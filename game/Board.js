function begin() {
	Common.board.beginPath();
}
function bg(color) {
	Common.board.fillStyle = color;
}
function strokeColor(color) {
	Common.board.strokeStyle = color;
}
function arc(x,y,r) {
	Common.board.arc(x,y,r,0,Math.PI * 2);
}
function move(x,y) {
	Common.board.moveTo(x,y);
}
function line(x,y,w) {
	lineWidth(w);
	Common.board.lineTo(x,y);
}
function lineWidth(w) {
	Common.board.lineWidth = w;
}
function stroke() {
	Common.board.stroke();
}
function fill() {
	Common.board.fill();
}
function clear() {
	Common.board.clearRect(0, 0, Common.canvas.width, Common.canvas.height);
}