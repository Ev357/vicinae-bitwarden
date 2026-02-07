import { environment, getPreferenceValues, LocalStorage, showToast, Toast } from "@vicinae/api";
import { execa, ExecaChildProcess, ExecaError, ExecaReturnValue } from "execa";
import { existsSync, accessSync, constants, chmodSync } from "fs";
import { LOCAL_STORAGE_KEY, DEFAULT_SERVER_URL, CACHE_KEYS } from "~/constants/general";
import { VaultState, VaultStatus } from "~/types/general";
import { PasswordGeneratorOptions } from "~/types/passwords";
import { Folder, Item, ItemType, Login } from "~/types/vault";
import { getPasswordGeneratingArgs } from "~/utils/passwords";
import { getServerUrlPreference } from "~/utils/preferences";
import {
  InstalledCLINotFoundError,
  ManuallyThrownError,
  NotLoggedInError,
  PremiumFeatureError,
  SendInvalidPasswordError,
  SendNeedsPasswordError,
  VaultIsLockedError,
} from "~/utils/errors";
import { dirname } from "path";
import { captureException } from "~/utils/development";
import { ReceivedSend, Send, SendCreatePayload, SendType } from "~/types/send";
import { prepareSendPayload } from "~/api/bitwarden.helpers";
import { Cache } from "~/utils/cache";

type Env = {
  BITWARDENCLI_APPDATA_DIR: string;
  BW_CLIENTSECRET: string;
  BW_CLIENTID: string;
  PATH: string;
  NODE_EXTRA_CA_CERTS?: string;
  BW_SESSION?: string;
};

type ActionListeners = {
  login?: () => MaybePromise<void>;
  logout?: (reason?: string) => MaybePromise<void>;
  lock?: (reason?: string) => MaybePromise<void>;
  unlock?: (password: string, sessionToken: string) => MaybePromise<void>;
};

type ActionListenersMap<T extends keyof ActionListeners = keyof ActionListeners> = Map<T, Set<ActionListeners[T]>>;

type MaybeError<T = undefined> = { result: T; error?: undefined } | { result?: undefined; error: ManuallyThrownError };

type ExecProps = {
  /** Reset the time of the last command that accessed data or modified the vault, used to determine if the vault timed out */
  resetVaultTimeout: boolean;
  abortController?: AbortController;
  input?: string;
};

type LockOptions = {
  /** The reason for locking the vault */
  reason?: string;
  checkVaultStatus?: boolean;
  /** The callbacks are called before the operation is finished (optimistic) */
  immediate?: boolean;
};

type LogoutOptions = {
  /** The reason for locking the vault */
  reason?: string;
  /** The callbacks are called before the operation is finished (optimistic) */
  immediate?: boolean;
};

type ReceiveSendOptions = {
  savePath?: string;
  password?: string;
};

type CreateLoginItemOptions = {
  name: string;
  username?: string;
  password: string;
  folderId: string | null;
  uri?: string;
};

const { supportPath } = environment;

export class Bitwarden {
  private env: Env;
  private initPromise: Promise<void>;
  private tempSessionToken?: string;
  private actionListeners: ActionListenersMap = new Map();
  private preferences = getPreferenceValues<Preferences>();
  private cliPath: string;
  private toastInstance: Toast | undefined;
  wasCliUpdated = false;

  constructor(toastInstance?: Toast) {
    const { cliPath: cliPathPreference, clientId, clientSecret, serverCertsPath } = this.preferences;
    const serverUrl = getServerUrlPreference();

    this.toastInstance = toastInstance;
    this.cliPath = cliPathPreference || "/usr/local/bin/bw"; // TODO: fix later
    this.env = {
      BITWARDENCLI_APPDATA_DIR: supportPath,
      BW_CLIENTSECRET: clientSecret.trim(),
      BW_CLIENTID: clientId.trim(),
      PATH: dirname(process.execPath),
      ...(serverUrl && serverCertsPath ? { NODE_EXTRA_CA_CERTS: serverCertsPath } : {}),
    };

    this.initPromise = (async (): Promise<void> => {
      this.ensureCliBinary();
      void this.retrieveAndCacheCliVersion();
      await this.checkServerUrl(serverUrl);
    })();
  }

