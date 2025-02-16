import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// save or update data
export const saveSimulation = mutation({
  args: {
    tokenIdentifier: v.string(),
    initialInvestment: v.number(),
    finalValue: v.number(),
    valueOverTime: v.array(v.object({ date: v.string(), value: v.number() })),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .first();

    if (!user) throw new Error("User not found");

    await ctx.db.insert("simulations", {
      userId: user._id,
      initialInvestment: args.initialInvestment,
      finalValue: args.finalValue,
      valueOverTime: args.valueOverTime,
    });
  },
});

// fetch data
export const getSimulation = query({
  args: { tokenIdentifier: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .first();

    if (!user) throw new Error("User not found");

    return await ctx.db.query("simulations").withIndex("by_user", (q) => q.eq("userId", user._id)).first();
  },
});
