import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// Insert a new trade into the database
export const addTrade = mutation({
  args: {
    userId: v.string(),
    date: v.string(),
    action: v.string(),
    ticker: v.string(),
    quantity: v.number(),
    price: v.number(),
    tv: v.number(),
  },
 
 
  handler: async (ctx, args) => {
    await ctx.db.insert("trades", args);
  },
});

// Get all trades for a user
export const getTrades = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("trades")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .collect();
  },
});
