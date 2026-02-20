# 🦉 OwlGrow - Telegram Web Mini App

OwlGrow is a task-earning platform built for Telegram. Users can complete social media tasks (Twitter, Telegram, TikTok) to earn USDT and OWL coins.

## 🚀 Features
- **Auto-Login:** Integrated with Telegram Web App initialization.
- **Daily Tasks:** Earn $0.02 USDT per task.
- **Daily Check-in:** Streak system for bonus OWL coins.
- **Leaderboard:** Real-time user rankings.
- **Referral System:** 10% commission with a unique invite link.
- **Activity Center:** Daily goal tracking and progress bars.

## 🛠️ Prerequisites (যা যা লাগবে)
To run this project, you need:
1. **Telegram Bot Token:** Get it from [@BotFather](https://t.me/BotFather).
2. **Firebase Account:** To store user data and balances.
3. **Web Hosting:** GitHub Pages (for Frontend) and Render/Railway (for Bot Backend).

## 📂 File Structure
- `index.html` - The main app interface.
- `style.css` - Custom premium styling.
- `app.js` - Firebase logic & Telegram Web App integration.
- `bot.js` - Node.js bot code for handling commands.
- `package.json` - Node dependencies.

## ⚙️ Setup Instructions
1. Clone this repository.
2. Replace Firebase credentials in `app.js`.
3. Replace your Bot Token in `bot.js`.
4. Deploy the frontend to GitHub Pages.
5. Set the Mini App URL in BotFather to your GitHub Pages link.
6. Host `bot.js` on a server like Render.com.

## 📜 License
MIT License
