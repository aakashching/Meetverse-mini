const axios = require("axios").default;
const apiKey = "9374ee2a360f6bf91a5adb0cdac1d22a";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather";
const getWeatherInfo = async (req, res) => {
  let { lat, lon } = req.query;
  console.log(lat, lon);
  // if(!lat & !lon) res.json({error:"invalid data"})
  try {
    let data = await axios.get(
      `${apiUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}`
    );

    // console.log(data)
    res.json(data.data);
  } catch (error) {
    console.log(error);
    res.json({ error: "invalid data" });
  }
};

module.exports = {
  getWeatherInfo,
};

const getWeatherDataByArea = async (req, res) => {
  let { q } = req.query;
  console.log(lat, lon);
  // if(!lat & !lon) res.json({error:"invalid data"})
  try {
    let data = await axios.get(`${apiUrl}?q=${city}&appid=${apiKey}`);

    // console.log(data)
    res.json(data.data);
  } catch (error) {
    console.log(error);
    res.json({ error: "invalid data" });
  }
};
