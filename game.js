var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var wsPort = 8083;
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
				shape: "rect",
				x: "33%",
				y: "30%",
				width: "5%",
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
			},
			{
				id: newUniqueID(),
				shape: "rect",
				x: "82.5%",
				y: "10%",
				width: 25,
				height: 200
			},
			{
				id: newUniqueID(),
				shape: "dots",
				dots: [
				    [ 100, 200 ],
					{
						bezier: true,
						dots: [
						    [ 225, 200 ],
						    [ 225, 350 ],
						    [ 350, 350 ]
						]
			    	},
				    [ 350, 190 ],
				    [ 100, 190 ]
				]
			},
			{
				id: newUniqueID(),
				shape: "dots",
				dots: [
				    [ 900, 400 ],
					{
						bezier: true,
						dots: [
						    [ 975, 400 ],
						    [ 975, 300 ],
						    [ 1050, 300 ]
						]
			    	},
				    [ 1050, 280 ],
				    [ 900, 280 ]
				]
			},
			{
				id: newUniqueID(),
				shape: "rect",
				x: 400,
				y: 400,
				width: 100,
				height: 35
			},
			{
				id: newUniqueID(),
				shape: "dots",
				dots: [
				    [ 500, 435 ],
					{
						bezier: true,
						dots: [
						    [ 625, 435 ],
						    [ 625, 585 ],
						    [ 750, 585 ]
						]
			    	},
				    [ 750, 400 ],
				    [ 500, 400 ]
				]
			},
			{
				id: newUniqueID(),
				shape: "dots",
				dots: [
					[ 900, 600 ],
					[ 1200, 700 ],
					[ 1500, 600 ],
					[ 1500, 590 ],
					[ 900, 590 ]
				]
			}
		];
	}
console.log(players);
	socket.emit("build", { action: "build", plateforms: plateforms, players: players });

	socket.on("player-connect", player => {
		socket.broadcast.emit("player-connect", player);

		players[socket.id] = player;
		console.log(player.name + " has connected");
	});

	socket.on("player-update", data => {
		let player = players[socket.id];
		if(typeof player !== "undefined") {
			player.position = data.position;
			player.vitality = data.vitality;
			player.health = data.health;
			// player.width = data.w;
			// player.height = data.h;

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