const TelegramBot = require('node-telegram-bot-api');

// আপনার টোকেন
const token = '8440326465:AAH05W-UQX1G1_oFLLxBsGXtoMveSvPD5Dg';
const bot = new TelegramBot(token, { polling: true });

// আপনার সঠিক Vercel URL
const webAppUrl = 'https://owlgrow.vercel.app/owlgrow-app/public';

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    
    bot.sendMessage(chatId, "Welcome to OwlGrow! 🦉\nComplete tasks and earn USDT & OWL coins.", {
        reply_markup: {
            keyboard: [
                [{ text: "🚀 Open OwlGrow", web_app: { url: webAppUrl } }],
                [{ text: "💰 Withdraw Status" }, { text: "📊 My Profile" }],
                [{ text: "ℹ️ Help" }, { text: "🏆 Leaderboard" }]
            ],
            resize_keyboard: true,
            one_time_keyboard: false // বাটনগুলো পারমানেন্ট থাকবে
        }
    });
});

// উইথড্রয়াল স্ট্যাটাস চেক (সিম্পল উদাহরণ)
bot.on('message', (msg) => {
    if (msg.text === "💰 Withdraw Status") {
        bot.sendMessage(msg.chat.id, "Your balance is being verified. Withdrawals are processed within 24 hours.");
    }
});

console.log("OwlGrow Bot is running...");
