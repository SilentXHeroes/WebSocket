function begin() {
	Common.board.beginPath();
}
function clear() {
	Common.board.clearRect(0, 0, Common.canvas.width, Common.canvas.height);
}
/* SHAPES */
function line(x,y,w) {
	lineWidth(w);
	Common.board.lineTo(x,y);
}
function arc(x,y,r) {
	Common.board.arc(x,y,r,0,Math.PI * 2);
}
function rect(x,y,w,h) {
	Common.board.fillRect(x, y, w, h);
}
/* FILL COLOR */
function bg(color) {
	Common.board.fillStyle = color;
}
function strokeColor(color) {
	Common.board.strokeStyle = color;
}
/* TEXT */
function font(size, family) {
	Common.board.font = size + "px " + family;
}
function align(align) {
	Common.board.textAlign = align;
}
/* METHODS */
function move(x,y) {
	Common.board.moveTo(x,y);
}
function lineWidth(w) {
	Common.board.lineWidth = w;
}
/* DRAW */
function text(string, x, y) {
	Common.board.fillText(string, x, y);
}
function stroke() {
	Common.board.stroke();
}
function fill() {
	Common.board.fill();
}