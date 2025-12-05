# 📈 traider - High-Performance AI-Powered Stock Trading Simulator

## 🚀 Inspiration  
Finance isn’t a subject commonly taught thoroughly in schools, yet it plays a crucial role in everyone’s lives. Furthermore, professional trading tools are often inaccessible or too complex for beginners. We created **traider** to bridge this gap, providing a risk-free environment that combines **high-performance C++ analytics** with **AI-driven insights** to help users master the markets.

---

## 🎯 What It Does  
**traider** is a next-generation educational platform that leverages a **hybrid C++/Python architecture** to deliver professional-grade trading simulations:

- 🚀 **High-Performance C++ Core** – Backtesting and technical analysis executed with bare-metal speed.
- 📊 **Real-Time Simulation** – Trade using historical & current data with millisecond-latency processing.
- 🤖 **AI-Powered Feedback** – Instantaneous trade analysis using **Llama 70B** on **NVIDIA Cloud Compute**.
- 📈 **Advanced Technical Indicators** – Real-time calculation of SMA, EMA, RSI, VWAP, and Bollinger Bands using our custom C++ engine.
- 📰 **Market Sentiment Analysis** – AI synthesis of financial news to inform trading decisions.
- 🏆 **Gamified Learning** – Compete on leaderboards and track portfolio performance metrics like Sharpe Ratio and Max Drawdown.

**traider** differentiates itself by running its heavy-lifting simulation logic in **C++**, ensuring accuracy and scalability, while using Python and AI for high-level reasoning and user interaction.

---

## 🛠️ How We Built It  

### 🔹 Core Engine (C++)
The heart of **traider** is a high-performance C++ extension (`traider_cpp`) exposed to Python via **Pybind11**. This layer handles all compute-intensive tasks:
- **Backtesting Engine**: Simulates trading strategies over historical data with O(n) efficiency.
- **Technical Indicators**: Optimized implementations of SMA, EMA, RSI, VWAP, and Bollinger Bands.
- **Data Processing**: Fast normalization and manipulation of OHLCV (Open, High, Low, Close, Volume) market data.
- **Portfolio Analytics**: Real-time calculation of risk metrics like Sharpe Ratio, variance, and returns.

### 🔹 Backend (Python & AI)
Our Python backend acts as the orchestration layer, integrating the C++ engine with modern AI capabilities:
- **FastAPI** – High-performance API server bridging the frontend and the C++ core.
- **NVIDIA Cloud Compute** – Hosting **Llama 3.3 70B** for deep semantic analysis of market news.
- **Google Search API** – Real-time financial news scraping.
- **Yahoo Finance API** – Source for raw historical market data.

### 🔹 Frontend
- **Next.js** – React framework for a responsive, interactive dashboard.
- **Tailwind CSS & ShadCN** – Modern, clean UI components.
- **Recharts** – Visualizing the high-frequency data streams from our backend.
- **Convex & Clerk** – Real-time database and secure authentication.

---

## ⚡ Challenges We Faced  
- **C++/Python Integration**: Developing a seamless interface between the C++ simulation engine and the Python backend using Pybind11.
- **Memory Management**: Ensuring zero-copy data transfer where possible to maintain high performance.
- **Cross-Platform Compilation**: configuring the build system (`setup.py` / `CMake`) to work reliably across different environments.
- **AI Hallucination Control**: Fine-tuning prompts for the Llama 70B model to ensure financial advice remained grounded in data.
- **Real-Time Data Sync**: coordinating the C++ calculation pipeline with live frontend updates.

---

## 🏆 Accomplishments We're Proud Of  
### 🔹 System Architecture
- Built a **hybrid execution environment** where C++ handles the math and Python handles the logic.
- Achieved **significant performance gains** in backtesting speed compared to pure Python implementations.
- Successfully integrated **NVIDIA's Llama 70B** for context-aware financial commentary.

### 🔹 Product Quality
- Designed a **professional-grade dashboard** that abstracts away the complexity of the underlying C++ engine.
- Created a robust educational tool that offers both **quantitative rigor** and **qualitative insights**.

---

## 📚 What We Learned  
- **Systems Programming**: The importance of memory safety and type strictness when building financial engines.
- **Foreign Function Interfaces (FFI)**: How to effectively bridge high-level and low-level languages.
- **Financial Engineering**: Deepened our knowledge of technical analysis algorithms and portfolio theory.
- **Scalable Architecture**: Designing a system that leverages the best tools for each specific job (C++ for speed, AI for reasoning).

---

## Screenshots
![image](https://github.com/user-attachments/assets/6130bbbe-776c-4c00-a901-3e43c6684e36)
![image](https://github.com/user-attachments/assets/46d866d7-dc41-4405-83ad-c7bb2ad005b6)
