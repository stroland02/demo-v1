/**
 * The marketing endpoint: a salon asks for a description and a set of social posts.
 */

import {NextResponse} from 'next/server';

import {draftVariants} from '@/lib/ai/legacy-completions';
import {pickBest, salonDescription, socialPosts} from '@/lib/marketing-copy';

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name: string;
    services: string[];
    offer?: string;
  };

  const description = await salonDescription(body.name, body.services);
  const posts = body.offer ? await socialPosts(body.name, body.offer) : [];

  // The tagline takes its own pass: shorter budget, best-of-five, ranked here.
  const taglineChoices = await draftVariants(
    `Write a five-word tagline for ${body.name}.`,
    5
  );
  const tagline = pickBest(taglineChoices);

  return NextResponse.json({description, posts, tagline});
}
