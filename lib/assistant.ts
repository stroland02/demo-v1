/**
 * The in-app grooming assistant: drafts appointment summaries and replies.
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

const anthropic = new Anthropic();
const openai = new OpenAI();

export async function draftAppointmentSummary(notes: string) {
  const response = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 400,
    messages: [{ role: 'user', content: `Summarise these grooming notes: ${notes}` }],
  });
  return response.content;
}

export async function suggestReply(customerMessage: string) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-32k',
    messages: [{ role: 'user', content: customerMessage }],
  });
  return completion.choices[0]?.message?.content ?? '';
}
