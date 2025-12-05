#include "trading_engine.h"
#include <iostream>

namespace traider {
namespace core {

    TradingEngine::TradingEngine(double initial_capital) 
        : capital_(initial_capital) {}

    void TradingEngine::execute_trade(const std::string& ticker, double quantity, double price, OrderSide side) {
        if (quantity <= 0 || price <= 0) return;

        double trade_value = quantity * price;

        if (side == OrderSide::BUY) {
            if (capital_ < trade_value) {
                // Not enough capital
                // In a real engine, we'd throw or return error
                return; 
            }
            capital_ -= trade_value;

            // Update Position
            auto& pos = positions_[ticker];
            if (pos.quantity == 0) {
                pos.ticker = ticker;
                pos.average_price = price;
                pos.quantity = quantity;
            } else {
                // Weighted average price
                double total_cost = (pos.quantity * pos.average_price) + trade_value;
                pos.quantity += quantity;
                pos.average_price = total_cost / pos.quantity;
            }
        } else {
            // SELL
            auto it = positions_.find(ticker);
            if (it == positions_.end() || it->second.quantity < quantity) {
                // Not enough shares
                return;
            }
            
            capital_ += trade_value;
            
            // Calculate Realized PnL
            // FIFO/LIFO matters here, but for simple avg price:
            double cost_basis = quantity * it->second.average_price;
            double pnl = trade_value - cost_basis;
            it->second.realized_pnl += pnl;
            
            it->second.quantity -= quantity;
            if (it->second.quantity <= 1e-9) { // Close to zero
                positions_.erase(it);
            }
        }

        // Record Order
        Order order;
        order.ticker = ticker;
        order.quantity = quantity;
        order.price = price;
        order.side = side;
        order.type = OrderType::MARKET; // Simplified
        // timestamp ...
        
        trade_history_.push_back(order);
    }

    void TradingEngine::update_price(const std::string& ticker, double current_price) {
        auto it = positions_.find(ticker);
        if (it != positions_.end()) {
            it->second.current_price = current_price;
            it->second.unrealized_pnl = (current_price - it->second.average_price) * it->second.quantity;
        }
    }

    double TradingEngine::get_capital() const {
        return capital_;
    }

    double TradingEngine::get_portfolio_value() const {
        double value = capital_;
        for (const auto& pair : positions_) {
            value += pair.second.quantity * pair.second.current_price;
        }
        return value;
    }

    const std::map<std::string, Position>& TradingEngine::get_positions() const {
        return positions_;
    }

    const std::vector<Order>& TradingEngine::get_trade_history() const {
        return trade_history_;
    }

} // namespace core
} // namespace traider

