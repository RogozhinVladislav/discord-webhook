require('dotenv').config()
const Cron = require("croner");
const { differenceInDays, startOfDay } = require('date-fns');
const isDayOffApi = require('isdayoff')();
const OpenAI = require('openai');
const googleSheet = require('./google-sheet');
const quotes = require('./quotes');
const { getDailyLeadPromt } = require('./promts');

const { WebhookClient, bold, italic, spoiler, blockQuote, hyperlink, channelMention, userMention } = require('discord.js');

const { WEBHOOK_URL, EXCEL_URL, JIRA_URL, SPRINT_REVIEW_URL, VOICE_CHAT_ID, OPENAI_API_KEY } = process.env

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

const webhookClient = new WebhookClient({
    url: WEBHOOK_URL
});

const cronOptions = {
    timezone: "Europe/Moscow"
}

// Дейлик ===================

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

// Дейли начнётся через 5 минут
Cron('55 10 * * *', function () {
    isDayOffApi.today()
        .then((isDayOff) => {
            if (!isDayOff && !isDaySprintClosing()) {
                sendDailyLeader();
            }
        })
}, cronOptions);

// Дейли начинается через минуту
Cron('59 10 * * *', function () {
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

// Через полчаса закрываем спринт
Cron('30 9 * * WED', function () {
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
${hyperlink('Ссылка для подключения', SPRINT_REVIEW_URL)}
`,
    });
}

function sendSprintFeedbackMessage() {
    webhookClient.send({
        content:
            `
@here 
Сегодня — последний день спринта. Наконец-то он закончился! Давайте оценим результаты, проанализируем успехи и неудачи, а также поймем и простим все недочеты и ошибки. Ведь без них не бывает развития и роста. Главное — мы движемся вперед и становимся лучше!
${bold(`Поставить оценку спринту от 1 до 10
1 — абсолютно неудовлетворён
10 — все супер!`)}
${italic('Также рядом с оценкой вы можете написать команде почему поставили такую оценку')}

:chart_with_upwards_trend: ${hyperlink('Задачи в Jira', JIRA_URL)}
:calendar_spiral: ${hyperlink('План спринта в Google Таблице', `<${EXCEL_URL}>`)}
`,
    });
}

function isLastDayOfSprint() {
    // 26 July 2022 г., 0:00:00 (была вторник, день обзора спринта)
    const start = new Date(1658793600000);
    const today = startOfDay(new Date());

    const diffDays = differenceInDays(today, start) + 1

    if (diffDays % 14 === 0) return true;

    return false;
}

// Спринт-ревью
Cron('59 12 * * TUE', function () {
    if (isLastDayOfSprint()) {
        isDayOffApi.today()
            .then((isDayOff) => {
                if (!isDayOff) {
                    sendSprintReviewMessage()
                }
            })
    }
}, cronOptions);

// Удовлетворенность спринтом
Cron('0 16 * * TUE', function () {
    if (isLastDayOfSprint()) {
        isDayOffApi.today()
            .then((isDayOff) => {
                if (!isDayOff) {
                    sendSprintFeedbackMessage()
                }
            })
    }
}, cronOptions);
