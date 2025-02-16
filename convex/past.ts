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
    const results = await ctx.db.query("users").collect() as unknown as tradeRecord[];
    return results.map(record => ({
      initialInvestment: record.initialInvestment || 0,
      finalValue: record.finalValue || 0,
      valueOverTime: record.valueOverTime || []
    }));
  },
});
