import axios from 'axios';

// @desc    Get current weather
// @route   GET /api/weather
// @access  Public
export const getWeather = async (req, res) => {
    try {
        const { lat, lon, city } = req.query;
        const apiKey = process.env.OPEN_WEATHER_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ success: false, message: 'OpenWeather API Key missing in backend' });
        }

        let url = `https://api.openweathermap.org/data/2.5/weather?appid=${apiKey}&units=metric`;

        if (lat && lon) {
            url += `&lat=${lat}&lon=${lon}`;
        } else if (city) {
            url += `&q=${city}`;
        } else {
            // Default to Delhi if no location provided
            url += `&q=Delhi,IN`;
        }

        const response = await axios.get(url);

        const weatherData = {
            location: response.data.name,
            temperature: Math.round(response.data.main.temp),
            condition: response.data.weather[0].main.toLowerCase(), // e.g., 'clouds', 'clear', 'rain'
            description: response.data.weather[0].description,
            humidity: response.data.main.humidity,
            windSpeed: Math.round(response.data.wind.speed * 3.6), // Convert m/s to km/h
            rainfall: response.data.rain ? response.data.rain['1h'] || 0 : 0
        };

        res.status(200).json({
            success: true,
            data: weatherData
        });

    } catch (error) {
        console.error("OpenWeather API Error:", error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch weather data' });
    }
};
