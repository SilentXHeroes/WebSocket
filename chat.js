var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var wsPort = 8079;
var fullContent = '';
var messengers = {};
var currentNames = [
	"Sinead Wagner",
	"Bronte Rosas",
	"Jayden Robles",
	"Wilma Ahmed",
	"Nikola Riddle",
	"Gurdeep Major",
	"Maliha Timms",
	"Julien Bates",
	"Cameron Bradford",
	"Charlize Mcdonnell",
];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/chat/index.html');
});

http.listen(wsPort, () => {
  	console.log('listening on *:' + wsPort);
});

io.on('connection', socket => {
	console.log('Utilisateur connecté');

	socket.on('disconnect', socket => {
		if(typeof messengers[socket.id] !== "undefined") {
			currentNames.push(messengers[socket.id]);
		}
	    console.log(messengers[socket.id] + ' déconnecté');
	 });

	// On affiche le chat complet pour les retardataires
	io.sockets.emit("update", fullContent);

	socket.on("chat", data => {
		if(typeof messengers[data.sender] === "undefined") {
			var rand = Math.ceil(Math.random() * currentNames.length);

			messengers[data.sender] = currentNames[rand];
			currentNames = currentNames.filter(name => name !== data.sender);
		}

		data.sender = messengers[data.sender];

		fullContent += '<li><strong>' + data.sender + ':</strong>&nbsp;' + data.message + '</li>';
		io.sockets.emit("chat", data);
	});

	socket.on("typing", id => {
		socket.broadcast.emit("typing", messengers[id]);
	});
});