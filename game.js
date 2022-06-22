var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var wsPort = 8081;
var players = {};
let plateforms = [];

app.use(express.static('game'));
// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/game/index.html');
// });

http.listen(wsPort, () => {
  	console.log('listening on *:' + wsPort);
});

io.on('connection', (socket, request) => {
	console.log('Utilisateur connecté');
	
	if(plateforms.length === 0) {
		function newUniqueID() {
			function _string() {
			    return Math.floor((1 + Math.random()) * 0x10000)
			        .toString(16)
			        .substring(1);
			}
		    //return id of format 'aaaaaaaa'-'aaaa'-'aaaa'-'aaaa'-'aaaaaaaaaaaa'
		    return _string() + _string() + '-' + _string() + '-' + _string() + '-' + _string() + '-' + _string() + _string() + _string();
		}

		plateforms = [
			// Floor
			{
				id: newUniqueID(),
				shape: 'rect', 
				x: 0,
				y: 0,
				width: "100%", 
				height: "10%"
			},

			// Plateforms
			{
				id: newUniqueID(),
				shape: 'rect', 
				x: "40%",
				y: "30%",
				width: "15%", 
				height: "5%"
			},
			{
				id: newUniqueID(),
				shape: 'rect', 
				x: "60%",
				y: "20%",
				width: "7.5%", 
				height: "3%"
			},
			// this.newElement('Plateform', 'rect', this.canvas.width / 2 - 100, 135, 150, 25);
			// this.newElement('Plateform', 'rect', this.canvas.width / 2 + 100, 100, 75, 15);

			// Walls
			{
				id: newUniqueID(),
				shape: 'rect', 
				x: "90%",
				y: "30%",
				width: "3.5%", 
				height: "20%"
			},
			{
				id: newUniqueID(),
				shape: 'rect', 
				x: "75%",
				y: "42%",
				width: "3.5%", 
				height: "20%"
			}
			// this.newElement('Plateform', 'rect', this.canvas.width * 90 / 100, 135, 35, 100);
			// this.newElement('Plateform', 'rect', this.canvas.width * 75 / 100, 210, 35, 100);
		];
	}

	socket.emit("build", { action: "build", data: plateforms });
	socket.emit("show-players", players);

	socket.on("player-connect", player => {
		socket.broadcast.emit("player-connect", player);

		players[socket.id] = player;
		console.log(player.name + " has connected");
	});

	socket.on("player-update", data => {
		if(typeof players[socket.id] !== "undefined") {
			// players[socket.id].posX = data.x;
			// players[socket.id].posY = data.y;
			// players[socket.id].width = data.w;
			// players[socket.id].height = data.h;

			data.id = socket.id;
			console.log(players[socket.id].name + " - "+ data.action.toUpperCase() +": " + JSON.stringify(data));
			socket.broadcast.emit("player-update", data);
		}
	});

	socket.on("build", data => {
		console.log("BUILD: " + JSON.stringify(data));
		socket.broadcast.emit("build", data);
	});

	socket.on('disconnect', () => {
		if(typeof players[socket.id] !== "undefined") {
		    console.log(players[socket.id].name + ' has disconnected');
			socket.broadcast.emit("player-disconnect", socket.id);
			delete players[socket.id];
		}
	});

});