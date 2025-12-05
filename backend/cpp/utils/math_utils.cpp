#include "math_utils.h"

namespace traider {
namespace utils {

    double mean(const std::vector<double>& data) {
        if (data.empty()) return 0.0;
        double sum = std::accumulate(data.begin(), data.end(), 0.0);
        return sum / data.size();
    }

    double variance(const std::vector<double>& data) {
        if (data.size() < 2) return 0.0;
        double m = mean(data);
        double sum_sq_diff = 0.0;
        for (double val : data) {
            double diff = val - m;
            sum_sq_diff += diff * diff;
        }
        return sum_sq_diff / (data.size() - 1); // Sample variance
    }

    double std_dev(const std::vector<double>& data) {
        return std::sqrt(variance(data));
    }

    double pct_change(double current, double previous) {
        if (previous == 0.0) return 0.0;
        return ((current - previous) / previous) * 100.0;
    }

} // namespace utils
} // namespace traider

