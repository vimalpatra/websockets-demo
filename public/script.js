const socket = io('/');
const videoGrid = document.getElementById('video-grid');

// create a new peer so that it creates a peer to peer connection 
// and assigns every user a unique ids on a given port
// run the port on commandline first using `peerjs --port 3001`
const myPeer = new Peer(undefined, {
	host: '/',
	port: '3001'
});

// get your own webpage's video element and mute it so that you don't hear your own audio
const myVideo = document.getElementById('video');
myVideo.muted = true;

// get video access from the browser as a stream
navigator.mediaDevices.getUserMedia({
	video: true,
	audio: true,
}).then(stream => {

	// add self video to the html video grid
	addVideoToGrid(myVideo, stream);

	// when another socket is connected to the same room
	// connect to get and add their video stream
	socket.on('user-connected', userId => {
		connectToNewUser(userId, stream);
	});

	// listen to when we receive a call
	myPeer.on('call', call => {
		// answer the call
		call.answer(stream);
		addVideoOnReceivingStream(call);
	});
});



// event handler to handle when a user connects to a peer
myPeer.on('open', userId => {
	// let the socket know and provide it with the room and user id  
	socket.emit('join-room', ROOM_ID, userId);
})



function connectToNewUser(userId, stream) {
	// call the new user who has connected to this room using their user id and send them our media stream
	const call = myPeer.call(userId, stream);
	addVideoOnReceivingStream(call);
}


function addVideoOnReceivingStream(call) {
	const video = document.createElement('video');	
	video.classList.add('not-self-video');

	// create and add a video element to the grid when we receive their media stream
	call.on('stream', userVideoStream => {
		addVideoToGrid(video, userVideoStream);
	});

	// when the call is disconnected and peer's connection is closed remove the video element from the grid
	call.on('close', () => video.remove());
}

function addVideoToGrid(video, stream){
	// set the video's source to the stream received
	video.srcObject = stream;

	// play the video when it's loaded
	video.addEventListener('loadedmetadata', () => {
		video.play()
	});

	// add it to the html grid
	videoGrid.append(video);
};


