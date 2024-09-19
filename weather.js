const axios = require('axios');
const { OPEN_WEATHER_MAP_API_KEY } = require('./configurations');

const cities = [
    {
        "name": "Moscow",
        "emoji": "🏛"
    },
    {
        "name": "Saint Petersburg",
        "emoji": "🌉"
    },
    {
        "name": "Ufa",
        "emoji": "🌲"
    },
    {
        "name": "Taganrog",
        "emoji": "🚢"
    },
    {
        "name": "Izhevsk",
        "emoji": "🏞"
    },
    {
        "name": "Tbilisi",
        "emoji": "🍷"
    },
    {
        "name": "Orenburg",
        "emoji": "🐪"
    }
]

const baseUrl = 'http://api.openweathermap.org/data/2.5/weather';

const getWeather = async (city) => {
    try {
        const url = `${baseUrl}?q=${city.name}&appid=${OPEN_WEATHER_MAP_API_KEY}&units=metric&lang=ru`;
        const response = await axios.get(url);
        const data = response.data;

        return {
            ...data.main,
            name: data.name,
            description: data.weather[0].description,
            emoji: city.emoji
        }
    } catch (error) {
        console.error(`Ошибка при получении погоды для ${city}: ${error}`);
    }
};

const getList = async () => {
    const list = await Promise.all(cities.map(city => getWeather(city)));

    return list.filter(Boolean)
}

module.exports = async () => {
    const weatherData = await getList();

    if (weatherData.length === 0) {
        throw new Error('Error while getting weather')
    }

    const temperatureDescription = weatherData.sort((a, b) => a.temp - b.temp).map(data =>
        `${data.emoji} **${data.name}**: **${data.temp}°C** ощущается как: **${data.feels_like}°C**`
    ).join('\n');

    const weatherEmbed = {
        color: 0x0099ff,
        description: temperatureDescription,
    };

    return weatherEmbed
};
