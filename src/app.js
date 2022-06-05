const express = require('express')
const app = express()
const httpServer = require('http').createServer(app)
const io = require('socket.io')(httpServer)
require('./routes')(app)

require('./socketController')(io)

const port = process.env.PORT || 3000;


httpServer.listen(port,()=>{
console.log('server is running on port 3000');
})