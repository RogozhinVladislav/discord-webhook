### Requires files
#### .env
WEBHOOK_URL  
EXCEL_URL  
JIRA_URL  
SPRINT_REVIEW_URL  
VOICE_CHAT_ID  
GOOGLE_API_KEY  
DOC_ID  

#### teamMembers.js
Пример
```
module.exports = {
    'Имя': '999999999999999',
}
```
Имя - строка из гугл таблицы (см. getDailyLead)  
discord user id

#### promts.js
Пример
```
const getDailyLeadPromt = (dailyLeadName) => `
Есть сообщение: Сегодня дейли проводит <${dailyLeadName}>...
Сделай только одно продолжение в забавной форме.
Примеры:
Сегодня дейли проводит <Имя>... и он сказал, что у него есть сюрприз для команды. Надеемся, что это не еще одна встреча!
`

module.exports = { getDailyLeadPromt }
```

### Функции
getDailyLead - загружает гугл док, который имеет 2 строки, верхняя строка для дат, нижняя для имён

|       |   A   |   B   |   C   |   D   |   E   |   F   |   G   |
|-------|-------|-------|-------|-------|-------|-------|-------|
| **1** | 25.09 | 26.09 | 27.09 | 28.09 | 29.09 | 30.09 | 01.10 |
| **2** | Имя 1| Имя 2| Имя 3| Имя 4| Имя 5| Имя 6| Имя 7|


### pm2
```
pm2 start main.js --name acqhamster
pm2 restart acqhamster
pm2 stop acqhamster
```
