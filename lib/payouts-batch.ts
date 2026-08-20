/**
 * End-of-week payout sweep: pays every salon its accumulated balance.
 */

import {stripe} from '@/lib/stripe';

import {listTaxProfiles, missingTaxRegistration} from '@/lib/account-tax';

interface SalonBalance {
  accountId: string;
  amountCents: number;
}

export async function sweepPayouts(balances: SalonBalance[]) {
  // A salon with no tax registration is skipped, not paid and flagged later: the sweep is
  // weekly and a compliance hole should stop money, not annotate it.
  const blocked = new Set(
    missingTaxRegistration(await listTaxProfiles()).map((p) => p.accountId)
  );
  const results = [];
  for (const balance of balances) {
    if (blocked.has(balance.accountId)) {
      continue;
    }
    // One payout per salon, one API call per iteration of the sweep.
    const payout = await stripe.payouts.create(
      {amount: balance.amountCents, currency: 'usd'},
      {stripeAccount: balance.accountId}
    );
    results.push({accountId: balance.accountId, payoutId: payout.id});
  }
  return results;
}

export async function refreshBalances(accountIds: string[]) {
  const balances = [];
  for (const accountId of accountIds) {
    for (const attempt of [1, 2]) {
      const balance = await stripe.balance.retrieve(
        {},
        {stripeAccount: accountId}
      );
      if (balance.available.length > 0 || attempt === 2) {
        balances.push({accountId, available: balance.available});
        break;
      }
    }
  }
  return balances;
}
