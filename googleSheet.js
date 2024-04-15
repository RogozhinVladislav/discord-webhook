const { GoogleSpreadsheet } = require('google-spreadsheet');
const dailyLeadsIds = require('./teamMembers');
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
    const end = 11;

    for (let i = start; i <= end; i++) {
        const excelDate = sheet.getCell(0, i).value;
        if (excelDate) {
            const date = numberToDate(excelDate);
            const dayOfWeek = date.getDay();
            // Skip weekends
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
              const dateString = date.toLocaleDateString("en-US");
              const name = sheet.getCell(1, i).formattedValue;
              dailyLeads[dateString] = name;
          }
        }
    }
    
    function numberToDate(excelDateNumber) {
        const excelEpoch = new Date(1899, 11, 30); // December 30, 1899
        const excelEpochAsUnixTimestamp = excelEpoch.getTime();
        const excelDateAsUnixTimestamp = excelEpochAsUnixTimestamp + excelDateNumber * 24 * 60 * 60 * 1000;
        return new Date(excelDateAsUnixTimestamp);
    }

    const today = new Date().toLocaleDateString("en-US");

    const dailyLeadName = dailyLeads[today];

    const dailyLeadId = dailyLeadsIds[dailyLeadName]

    return { dailyLeadName, dailyLeadId }
}