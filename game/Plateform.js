class Plateform extends Handler {

	constructor(...args) {
		super();

		this.shape = args.shift();

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
					bezierDots.unshift(prevDot);
					this.bezierCurves.push(bezierDots);
					dot.dots.forEach(getParam);
				}
				else {
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

		this.setColor('lightgreen');
	}

	setColor(color) {
		this.color = color;
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

	isHill() {
		return this.hasBezierCurves() && this.bezierCurves[0][0][1] < this.bezierCurves[0][3][1];
	}

	isDescent() {
		return this.hasBezierCurves() && this.bezierCurves[0][0][1] > this.bezierCurves[0][3][1];
	}

	clearBezierCurveCoordinates() {
		this.bezierCurveCoordinates = null;
	}

	setBezierCurveCoordinates(coordinates) {
		this.bezierCurveCoordinates = coordinates;
	}

	getBezierCurveCoordinates() {
		return this.bezierCurveCoordinates;
	}

	calcBezierCurveCoordinates(playerX) {
        let [p0, p1, p2, p3] = this.bezierCurves[0];
		var A = p3[0] - 3*p2[0] + 3*p1[0] - p0[0],
	        B = 3*p2[0] - 6*p1[0] + 3*p0[0],
	        C = 3*p1[0] - 3*p0[0],
	        D = p0[0] - playerX;

	    var t = resolveCubicEquation(A, B, C, D);

		// console.log(t, '(', x ,'-', p0[0], ') / (', p3[0], '-', p0[0], ')');
	    let coords = [ 0, 0 ];
	    for(let index in coords) {
	    	//Calculate the coefficients based on where the ball currently is in the animation
	    	let c = 3 * (p1[index] - p0[index]);
	    	let b = 3 * (p2[index] - p1[index]) - c;
	    	let a = p3[index] - p0[index] - c - b;

	    	//Calculate new X & Y positions of ball
	    	coords[index] = a * Math.pow(t, 3) + b * Math.pow(t, 2) + c * t + p0[index];
	    }

	    //We draw the ball to the canvas in the new location
	    return { x: coords[0], y: coords[1] };
	}

	onDraw() {
		super.draw();
		
		this.printType();

		// if(this.bezierCurveCoordinates) {
		// 	begin();
		// 	bg("red");
		// 	circle(this.bezierCurveCoordinates.x, this.bezierCurveCoordinates.y, 5);
		// 	fill();
		// }

		bg(this.color);

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