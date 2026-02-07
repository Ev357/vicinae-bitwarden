import { Action } from "@vicinae/api";
import type { ComponentProps } from "react";
import { useSelectedVaultItem } from "~/components/searchVault/context/vaultItem";
import useReprompt from "~/utils/hooks/useReprompt";

export type ActionWithRepromptProps = Omit<ComponentProps<typeof Action>, "onAction"> & {
  repromptDescription?: string;
  onAction: () => void | Promise<void>;
};

function ActionWithReprompt(props: ActionWithRepromptProps) {
  const { repromptDescription, onAction, ...componentProps } = props;
  const { reprompt } = useSelectedVaultItem();
  const repromptAndPerformAction = useReprompt(onAction, { description: repromptDescription });

  return <Action {...componentProps} onAction={reprompt ? repromptAndPerformAction : onAction} />;
}

export default ActionWithReprompt;
