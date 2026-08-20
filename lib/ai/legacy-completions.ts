/**
 * Marketing copy generation on the legacy Completions API.
 *
 * The raw `CompletionChoice` shape is exported on purpose: ranking and formatting live in
 * the consumers, and re-wrapping every field here would be a second copy of the vendor's
 * own type.
 */

import OpenAI from 'openai';
import type {CompletionChoice} from 'openai/resources/completions';

const openai = new OpenAI();

export async function draftVariants(
  prompt: string,
  count: number
): Promise<CompletionChoice[]> {
  const completion = await openai.completions.create({
    model: 'gpt-3.5-turbo-instruct',
    prompt,
    n: count,
    max_tokens: 160,
    temperature: 0.8,
  });
  return completion.choices;
}

export async function draftOne(prompt: string): Promise<CompletionChoice> {
  const [choice] = await draftVariants(prompt, 1);
  if (!choice) {
    throw new Error('the model returned no choices');
  }
  return choice;
}
