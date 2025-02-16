import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  users: defineTable({
    name: v.string(),
    tokenIdentifier: v.string(),
  }).index("by_token", ["tokenIdentifier"]),

  simulations: defineTable({
    userId: v.id("users"), // Reference to the user
    initialInvestment: v.number(),
    finalValue: v.number(),
    valueOverTime: v.array(
      v.object({
        date: v.string(),
        value: v.number(),
      })
    ),
  }).index("by_user", ["userId"]),

  trade: defineTable({
    userId: v.id("users"),
    date: v.string(),
    ticker: v.string(),
    quantity: v.number(),
    price: v.number(),
    action: v.string()
  })
});

export default schema;
