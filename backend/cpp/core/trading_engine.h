#pragma once

#include <string>
#include <vector>
#include <map>
#include <chrono>

namespace traider {
namespace core {

    enum class OrderType {
        MARKET,
        LIMIT,
        STOP
    };

    enum class OrderSide {
        BUY,
        SELL
    };

    struct Order {
        std::string id;
        std::string ticker;
        OrderType type;
        OrderSide side;
        double quantity;
        double price; // Limit price or execution price
        double timestamp;
    };

    struct Position {
        std::string ticker;
        double quantity;
        double average_price;
        double current_price;
        double unrealized_pnl;
        double realized_pnl;
    };

    class TradingEngine {
    public:
        TradingEngine(double initial_capital);

        // Core actions
        void execute_trade(const std::string& ticker, double quantity, double price, OrderSide side);
        void update_price(const std::string& ticker, double current_price);
        
        // Accessors
        double get_capital() const;
        double get_portfolio_value() const;
        const std::map<std::string, Position>& get_positions() const;
        const std::vector<Order>& get_trade_history() const;

    private:
        double capital_;
        std::map<std::string, Position> positions_;
        std::vector<Order> trade_history_;
    };

} // namespace core
} // namespace traider

