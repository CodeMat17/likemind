import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByMemberId = query({
  args: { memberId: v.id("members") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("fines")
      .withIndex("by_member", (q) => q.eq("memberId", args.memberId))
      .collect();
  },
});

export const addFine = mutation({
  args: {
    memberId: v.id("members"),
    amount: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("fines", {
      memberId: args.memberId,
      amount: args.amount,
      reason: args.reason,
      date: Date.now(),
      status: "unpaid",
    });
  },
});

export const updateFine = mutation({
  args: {
    id: v.id("fines"),
    amount: v.optional(v.number()),
    reason: v.optional(v.string()),
    status: v.optional(v.union(v.literal("paid"), v.literal("unpaid"))),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    return await ctx.db.patch(id, rest);
  },
});

export const deleteFine = mutation({
  args: { id: v.id("fines") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const markPaid = mutation({
  args: { id: v.id("fines") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "paid" });
  },
});

export const markUnpaid = mutation({
  args: { id: v.id("fines") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "unpaid" });
  },
});
