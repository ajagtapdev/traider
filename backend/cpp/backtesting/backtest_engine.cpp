#include "backtest_engine.h"

namespace traider {
namespace backtesting {

    BacktestEngine::BacktestEngine(double initial_capital) 
        : engine_(initial_capital) {}

    BacktestResult BacktestEngine::run_simple(
        const std::string& ticker,
        const std::vector<double>& prices,
        const std::vector<int>& signals
    ) {
        BacktestResult result;
        if (prices.size() != signals.size()) return result;

        result.equity_curve.reserve(prices.size());

        for (size_t i = 0; i < prices.size(); ++i) {
            // Update Price
            engine_.update_price(ticker, prices[i]);

            // Execute Signal
            // Simple logic: Buy all capital, Sell all position
            // In real engine, signals should be more complex orders
            int signal = signals[i];
            
            if (signal == 1) { // BUY
                double capital = engine_.get_capital();
                if (capital > 0) {
                    double qty = capital / prices[i];
                    // Apply slight slippage/fee model? For now, raw.
                    engine_.execute_trade(ticker, qty, prices[i], core::OrderSide::BUY);
                }
            } else if (signal == -1) { // SELL
                const auto& positions = engine_.get_positions();
                auto it = positions.find(ticker);
                if (it != positions.end() && it->second.quantity > 0) {
                    engine_.execute_trade(ticker, it->second.quantity, prices[i], core::OrderSide::SELL);
                }
            }

            // Record Equity
            result.equity_curve.push_back(engine_.get_portfolio_value());
        }

        // Calculate Metrics
        result.metrics = portfolio::PortfolioAnalytics::calculate_metrics(result.equity_curve);
        result.trades = engine_.get_trade_history();

        return result;
    }

} // namespace backtesting
} // namespace traider