  private ensureCliBinary() {
    // TODO: fix later
    if (this.checkCliBinIsReady(this.cliPath)) return;
    if (this.cliPath === this.preferences.cliPath) {
      throw new InstalledCLINotFoundError(`Bitwarden CLI not found at ${this.cliPath}`);
    }
  }

  private async retrieveAndCacheCliVersion(): Promise<void> {
    try {
      const { error, result } = await this.getVersion();
      if (!error) Cache.set(CACHE_KEYS.CLI_VERSION, result);
    } catch (error) {
      captureException("Failed to retrieve and cache cli version", error);
    }
  }

  private checkCliBinIsReady(filePath: string): boolean {
    try {
      if (!existsSync(this.cliPath)) return false;
      accessSync(filePath, constants.X_OK);
      return true;
    } catch {
      chmodSync(filePath, "755");
      return true;
    }
  }

  setSessionToken(token: string): void {
    this.env = {
      ...this.env,
      BW_SESSION: token,
    };
  }

  clearSessionToken(): void {
    delete this.env.BW_SESSION;
  }

  withSession(token: string): this {
    this.tempSessionToken = token;
    return this;
  }

  async initialize(): Promise<this> {
    await this.initPromise;
    return this;
  }

  async checkServerUrl(serverUrl: string | undefined): Promise<void> {
    // Check the CLI has been configured to use the preference Url
    const storedServer = await LocalStorage.getItem<string>(LOCAL_STORAGE_KEY.SERVER_URL);
    if (!serverUrl || storedServer === serverUrl) return;

    // Update the server Url
    const toast = await this.showToast({
      style: Toast.Style.Animated,
      title: "Switching server...",
      message: "Bitwarden server preference changed",
    });
    try {
      try {
        await this.logout();
      } catch {
        // It doesn't matter if we weren't logged in.
      }
      // If URL is empty, set it to the default
      await this.exec(["config", "server", serverUrl || DEFAULT_SERVER_URL], { resetVaultTimeout: false });
      await LocalStorage.setItem(LOCAL_STORAGE_KEY.SERVER_URL, serverUrl);

      toast.style = Toast.Style.Success;
      toast.title = "Success";
      toast.message = "Bitwarden server changed";
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed to switch server";
      if (error instanceof Error) {
        toast.message = error.message;
      } else {
        toast.message = "Unknown error occurred";
      }
    } finally {
      await toast.restore();
    }
  }

  private async exec(args: string[], options: ExecProps): Promise<ExecaChildProcess> {
    const { abortController, input = "", resetVaultTimeout } = options ?? {};

    let env = this.env;
    if (this.tempSessionToken) {
      env = { ...env, BW_SESSION: this.tempSessionToken };
      this.tempSessionToken = undefined;
    }

    const result = await execa(this.cliPath, args, { input, env, signal: abortController?.signal });

    if (this.isPromptWaitingForMasterPassword(result)) {
      /* since we have the session token in the env, the password 
      should not be requested, unless the vault is locked */
      await this.lock();
      throw new VaultIsLockedError();
    }

    if (resetVaultTimeout) {
      await LocalStorage.setItem(LOCAL_STORAGE_KEY.LAST_ACTIVITY_TIME, new Date().toISOString());
    }

    return result;
  }

