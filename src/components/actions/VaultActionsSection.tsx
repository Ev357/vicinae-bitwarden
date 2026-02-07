import { Action, ActionPanel, Color, Icon, showToast, Toast } from "@vicinae/api";
import { VAULT_LOCK_MESSAGES } from "~/constants/general";
import { useBitwarden } from "~/context/bitwarden";
import { useVaultContext } from "~/context/vault";

export function VaultActionsSection() {
  const vault = useVaultContext();
  const bitwarden = useBitwarden();

  const handleLockVault = async () => {
    const toast = await showToast(Toast.Style.Animated, "Locking Vault...", "Please wait");
    await bitwarden.lock({ reason: VAULT_LOCK_MESSAGES.MANUAL });
    await toast.hide();
  };

  const handleLogoutVault = async () => {
    const toast = await showToast({ title: "Logging Out...", style: Toast.Style.Animated });
    try {
      await bitwarden.logout();
      await toast.hide();
    } catch (error) {
      toast.title = "Failed to logout";
      toast.style = Toast.Style.Failure;
    }
  };

  return (
    <ActionPanel.Section title="Vault Actions">
      <Action
        title="Sync Vault"
        shortcut={{ key: "r", modifiers: ["cmd"] }}
        icon={Icon.ArrowClockwise}
        onAction={vault.syncItems}
      />
      <Action
        icon={{ source: "sf_symbols_lock.svg", tintColor: Color.PrimaryText }} // Does not immediately follow theme
        title="Lock Vault"
        shortcut={{
          key: "l",
          modifiers: ["cmd", "shift"],
        }}
        onAction={handleLockVault}
      />
      <Action style={Action.Style.Destructive} title="Logout" icon={Icon.Logout} onAction={handleLogoutVault} />
    </ActionPanel.Section>
  );
}
