const { bold, hyperlink } = require('discord.js');
const { JIRA_URL } = require('./configurations');
const webhookClient = require('./webhookClient');

function sendSprintIsClosingMessage() {
    webhookClient.send({
        content:
            `
@here ${bold('Через полчаса закрываем спринт, не забудьте актулизировать статусы по задачам :)')}
${hyperlink('Доска в Jira', JIRA_URL)}
`,
    });
}

module.exports = {
    sendSprintIsClosingMessage
};
