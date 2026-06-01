import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";
import { getDb } from "../db";
import { stripePayments, creditBalances, ledgerEntries, organizations, books, bookAccess } from "../../drizzle/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { ENV } from "../_core/env";
import Stripe from "stripe";

function getStripe(): Stripe | null {
  if (!ENV.stripeSecretKey) return null;
  return new Stripe(ENV.stripeSecretKey);
}

// Voucher packages — Exam Vouchers
const VOUCHER_PACKAGES = [
  {
    id: "starter",
    name: "Starter Pack",
    category: "vouchers",
    vouchers: 10,
    price: 25000, // $250.00 in cents
    pricePerUnit: 2500, // $25.00 per voucher
    validityDays: 90,
    badge: null,
    features: ["10 examination vouchers", "Valid for 90 days", "Auto-credential issuance", "Basic support"],
    description: "10 exam vouchers — $25 each",
  },
  {
    id: "professional",
    name: "Professional",
    category: "vouchers",
    vouchers: 50,
    price: 110000, // $1,100.00 in cents
    pricePerUnit: 2200, // $22.00 per voucher
    validityDays: 180,
    badge: "MOST POPULAR",
    savings: "12% cost savings",
    features: ["50 examination vouchers", "Valid for 180 days", "Auto-credential issuance", "Priority support", "12% cost savings"],
    description: "50 exam vouchers — $22 each",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    category: "vouchers",
    vouchers: 0,
    price: 0, // Pay as you go
    pricePerUnit: 2000, // $20.00 per voucher
    validityDays: 365,
    badge: "PAY AS YOU GO",
    features: ["Pay only for what you use", "No upfront payment required", "$20 per voucher", "Valid for 1 year", "24/7 premium support", "Dedicated account manager"],
    description: "Enterprise pay-as-you-go — $20 per voucher",
  },
];

// Book packages
const BOOK_PACKAGES = [
  {
    id: "book-single",
    name: "Single Book",
    category: "books",
    vouchers: 1,
    price: 4900, // $49.00
    pricePerUnit: 4900,
    validityDays: 365,
    badge: null,
    features: ["1 digital textbook", "Lifetime access", "AI Tutor included", "Practice tests"],
    description: "Single digital book access",
  },
  {
    id: "book-bundle-3",
    name: "3-Book Bundle",
    category: "books",
    vouchers: 3,
    price: 12900, // $129.00
    pricePerUnit: 4300,
    validityDays: 365,
    badge: "BEST VALUE",
    savings: "12% savings",
    features: ["3 digital textbooks", "Lifetime access", "AI Tutor for each book", "Practice tests", "12% savings"],
    description: "3-book bundle — $43 each",
  },
  {
    id: "book-library",
    name: "Full Library",
    category: "books",
    vouchers: 10,
    price: 34900, // $349.00
    pricePerUnit: 3490,
    validityDays: 365,
    badge: "UNLIMITED",
    savings: "29% savings",
    features: ["All available books", "Lifetime access", "AI Tutor for all books", "Priority support", "29% savings"],
    description: "Full library access",
  },
];

// Bundle packages (Exam + Book combos)
const BUNDLE_PACKAGES = [
  {
    id: "bundle-starter",
    name: "Exam + Book Starter",
    category: "bundle",
    vouchers: 5,
    price: 19900, // $199.00
    pricePerUnit: 3980,
    validityDays: 180,
    badge: null,
    features: ["5 exam vouchers", "1 digital book", "Valid for 180 days", "Auto-credential issuance"],
    description: "5 exam vouchers + 1 book",
  },
  {
    id: "bundle-pro",
    name: "Pro Bundle",
    category: "bundle",
    vouchers: 25,
    price: 74900, // $749.00
    pricePerUnit: 2996,
    validityDays: 365,
    badge: "MOST POPULAR",
    savings: "15% savings",
    features: ["25 exam vouchers", "5 digital books", "Valid for 1 year", "Priority support", "15% savings"],
    description: "25 exam vouchers + 5 books",
  },
  {
    id: "bundle-enterprise",
    name: "Enterprise Bundle",
    category: "bundle",
    vouchers: 100,
    price: 249900, // $2,499.00
    pricePerUnit: 2499,
    validityDays: 365,
    badge: "ENTERPRISE",
    savings: "20% savings",
    features: ["100 exam vouchers", "Full book library", "Valid for 1 year", "Dedicated support", "20% savings"],
    description: "100 exam vouchers + full library",
  },
];

