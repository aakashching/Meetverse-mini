const router = require('express').Router()
const WeatherController = require("../controllers/weather.controller")
router.get('/weather',WeatherController.getWeatherInfo)
router.get('/weather/city',WeatherController.getWeatherDataByArea)
module.exports=router