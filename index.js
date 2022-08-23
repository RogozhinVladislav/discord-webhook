require('dotenv').config()
const cron = require('node-cron');
const { differenceInDays, startOfDay } = require('date-fns');
const isDayOffApi = require('isdayoff')();

const { WebhookClient, bold, hyperlink, channelMention } = require('discord.js');

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

function sendDailyMessage() {
    webhookClient.send({
        content:
            `
@here ${bold('Приглашаю всех на Дейли в')} ${channel}
Полезные ссылки:
${hyperlink('Доска в Jira', JIRA_URL)}
${hyperlink('Запланированные задачи в Google Таблице', `<${EXCEL_URL}>`)}
`,
    });
}

cron.schedule('0 11 * * *', function () {
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