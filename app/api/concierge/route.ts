/**
 * The concierge endpoint: reviews are moderated, complaints triaged, visits summarised.
 */

import {NextResponse} from 'next/server';

import {
  moderateReview,
  summariseVisit,
  triageComplaint,
  type ConciergeReply,
} from '@/lib/ai/concierge';

export async function POST(request: Request) {
  const body = (await request.json()) as {
    kind: 'review' | 'complaint' | 'visit';
    text: string;
  };

  let reply: ConciergeReply;
  if (body.kind === 'review') {
    reply = await moderateReview(body.text);
  } else if (body.kind === 'complaint') {
    reply = await triageComplaint(body.text);
  } else {
    reply = await summariseVisit(body.text);
  }

  return NextResponse.json({
    task: reply.task,
    model: reply.model,
    text: reply.text,
  });
}
