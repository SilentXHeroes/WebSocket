var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var wsPort = 8079;
var players = {};

app.use(express.static('game'));
// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/game/index.html');
// });

http.listen(wsPort, () => {
  	console.log('listening on *:' + wsPort);
});

io.on('connection', socket => {
	console.log('Utilisateur connecté');
	
	socket.emit("show-players", players);

	socket.on("player-connect", player => {
		socket.broadcast.emit("player-connect", player);

		players[socket.id] = player;
		console.log(player.name + " has connected");
	});

	socket.on("player-update", data => {
		if(typeof players[socket.id] !== "undefined") {
			players[socket.id].posX = data.x;
			players[socket.id].posY = data.y;
			players[socket.id].width = data.w;
			players[socket.id].height = data.h;

			socket.broadcast.emit("player-update", {
				id: socket.id,
				x: data.x,
				y: data.y
			});
		}
	});

	socket.on('disconnect', () => {
		if(typeof players[socket.id] !== "undefined") {
		    console.log(players[socket.id].name + ' has disconnected');
			socket.broadcast.emit("player-disconnect", socket.id);
			delete players[socket.id];
		}
	});

});