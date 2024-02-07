const { spoiler, blockQuote, hyperlink, channelMention, userMention } = require('discord.js');
const googleSheet = require('./googleSheet');
const quotes = require('./quotes');
const { VOICE_CHAT_ID, JIRA_URL, EXCEL_URL } = require('./configurations');
const webhookClient = require('./webhookClient');
const GPT = require('./gpt');

const channel = channelMention(VOICE_CHAT_ID)

async function sendDailyLeader() {
    const { dailyLeadId, dailyLeadName } = await googleSheet.getDailyLead();

    try {
        const message = await GPT(dailyLeadId, dailyLeadName)
        console.log("🚀 ~ message:", message)

        webhookClient.send({ content: message })
    } catch (error) {
        console.error("Error with OpenAI request (full):", error);
        console.error("=========================");
        console.error("Error with OpenAI request:", JSON.stringify(error.response.data.error, null, 2));

        const dailyLeadUser = userMention(dailyLeadId);
        webhookClient.send({ content: `Сегодня дейли проводит ${dailyLeadUser} :clap:` });
    }
}

async function sendDailyMessage() {
    const quote = quotes[Math.floor(Math.random() * quotes.length)];

    const exampleEmbed = {
        "color": 0x0099ff,
        "type": "rich",
        "title": `Скоро Daily :clock11:`,
        "description": `
Через минуту начнётся дейлик, где можно поделиться с командой чем-то важным (или не очень важным)
Буду ждать всеx в ${channel}

Цитата дня:
${spoiler(`${blockQuote(quote)} :hamster: `)}`,
        "fields": [
            {
                "name": "\u200B",
                "value": ':chart_with_upwards_trend: ' + hyperlink('Задачки в Jira', JIRA_URL),
                "inline": true
            },
            {
                "name": "\u200B",
                "value": ':calendar_spiral: ' + hyperlink('План спринта в Google Таблице', `<${EXCEL_URL}>`),
                "inline": true
            }
        ],
        "thumbnail": {
            "url": `https://miro.medium.com/max/300/0*Xx5K0P5rW201QYpr.png`,
            "height": 0,
            "width": 0
        },
        "footer": {
            "text": `не забудьте актуализировать статусы задач в Jira ;)`
        }
    };

    webhookClient.send({ content: `@here`, embeds: [exampleEmbed] })
}

module.exports = {
    sendDailyLeader,
    sendDailyMessage
};
