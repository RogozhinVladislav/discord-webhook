require('dotenv').config();
const { WEBHOOK_URL, EXCEL_URL, JIRA_URL, SPRINT_REVIEW_URL, VOICE_CHAT_ID, OPENAI_API_KEY, PROXY_STRING } = process.env;

module.exports = {
    WEBHOOK_URL,
    EXCEL_URL,
    JIRA_URL,
    SPRINT_REVIEW_URL,
    VOICE_CHAT_ID,
    OPENAI_API_KEY,
    PROXY_STRING
};