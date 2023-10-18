const { GoogleSpreadsheet } = require('google-spreadsheet');
const dailyLeadsIds = require('./team-members');
// {
//     'Имя': 'Discord ID',
// }

module.exports.getDailyLead = async function getDaylyLead() {
    const doc = new GoogleSpreadsheet(process.env.DOC_ID, { apiKey: process.env.GOOGLE_API_KEY });

    await doc.loadInfo();

    // Найти первый не скрытый лист
    let index = 0;
    while (index < doc.sheetCount) {
        const candidateSheet = doc.sheetsByIndex[index];
        if (candidateSheet.hidden) {
            index++
        } else {
            break
        }
    }

    const sheet = doc.sheetsByIndex[index];

    await sheet.loadCells('A1:L2');

    const dailyLeads = {}

    const start = 2;

    for (let i = start; i <= 10; i++) {
        const numberDate = sheet.getCell(0, i).value
        if (numberDate) {
            const date = numberToDate(numberDate).toLocaleDateString("en-US");
            const name = sheet.getCell(1, i).formattedValue;
            dailyLeads[date] = name
        }
    }

    function numberToDate(number) {
        var date = new Date(number * 24 * 60 * 60 * 1000);
        date.setFullYear(date.getFullYear() - 70);
        date.setDate(date.getDate() - 1);
        return (date);
    }

    const today = new Date().toLocaleDateString("en-US");

    const dailyLeadName = dailyLeads[today];

    const dailyLeadId = dailyLeadsIds[dailyLeadName]

    return { dailyLeadName, dailyLeadId }
}