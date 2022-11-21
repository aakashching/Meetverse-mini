//const shortid = require("shortid");
const astring = require("alphastring")
let rooms = {};
let peers;

module.exports = (io) => {
  io.on("connect", (socket) => {
    console.log("a client is connected");
    var rooms = io.sockets.adapter.rooms;
    let clients;
    let roomId;
    socket.on("create", (data) => {
      // roomId = shortid.generate();
      roomId = astring(6);
      socket.join(roomId);
      socket.emit("created", { roomId: roomId });
    });
    socket.on("join", async (data) => {
      // let room = rooms.get(data.roomId)
      roomId = data.roomId;
      let room = rooms.get(roomId);
      // if (room === undefined) {
      //   socket.to(socket.id).emit("invalidRoom");
      //   return;
      // }
      socket.join(roomId);
      clients = await io.in(roomId).allSockets();

      //   for (let socketId of clients) {
      //     console.log("clients", socketId);
      //   }

      // peers[socket.id] = socket;
      for (let id of clients) {
        console.log(id);
        if (id === socket.id) continue;
        console.log("sending init receive to", socket.id);
        socket.to(id).emit("initReceive", socket.id);
      }
    });

    socket.on("signal", (data) => {
      console.log("sending signal from " + socket.id + " to ", data);
      //   if (!socket.to(data.socket_id)) return;
      socket.to(data.socket_id).emit("signal", {
        socket_id: socket.id,
        signal: data.signal,
      });
    });
    socket.on("disconnect", () => {
      console.log("socket disconnected " + socket.id);
      socket.broadcast.emit("removePeer", socket.id);
      socket.leave(roomId);
      // delete peers[socket.id];
    });

    socket.on("initSend", (init_socket_id) => {
      console.log("INIT SEND by " + socket.id + " for " + init_socket_id);
      socket.to(init_socket_id).emit("initSend", socket.id);
    });
    socket.on("sendMsg",(data)=>{
      // socket.to(roomId).emit("msgRecive",data );
      socket.to(data.roomId).emit("msgRecive",data );
    })

    //Screen Share
    // socket.on("share",(data)=>{
    //    // let room = rooms.get(data.roomId)
    //    roomId = data.roomId;
    //    let room = rooms.get(roomId);
    //    if (room === undefined) {
    //      socket.to(socket.id).emit("invalidRoom");
    //      return;
    //    }
    //    socket.join(roomId);
    //    clients = await io.in(roomId).allSockets();
 
    //    //   for (let socketId of clients) {
    //    //     console.log("clients", socketId);
    //    //   }
 
    //    // peers[socket.id] = socket;
    //    for (let id of clients) {
    //      console.log(id);
    //      if (id === socket.id) continue;
    //      console.log("sending init receive to", "sm-"+socket.id);
    //      socket.to(id).emit("initReceive", "sm-"+socket.id);
    //    }
    // })


  });
};
