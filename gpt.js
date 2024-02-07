const { userMention } = require('discord.js');
const axios = require("axios");
const { HttpsProxyAgent } = require('https-proxy-agent');
const { getDailyLeadPromt } = require('./promts');
const { OPENAI_API_KEY, PROXY_STRING } = require('./configurations');

module.exports = async function (dailyLeadId, dailyLeadName) {
    const promt = getDailyLeadPromt(dailyLeadName)

    const request = {
        method: 'post',
        url: 'https://api.openai.com/v1/chat/completions',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        data: {
            model: 'gpt-4',
            messages: [
                {
                    role: 'user',
                    content: promt
                }
            ],
            temperature: 0.7
        },
        httpsAgent: new HttpsProxyAgent(PROXY_STRING)
    };

    const response = await axios(request);
    const content = response.data.choices[0].message.content

    const regex = /<([^<>]+)>/g;
    const dailyLeadUser = userMention(dailyLeadId);

    const modifiedMessage = content.replace(regex, dailyLeadUser);

    return modifiedMessage
}