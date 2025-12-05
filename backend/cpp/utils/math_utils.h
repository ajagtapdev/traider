#pragma once

#include <vector>
#include <cmath>
#include <numeric>
#include <algorithm>
#include <stdexcept>

namespace traider {
namespace utils {

    /**
     * @brief Calculate the mean of a vector of doubles
     */
    double mean(const std::vector<double>& data);

    /**
     * @brief Calculate the variance of a vector of doubles
     */
    double variance(const std::vector<double>& data);

    /**
     * @brief Calculate the standard deviation of a vector of doubles
     */
    double std_dev(const std::vector<double>& data);

    /**
     * @brief Calculate percentage change between two values
     */
    double pct_change(double current, double previous);

} // namespace utils
} // namespace traider

