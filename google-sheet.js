const { GoogleSpreadsheet } = require('google-spreadsheet');

module.exports.getDailyLead = async function getDaylyLead() {
    const doc = new GoogleSpreadsheet(process.env.DOC_ID);
    doc.useApiKey(process.env.GOOGLE_API_KEY);

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

    await sheet.loadCells('A1:k2');

    const dailyLeads = {}

    for (let i = 1; i <= 10; i++) {
        const numberDate = sheet.getCell(0, i).value
        const date = numberToDate(numberDate).toLocaleDateString("en-US");
        const name = sheet.getCell(1, i).formattedValue;
        dailyLeads[date] = name
    }

    const dailyLeadsIds = {
        'Женя': '996675915604045915',
        'Влад Ф': '701783368819540082',
        'Влад Р': '555349812774567958',
        'Настя': '969149875751116800',
        'Руслан': '1008650409340063866',
        'Маша': '969494810983534682',
    }

    function numberToDate(number) {
        if (!number) return ''
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