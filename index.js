// require('dotenv').config()
const cron = require('node-cron');
const isDayOffApi = require('isdayoff')();

const { WebhookClient, bold, hyperlink, channelMention } = require('discord.js');

const { WEBHOOK_URL, EXCEL_URL, JIRA_URL, VOICE_CHAT_ID } = process.env

const webhookClient = new WebhookClient({
    url: WEBHOOK_URL
});

const channel = channelMention(VOICE_CHAT_ID)

function send() {
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

send()

const cronOptions = {
    scheduled: true,
    timezone: "Europe/Moscow"
}

cron.schedule('30 21 * * *', function () {
    isDayOffApi.today()
        .then((isDayOff) => {
            if (!isDayOff) {
                send();
            }
        })
}, cronOptions);

