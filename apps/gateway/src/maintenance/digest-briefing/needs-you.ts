import { BRIEFING_RECITE_MAX } from './constants.js';
import { formatConversationParagraph } from './conversation.js';
import { capitalize, countWord } from './text.js';
import type { BriefingItem } from './types.js';

// Rich request/draft paragraphs are longer than the old labels. Reserve space
// for the greeting and completed-work tail instead of filling a phone screen.
const PARAGRAPH_BUDGET = 2_600;

/** Render in ledger order so a number always names the paragraph it appeared on. */
export function formatNeedsYouProse(items: BriefingItem[]): string | null {
  if (items.length === 0) return null;
  const visible = items.slice(0, BRIEFING_RECITE_MAX);
  const people = visible.flatMap((item) => item.conversation ? [item.conversation.person] : []);
  const numberParagraphs = new Set(people).size !== people.length;
  const paragraphs: string[] = [];
  let used = 0;
  for (const [index, item] of visible.entries()) {
    const paragraph = formatConversationParagraph(
      item.conversation,
      item.kind,
      item.needsThreadReview === true,
    );
    const rendered = numberParagraphs ? `${index + 1}. ${paragraph}` : paragraph;
    if (paragraphs.length > 0 && used + rendered.length + 2 > PARAGRAPH_BUDGET) break;
    paragraphs.push(rendered);
    used += rendered.length + 2;
  }
  if (items.length > paragraphs.length) {
    paragraphs.push(`${capitalize(countWord(items.length - paragraphs.length))} more conversations need your attention. Want me to take you through them?`);
  }
  return paragraphs.join('\n\n');
}
