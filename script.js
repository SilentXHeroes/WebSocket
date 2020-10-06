var socket = io();

var message = document.getElementById('m'),
	btn = document.getElementById('send'),
	output = document.getElementById('messages'),
	feedback = document.getElementById('feedback');

btn.addEventListener("click", (e) => {
	e.preventDefault();

	socket.emit("chat", {
		sender: socket.id,
		message: message.value
	});
	
	message.value = '';
});

message.addEventListener("keypress", () => {
	socket.emit("typing", socket.id);
});

socket.on("update", data => {
	output.innerHTML = data;
});

socket.on("chat", data => {
	output.innerHTML += '<li><strong>' + data.sender + ':</strong>&nbsp;' + data.message + '</li>';
});

var showTyper;
socket.on("typing", user => {
	feedback.innerHTML = user + " est en train d'écrire ...";
	feedback.hidden = false;

	clearTimeout(showTyper);
	showTyper = setTimeout(() => {
		feedback.hidden = true;
	}, 1000);
});