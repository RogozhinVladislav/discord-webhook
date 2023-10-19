const { WebhookClient } = require('discord.js');
const { WEBHOOK_URL } = require('./configurations');

const webhookClient = new WebhookClient({ url: WEBHOOK_URL });

module.exports = webhookClient;
