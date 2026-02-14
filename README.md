# Financial Literacy Simulation Game

A cross-platform (Web & Mobile) simulation game designed to teach financial concepts through immersive role-playing. Players navigate a career, manage expenses, and build wealth through real estate and business investments.

## 🚀 Key Features

### Core Mechanics
- **Real-Time Simulation**: Time progresses automatically (1 Month ≈ 3 Seconds).
- **Economic Engine**: Live balance updates, monthly expenses (Rent, Food), and salary credits.
- **Career Progression**:
  - Start as a **Student** (Net Worth: ₹0).
  - Unlock jobs like **Cafe Worker**, **Mechanic**, **Software Engineer**, and **Manager**.
  - **Requirements System**: Jobs are locked behind Net Worth & Education milestones.
- **Investment Portfolio**:
  - **Real Estate**: Buy properties to upgrade your lifestyle (Hostel -> Apartment -> Villa).
  - **Businesses**: Invest in Food Trucks, Stocks, and Commercial Spaces for passive income.

### Clients
- **Web Client**: Immersive desktop experience with split-screen "Stage" (Visuals) and "Dashboard" (Controls).
- **Mobile Client**: Native iOS/Android app with gesture-based controls, half-screen sheets, and haptic feedback.

---

## 🛠️ Project Structure

```
finlit/
├── WebClient/          # React + Vite (Desktop Browser)
│   ├── src/data/       # Shared Game Data (Jobs, Investments)
│   └── src/context/    # Game Logic (Time, Balance, State)
│
├── MobileClient/       # React Native + Expo (iOS/Android)
│   ├── App.js          # Native UI Entry Point
│   ├── start_tunnel.ps1 # Helper script for Network Tunneling
│   └── assets/         # Optimized assets for mobile
│
└── Backend/            # Python FastAPI (Future Multiplayer Logic)
```

---

## 📱 How to Run (Mobile)

We use **Expo** to run the mobile app on your physical device.

**Prerequisites:**
- Install **Node.js**.
- Install **Expo Go** app on your phone (Play Store / App Store).

**Running the App:**
1. Open Terminal in `MobileClient`:
   ```powershell
   cd MobileClient
   ```
2. **Launch the Tunnel Script** (Recommended for most networks):
   ```powershell
   .\start_tunnel.ps1
   ```
   *(This automatically handles authentication and firewalls)*.

3. **Scan the QR Code** with your phone's camera or Expo Go app.

---

## 💻 How to Run (Web)

1. Open Terminal in `WebClient`:
   ```powershell
   cd WebClient
   npm install
   npm run dev
   ```
2. Open the localhost URL (usually `http://localhost:5173`) in your browser.

---

## 🎨 Tech Stack

- **Frontend (Web)**: React, TailwindCSS, Lucide Icons.
- **Frontend (Mobile)**: React Native, Expo, NativeWind v2 (Styled Components), Reanimated.
- **State Management**: React Context API (GameContext).
- **Assets**: Custom generated visuals for Rooms, Offices, and Job Icons.

## 📝 Recent Updates
- **Mobile Migration**: Successfully ported game logic to React Native.
- **Asset Fixes**: Resolved all missing image paths for Offices and Properties.
- **Networking**: Implemented `ngrok` tunneling for seamless local development.