// Legacy credit packages (kept for backward compat)
const CREDIT_PACKAGES = VOUCHER_PACKAGES.map(p => ({
  id: p.id,
  name: p.name,
  credits: p.vouchers || 10,
  price: p.price || 25000,
  description: p.description,
}));

export const stripeRouter = router({
  packages: publicProcedure.query(() => CREDIT_PACKAGES),
  voucherPackages: publicProcedure.query(() => VOUCHER_PACKAGES),
  bookPackages: publicProcedure.query(() => BOOK_PACKAGES),
  bundlePackages: publicProcedure.query(() => BUNDLE_PACKAGES),

  createCheckout: protectedProcedure
    .input(z.object({
      packageId: z.string(),
      successUrl: z.string().url(),
      cancelUrl: z.string().url(),
    }))
    .mutation(async ({ input, ctx }) => {
      const stripe = getStripe();
      if (!stripe) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Stripe is not configured. Please add your Stripe API keys.",
        });
      }

      const pkg = CREDIT_PACKAGES.find((p) => p.id === input.packageId);
      if (!pkg) throw new TRPCError({ code: "NOT_FOUND", message: "Package not found" });

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const orgId = ctx.user.orgId || 1;

      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: pkg.name,
                description: pkg.description,
              },
              unit_amount: pkg.price,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        metadata: {
          orgId: orgId.toString(),
          userId: ctx.user.id.toString(),
          packageId: pkg.id,
          credits: pkg.credits.toString(),
        },
      });

      // Record the pending payment
      await db.insert(stripePayments).values({
        orgId,
        userId: ctx.user.id,
        stripeSessionId: session.id,
        amount: pkg.price,
        currency: "usd",
        credits: pkg.credits,
        plan: pkg.id,
        status: "pending",
        metadata: { packageId: pkg.id, packageName: pkg.name },
      });

      return { sessionId: session.id, url: session.url };
    }),

  // Check payment status (called after redirect back from Stripe)
  verifyPayment: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const stripe = getStripe();
      if (!stripe) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe not configured" });

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Get the session from Stripe
      const session = await stripe.checkout.sessions.retrieve(input.sessionId);

      if (session.payment_status !== "paid") {
        return { success: false, message: "Payment not completed" };
      }

      // Check if already processed
      const existing = await db.select().from(stripePayments)
        .where(eq(stripePayments.stripeSessionId, input.sessionId)).limit(1);

      if (!existing.length) {
        return { success: false, message: "Payment record not found" };
      }

      const payment = existing[0];
      if (!payment) return { success: false, message: "Payment record not found" };

      if (payment.status === "completed") {
        return { success: true, message: "Payment already processed", credits: payment.credits };
      }

      // Mark as completed
      await db.update(stripePayments)
        .set({ status: "completed", completedAt: new Date(), stripePaymentIntentId: session.payment_intent as string })
        .where(eq(stripePayments.stripeSessionId, input.sessionId));

      // Add credits to org balance
      const orgId = payment.orgId;
      const creditsToAdd = payment.credits || 0;

      const balRows = await db.select().from(creditBalances).where(eq(creditBalances.orgId, orgId)).limit(1);
      const currentBalance = parseFloat(balRows[0]?.balance?.toString() || "0");
      const newBalance = currentBalance + creditsToAdd;

      await db.insert(creditBalances).values({ orgId, balance: newBalance.toFixed(4) })
        .onDuplicateKeyUpdate({ set: { balance: newBalance.toFixed(4) } });

      // Add ledger entry
      await db.insert(ledgerEntries).values({
        orgId,
        userId: ctx.user.id,
        type: "credit_purchase",
        amount: creditsToAdd.toFixed(4),
        currency: "USD",
        balanceBefore: currentBalance.toFixed(4),
        balanceAfter: newBalance.toFixed(4),
        description: `Stripe payment - ${payment.plan} package`,
        cryptoHash: `stripe_${input.sessionId}`,
        prevHash: "STRIPE",
      });

      // Grant book access for any book IDs stored in payment metadata
      const paymentMeta = payment.metadata as Record<string, unknown> | null;
      const bookIdsRaw = paymentMeta?.bookIds;
      if (bookIdsRaw) {
        const bookIdList: number[] = Array.isArray(bookIdsRaw)
          ? (bookIdsRaw as unknown[]).map(Number).filter(Boolean)
          : String(bookIdsRaw).split(",").map(Number).filter(Boolean);
        if (bookIdList.length > 0) {
          for (const bookId of bookIdList) {
            try {
              await db.insert(bookAccess).values({
                bookId,
                userId: payment.userId,
                accessType: "purchased",
                purchasedAt: new Date(),
              });
            } catch {
              // ignore duplicate key — already granted
            }
          }
        }
      }
      return { success: true, credits: creditsToAdd, newBalance };
    }),

  // Dynamic checkout: accepts custom voucher count + selected book IDs
  createCustomCheckout: protectedProcedure
    .input(z.object({
      purchaseType: z.enum(["vouchers", "books", "bundle"]),
      voucherCount: z.number().min(0).max(10000).default(0),
      bookIds: z.array(z.number()).default([]),
      successUrl: z.string().url(),
      cancelUrl: z.string().url(),
    }))
    .mutation(async ({ input, ctx }) => {
      const stripe = getStripe();
      if (!stripe) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe not configured" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const orgId = ctx.user.orgId || 1;
      const VOUCHER_PRICE_CENTS = 2500; // $25 per voucher
      const lineItems: any[] = [];
      let totalCredits = 0;
      let totalAmount = 0;
      // Voucher line item
      if (input.voucherCount > 0) {
        const voucherTotal = input.voucherCount * VOUCHER_PRICE_CENTS;
        totalAmount += voucherTotal;
        totalCredits += input.voucherCount;
        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: { name: `Exam Vouchers (x${input.voucherCount})`, description: `${input.voucherCount} examination vouchers at $25 each` },
            unit_amount: VOUCHER_PRICE_CENTS,
          },
          quantity: input.voucherCount,
        });
      }
      // Book line items
      if (input.bookIds.length > 0) {
        const bookRows = await db.select().from(books).where(inArray(books.id, input.bookIds));
        for (const book of bookRows) {
          const bookPriceCents = Math.round(parseFloat(book.price || "49") * 100);
          totalAmount += bookPriceCents;
          lineItems.push({
            price_data: {
              currency: "usd",
              product_data: { name: book.title, description: book.author ? `By ${book.author}` : "Digital study material" },
              unit_amount: bookPriceCents,
            },
            quantity: 1,
          });
        }
      }
      if (lineItems.length === 0) throw new TRPCError({ code: "BAD_REQUEST", message: "No items selected" });
      // Bundle discount: 15% off if both vouchers and books
      let discountCents = 0;
      if (input.purchaseType === "bundle" && input.voucherCount > 0 && input.bookIds.length > 0) {
        discountCents = Math.round(totalAmount * 0.15);
        totalAmount -= discountCents;
      }
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        allow_promotion_codes: true,
        customer_email: ctx.user.email || undefined,
        client_reference_id: ctx.user.id.toString(),
        metadata: {
          orgId: orgId.toString(),
          userId: ctx.user.id.toString(),
          voucherCount: input.voucherCount.toString(),
          bookIds: input.bookIds.join(","),
          purchaseType: input.purchaseType,
          discountCents: discountCents.toString(),
        },
      });
      await db.insert(stripePayments).values({
        orgId,
        userId: ctx.user.id,
        stripeSessionId: session.id,
        amount: totalAmount,
        currency: "usd",
        credits: totalCredits,
        plan: input.purchaseType,
        status: "pending",
        metadata: { purchaseType: input.purchaseType, voucherCount: input.voucherCount, bookIds: input.bookIds },
      });
      return { sessionId: session.id, url: session.url };
    }),

  history: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const orgId = ctx.user.orgId || 1;
    return db.select().from(stripePayments)
      .where(eq(stripePayments.orgId, orgId))
      .orderBy(desc(stripePayments.createdAt)).limit(50);
  }),
});
