#include "portfolio_analytics.h"
#include "../utils/math_utils.h"
#include <cmath>
#include <algorithm>
#include <numeric>

namespace traider {
namespace portfolio {

    PortfolioMetrics PortfolioAnalytics::calculate_metrics(
        const std::vector<double>& equity_curve,
        double risk_free_rate
    ) {
        PortfolioMetrics metrics = {0.0, 0.0, 0.0, 0.0, 0.0};
        
        if (equity_curve.size() < 2) return metrics;

        // Total Return
        metrics.total_return = utils::pct_change(equity_curve.back(), equity_curve.front());
        metrics.max_drawdown = calculate_max_drawdown(equity_curve);

        // Daily Returns for Sharpe/Sortino
        std::vector<double> returns;
        returns.reserve(equity_curve.size() - 1);
        for (size_t i = 1; i < equity_curve.size(); ++i) {
            double ret = (equity_curve[i] - equity_curve[i-1]) / equity_curve[i-1];
            returns.push_back(ret);
        }

        // Sharpe Ratio
        // Annualize roughly by sqrt(252) assuming daily data
        // For generalized tool, we might need frequency input. Assuming daily here.
        double avg_return = utils::mean(returns);
        double std_return = utils::std_dev(returns);
        
        if (std_return > 1e-9) {
            // Daily Sharpe
            double daily_rf = risk_free_rate / 252.0; 
            double daily_sharpe = (avg_return - daily_rf) / std_return;
            metrics.sharpe_ratio = daily_sharpe * std::sqrt(252.0);
            metrics.volatility = std_return * std::sqrt(252.0);
        }

        // Sortino Ratio (downside deviation)
        std::vector<double> downside_returns;
        double daily_rf = risk_free_rate / 252.0;
        for (double r : returns) {
            if (r < daily_rf) {
                downside_returns.push_back((r - daily_rf) * (r - daily_rf));
            } else {
                downside_returns.push_back(0.0);
            }
        }
        double downside_std = std::sqrt(utils::mean(downside_returns)); // Semi-deviation
        
        if (downside_std > 1e-9) {
             double daily_sortino = (avg_return - daily_rf) / downside_std;
             metrics.sortino_ratio = daily_sortino * std::sqrt(252.0);
        }

        return metrics;
    }

    double PortfolioAnalytics::calculate_max_drawdown(const std::vector<double>& equity_curve) {
        if (equity_curve.empty()) return 0.0;
        
        double max_val = equity_curve[0];
        double max_dd = 0.0;
        
        for (double val : equity_curve) {
            if (val > max_val) {
                max_val = val;
            } else {
                double dd = (max_val - val) / max_val;
                if (dd > max_dd) max_dd = dd;
            }
        }
        return max_dd * 100.0; // Percentage
    }
    
    double PortfolioAnalytics::calculate_sharpe_ratio(const std::vector<double>& returns, double risk_free_rate) {
        // Standalone helper
        double avg = utils::mean(returns);
        double sd = utils::std_dev(returns);
        if (sd < 1e-9) return 0.0;
        return (avg - risk_free_rate) / sd;
    }

} // namespace portfolio
} // namespace traider