  async getVersion(): Promise<MaybeError<string>> {
    try {
      const { stdout: result } = await this.exec(["--version"], { resetVaultTimeout: false });
      return { result };
    } catch (execError) {
      captureException("Failed to get cli version", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }

  async login(): Promise<MaybeError> {
    try {
      await this.exec(["login", "--apikey"], { resetVaultTimeout: true });
      await this.saveLastVaultStatus("login", "unlocked");
      await this.callActionListeners("login");
      return { result: undefined };
    } catch (execError) {
      captureException("Failed to login", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }

  async logout(options?: LogoutOptions): Promise<MaybeError> {
    const { reason, immediate = false } = options ?? {};
    try {
      if (immediate) await this.handlePostLogout(reason);

      await this.exec(["logout"], { resetVaultTimeout: false });
      await this.saveLastVaultStatus("logout", "unauthenticated");
      if (!immediate) await this.handlePostLogout(reason);
      return { result: undefined };
    } catch (execError) {
      captureException("Failed to logout", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }

  async lock(options?: LockOptions): Promise<MaybeError> {
    const { reason, checkVaultStatus = false, immediate = false } = options ?? {};
    try {
      if (immediate) await this.callActionListeners("lock", reason);
      if (checkVaultStatus) {
        const { error, result } = await this.status();
        if (error) throw error;
        if (result.status === "unauthenticated") return { error: new NotLoggedInError("Not logged in") };
      }

      await this.exec(["lock"], { resetVaultTimeout: false });
      await this.saveLastVaultStatus("lock", "locked");
      if (!immediate) await this.callActionListeners("lock", reason);
      return { result: undefined };
    } catch (execError) {
      captureException("Failed to lock vault", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }

  async unlock(password: string): Promise<MaybeError<string>> {
    try {
      const { stdout: sessionToken } = await this.exec(["unlock", password, "--raw"], { resetVaultTimeout: true });
      this.setSessionToken(sessionToken);
      await this.saveLastVaultStatus("unlock", "unlocked");
      await this.callActionListeners("unlock", password, sessionToken);
      return { result: sessionToken };
    } catch (execError) {
      captureException("Failed to unlock vault", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }

  async sync(): Promise<MaybeError> {
    try {
      await this.exec(["sync"], { resetVaultTimeout: true });
      return { result: undefined };
    } catch (execError) {
      captureException("Failed to sync vault", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }

  async getItem(id: string): Promise<MaybeError<Item>> {
    try {
      const { stdout } = await this.exec(["get", "item", id], { resetVaultTimeout: true });
      return { result: JSON.parse<Item>(stdout) };
    } catch (execError) {
      captureException("Failed to get item", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }

  async listItems(): Promise<MaybeError<Item[]>> {
    try {
      const { stdout } = await this.exec(["list", "items"], { resetVaultTimeout: true });
      const items = JSON.parse<Item[]>(stdout);
      // Filter out items without a name property (they are not displayed in the bitwarden app)
      return { result: items.filter((item: Item) => !!item.name) };
    } catch (execError) {
      captureException("Failed to list items", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }

  async createLoginItem(options: CreateLoginItemOptions): Promise<MaybeError<Item>> {
    try {
      const { error: itemTemplateError, result: itemTemplate } = await this.getTemplate<Item>("item");
      if (itemTemplateError) throw itemTemplateError;

      const { error: loginTemplateError, result: loginTemplate } = await this.getTemplate<Login>("item.login");
      if (loginTemplateError) throw loginTemplateError;

      itemTemplate.name = options.name;
      itemTemplate.type = ItemType.LOGIN;
      itemTemplate.folderId = options.folderId || null;
      itemTemplate.login = loginTemplate;
      itemTemplate.notes = null;

      loginTemplate.username = options.username || null;
      loginTemplate.password = options.password;
      loginTemplate.totp = null;
      loginTemplate.fido2Credentials = undefined;

      if (options.uri) {
        loginTemplate.uris = [{ match: null, uri: options.uri }];
      }

      const { result: encodedItem, error: encodeError } = await this.encode(JSON.stringify(itemTemplate));
      if (encodeError) throw encodeError;

      const { stdout } = await this.exec(["create", "item", encodedItem], { resetVaultTimeout: true });
      return { result: JSON.parse<Item>(stdout) };
    } catch (execError) {
      captureException("Failed to create login item", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }

  async listFolders(): Promise<MaybeError<Folder[]>> {
    try {
      const { stdout } = await this.exec(["list", "folders"], { resetVaultTimeout: true });
      return { result: JSON.parse<Folder[]>(stdout) };
    } catch (execError) {
      captureException("Failed to list folder", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }

  async createFolder(name: string): Promise<MaybeError> {
    try {
      const { error, result: folder } = await this.getTemplate("folder");
      if (error) throw error;

      folder.name = name;
      const { result: encodedFolder, error: encodeError } = await this.encode(JSON.stringify(folder));
      if (encodeError) throw encodeError;

      await this.exec(["create", "folder", encodedFolder], { resetVaultTimeout: true });
      return { result: undefined };
    } catch (execError) {
      captureException("Failed to create folder", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }

  async getTotp(id: string): Promise<MaybeError<string>> {
    try {
      // this could return something like "Not found." but checks for totp code are done before calling this function
      const { stdout } = await this.exec(["get", "totp", id], { resetVaultTimeout: true });
      return { result: stdout };
    } catch (execError) {
      captureException("Failed to get TOTP", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }

  async status(): Promise<MaybeError<VaultState>> {
    try {
      const { stdout } = await this.exec(["status"], { resetVaultTimeout: false });
      return { result: JSON.parse<VaultState>(stdout) };
    } catch (execError) {
      captureException("Failed to get status", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }

  async checkLockStatus(): Promise<VaultStatus> {
    try {
      await this.exec(["unlock", "--check"], { resetVaultTimeout: false });
      await this.saveLastVaultStatus("checkLockStatus", "unlocked");
      return "unlocked";
    } catch (error) {
      captureException("Failed to check lock status", error);
      const errorMessage = (error as ExecaError).stderr;
      if (errorMessage === "Vault is locked.") {
        await this.saveLastVaultStatus("checkLockStatus", "locked");
        return "locked";
      }
      await this.saveLastVaultStatus("checkLockStatus", "unauthenticated");
      return "unauthenticated";
    }
  }

  async getTemplate<T = any>(type: string): Promise<MaybeError<T>> {
    try {
      const { stdout } = await this.exec(["get", "template", type], { resetVaultTimeout: true });
      return { result: JSON.parse<T>(stdout) };
    } catch (execError) {
      captureException("Failed to get template", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }

  async encode(input: string): Promise<MaybeError<string>> {
    try {
      const { stdout } = await this.exec(["encode"], { input, resetVaultTimeout: false });
      return { result: stdout };
    } catch (execError) {
      captureException("Failed to encode", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }

  async generatePassword(options?: PasswordGeneratorOptions, abortController?: AbortController): Promise<string> {
    const args = options ? getPasswordGeneratingArgs(options) : [];
    const { stdout } = await this.exec(["generate", ...args], { abortController, resetVaultTimeout: false });
    return stdout;
  }

  async listSends(): Promise<MaybeError<Send[]>> {
    try {
      const { stdout } = await this.exec(["send", "list"], { resetVaultTimeout: true });
      return { result: JSON.parse<Send[]>(stdout) };
    } catch (execError) {
      captureException("Failed to list sends", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }

  async createSend(values: SendCreatePayload): Promise<MaybeError<Send>> {
    try {
      const { error: templateError, result: template } = await this.getTemplate(
        values.type === SendType.Text ? "send.text" : "send.file"
      );
      if (templateError) throw templateError;

      const payload = prepareSendPayload(template, values);
      const { result: encodedPayload, error: encodeError } = await this.encode(JSON.stringify(payload));
      if (encodeError) throw encodeError;

      const { stdout } = await this.exec(["send", "create", encodedPayload], { resetVaultTimeout: true });

      return { result: JSON.parse<Send>(stdout) };
    } catch (execError) {
      captureException("Failed to create send", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }

  async editSend(values: SendCreatePayload): Promise<MaybeError<Send>> {
    try {
      const { result: encodedPayload, error: encodeError } = await this.encode(JSON.stringify(values));
      if (encodeError) throw encodeError;

      const { stdout } = await this.exec(["send", "edit", encodedPayload], { resetVaultTimeout: true });
      return { result: JSON.parse<Send>(stdout) };
    } catch (execError) {
      captureException("Failed to delete send", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }

  async deleteSend(id: string): Promise<MaybeError> {
    try {
      await this.exec(["send", "delete", id], { resetVaultTimeout: true });
      return { result: undefined };
    } catch (execError) {
      captureException("Failed to delete send", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }

  async removeSendPassword(id: string): Promise<MaybeError> {
    try {
      await this.exec(["send", "remove-password", id], { resetVaultTimeout: true });
      return { result: undefined };
    } catch (execError) {
      captureException("Failed to remove send password", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }

  async receiveSendInfo(url: string, options?: ReceiveSendOptions): Promise<MaybeError<ReceivedSend>> {
    try {
      const { stdout, stderr } = await this.exec(["send", "receive", url, "--obj"], {
        resetVaultTimeout: true,
        input: options?.password,
      });
      if (!stdout && /Invalid password/i.test(stderr)) return { error: new SendInvalidPasswordError() };
      if (!stdout && /Send password/i.test(stderr)) return { error: new SendNeedsPasswordError() };

      return { result: JSON.parse<ReceivedSend>(stdout) };
    } catch (execError) {
      const errorMessage = (execError as ExecaError).stderr;
      if (/Invalid password/gi.test(errorMessage)) return { error: new SendInvalidPasswordError() };
      if (/Send password/gi.test(errorMessage)) return { error: new SendNeedsPasswordError() };

      captureException("Failed to receive send obj", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }

  async receiveSend(url: string, options?: ReceiveSendOptions): Promise<MaybeError<string>> {
    try {
      const { savePath, password } = options ?? {};
      const args = ["send", "receive", url];
      if (savePath) args.push("--output", savePath);
      const { stdout } = await this.exec(args, { resetVaultTimeout: true, input: password });
      return { result: stdout };
    } catch (execError) {
      captureException("Failed to receive send", execError);
      const { error } = await this.handleCommonErrors(execError);
      if (!error) throw execError;
      return { error };
    }
  }

  // utils below

  async saveLastVaultStatus(_callName: string, status: VaultStatus): Promise<void> {
    await LocalStorage.setItem(LOCAL_STORAGE_KEY.VAULT_LAST_STATUS, status);
  }

  async getLastSavedVaultStatus(): Promise<VaultStatus | undefined> {
    const lastSavedStatus = await LocalStorage.getItem<VaultStatus>(LOCAL_STORAGE_KEY.VAULT_LAST_STATUS);
    if (!lastSavedStatus) {
      const vaultStatus = await this.status();
      return vaultStatus.result?.status;
    }
    return lastSavedStatus;
  }

  private isPromptWaitingForMasterPassword(result: ExecaReturnValue): boolean {
    return !!(result.stderr && result.stderr.includes("Master password"));
  }

  private async handlePostLogout(reason?: string): Promise<void> {
    this.clearSessionToken();
    await this.callActionListeners("logout", reason);
  }

  private async handleCommonErrors(error: any): Promise<{ error?: ManuallyThrownError }> {
    const errorMessage = (error as ExecaError).stderr;
    if (!errorMessage) return {};

    if (/not logged in/i.test(errorMessage)) {
      await this.handlePostLogout();
      return { error: new NotLoggedInError("Not logged in") };
    }
    if (/Premium status/i.test(errorMessage)) {
      return { error: new PremiumFeatureError() };
    }
    return {};
  }

  setActionListener<A extends keyof ActionListeners>(action: A, listener: ActionListeners[A]): this {
    const listeners = this.actionListeners.get(action);
    if (listeners && listeners.size > 0) {
      listeners.add(listener);
    } else {
      this.actionListeners.set(action, new Set([listener]));
    }
    return this;
  }

  removeActionListener<A extends keyof ActionListeners>(action: A, listener: ActionListeners[A]): this {
    const listeners = this.actionListeners.get(action);
    if (listeners && listeners.size > 0) {
      listeners.delete(listener);
    }
    return this;
  }

  private async callActionListeners<A extends keyof ActionListeners>(
    action: A,
    ...args: Parameters<NonNullable<ActionListeners[A]>>
  ) {
    const listeners = this.actionListeners.get(action);
    if (listeners && listeners.size > 0) {
      for (const listener of listeners) {
        try {
          await (listener as any)?.(...args);
        } catch (error) {
          captureException(`Error calling bitwarden action listener for ${action}`, error);
        }
      }
    }
  }

  private showToast = async (toastOpts: Toast.Options): Promise<Toast & { restore: () => Promise<void> }> => {
    if (this.toastInstance) {
      const previousStateToastOpts: Toast.Options = {
        message: this.toastInstance.message,
        title: this.toastInstance.title,
      };

      if (toastOpts.style) this.toastInstance.style = toastOpts.style;
      this.toastInstance.message = toastOpts.message;
      this.toastInstance.title = toastOpts.title;
      await this.toastInstance.show();

      return Object.assign(this.toastInstance, {
        restore: async () => {
          await this.showToast(previousStateToastOpts);
        },
      });
    } else {
      const toast = await showToast(toastOpts);
      return Object.assign(toast, { restore: () => toast.hide() });
    }
  };
}
