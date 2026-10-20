// Shapes returned by the API. Shared by route handlers and the client so both sides agree.

export const MOVEMENT_TYPES = ["SUBSCRIPTION", "CASH_IN", "CASH_OUT"] as const;
export type MovementType = (typeof MOVEMENT_TYPES)[number];
export type MovementStatus = "COMPLETED" | "PENDING" | "FAILED";
export type CardBrand = "MASTERCARD" | "VISA";
export type CardStatus = "ACTIVE" | "BLOCKED" | "EXPIRED";

export type CardDTO = {
  id: string;
  brand: CardBrand;
  last4: string;
  holderName: string;
  expMonth: number;
  expYear: number;
  status: CardStatus;
};

export type ProfileDTO = {
  name: string;
  email: string;
  balanceCents: number;
  currency: string;
  cards: CardDTO[];
};

export type MovementDTO = {
  id: string;
  type: MovementType;
  status: MovementStatus;
  counterparty: string;
  description: string | null;
  amountCents: number;
  currency: string;
  date: string;
  card: Pick<CardDTO, "brand" | "last4"> | null;
};

export type ApiErrorBody = { error: string };
