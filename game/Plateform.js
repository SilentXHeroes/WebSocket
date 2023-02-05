class Plateform extends Handler {

	constructor(...args) {
		super();

		this.shape = args.shift();
		this.path = null;
		this.linePath = null;

		if(this.shape === 'rect') {
			let x, y;
			let width = args[2];
			let height = args[3];

			x = args[0];
			y = args[1];

			if(width < 0) {
				width = -width;
				x -= width;
			}

			if(height < 0) {
				height = -height;
				y -= height;
			}

			this.width = width;
			this.height = height;

			this.setXY(x, y);
		}
		else if(this.shape === "dots") {
			this.dots = args[0];
			this.bezierCurves = [];
			this.curves = [];
			this.lines = [];

			let x = 0;
			let y = 0;
			let max_x = 0;
			let max_y = 0;
			let prevDot;
			this.dots.forEach(dot => {
				if(dot.bezier === true) {
					// On copie les points
					let bezierDots = Array.from(dot.dots);
					// On ajoute le point précédent étant le départ
					// Courbe de bézier, on prend le dernier point
					if(prevDot.bezier === true) {
						bezierDots.unshift(prevDot.dots[2]);
					}
					// Point normal
					else {
						bezierDots.unshift(prevDot);
					}
					this.bezierCurves.push(bezierDots);
					dot.dots.forEach(getParam);
				}
				else {
					// Ordonnée différente ? => Pente ou montée
					if(prevDot) {
						if(prevDot[1] !== dot[1] && prevDot[0] < dot[0]) {
							this.lines.push([ prevDot, dot ]);
						}
					}
					getParam(dot);
				}
				prevDot = dot;
			});

			this.setXY(x, y);
			this.setWidth(max_x - x);
			this.setHeight(max_y - y);

			function getParam(coords) {
				x = x === 0 ? coords[0] : Math.min(x, coords[0]);
				y = y === 0 ? coords[1] : Math.min(y, coords[1]);
				max_x = Math.max(max_x, coords[0]);
				max_y = Math.max(max_y, coords[1]);
			}
		}

		this.setDefaultColor('lightgreen');
	}

	setColor(color) {
		this.color = color;
	}
	setDefaultColor(color) {
		this.default_color = color;
		this.setColor(color);
	}
	resetDefaultColor() {
		this.setColor(this.default_color);
	}

	isGround() {
		return this.type === "ground";
	}

	isCeil() {
		return this.type === "ceil";
	}

	isWall() {
		return this.type === "wall";
	}

	printType() {
		font(15, 'Comic Sans MS');
		bg('black');
		align('center');
		text(this.type, this.getX() + this.getWidth() / 2, this.getHitBoxY() + 30);
	}

	hasBezierCurves() {
		return typeof this.bezierCurves !== "undefined" && this.bezierCurves.length > 0;
	}

	hasCurves() {
		return typeof this.curves !== "undefined" && this.curves.length > 0;
	}

	hasLines() {
		return typeof this.lines !== "undefined" && this.lines.length > 0;
	}

	isHill() {
		let playerNextX = this.getReferrerNextX("hill");
		this.hill = false;
		this.linePath = null;

		if(this.hasBezierCurves()) {
			this.hill = this.bezierCurves[0][0][1] < this.bezierCurves[0][3][1] && playerNextX >= this.getX() && playerNextX <= this.getHitBoxX();
			if(this.hill) {
				// console.log(this, playerNextX);
				this.linePath = this.bezierCurves[0];
			}
		}
		if(this.hasCurves()) {
			this.hill = false;
			this.linePath = null;
		}
		if(this.hasLines()) {
			this.lines.forEach(line => {
				// console.log("HILL", line[0], line[1], playerNextX);
				if(
					// Même abscisse
					line[0][0] === line[1][0] ||
					// Hauteur inférieure
					line[0][1] > line[1][1] ||
					// Element trop loin
					playerNextX < line[0][0] || playerNextX > line[1][0]
				) {
					return;
				}
				// console.log(line);
				this.hill = true;
				this.linePath = line;
			});
		}
		return this.hill;
	}

	isDescent() {
		let playerNextX = this.getReferrerNextX("descent");
		this.descent = false;
		this.linePath = null;

		if(this.hasBezierCurves()) {
			this.descent = this.bezierCurves[0][0][1] > this.bezierCurves[0][3][1] && playerNextX >= this.getX() && playerNextX <= this.getHitBoxX();
			if(this.descent) {
				// console.log(this, playerNextX);
				this.linePath = this.bezierCurves[0];
			}
		}
		if(this.hasCurves()) {
			this.descent = false;
			this.linePath = null;
		}
		if(this.hasLines()) {
			this.lines.forEach(line => {
				// console.log("DESCENT", line[0], line[1], playerNextX);
				if(
					// Même abscisse
					line[0][0] === line[1][0] ||
					// Hauteur supérieure
					line[0][1] < line[1][1] ||
					// Element trop loin
					playerNextX < line[0][0] || playerNextX > line[1][0]
				) {
					return;
				}
				// console.log(line);
				this.descent = true;
				this.linePath = line;
			});
		}
		return this.descent;
	}

	setReferrer(player) {
		this.refer = player;
	}

	getReferrer() {
		return this.refer;
	}

	getReferrerNextX(type = null, addSpeed = true) {
		let player = this.getReferrer();
		if(type === null && (this.hill || this.descent)) {
			type = this.hill ? "hill" : "descent";
		}
		if(player === null || type === null) return null;
		if(player.isCurrentPlateform(this)) addSpeed = false;
		return (type === "hill" ? player.getHitBoxX() : player.getX()) + (addSpeed ? player.speed * player.getFacingOperator() : 0);
	}

	clearReferrer() {
		this.refer = null;
	}

	clearPath() {
		this.path = null;
	}

	getPath() {
		return this.path;
	}

	hasPath() {
		return this.path !== null;
	}

	setPath(playerX) {
		this.clearPath();

		let player = this.getReferrer();
		if(player === null) return;

		let playerNextX = this.getReferrerNextX(null, false);
		if(this.hasBezierCurves()) {
	        let [p0, p1, p2, p3] = this.linePath;
			var A = p3[0] - 3 * p2[0] + 3 * p1[0] - p0[0],
		        B = 3 * p2[0] - 6 * p1[0] + 3 * p0[0],
		        C = 3 * p1[0] - 3 * p0[0],
		        D = p0[0] - playerNextX;

		    var t = resolveCubicEquation(A, B, C, D);

		    let coords = [ 0, 0 ]; // X, Y
		    for(let index in coords) {
		    	let c = 3 * (p1[index] - p0[index]);
		    	let b = 3 * (p2[index] - p1[index]) - c;
		    	let a = p3[index] - p0[index] - c - b;

		    	coords[index] = a * Math.pow(t, 3) + b * Math.pow(t, 2) + c * t + p0[index];
		    }

		    //We draw the ball to the canvas in the new location
		    this.path = { x: coords[0], y: coords[1] };
		    // console.log(playerNextX, A, B, C, D, 'T', t);
		}
		if(this.hasCurves()) {
			this.path = { x: 0, y: 0 };
		}
		if(this.hasLines()) {
			let eq = getLineEquation({ x: this.linePath[0][0], y: this.linePath[0][1] }, { x: this.linePath[1][0], y: this.linePath[1][1] });
			// console.log(playerNextX, this.hill, this.descent, this.linePath, eq);
			this.path = { x: playerNextX, y: eq.Fx(playerNextX) };
		}
	}

	onDraw() {
		super.draw();
		
		this.printType();

		// if(this.path) {
		// 	begin();
		// 	bg("red");
		// 	circle(this.path.x, this.path.y, 5);
		// 	fill();
		// }

		if(this.isMouseOver()) {
			bg("red");
			Common.mouse.cursor.grab();
			if(Common.mouse.isGrabbing()) {

			}
		}
		else {
			bg(this.color);
		}

		if(this.shape === "rect") {
			rect(this.getX(), this.getY(), this.getWidth(), this.getHeight());
		}
		else if(this.shape === "dots") {
			begin();
			for(var i in this.dots) {
				let dot = this.dots[i];
				let isBezierCurve = dot.bezier === true;

				if(i == 0) {
					move(dot[0], dot[1]);
				}
				else if(isBezierCurve) {
					let points = [];
					dot.dots.forEach(coords => {
						points.push(coords[0], coords[1])
					});
					bezierCurve(...points);
				}
				else {
					line(dot[0], dot[1], 2, 'round');
				}
			}
			join("round");
			fill();
		}
	}
}