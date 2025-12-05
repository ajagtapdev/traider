#include "technical_indicators.h"
#include "../utils/math_utils.h"
#include <cmath>
#include <limits>

namespace traider {
namespace indicators {

    std::vector<double> sma(const std::vector<double>& prices, int period) {
        std::vector<double> result;
        result.reserve(prices.size());

        if (prices.size() < period) {
            return std::vector<double>(prices.size(), std::numeric_limits<double>::quiet_NaN());
        }

        // Fill initial part with NaN
        for (int i = 0; i < period - 1; ++i) {
            result.push_back(std::numeric_limits<double>::quiet_NaN());
        }

        // Calculate SMA
        double sum = 0.0;
        for (int i = 0; i < period; ++i) {
            sum += prices[i];
        }
        result.push_back(sum / period);

        for (size_t i = period; i < prices.size(); ++i) {
            sum += prices[i] - prices[i - period];
            result.push_back(sum / period);
        }

        return result;
    }

    std::vector<double> ema(const std::vector<double>& prices, int period) {
        std::vector<double> result;
        result.reserve(prices.size());

        if (prices.empty()) return result;

        double multiplier = 2.0 / (period + 1.0);
        
        // Start with SMA for the first valid point or just first price
        // Standard EMA often starts with SMA of first 'period' elements
        // Simplified: Start with first price if history is short, or first price as seed
        
        if (prices.size() < period) {
             // Not enough data for standard definition, but we can compute accumulated EMA
             result.push_back(prices[0]);
             for (size_t i = 1; i < prices.size(); ++i) {
                 double val = (prices[i] - result.back()) * multiplier + result.back();
                 result.push_back(val);
             }
             return result;
        }

        // Standard approach: First EMA value is SMA of first 'period' prices
        double sum = 0.0;
        for (int i = 0; i < period; ++i) {
            result.push_back(std::numeric_limits<double>::quiet_NaN()); // Pad
            sum += prices[i];
        }
        // Replace the last padded NaN with the initial SMA
        result.back() = sum / period;

        for (size_t i = period; i < prices.size(); ++i) {
            double prev_ema = result.back();
            double val = (prices[i] - prev_ema) * multiplier + prev_ema;
            result.push_back(val);
        }

        return result;
    }

    std::vector<double> rsi(const std::vector<double>& prices, int period) {
        std::vector<double> result;
        result.reserve(prices.size());

        if (prices.size() <= period) {
            return std::vector<double>(prices.size(), std::numeric_limits<double>::quiet_NaN());
        }

        std::vector<double> gains, losses;
        for (size_t i = 1; i < prices.size(); ++i) {
            double change = prices[i] - prices[i - 1];
            gains.push_back(change > 0 ? change : 0.0);
            losses.push_back(change < 0 ? -change : 0.0);
        }

        // First average gain/loss
        double avg_gain = 0.0;
        double avg_loss = 0.0;
        for (int i = 0; i < period; ++i) {
            avg_gain += gains[i];
            avg_loss += losses[i];
        }
        avg_gain /= period;
        avg_loss /= period;

        // Pad initial values
        for (int i = 0; i < period; ++i) {
            result.push_back(std::numeric_limits<double>::quiet_NaN());
        }

        // First RSI
        double rs = (avg_loss == 0) ? 100.0 : avg_gain / avg_loss;
        result.push_back(100.0 - (100.0 / (1.0 + rs)));

        // Subsequent RSI
        for (size_t i = period; i < gains.size(); ++i) {
            avg_gain = (avg_gain * (period - 1) + gains[i]) / period;
            avg_loss = (avg_loss * (period - 1) + losses[i]) / period;

            rs = (avg_loss == 0) ? 100.0 : avg_gain / avg_loss;
            result.push_back(100.0 - (100.0 / (1.0 + rs)));
        }

        return result;
    }

    std::vector<double> vwap(const std::vector<double>& prices, const std::vector<double>& volumes) {
        std::vector<double> result;
        if (prices.size() != volumes.size()) return result;
        
        result.reserve(prices.size());

        double cum_pv = 0.0;
        double cum_vol = 0.0;

        for (size_t i = 0; i < prices.size(); ++i) {
            cum_pv += prices[i] * volumes[i];
            cum_vol += volumes[i];
            
            if (cum_vol > 0) {
                result.push_back(cum_pv / cum_vol);
            } else {
                result.push_back(0.0);
            }
        }
        return result;
    }

    std::pair<std::vector<double>, std::vector<double>> bollinger_bands(
        const std::vector<double>& prices, int period, double num_std_dev) {
        
        std::vector<double> upper, lower;
        if (prices.size() < period) return {upper, lower};

        auto sma_vals = sma(prices, period);
        
        upper.reserve(prices.size());
        lower.reserve(prices.size());

        // We need rolling standard deviation
        // Efficient way: keep sum and sum_sq window? 
        // Or recompute for simplicity first.
        
        for (size_t i = 0; i < prices.size(); ++i) {
            if (std::isnan(sma_vals[i])) {
                upper.push_back(std::numeric_limits<double>::quiet_NaN());
                lower.push_back(std::numeric_limits<double>::quiet_NaN());
                continue;
            }

            // Compute std dev for window ending at i
            double sum_sq_diff = 0.0;
            double mean = sma_vals[i];
            // Window start: i - period + 1
            for (int j = 0; j < period; ++j) {
                double diff = prices[i - j] - mean;
                sum_sq_diff += diff * diff;
            }
            double sd = std::sqrt(sum_sq_diff / period); // Population SD usually for BB? Or sample. Tradingview often uses sample (period-1) or population. Let's use period.

            upper.push_back(mean + num_std_dev * sd);
            lower.push_back(mean - num_std_dev * sd);
        }

        return {upper, lower};
    }

} // namespace indicators
} // namespace traider

