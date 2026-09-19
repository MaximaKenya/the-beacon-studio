export type ContactIntent = "book" | "email" | "subscribe" | null;

export function detectContactIntent(message: string): ContactIntent {
  const text = message.toLowerCase().trim();
  if (!text) return null;

  if (
    /\b(book|schedule|call|meeting|calendar|zoom|chat live|talk live|availability)\b/.test(
      text
    )
  ) {
    return "book";
  }

  if (
    /\b(subscribe|newsletter|updates|notify|mailing list|stay in touch)\b/.test(text)
  ) {
    return "subscribe";
  }

  if (
    /\b(email|message|contact|hello|hi|project|proposal|quote|question|inquir)/.test(
      text
    ) ||
    text.length > 20
  ) {
    return "email";
  }

  return null;
}
