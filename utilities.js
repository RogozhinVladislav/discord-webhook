const { differenceInDays, startOfDay } = require('date-fns');

function isDaySprintClosing() {
    const start = new Date(1658880000000);
    const today = startOfDay(new Date());
    const diffDays = differenceInDays(today, start) + 1;
    return diffDays % 14 === 0;
}

function isLastDayOfSprint() {
    // 26 July 2022 г., 0:00:00 (был вторник, день обзора спринта)
    const start = new Date(1658793600000);
    const today = startOfDay(new Date());
    const diffDays = differenceInDays(today, start) + 1;
    return diffDays % 28 === 0;
}

module.exports = {
    isDaySprintClosing,
    isLastDayOfSprint
};
