/**
 * Tax posture for every connected salon, read straight off the Stripe account list.
 *
 * Invoicing is blocked for a salon with no default tax registration, so several surfaces
 * consume this: the tax report route, the payout sweep's compliance gate, and the
 * owner-facing reminder in notifications.
 */

import {stripe} from '@/lib/stripe';

export interface TaxProfile {
  accountId: string;
  businessName: string | null;
  /** The account's default tax registrations, as Stripe id strings. */
  defaultTaxIds: string[];
  payoutsEnabled: boolean;
}

export async function listTaxProfiles(): Promise<TaxProfile[]> {
  const accounts = await stripe.accounts.list({limit: 100});
  return accounts.data.map((account) => ({
    accountId: account.id,
    businessName: account.business_profile?.name ?? null,
    defaultTaxIds: (
      account.settings?.invoices?.default_account_tax_ids ?? []
    ).map((taxId) => (typeof taxId === 'string' ? taxId : taxId.id)),
    payoutsEnabled: account.payouts_enabled,
  }));
}

/** Salons that cannot be invoiced yet: no default tax registration on the account. */
export function missingTaxRegistration(profiles: TaxProfile[]): TaxProfile[] {
  return profiles.filter((profile) => profile.defaultTaxIds.length === 0);
}

/** One line per salon for the compliance report, tax ids joined for the CSV cell. */
export function taxReportRows(profiles: TaxProfile[]): string[] {
  return profiles.map(
    (profile) =>
      `${profile.accountId},${profile.businessName ?? ''},${profile.defaultTaxIds.join('|')}`
  );
}
