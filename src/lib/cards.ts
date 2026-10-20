import type { CardStatus } from "@/lib/types";

type CardState = { isBlocked: boolean; expMonth: number; expYear: number };

/** A card is valid through the last day of its expiration month. Blocking wins over expiry. */
export function cardStatus(card: CardState, now = new Date()): CardStatus {
  if (card.isBlocked) return "BLOCKED";
  const firstDayAfterExpiry = new Date(card.expYear, card.expMonth, 1);
  return now < firstDayAfterExpiry ? "ACTIVE" : "EXPIRED";
}
