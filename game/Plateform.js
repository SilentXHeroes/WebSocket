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
		else if(this.shape === "custom") {
			this.dots = args;
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
		text(this.type, this.getX() + this.getWidth() / 2, this.getHitBoxY() + 20);
	}

	onDraw() {
		super.draw();
		
		// this.printType();
		bg(this.color);

		if(this.shape === "rect") {
			rect(this.getX(), this.getY(), this.getWidth(), this.getHeight());
		}
		else if(this.shape === "custom") {
			move(...this.dots[0]);
			for(var i in this.dots) {
				line(this.dots[i][0], this.dots[i][1], 2, 'round');
			}
			join("round");
			fill();
		}
	}
}