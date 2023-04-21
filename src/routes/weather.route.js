const router = require('express').Router()
const WeatherController = require("../controllers/weather.controller")
router.get('/weather',WeatherController.getWeatherInfo)

module.exports=router