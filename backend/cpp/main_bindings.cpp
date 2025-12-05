#include <pybind11/pybind11.h>
#include <pybind11/stl.h>

#include "utils/math_utils.h"
#include "indicators/technical_indicators.h"
#include "core/trading_engine.h"
#include "data/data_processor.h"
#include "portfolio/portfolio_analytics.h"
#include "backtesting/backtest_engine.h"

namespace py = pybind11;

PYBIND11_MODULE(traider_cpp, m) {
    m.doc() = "High-performance C++ trading engine for Traider";

    // --- Utils Module ---
    auto m_utils = m.def_submodule("utils", "Mathematical utility functions");
    m_utils.def("mean", &traider::utils::mean, "Calculate mean of a vector");
    m_utils.def("variance", &traider::utils::variance, "Calculate variance of a vector");
    m_utils.def("std_dev", &traider::utils::std_dev, "Calculate standard deviation of a vector");
    m_utils.def("pct_change", &traider::utils::pct_change, "Calculate percentage change");

    // --- Indicators Module ---
    auto m_indicators = m.def_submodule("indicators", "Technical indicators");
    m_indicators.def("sma", &traider::indicators::sma, "Calculate Simple Moving Average", py::arg("prices"), py::arg("period"));
    m_indicators.def("ema", &traider::indicators::ema, "Calculate Exponential Moving Average", py::arg("prices"), py::arg("period"));
    m_indicators.def("rsi", &traider::indicators::rsi, "Calculate RSI", py::arg("prices"), py::arg("period") = 14);
    m_indicators.def("vwap", &traider::indicators::vwap, "Calculate VWAP", py::arg("prices"), py::arg("volumes"));
    m_indicators.def("bollinger_bands", &traider::indicators::bollinger_bands, "Calculate Bollinger Bands", py::arg("prices"), py::arg("period") = 20, py::arg("num_std_dev") = 2.0);

    // --- Data Module ---
    auto m_data = m.def_submodule("data", "Data processing utilities");
    py::class_<traider::data::OHLCV>(m_data, "OHLCV")
        .def(py::init<>()) // Default constructor
        .def_readwrite("open", &traider::data::OHLCV::open)
        .def_readwrite("high", &traider::data::OHLCV::high)
        .def_readwrite("low", &traider::data::OHLCV::low)
        .def_readwrite("close", &traider::data::OHLCV::close)
        .def_readwrite("volume", &traider::data::OHLCV::volume)
        .def_readwrite("timestamp", &traider::data::OHLCV::timestamp);

    m_data.def("normalize", &traider::data::DataProcessor::normalize, "Normalize data (min-max)");

    // --- Core Module ---
    auto m_core = m.def_submodule("core", "Core trading engine components");
    
    py::enum_<traider::core::OrderSide>(m_core, "OrderSide")
        .value("BUY", traider::core::OrderSide::BUY)
        .value("SELL", traider::core::OrderSide::SELL)
        .export_values();
        
    py::class_<traider::core::Position>(m_core, "Position")
        .def(py::init<>()) // Default constructor
        .def_readwrite("ticker", &traider::core::Position::ticker)
        .def_readwrite("quantity", &traider::core::Position::quantity)
        .def_readwrite("average_price", &traider::core::Position::average_price)
        .def_readwrite("current_price", &traider::core::Position::current_price)
        .def_readwrite("unrealized_pnl", &traider::core::Position::unrealized_pnl)
        .def_readwrite("realized_pnl", &traider::core::Position::realized_pnl);

    py::class_<traider::core::TradingEngine>(m_core, "TradingEngine")
        .def(py::init<double>())
        .def("execute_trade", &traider::core::TradingEngine::execute_trade)
        .def("update_price", &traider::core::TradingEngine::update_price)
        .def("get_capital", &traider::core::TradingEngine::get_capital)
        .def("get_portfolio_value", &traider::core::TradingEngine::get_portfolio_value)
        .def("get_positions", &traider::core::TradingEngine::get_positions);

    // --- Backtesting Module ---
    auto m_backtest = m.def_submodule("backtesting", "Backtesting engine");
    
    py::class_<traider::portfolio::PortfolioMetrics>(m_backtest, "PortfolioMetrics")
        .def(py::init<>()) // Default constructor
        .def_readwrite("total_return", &traider::portfolio::PortfolioMetrics::total_return)
        .def_readwrite("sharpe_ratio", &traider::portfolio::PortfolioMetrics::sharpe_ratio)
        .def_readwrite("sortino_ratio", &traider::portfolio::PortfolioMetrics::sortino_ratio)
        .def_readwrite("max_drawdown", &traider::portfolio::PortfolioMetrics::max_drawdown)
        .def_readwrite("volatility", &traider::portfolio::PortfolioMetrics::volatility);

    m_backtest.def("calculate_metrics", &traider::portfolio::PortfolioAnalytics::calculate_metrics,
        "Calculate portfolio metrics from equity curve",
        py::arg("equity_curve"), py::arg("risk_free_rate") = 0.02);

    py::class_<traider::backtesting::BacktestResult>(m_backtest, "BacktestResult")
        .def(py::init<>()) // Default constructor
        .def_readwrite("metrics", &traider::backtesting::BacktestResult::metrics)
        .def_readwrite("equity_curve", &traider::backtesting::BacktestResult::equity_curve);

    py::class_<traider::backtesting::BacktestEngine>(m_backtest, "BacktestEngine")
        .def(py::init<double>())
        .def("run_simple", &traider::backtesting::BacktestEngine::run_simple);

}
