const { bold, hyperlink, italic } = require('discord.js');
const { SPRINT_REVIEW_URL, EXCEL_URL, JIRA_URL } = require('./configurations');
const webhookClient = require('./webhookClient');

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

module.exports = {
    sendSprintReviewMessage,
    sendSprintFeedbackMessage
};
