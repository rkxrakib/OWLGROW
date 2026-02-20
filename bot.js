const TelegramBot = require('node-telegram-bot-api');

const token = '8440326465:AAH05W-UQX1G1_oFLLxBsGXtoMveSvPD5Dg';
const bot = new TelegramBot(token, {polling: true});

// মিনি অ্যাপ ইউআরএল (এখানে আপনার হোস্টিং লিংক বসাবেন)
const webAppUrl = 'https://your-hosting-link.com';

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    
    bot.sendMessage(chatId, "Welcome to OwlGrow! 🦉\nComplete tasks and earn USDT & OWL coins.", {
        reply_markup: {
            keyboard: [
                [{ text: "🚀 Open OwlGrow", web_app: { url: webAppUrl } }],
                [{ text: "💰 Withdraw Status" }, { text: "📊 My Profile" }],
                [{ text: "ℹ️ Help" }]
            ],
            resize_keyboard: true,
            one_time_keyboard: false
        }
    });
});

// উইথড্রয়াল হ্যান্ডলিং (সিম্পল উদাহরণ)
bot.on('message', (msg) => {
    if (msg.text === "💰 Withdraw Status") {
        bot.sendMessage(msg.chat.id, "Your withdrawal requests are being processed. Check the app for history.");
    }
});

console.log("Bot is running...");
