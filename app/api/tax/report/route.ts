/**
 * The tax compliance report: every salon, its registrations, and who is blocked.
 */

import {NextResponse} from 'next/server';

import {
  listTaxProfiles,
  missingTaxRegistration,
  taxReportRows,
} from '@/lib/account-tax';

export async function GET() {
  const profiles = await listTaxProfiles();
  const blocked = missingTaxRegistration(profiles);
  return NextResponse.json({
    total: profiles.length,
    blocked: blocked.map((profile) => profile.accountId),
    csv: ['account_id,business_name,tax_ids', ...taxReportRows(profiles)].join(
      '\n'
    ),
  });
}
