require('dotenv').config()
const cron = require('node-cron');
const { differenceInDays, startOfDay } = require('date-fns');
const isDayOffApi = require('isdayoff')();
const googleSheet = require('./google-sheet');
const quotes = require('./quotes');

const { WebhookClient, bold, spoiler, blockQuote, hyperlink, channelMention, userMention } = require('discord.js');

const { WEBHOOK_URL, EXCEL_URL, JIRA_URL, SPRINT_REVIEW_ZOOM_URL, VOICE_CHAT_ID } = process.env

const webhookClient = new WebhookClient({
    url: WEBHOOK_URL
});

const cronOptions = {
    scheduled: true,
    timezone: "Europe/Moscow"
}

// Дейлик ===================

const channel = channelMention(VOICE_CHAT_ID)

async function sendDailyLeader() {

    const { dailyLeadId } = await googleSheet.getDailyLead();

    const dailyLeadUser = userMention(dailyLeadId);

    webhookClient.send({ content: `Сегодня дейли проводит ${dailyLeadUser} :clap:` })
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

cron.schedule('55 10 * * *', function () {
    isDayOffApi.today()
        .then((isDayOff) => {
            if (!isDayOff && !isDaySprintClosing()) {
                sendDailyLeader();
            }
        })
}, cronOptions);

cron.schedule('59 10 * * *', function () {
    isDayOffApi.today()
        .then((isDayOff) => {
            if (!isDayOff && !isDaySprintClosing()) {
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

///// Обзор спринта ======================

function sendSprintReviewMessage() {
    webhookClient.send({
        avatarURL: 'https://cdn.discordapp.com/attachments/1003198982337605645/1048165112931958804/unknown.png',
        content:
            `
@here ${bold('Начинается обзор спринта')}
${hyperlink('Ссылка на ZOOM', SPRINT_REVIEW_ZOOM_URL)}
`,
    });
}

function isDaySprintReview() {
    // 26 July 2022 г., 0:00:00 (была вторник, день обзора спринта)
    const start = new Date(1658793600000);
    const today = startOfDay(new Date());

    const diffDays = differenceInDays(today, start) + 1

    if (diffDays % 14 === 0) return true;

    return false;
}

cron.schedule('59 12 * * tues', function () {
    if (isDaySprintReview()) {
        isDayOffApi.today()
            .then((isDayOff) => {
                if (!isDayOff) {
                    sendSprintReviewMessage()
                }
            })
    }
}, cronOptions);