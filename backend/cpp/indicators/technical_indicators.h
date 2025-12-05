#pragma once

#include <vector>
#include <utility>

namespace traider {
namespace indicators {

    /**
     * @brief Calculate Simple Moving Average (SMA)
     * @param prices Input price vector
     * @param period SMA period
     * @return Vector of SMA values (same size as input, padded with NaNs or 0s at start)
     */
    std::vector<double> sma(const std::vector<double>& prices, int period);

    /**
     * @brief Calculate Exponential Moving Average (EMA)
     * @param prices Input price vector
     * @param period EMA period
     * @return Vector of EMA values
     */
    std::vector<double> ema(const std::vector<double>& prices, int period);

    /**
     * @brief Calculate Relative Strength Index (RSI)
     * @param prices Input price vector
     * @param period RSI period (default 14)
     * @return Vector of RSI values
     */
    std::vector<double> rsi(const std::vector<double>& prices, int period = 14);

    /**
     * @brief Calculate Volume Weighted Average Price (VWAP)
     * @param prices Input price vector
     * @param volumes Input volume vector
     * @return Vector of VWAP values
     */
    std::vector<double> vwap(const std::vector<double>& prices, const std::vector<double>& volumes);

    /**
     * @brief Calculate Bollinger Bands
     * @param prices Input price vector
     * @param period Moving average period
     * @param num_std_dev Number of standard deviations
     * @return Pair of vectors {upper_band, lower_band}
     */
    std::pair<std::vector<double>, std::vector<double>> bollinger_bands(
        const std::vector<double>& prices, int period = 20, double num_std_dev = 2.0);

} // namespace indicators
} // namespace traider

