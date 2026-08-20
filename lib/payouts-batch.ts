/**
 * End-of-week payout sweep: pays every salon its accumulated balance.
 */

import { stripe } from '@/lib/stripe';

interface SalonBalance {
  accountId: string;
  amountCents: number;
}

export async function sweepPayouts(balances: SalonBalance[]) {
  const results = [];
  for (const balance of balances) {
    // One payout per salon, one API call per iteration of the sweep.
    const payout = await stripe.payouts.create(
      { amount: balance.amountCents, currency: 'usd' },
      { stripeAccount: balance.accountId },
    );
    results.push({ accountId: balance.accountId, payoutId: payout.id });
  }
  return results;
}

export async function refreshBalances(accountIds: string[]) {
  const balances = [];
  for (const accountId of accountIds) {
    for (const attempt of [1, 2]) {
      const balance = await stripe.balance.retrieve({}, { stripeAccount: accountId });
      if (balance.available.length > 0 || attempt === 2) {
        balances.push({ accountId, available: balance.available });
        break;
      }
    }
  }
  return balances;
}
