/**
 * The AI concierge: one module owns which model serves which task, and every
 * surface asks it rather than naming a model inline.
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

const anthropic = new Anthropic();
const openai = new OpenAI();

export type ConciergeTask = 'summarise' | 'triage' | 'moderate';

/** One place to change a model, so a swap is a one-line diff. */
const MODEL_BY_TASK = {
  summarise: 'claude-3-5-sonnet-20240620',
  triage: 'gpt-3.5-turbo',
  moderate: 'text-moderation-latest',
} as const;

export interface ConciergeReply {
  task: ConciergeTask;
  model: string;
  text: string;
}

export async function summariseVisit(notes: string): Promise<ConciergeReply> {
  const response = await anthropic.messages.create({
    model: MODEL_BY_TASK.summarise,
    max_tokens: 300,
    messages: [
      {role: 'user', content: `Summarise this grooming visit: ${notes}`},
    ],
  });
  const first = response.content[0];
  return {
    task: 'summarise',
    model: MODEL_BY_TASK.summarise,
    text: first.type === 'text' ? first.text : '',
  };
}

export async function triageComplaint(
  message: string
): Promise<ConciergeReply> {
  const completion = await openai.chat.completions.create({
    model: MODEL_BY_TASK.triage,
    messages: [
      {
        role: 'system',
        content:
          'Classify the complaint as refund, rebooking, or escalate. One word.',
      },
      {role: 'user', content: message},
    ],
  });
  return {
    task: 'triage',
    model: MODEL_BY_TASK.triage,
    text: completion.choices[0]?.message?.content ?? 'escalate',
  };
}

export async function moderateReview(review: string): Promise<ConciergeReply> {
  const moderation = await openai.moderations.create({
    model: MODEL_BY_TASK.moderate,
    input: review,
  });
  return {
    task: 'moderate',
    model: MODEL_BY_TASK.moderate,
    text: moderation.results[0]?.flagged ? 'held' : 'published',
  };
}
