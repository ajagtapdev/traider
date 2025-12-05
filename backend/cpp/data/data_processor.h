#pragma once

#include <vector>
#include <string>

namespace traider {
namespace data {

    struct OHLCV {
        double open;
        double high;
        double low;
        double close;
        double volume;
        long long timestamp; // Unix timestamp
    };

    class DataProcessor {
    public:
        // Convert raw parallel arrays to OHLCV struct
        static std::vector<OHLCV> align_data(
            const std::vector<double>& prices,
            const std::vector<double>& volumes,
            const std::vector<long long>& timestamps
        );

        // Resample data (e.g., minute to hour) - Simplified placeholder
        static std::vector<OHLCV> resample(
            const std::vector<OHLCV>& data,
            int factor
        );

        // Normalize data (min-max scaling)
        static std::vector<double> normalize(const std::vector<double>& data);
    };

} // namespace data
} // namespace traider

