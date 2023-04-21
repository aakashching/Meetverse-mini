// import {Server} from 'socket.io'
const express = require('express')
const app = express()
const httpServer = require('http').createServer(app)
const WeatherRoute = require('./routes/weather.route')
const io = require('socket.io')(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

require('./routes')(app)

require('./socketController')(io)
// app.use(cros)
app.use('/api',WeatherRoute)
const port = process.env.PORT || 3000;

// app.all("*",(req,res,next)=>{
//     res.setHeader()
// })

httpServer.listen(port, () => {
    console.log('server is running on port 3000');
})

module.express=httpServer