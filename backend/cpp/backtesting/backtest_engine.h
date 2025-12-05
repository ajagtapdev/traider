#pragma once

#include <vector>
#include <string>
#include "../core/trading_engine.h"
#include "../data/data_processor.h"
#include "../portfolio/portfolio_analytics.h"

namespace traider {
namespace backtesting {

    struct BacktestResult {
        portfolio::PortfolioMetrics metrics;
        std::vector<double> equity_curve;
        std::vector<core::Order> trades;
    };

    class BacktestEngine {
    public:
        BacktestEngine(double initial_capital);

        /**
         * @brief Run a simple backtest on a single asset
         * @param prices Historical close prices
         * @param signals Buy (1), Sell (-1), Hold (0) signals aligned with prices
         */
        BacktestResult run_simple(
            const std::string& ticker,
            const std::vector<double>& prices,
            const std::vector<int>& signals
        );

    private:
        core::TradingEngine engine_;
    };

} // namespace backtesting
} // namespace traider

