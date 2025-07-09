import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  members: defineTable({
    name: v.string(),
    accessCode: v.string(),
    isAdmin: v.optional(v.boolean()),
  })
    .index("by_accessCode", ["accessCode"])
    .index("isAdmin", ["isAdmin"]),

  monthlyDues: defineTable({
    amount: v.optional(v.number()),
    memberId: v.id("members"),
    month: v.number(),
    year: v.number(),
    status: v.string(),
  })
    .index("by_member", ["memberId"])
    .index("by_year", ["year"])
    .index("by_year_month", ["year", "month"]),

  // Add to your existing schema
  projectLevy: defineTable({
    memberId: v.id("members"),
    amount: v.number(),
    year: v.number(),
    date: v.number(), // timestamp
  })
    .index("by_member", ["memberId"])
    .index("by_year", ["year"]),

  // Add to your existing schema
  fines: defineTable({
    memberId: v.id("members"),
    amount: v.number(),
    reason: v.string(),
    date: v.number(), // timestamp
    status: v.union(v.literal("paid"), v.literal("unpaid")),
  })
    .index("by_member", ["memberId"])
    .index("by_status", ["status"]),
});

