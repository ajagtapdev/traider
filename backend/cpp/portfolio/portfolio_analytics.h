#pragma once

#include <vector>

namespace traider {
namespace portfolio {

    struct PortfolioMetrics {
        double total_return;
        double sharpe_ratio;
        double sortino_ratio;
        double max_drawdown;
        double volatility;
    };

    class PortfolioAnalytics {
    public:
        // Calculate standard portfolio metrics from equity curve
        static PortfolioMetrics calculate_metrics(
            const std::vector<double>& equity_curve,
            double risk_free_rate = 0.02
        );

        static double calculate_max_drawdown(const std::vector<double>& equity_curve);
        static double calculate_sharpe_ratio(const std::vector<double>& returns, double risk_free_rate);
    };

} // namespace portfolio
} // namespace traider

