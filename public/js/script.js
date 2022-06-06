let socket = io();
let localStream;
let peers = {};
let videos = document.getElementById("videos");
let input = document.getElementById("input");
let createBtn = document.getElementById("create");
let joinBtn = document.getElementById("join");
let localVideo = document.getElementById("localVideo");
let muteBtn = document.getElementById("muteBtn");
let vdoBtn = document.getElementById("vdoBtn");
let exitBtn = document.getElementById("exit");
let btnGrp = document.getElementById("btn-grp");
let streams = {};
const configuration = {
  // Using From https://www.metered.ca/tools/openrelay/
  iceServers: [
    {
      urls: "stun:openrelay.metered.ca:80",
    },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443?transport=tcp",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
};

let constraints = {
  audio: true,
  video: {
    width: {
      min: 360,
      max: 480,
    },
    height: {
      min: 240,
      max: 360,
    },
  },
};
constraints.video.facingMode = {
  ideal: "user",
};
function init() {
  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    localStream = stream;
    localVideo.srcObject = stream;
    localVideo.onloadedmetadata = () => {
      localVideo.mute = true;
      localVideo.play();
    };
  });
  exitBtn.disabled = true;
}

init();
const joinFn = () => {
  if (input.value.trim() === "") {
    alert("invalid input");
    return;
  }
  console.log("joined");
  localVideo.classList.add("vid-move");
  videos.classList.add("videos-container");
  btnGrp.classList.add("btn-move");
  exitBtn.disabled = false;
  socket.emit("join", { roomId: input.value });
};

createBtn.addEventListener("click", (e) => {
  console.log("clicked");

  socket.emit("create");
  socket.on("created", (data) => {
    let { roomId } = data;
    console.log(roomId);
    input.value = roomId;
  });
});

joinBtn.addEventListener("click", joinFn);

socket.on("invalidRoom", () => {
  alert("invalid room id");
});

socket.on("initReceive", (socket_id) => {
  console.log("init received", socket_id);
  addPeer(socket_id, false);

  socket.emit("initSend", socket_id);
});

socket.on("initSend", (socket_id) => {
  console.log("INIT SEND " + socket_id);
  // console.log(peers);
  addPeer(socket_id, true);
});

socket.on("removePeer", (socket_id) => {
  console.log("removing peer " + socket_id);
  removePeer(socket_id);
});

socket.on("disconnect", () => {
  console.log("GOT DISCONNECTED");
  for (let socket_id in peers) {
    removePeer(socket_id);
  }
});

socket.on("signal", (data) => {
  console.log("signal", peers);
  peers[data.socket_id].signal(data.signal);

  console.log(peers[data.socket_id]);
});

/**
 * Remove a peer with given socket_id.
 * Removes the video element and deletes the connection
 * @param {String} socket_id
 */
function removePeer(socket_id) {
  let videoEl = document.getElementById(socket_id);
  if (videoEl) {
    const tracks = videoEl.srcObject.getTracks();

    tracks.forEach(function (track) {
      track.stop();
    });

    videoEl.srcObject = null;
    videoEl.parentNode.removeChild(videoEl);
  }
  if (peers[socket_id]) peers[socket_id].destroy();
  delete peers[socket_id];
}

/**
 * Creates a new peer connection and sets the event listeners
 * @param {String} socket_id
 *                 ID of the peer
 * @param {Boolean} am_initiator
 *                  Set to true if the peer initiates the connection process.
 *                  Set to false if the peer receives the connection.
 */
function addPeer(socket_id, am_initiator) {
  console.log("peer added", am_initiator);
  peers[socket_id] = new SimplePeer({
    initiator: am_initiator,
    stream: localStream,
    config: configuration,
  });

  peers[socket_id].on("signal", (data) => {
    console.log(data);

    socket.emit("signal", {
      signal: data,
      socket_id: socket_id,
    });
  });

  peers[socket_id].on("stream", (stream) => {
    if (!streams[stream.id]) {
      console.log("Streaming new video");
      let newVid = document.createElement("video");
      newVid.srcObject = stream;
      newVid.id = socket_id;
      newVid.playsinline = false;
      newVid.autoplay = true;
      newVid.className = "gird-items";
      newVid.onclick = () => openPictureMode(newVid);
      newVid.ontouchstart = (e) => openPictureMode(newVid);
      videos.appendChild(newVid);
      streams[stream.id] = stream;
    }
  });
  peers[socket_id].on("track", (track, stream) => {
    console.log(stream);
  });
}

/**
 * Opens an element in Picture-in-Picture mode
 * @param {HTMLVideoElement} el video element to put in pip mode
 */
function openPictureMode(el) {
  console.log("opening pip");
  el.requestPictureInPicture();
}

// form here has been added

function toggleMute() {
  if (localStream) {
    localStream.getAudioTracks()[0].enabled =
      !localStream.getAudioTracks()[0].enabled;
  }
  if (localStream.getAudioTracks()[0].enabled) {
    muteBtn.innerHTML = '<i class="bi bi-mic-fill"></i>';
  } else {
    muteBtn.innerHTML = '<i class="bi bi-mic-mute-fill"></i>';
  }
}
function toggleVideo() {
  if (localStream) {
    localStream.getVideoTracks()[0].enabled =
      !localStream.getVideoTracks()[0].enabled;
  }
  if (localStream.getVideoTracks()[0].enabled) {
    vdoBtn.innerHTML = '<i class="bi bi-camera-video-fill"></i>';
  } else {
    vdoBtn.innerHTML = '<i class="bi bi-camera-video-off-fill"></i>';
  }
}

function leaveMeeting() {
  for (let id in peers) {
    peers[id].destroy();
    delete peers[id];
  }
  videos.innerHTML = "";
  videos.classList.remove("videos-container");
  localVideo.classList.remove("vid-move");
  socket.off("disconnect");
}
