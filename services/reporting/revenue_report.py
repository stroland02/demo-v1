"""Nightly revenue report: pulls the day's charges and drafts the owner's summary."""

import os

import anthropic
import stripe

stripe.api_key = os.environ["STRIPE_SECRET_KEY"]
claude = anthropic.Anthropic()


def days_charges(created_after: int) -> list[dict]:
    charges = stripe.Charge.list(created={"gte": created_after}, limit=100)
    return [
        {"id": charge["id"], "amount": charge["amount"], "paid": charge["paid"]}
        for charge in charges["data"]
    ]


def refund_disputes(charge_ids: list[str]) -> list[str]:
    refunded = []
    for charge_id in charge_ids:
        refund = stripe.Refund.create(charge=charge_id)
        refunded.append(refund["id"])
    return refunded


def draft_owner_summary(rows: list[dict]) -> str:
    message = claude.messages.create(
        model="claude-3-sonnet-20240229",
        max_tokens=500,
        messages=[{"role": "user", "content": f"Summarise today's revenue: {rows}"}],
    )
    return message.content[0].text
