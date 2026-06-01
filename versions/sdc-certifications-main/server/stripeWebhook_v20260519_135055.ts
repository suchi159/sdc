import express, { type Express } from "express";
import Stripe from "stripe";
import { getDb } from "./db";
import { stripePayments, creditBalances, ledgerEntries, bookAccess, vouchers } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { ENV } from "./_core/env";
import { nanoid } from "nanoid";

function getStripe(): Stripe | null {
  if (!ENV.stripeSecretKey) return null;
  return new Stripe(ENV.stripeSecretKey);
}

export function registerStripeWebhook(app: Express): void {
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const stripe = getStripe();
      if (!stripe) {
        console.warn("[Stripe Webhook] Stripe not configured — skipping.");
        return res.json({ received: true });
      }

      const sig = req.headers["stripe-signature"] as string;
      const webhookSecret = ENV.stripeWebhookSecret;

      let event: Stripe.Event;

      try {
        if (webhookSecret && sig) {
          const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
          event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
        } else {
          const bodyStr = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
          event = JSON.parse(bodyStr) as Stripe.Event;
        }
      } catch (err) {
        console.error("[Stripe Webhook] Signature verification failed:", err);
        return res.status(400).json({ error: "Webhook signature verification failed" });
      }

      // Test events — return immediately so Stripe dashboard shows verified
      if (event.id.startsWith("evt_test_")) {
        console.log("[Stripe Webhook] Test event detected, returning verification response");
        return res.json({ verified: true });
      }

      console.log(`[Stripe Webhook] Received event: ${event.type} (${event.id})`);

      try {
        if (event.type === "checkout.session.completed") {
          const session = event.data.object as Stripe.Checkout.Session;
          await handleCheckoutCompleted(session);
        }
      } catch (err) {
        console.error("[Stripe Webhook] Error processing event:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      return res.json({ received: true });
    }
  );
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.error("[Stripe Webhook] DB not available");
    return;
  }

  // Find the pending payment record
  const existing = await db
    .select()
    .from(stripePayments)
    .where(eq(stripePayments.stripeSessionId, session.id))
    .limit(1);

  if (!existing.length || !existing[0]) {
    console.warn(`[Stripe Webhook] No payment record found for session ${session.id}`);
    return;
  }

  const payment = existing[0];

  if (payment.status === "completed") {
    console.log(`[Stripe Webhook] Session ${session.id} already processed — skipping.`);
    return;
  }

  // Mark payment as completed
  await db
    .update(stripePayments)
    .set({
      status: "completed",
      completedAt: new Date(),
      stripePaymentIntentId: session.payment_intent as string,
    })
    .where(eq(stripePayments.stripeSessionId, session.id));

  const orgId = payment.orgId;
  const userId = payment.userId;
  const creditsToAdd = payment.credits || 0;
  const paymentMeta = payment.metadata as Record<string, unknown> | null;

  // ── Update credit balance ──────────────────────────────────────────────
  const balRows = await db
    .select()
    .from(creditBalances)
    .where(eq(creditBalances.orgId, orgId))
    .limit(1);
  const currentBalance = parseFloat(balRows[0]?.balance?.toString() || "0");
  const newBalance = currentBalance + creditsToAdd;

  await db
    .insert(creditBalances)
    .values({ orgId, balance: newBalance.toFixed(4) })
    .onDuplicateKeyUpdate({ set: { balance: newBalance.toFixed(4) } });

  // ── Append immutable ledger entry ──────────────────────────────────────
  await db.insert(ledgerEntries).values({
    orgId,
    userId,
    type: "credit_purchase",
    amount: creditsToAdd.toFixed(4),
    currency: "USD",
    balanceBefore: currentBalance.toFixed(4),
    balanceAfter: newBalance.toFixed(4),
    description: `Stripe webhook — ${payment.plan} package (session: ${session.id})`,
    cryptoHash: `webhook_${session.id}`,
    prevHash: "STRIPE_WEBHOOK",
  });

  // ── Generate exam vouchers ─────────────────────────────────────────────
  const voucherCountRaw = paymentMeta?.voucherCount;
  const voucherCount = voucherCountRaw ? parseInt(String(voucherCountRaw), 10) : 0;
  if (voucherCount > 0) {
    const voucherRows = Array.from({ length: voucherCount }, () => ({
      code: `SDC-${nanoid(10).toUpperCase()}`,
      orgId,
      type: "exam" as const,
      status: "active" as const,
      createdBy: userId,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year validity
    }));
    // Insert in batches of 100 to avoid packet size limits
    for (let i = 0; i < voucherRows.length; i += 100) {
      await db.insert(vouchers).values(voucherRows.slice(i, i + 100));
    }
    console.log(`[Stripe Webhook] Generated ${voucherCount} exam vouchers for org ${orgId}`);
  }

  // ── Grant book access ──────────────────────────────────────────────────
  const bookIdsRaw = paymentMeta?.bookIds;
  if (bookIdsRaw) {
    const bookIdList: number[] = Array.isArray(bookIdsRaw)
      ? (bookIdsRaw as unknown[]).map(Number).filter(Boolean)
      : String(bookIdsRaw).split(",").map(Number).filter(Boolean);
    for (const bookId of bookIdList) {
      try {
        await db.insert(bookAccess).values({
          bookId,
          userId,
          accessType: "purchased",
          purchasedAt: new Date(),
        });
      } catch {
        // ignore duplicate key — already granted
      }
    }
    if (bookIdList.length > 0) {
      console.log(`[Stripe Webhook] Granted access to ${bookIdList.length} books for user ${userId}`);
    }
  }

  console.log(
    `[Stripe Webhook] Credited ${creditsToAdd} credits to org ${orgId}. New balance: ${newBalance}`
  );
}
