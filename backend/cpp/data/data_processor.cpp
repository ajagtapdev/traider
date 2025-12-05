#include "data_processor.h"
#include <algorithm>
#include <limits>

namespace traider {
namespace data {

    std::vector<OHLCV> DataProcessor::align_data(
        const std::vector<double>& prices,
        const std::vector<double>& volumes,
        const std::vector<long long>& timestamps
    ) {
        std::vector<OHLCV> result;
        size_t n = std::min({prices.size(), volumes.size(), timestamps.size()});
        result.reserve(n);

        for (size_t i = 0; i < n; ++i) {
            OHLCV bar;
            bar.open = prices[i];  // Simplified: assume price is close, or use single price
            bar.high = prices[i];
            bar.low = prices[i];
            bar.close = prices[i];
            bar.volume = volumes[i];
            bar.timestamp = timestamps[i];
            result.push_back(bar);
        }
        return result;
    }

    std::vector<OHLCV> DataProcessor::resample(const std::vector<OHLCV>& data, int factor) {
        if (data.empty() || factor <= 1) return data;
        
        std::vector<OHLCV> result;
        // Simple chunking implementation
        for (size_t i = 0; i < data.size(); i += factor) {
            OHLCV bar;
            bar.open = data[i].open;
            bar.high = data[i].high;
            bar.low = data[i].low;
            bar.volume = 0;
            bar.timestamp = data[i].timestamp; // Use start time

            size_t end = std::min(i + factor, data.size());
            for (size_t j = i; j < end; ++j) {
                bar.high = std::max(bar.high, data[j].high);
                bar.low = std::min(bar.low, data[j].low);
                bar.volume += data[j].volume;
                if (j == end - 1) {
                    bar.close = data[j].close;
                }
            }
            result.push_back(bar);
        }
        return result;
    }

    std::vector<double> DataProcessor::normalize(const std::vector<double>& data) {
        if (data.empty()) return {};
        
        auto [min_it, max_it] = std::minmax_element(data.begin(), data.end());
        double min_val = *min_it;
        double max_val = *max_it;
        double range = max_val - min_val;
        
        if (range == 0) return std::vector<double>(data.size(), 0.0);
        
        std::vector<double> result;
        result.reserve(data.size());
        for (double val : data) {
            result.push_back((val - min_val) / range);
        }
        return result;
    }

} // namespace data
} // namespace traider

