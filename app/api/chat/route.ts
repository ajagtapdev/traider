import OpenAI from "openai";
import { Trade, Holding } from "@shared/schema";

const openai = new OpenAI();

interface AIFeedback {
  feedback: string[];
  confidence: number;
  recommendations: string[];
}

interface TradeAnalysis {
  trade: Trade;
  priceAtTime: number;
  currentPrice: number;
  percentageChange: number;
  holdingDuration: number;
}

// Helper function to generate structured analysis prompts
function generateAnalysisPrompt(tradeAnalysis: TradeAnalysis[], holdings: Holding[]) {
  // Calculate portfolio metrics
  const totalPortfolioValue = holdings.reduce((sum, h) => sum + (h.quantity * h.currentPrice), 0);
  const positionSizes = holdings.map(h => ({
    symbol: h.symbol,
    percentage: ((h.quantity * h.currentPrice) / totalPortfolioValue) * 100
  }));

  return [
    {
      role: "system",
      content: `You are an expert quantitative trading analyst with deep expertise in:
      - Technical analysis and market timing
      - Risk management and position sizing
      - Portfolio optimization and diversification
      - Trading psychology and behavioral patterns
      
      Analyze trading decisions using these principles:
      1. Compare entry/exit points against major market indicators
      2. Evaluate position sizing relative to total portfolio value
      3. Assess diversification across sectors and asset classes
      4. Identify patterns in trading behavior and emotional decisions
      5. Calculate risk-adjusted returns and Sharpe ratios where applicable
      
      Provide specific, data-driven feedback with numerical support.
      Focus on actionable insights rather than general advice.
      Consider both individual trade performance and portfolio-level impacts.`
    },
    {
      role: "user",
      content: `Perform a comprehensive trading analysis using this data:

      Portfolio Metrics:
      Total Portfolio Value: $${totalPortfolioValue.toFixed(2)}
      Position Sizes: ${JSON.stringify(positionSizes, null, 2)}
      
      Trade History Analysis:
      ${JSON.stringify(tradeAnalysis.map(t => ({
        ...t,
        roi: ((t.currentPrice - t.priceAtTime) / t.priceAtTime * 100).toFixed(2) + '%',
        holdingPeriod: t.holdingDuration + ' days'
      })), null, 2)}

      Current Holdings:
      ${JSON.stringify(holdings.map(h => ({
        symbol: h.symbol,
        quantity: h.quantity,
        currentValue: (h.quantity * h.currentPrice).toFixed(2),
        percentOfPortfolio: ((h.quantity * h.currentPrice) / totalPortfolioValue * 100).toFixed(2) + '%'
      })), null, 2)}

      Analyze:
      1. Trade timing effectiveness (entry/exit points)
      2. Position sizing strategy
      3. Risk management practices
      4. Portfolio diversification
      5. Overall trading patterns

      Required JSON Response Format:
      {
        "feedback": [
          "Specific observation with numerical support",
          "Pattern identification with concrete examples",
          "Risk analysis with metrics"
        ],
        "confidence": "Number between 0-1 based on data quality",
        "recommendations": [
          "Actionable step with specific criteria",
          "Risk management adjustment with target numbers",
          "Portfolio rebalancing suggestion with percentages"
        ]
      }`
    }
  ];
}

export async function analyzeTrades(trades: Trade[], holdings: Holding[]): Promise<AIFeedback> {
  try {
    // Enhanced trade analysis with additional metrics
    const tradeAnalysis: TradeAnalysis[] = trades.map(trade => {
      const currentHolding = holdings.find(h => h.symbol === trade.symbol);
      const currentPrice = currentHolding?.currentPrice || trade.price;
      const holdingDuration = Math.floor((Date.now() - new Date(trade.timestamp).getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        trade,
        priceAtTime: trade.price,
        currentPrice,
        percentageChange: ((currentPrice - trade.price) / trade.price) * 100,
        holdingDuration
      };
    });

    const response = await openai.chat.completions.create({
      model: "nvidia/llama-3.1-nemotron-70b-instruct",
      messages: generateAnalysisPrompt(tradeAnalysis, holdings),
      temperature: 0.7,
      response_format: { type: "json_object" },
      max_tokens: 1024
    });

    const result = response.choices[0].message.content
      ? JSON.parse(response.choices[0].message.content)
      : { feedback: [], confidence: 0, recommendations: [] };

    // Validate and normalize response
    return {
      feedback: result.feedback?.map(f => f.trim()) || [],
      confidence: Math.max(0, Math.min(1, result.confidence || 0)),
      recommendations: result.recommendations?.map(r => r.trim()) || []
    };
  } catch (error) {
    console.error('Error analyzing trades:', error);
    return {
      feedback: ['Unable to analyze trades due to technical issues.'],
      confidence: 0,
      recommendations: ['Please try again later or contact support if the issue persists.']
    };
  }
}