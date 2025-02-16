import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const registerUser = mutation({
  args: { tokenIdentifier: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    console.log("🔍 Checking if user exists:", args.tokenIdentifier);

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .first();

    if (!existingUser) {
      console.log("✅ Registering new user:", args.name);
      await ctx.db.insert("users", { name: args.name, tokenIdentifier: args.tokenIdentifier });
    } else {
      console.log("⚠️ User already exists:", existingUser);
    }
  },
});
