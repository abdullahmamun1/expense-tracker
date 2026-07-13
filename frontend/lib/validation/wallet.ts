import { z } from "zod";

export const walletTypes = ["CASH", "BANK", "CREDIT_CARD", "OTHER"] as const;

export const walletTypeLabels: Record<(typeof walletTypes)[number], string> = {
  CASH: "Cash",
  BANK: "Bank Account",
  CREDIT_CARD: "Credit Card",
  OTHER: "Other",
};

const amountSchema = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount (e.g. 100 or 100.50)");

export const walletFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(walletTypes),
  startingBalance: amountSchema,
});

export type WalletFormValues = z.infer<typeof walletFormSchema>;

export type Wallet = {
  id: string;
  userId: string;
  name: string;
  type: (typeof walletTypes)[number];
  startingBalance: string;
  createdAt: string;
  currentBalance?: string;
};

export function walletLabel(wallet: Pick<Wallet, "name" | "type">) {
  return `${wallet.name} (${walletTypeLabels[wallet.type]})`;
}
