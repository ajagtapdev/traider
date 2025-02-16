import { query } from "./_generated/server";

// Define the structure of a trade record
interface tradeRecord {
  initialInvestment: number;
  finalValue: number;
  valueOverTime: { date: string; value: number }[];
}

export const get = query({
  args: {},
  handler: async (ctx): Promise<tradeRecord[]> => {
    return await ctx.db.query("past").collect();
  },
});
