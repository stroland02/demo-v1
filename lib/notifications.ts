/**
 * Grooming appointment notifications, sent over Twilio.
 */

import twilio from 'twilio';

import type {TaxProfile} from '@/lib/account-tax';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendAppointmentReminder(
  to: string,
  salonName: string,
  when: string
) {
  const message = await client.messages.create({
    to,
    from: process.env.TWILIO_FROM_NUMBER,
    body: `Reminder: your appointment at ${salonName} is at ${when}.`,
  });
  return message.sid;
}

export async function sendReceiptLink(to: string, url: string) {
  const message = await client.messages.create({
    to,
    from: process.env.TWILIO_FROM_NUMBER,
    body: `Your receipt: ${url}`,
  });
  return {sid: message.sid, status: message.status};
}

export async function verifySalonPhone(phone: string) {
  const lookup = await client.lookups.v2.phoneNumbers(phone).fetch();
  return lookup.valid;
}

export async function sendTaxRegistrationReminder(
  to: string,
  salonName: string,
  profile: TaxProfile
) {
  const registered = profile.defaultTaxIds.length;
  const message = await client.messages.create({
    to,
    from: process.env.TWILIO_FROM_NUMBER,
    body:
      registered === 0
        ? `${salonName}: add a tax registration to keep invoicing enabled.`
        : `${salonName}: ${registered} tax registration(s) on file.`,
  });
  return message.sid;
}
