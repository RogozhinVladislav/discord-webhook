const OpenAI = require('openai');
const { spoiler, blockQuote, hyperlink, channelMention, userMention } = require('discord.js');
const { getDailyLeadPromt } = require('./promts');
const googleSheet = require('./googleSheet');
const quotes = require('./quotes');
const { OPENAI_API_KEY, VOICE_CHAT_ID, JIRA_URL, EXCEL_URL } = require('./configurations');
const webhookClient = require('./webhookClient');

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const channel = channelMention(VOICE_CHAT_ID)

async function sendDailyLeader() {

    const { dailyLeadId, dailyLeadName } = await googleSheet.getDailyLead();

    try {
        const promt = getDailyLeadPromt(dailyLeadName)

        const chatCompletion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: promt }],
            model: 'gpt-4',
            temperature: 0.7,
        });

        const regex = /<([^<>]+)>/g;
        const content = chatCompletion.choices[0].message.content
        const dailyLeadUser = userMention(dailyLeadId);

        const modifiedMessage = content.replace(regex, dailyLeadUser);

        webhookClient.send({ content: modifiedMessage })
    } catch (error) {
        console.error("Error with OpenAI request:", error);

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
