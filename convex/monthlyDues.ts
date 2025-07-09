import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByMemberId = query({
  args: { memberId: v.id("members") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("monthlyDues")
      .withIndex("by_member", (q) => q.eq("memberId", args.memberId))
      .collect();
  },
});

export const getByYearMonth = query({
  args: { year: v.number(), month: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("monthlyDues")
      .withIndex("by_year_month", (q) =>
        q.eq("year", args.year).eq("month", args.month)
      )
      .collect();
  },
});

export const markDues = mutation({
  args: {
    id: v.optional(v.id("monthlyDues")),
    memberId: v.optional(v.id("members")),
    year: v.optional(v.number()),
    month: v.optional(v.number()),
    amount: v.optional(v.number()),
    createNew: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.id) {
      // Update existing payment
      return await ctx.db.patch(args.id, { status: "paid" });
    } else if (
      args.createNew &&
      args.memberId &&
      args.year !== undefined &&
      args.month !== undefined &&
      args.amount !== undefined
    ) {
      // Create new payment
      return await ctx.db.insert("monthlyDues", {
        memberId: args.memberId,
        year: args.year,
        month: args.month,
        amount: args.amount,
        status: "paid",
      });
    } else {
      throw new Error("Invalid arguments for markDues mutation");
    }
  },
});

export const unMarkDues = mutation({
  args: { id: v.id("monthlyDues") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "pending" });
  },
});

export const getAllMonthlyDues = query({
  handler: async (ctx) => {
    return await ctx.db.query("monthlyDues").collect();
  },
});