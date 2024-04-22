const Cron = require("croner");
const isDayOffApi = require('isdayoff')();
const { sendDailyLeader, sendDailyMessage } = require('./dailyMessages');
const { sendSprintIsClosingMessage } = require('./sprintClosing');
const { sendSprintReviewMessage, sendSprintFeedbackMessage } = require('./sprintReview');
const { isDaySprintClosing, isLastDayOfSprint, isSprintReviewTime } = require('./utilities');

const cronOptions = {
    timezone: "Europe/Moscow"
};

// Уведомление о лидере дня за 5 минут до дейлика
Cron('55 10 * * *', function () {
    isDayOffApi.today()
        .then((isDayOff) => {
            if (!isDayOff && !isDaySprintClosing()) {
                sendDailyLeader();
            }
        })
}, cronOptions);

// Уведомление о дейлике за 1 минуту до начала
Cron('59 10 * * *', function () {
    isDayOffApi.today()
        .then((isDayOff) => {
            if (!isDayOff && !isDaySprintClosing()) {
                sendDailyMessage();
            }
        })
}, cronOptions);

// Уведомление о закрытии спринта за 30 минут до закрытия
Cron('30 9 * * WED', function () {
    if (isDaySprintClosing()) {
        isDayOffApi.today()
            .then((isDayOff) => {
                if (!isDayOff) {
                    sendSprintIsClosingMessage();
                }
            })
    }
}, cronOptions);

// Уведомление об обзоре спринта за 1 минуту до начала
Cron('59 12 * * TUE', function () {
    if (isSprintReviewTime()) {
        isDayOffApi.today()
            .then((isDayOff) => {
                if (!isDayOff) {
                    sendSprintReviewMessage();
                }
            })
    }
}, cronOptions);

// Уведомление о фидбеке по спринту в 16:00
Cron('0 16 * * TUE', function () {
    if (isLastDayOfSprint()) {
        isDayOffApi.today()
            .then((isDayOff) => {
                if (!isDayOff) {
                    sendSprintFeedbackMessage();
                }
            })
    }
}, cronOptions);


