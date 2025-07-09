import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const LEVY_AMOUNT = 50000; // N50,000

export const getByMemberId = query({
  args: { memberId: v.id("members") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("projectLevy")
      .withIndex("by_member", (q) => q.eq("memberId", args.memberId))
      .collect();
  },
});

export const getByMemberYear = query({
  args: { memberId: v.id("members"), year: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("projectLevy")
      .withIndex("by_member", (q) => q.eq("memberId", args.memberId))
      .filter((q) => q.eq(q.field("year"), args.year))
      .collect();
  },
});

export const addLevyPayment = mutation({
  args: {
    memberId: v.id("members"),
    year: v.number(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if total payments exceed levy amount
    const existingPayments = await ctx.db
      .query("projectLevy")
      .withIndex("by_member", (q) => q.eq("memberId", args.memberId))
      .filter((q) => q.eq(q.field("year"), args.year))
      .collect();

    const totalPaid = existingPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
    const remaining = LEVY_AMOUNT - totalPaid;

    if (args.amount > remaining) {
      throw new Error(
        `Payment exceeds remaining balance. Maximum payment: ${remaining}`
      );
    }

    return await ctx.db.insert("projectLevy", {
      memberId: args.memberId,
      year: args.year,
      amount: args.amount,
      date: Date.now(),
    });
  },
});

export const updateLevyPayment = mutation({
  args: {
    id: v.id("projectLevy"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db.get(args.id);
    if (!payment) throw new Error("Payment not found");

    // Get all payments for this member/year
    const allPayments = await ctx.db
      .query("projectLevy")
      .withIndex("by_member", (q) => q.eq("memberId", payment.memberId))
      .filter((q) => q.eq(q.field("year"), payment.year))
      .collect();

    const otherPaymentsTotal = allPayments
      .filter((p) => p._id !== args.id)
      .reduce((sum, p) => sum + p.amount, 0);

    const newTotal = otherPaymentsTotal + args.amount;

    if (newTotal > LEVY_AMOUNT) {
      throw new Error(
        `Total payments would exceed annual levy. Maximum: ${LEVY_AMOUNT - otherPaymentsTotal}`
      );
    }

    return await ctx.db.patch(args.id, { amount: args.amount });
  },
});

export const deleteLevyPayment = mutation({
  args: { id: v.id("projectLevy") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
