function begin() {
	Common.board.beginPath();
}
function clear() {
	Common.board.clearRect(0, 0, Common.canvas.width, Common.canvas.height);
}
/* SHAPES */
function line(x,y,w = 0,cap = '') {
	if(w > 0) lineWidth(w);
	if(cap !== '') lineCap(cap);
	Common.board.lineTo(
		x - Common.getScroll(),
		Common.canvas.height - y
	);
}
function circle(x,y,r) {
	Common.board.arc(x - Common.getScroll(), Common.canvas.height - y, r, 0, Math.PI * 2);
}

function rect(x,y,w,h) {
	Common.board.fillRect(x - Common.getScroll(), Common.canvas.height - y, w, -h);
}

function img(...args) {
	let argNumber = args.length === 9 ? 6 : 2;
	args[argNumber] = Common.canvas.height - args[argNumber];
	Common.board.drawImage(...args);
}

/* FILL COLOR */
function bg(color) {
	Common.board.fillStyle = color;
}

function strokeColor(color) {
	Common.board.strokeStyle = color;
}

/* TEXT */

function font(size, family, style = '') {
	if(style !== '') style += ' ';
	Common.board.font = style + size + "px " + family;
}

function align(align) {
	Common.board.textAlign = align;
}

/* METHODS */
function join(join) {
	Common.board.lineJoin = join;
}

function move(x,y) {
	Common.board.moveTo(x - Common.getScroll(), Common.canvas.height - y);
}

function lineWidth(w) {
	Common.board.lineWidth = w;
}

function lineCap(cap) {
	Common.board.lineCap = cap;
}

function lineDash(lineWidth, spaceWidth = null) {
	if(spaceWidth === null) spaceWidth = lineWidth;
	Common.board.setLineDash([lineWidth, spaceWidth]);
}

function bezierCurve(x1, y1, x2, y2, x3, y3) {
	Common.board.bezierCurveTo(x1 - Common.getScroll(), Common.canvas.height - y1, x2 - Common.getScroll(), Common.canvas.height - y2, x3 - Common.getScroll(), Common.canvas.height - y3);
}

function filter(filters) {
	Common.board.filter = filters;
}

/* DRAW */

function text(string, x, y) {
	Common.board.fillText(string, x - Common.getScroll(), Common.canvas.height - y);
}

function stroke() {
	Common.board.stroke();
}

function fill() {
	Common.board.fill();
}