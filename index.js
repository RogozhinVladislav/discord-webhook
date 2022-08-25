require('dotenv').config()
const cron = require('node-cron');
const { differenceInDays, startOfDay } = require('date-fns');
const isDayOffApi = require('isdayoff')();
const googleSheet = require('./google-sheet');
const quotes = require('./quotes');

const { WebhookClient, bold, spoiler, quote, blockQuote, hyperlink, channelMention } = require('discord.js');

const { WEBHOOK_URL, EXCEL_URL, JIRA_URL, VOICE_CHAT_ID } = process.env

const webhookClient = new WebhookClient({
    url: WEBHOOK_URL
});

const cronOptions = {
    scheduled: true,
    timezone: "Europe/Moscow"
}

// Дейлик ===================

const channel = channelMention(VOICE_CHAT_ID)

async function sendDailyMessage() {

    const dailyLead = await googleSheet.getDailyLead();

    const quote = quotes[Math.floor(Math.random() * quotes.length)];

    const exampleEmbed = {
        "color": 0x0099ff,
        "type": "rich",
        "title": `Скоро Daily :clock11:`,
        "description": `
Через 5 минут начнётся дейлик, где можно поделиться с командой чем-то важным (или не очень важным)
Сегодня его проводит ${bold(dailyLead)}
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
            "text": `можете пока актулизировать статусы в Jira ;)`
        }
    };

    webhookClient.send({ content: `@here`, embeds: [exampleEmbed] })
}

cron.schedule('55 10 * * *', function () {
    isDayOffApi.today()
        .then((isDayOff) => {
            if (!isDayOff) {
                sendDailyMessage();
            }
        })
}, cronOptions);

///// Закрытие спринта ======================

function sendSprintIsClosingMessage() {
    webhookClient.send({
        content:
            `
@here ${bold('Через полчаса закрываем спринт, не забудьте актулизировать статусы по задачам :)')}
${hyperlink('Доска в Jira', JIRA_URL)}
`,
    });
}

function isDaySprintClosing() {
    // 27 July 2022 г., 0:00:00 (была среда, день планирования)
    const start = new Date(1658880000000);
    const today = startOfDay(new Date());

    const diffDays = differenceInDays(today, start) + 1

    if (diffDays % 14 === 0) return true;

    return false;
}

cron.schedule('30 9 * * wed', function () {
    if (isDaySprintClosing()) {
        isDayOffApi.today()
            .then((isDayOff) => {
                if (!isDayOff) {
                    sendSprintIsClosingMessage()
                }
            })
    }
}, cronOptions);