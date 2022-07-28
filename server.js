const express = require('express');
const app = express();

// http server needed by socket.io
const server = require('http').Server(app);
const io = require('socket.io')(server);

// generate unique user ids
const { v4: uuidV4 } = require('uuid');

////////
// SETUP
////////
app.set('view engine', 'ejs');
app.use(express.static('public'));


///////
// ROUTES
///////

// redirect when someone visits the home url to a unique room url
app.get('/', (req, res) => {
	res.redirect(`/${uuidV4()}`)
});

// when someone visits with a unique room id render a room and pass the unique room id
app.get('/:room', (req, res) => {
	res.render('room', { roomId: req.params.room })
});


///////
// SOCKET.IO
///////

io.on('connection', socket => {
	socket.on('join-room', (roomId, userId) => {
		// On successful connection, let the user or socket to join the room
		socket.join(roomId);
		// emit a broadcast event to all other connected users / sockets
		// and provide the userId to those listening
		console.log('details', roomId, userId);
		console.log(socket.broadcast.emit);
		socket.broadcast.emit('user-connected', userId);
		
	});
});

server.listen(3000);
