/**
 * Salon marketing copy: prompts composed here, ranking rules here, generation delegated.
 */

import type {CompletionChoice} from 'openai/resources/completions';

import {draftOne, draftVariants} from '@/lib/ai/legacy-completions';

/** The longest finished variant wins; an unfinished one never beats a finished one. */
export function pickBest(choices: CompletionChoice[]): string {
  const finished = choices.filter((choice) => choice.finish_reason === 'stop');
  const pool = finished.length > 0 ? finished : choices;
  const best = [...pool].sort(
    (a, b) => (b.text?.length ?? 0) - (a.text?.length ?? 0)
  )[0];
  return best?.text?.trim() ?? '';
}

export async function salonDescription(
  name: string,
  services: string[]
): Promise<string> {
  const choice = await draftOne(
    `Write a warm two-sentence description of ${name}, a dog grooming salon offering ${services.join(', ')}.`
  );
  return choice.text?.trim() ?? '';
}

export async function socialPosts(
  name: string,
  offer: string
): Promise<string[]> {
  const choices = await draftVariants(
    `Write a short upbeat social post for ${name} promoting: ${offer}.`,
    3
  );
  return choices
    .map((choice) => choice.text?.trim() ?? '')
    .filter((text) => text.length > 0);
}
