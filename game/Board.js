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
	Common.board.lineTo(Common.calcX(x), Common.calcY(Common.canvas.height - y));
}
function circle(x,y,r) {
	Common.board.arc(
		Common.origin.X + (x - Common.getScroll()) * Common.scale, 
		Common.origin.Y + (Common.canvas.height - y) * Common.scale, 
		r * Common.scale, 
		0, 
		Math.PI * 2
	);
}

function rect(x,y,w,h) {
	Common.board.fillRect(
		Common.origin.X + (x - Common.getScroll()) * Common.scale, 
		Common.origin.Y + (Common.canvas.height - y) * Common.scale, 
		w * Common.scale, 
		-h * Common.scale
	);
}

function img(...args) {
	let argNumber = args.length === 9 ? 6 : 2;
	args[argNumber] = Common.canvas.height - args[argNumber];
	if(args.length === 9) {
		args[5] = Common.origin.X + args[5] * Common.scale;
		args[6] = Common.origin.Y + args[6] * Common.scale;
		args[7] *= Common.scale;
		args[8] *= Common.scale;
	}
	else {
		args[1] = Common.origin.X + args[1] * Common.scale;
		args[2] = Common.origin.Y + args[2] * Common.scale;
	}
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
	Common.board.font = style + size * Common.scale + "px " + family;
}

function fontSize(size) {
	let font = Common.board.font;
	let index = font.indexOf("px") + 2;
	let infos = font.substring(0, index).split(' ');
	let family = font.substring(index).trim();
	let idxFontSize = infos.length === 2 ? 1 : 0;

	infos[idxFontSize] = parseFloat(size) * Common.scale + "px";

	Common.board.font = infos.join(' ') +' '+ family;
}

function fontFamily(name) {
	Common.board.font = Common.board.font.substring(0, Common.board.font.indexOf("px") + 2).trim() +' '+ name;
}

function align(align) {
	Common.board.textAlign = align;
}

/* METHODS */
function join(join) {
	Common.board.lineJoin = join;
}

function move(x,y) {
	Common.board.moveTo(
		Common.origin.X + (x - Common.getScroll()) * Common.scale, 
		Common.origin.Y + (Common.canvas.height - y) * Common.scale
	);
}

function lineWidth(w) {
	Common.board.lineWidth = w * Common.scale;
}

function lineCap(cap) {
	Common.board.lineCap = cap;
}

function lineDash(lineWidth, spaceWidth = null) {
	if(spaceWidth === null) spaceWidth = lineWidth;
	Common.board.setLineDash([ lineWidth * Common.scale, spaceWidth * Common.scale ]);
}

function bezierCurve(x1, y1, x2, y2, x3, y3) {
	Common.board.bezierCurveTo(
		Common.origin.X + (x1 - Common.getScroll()) * Common.scale,
		Common.origin.Y + (Common.canvas.height - y1) * Common.scale, 
		Common.origin.X + (x2 - Common.getScroll()) * Common.scale, 
		Common.origin.Y + (Common.canvas.height - y2) * Common.scale, 
		Common.origin.X + (x3 - Common.getScroll()) * Common.scale, 
		Common.origin.Y + (Common.canvas.height - y3) * Common.scale
	);
}

function filter(filters) {
	Common.board.filter = filters;
}

/* DRAW */

function text(string, x, y) {
	Common.board.fillText(
		string, 
		Common.origin.X + (x - Common.getScroll()) * Common.scale, 
		Common.origin.Y + (Common.canvas.height - y) * Common.scale
	);
}

function stroke() {
	Common.board.stroke();
}

function fill() {
	Common.board.fill();
}