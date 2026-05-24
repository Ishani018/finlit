# FinLit: The Ultimate Financial Literacy RPG

<p align="center">
  <img src="docs/uncle_fin.png" width="150" />
</p>

Welcome to **FinLit**, an engaging, immersive mobile RPG built with React Native that gamifies personal finance! In FinLit, you take control of a simulated life, making critical decisions about your career, investments, real estate, and lifestyle. Navigate through unpredictable life events, manage your happiness and health, and build your net worth to achieve early retirement!

---

## 🌟 Key Features

### 💼 Dynamic Career System
Start from the bottom and climb the corporate ladder! Apply for jobs, earn promotions, and increase your salary. Be careful though, your energy and health are tied to your work performance!

<p align="center">
  <img src="docs/game%20tester.png" width="300" style="margin-right: 10px;" />
  <img src="docs/fine%20dining%20restaurant.png" width="300" />
</p>

### 🏠 Real Estate & Mortgages
Buy and rent properties. Take out home loans, manage EMIs, and build equity. Properties appreciate over time based on the economic cycle, allowing you to flip houses or build a rental empire.

<p align="center">
  <img src="docs/city_apartment_with_3_floors.png" width="300" style="margin-right: 10px;" />
  <img src="docs/villa_for_family_of_4-5.png" width="300" />
</p>

### 📈 Deep Investment Engine & Debt Management
Put your money to work! The game features a fully realized stock market, mutual funds, FDs, and Gold. But manage your debt carefully—use credit cards wisely and pay off personal loans to boost your credit score!

### 👨‍👩‍👧 Family & Life Events
Get married, have children, and manage your dependents. Life is unpredictable—expect medical emergencies, market crashes, and surprise expenses. Protect your family by purchasing health and life insurance!

### 👴 Meet Uncle Fin!
Your personal financial advisor! Uncle Fin will guide you through the complex world of finance, giving you contextual tips at the end of every month to help you optimize your tax strategy and investment portfolio.

---

## 🚀 Getting Started

The project is entirely focused on the **MobileClient** (React Native / Expo).

### Prerequisites
- Node.js (v18+)
- Expo CLI
- Expo Go app on your iOS/Android device (or Android Studio / Xcode for emulators)

### Installation

1. Navigate to the MobileClient directory:
   ```bash
   cd MobileClient
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Metro Bundler:
   ```bash
   npx expo start
   ```

4. Scan the QR code with the Expo Go app on your phone, or press `a` to run on an Android emulator, or `i` for iOS simulator.

---

## 🎮 How to Play

1. **Month 1:** You arrive in the city with a small amount of cash. Your first goal is to **Find a Job** and **Buy Groceries**. 
2. **Advance Time:** The game progresses month by month. Click the gold **Next Month** coin to advance time and receive your paycheck.
3. **Survive:** Manage your Food (Pantry) and Health. If you don't eat, your health drops. If your health drops too low, you'll be forced to take unpaid sick leave!
4. **Thrive:** Once your basic needs are met, start investing. Open an FD, start a Mutual Fund SIP, or save up for a downpayment on an apartment.
5. **Retire:** Build up enough passive income and investments in your Retirement Buckets to quit your job and win the game!

---

## 🛠️ Technology Stack
- **Framework:** React Native & Expo
- **Styling:** TailwindCSS (NativeWind) & custom styling
- **State Management:** React Context API (`GameContext.js`)
- **Routing:** Conditional rendering based layout architecture

## ⚠️ Note on Assets
The heavy image assets for this game are kept locally and are intentionally excluded from the repository.

---
*Happy Investing! Build your wealth, manage your risks, and achieve financial freedom.*
