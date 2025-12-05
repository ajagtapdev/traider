import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// Insert a new trade into the database
export const addTrade = mutation({
  args: {
    tokenIdentifier: v.string(),
    date: v.string(),
    action: v.string(),
    ticker: v.string(),
    quantity: v.number(),
    price: v.number(),
    tv: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .first();

    if (!user) throw new Error("User not found");

    await ctx.db.insert("trade", {
      userId: user._id,
      date: args.date,
      action: args.action,
      ticker: args.ticker,
      quantity: args.quantity,
      price: args.price,
      tv: args.tv,
    });
  },
});

// Get all trades for a user
export const getTrades = query({
  args: { tokenIdentifier: v.string() },
  handler: async (ctx, { tokenIdentifier }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
      .first();

    if (!user) return [];

    return await ctx.db
      .query("trade")
      .withIndex("by_user", (q) => q.eq("userId", user._id)) // Assuming index exists, if not use filter
      .order("desc")
      .collect();
  },
});
