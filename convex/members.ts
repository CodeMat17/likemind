

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";



function generateAccessCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const addMember = mutation({
  args: {
    name: v.string(),
  },
  handler: async ({ db }, { name }) => {
    const normalizedName = name
      .toLowerCase()
      .split(" ")
      .sort()
      .join(" ")
      .trim();

    const existing = await db.query("members").collect();

    const duplicate = existing.find((m) => {
      const normalizedExisting = m.name
        .toLowerCase()
        .split(" ")
        .sort()
        .join(" ")
        .trim();
      return normalizedExisting === normalizedName;
    });

    if (duplicate) {
      throw new Error("Member with this name already exists.");
    }

    let accessCode = "";
    let isUnique = false;

    while (!isUnique) {
      accessCode = generateAccessCode();
      const codeExists = await db
        .query("members")
        .withIndex("by_accessCode", (q) => q.eq("accessCode", accessCode))
        .unique();
      isUnique = !codeExists;
    }

    const id = await db.insert("members", {
      name: name.trim(),
      accessCode,
      isAdmin: false,
    });

    return {
      id,
      name: name.trim(),
      accessCode,
    };
  },
});

export const verifyMember = mutation({
  args: { accessCode: v.string() },
  handler: async ({ db }, { accessCode }) => {
    const normalizedAccessCode = accessCode.toUpperCase();

    const member = await db
      .query("members")
      .withIndex("by_accessCode", (q) =>
        q.eq("accessCode", normalizedAccessCode)
      )
      .first();

    if (!member) {
      throw new Error("Invalid access code");
    }

    return {
      success: true,
      name: member.name,
    };
  },
});

export const verifyAdmin = mutation({
  args: { accessCode: v.string() },
  handler: async ({ db }, { accessCode }) => {

    const admin = await db
      .query("members")
      .withIndex("by_accessCode", (q) => q.eq("accessCode", accessCode.trim()))
      .filter((q) => q.eq(q.field("isAdmin"), true))
      .first();

    if (!admin) throw new Error("Invalid access code");

    return {
      success: true,
      accessCode: admin.accessCode,
      name: admin.name,
    };
  }
});

export const getAllMembers = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("members").order("desc").collect();
  },
});
