var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var wsPort = 8079;
var draws = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/canvas/index.html');
});

http.listen(wsPort, () => {
  	console.log('listening on *:' + wsPort);
});

io.on('connection', socket => {
	console.log('Utilisateur connecté');

	socket.emit("draws", draws);

	socket.on('disconnect', socket => {
	    console.log('Utilisateur déconnecté');
	 });

	socket.on("draw", draw => {
		draws.push(draw);
		socket.broadcast.emit("draw", draw);
	});

	socket.on("clear", () => {
		draws = [];
		socket.broadcast.emit("clear");
	});
});