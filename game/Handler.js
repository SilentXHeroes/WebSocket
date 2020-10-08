class Handler {

	constructor() {
		this.facing = 'right';
	}

	is(...constructors) {
		return constructors.includes(this.constructor.name);
	}
	setUniqueID() {
		if(this.is('Player')) this.uniqueID = this.getId();
		else this.uniqueID = Common.newUniqueID();
	}
	getUniqueID() {
		return this.uniqueID;
	}
	destroy() {
		Common.destroyElement(this.uniqueID);
	}
	setX(x) {
		this.setXY(x, this.getY());
		if(this.is('Player') && this.isCurrentPlayer()) {
			for(var i in this.elements) {
				x = this.elements[i].getXOrigin() + Common.getScroll();
				this.elements[i].setX(x);
			}
		}
	}
	setXOrigin(x) {
		this.xOrigin = x;
	}
	getXOrigin() {
		return this.xOrigin;
	}
	setScrollX(scrollX) {
		this.scrollX = scrollX;
	}
	getScrollX() {
		let val = this.scrollX;
		return isNaN(val) ? 0 : val;
	}
	setY(y) {
		this.setXY(this.getX(), y);
	}
	setXY(x, y) {
		if(typeof this.getXOrigin() === "undefined" || this.is('Player')) {
			this.setXOrigin(x);
			this.setScrollX(x);
		}

		this.x = x;
		this.y = y;

		if(this.is('Player') && this.isCurrentPlayer()) Common.socket.emit("player-update", {x: x, y: y, w: this.getWidth(), h: this.getHeight()});
	}
	getX() {
		return this.x;
	}
	getHitBoxX() {
		return this.getX() + this.getWidth();
	}
	getY() {
		return this.y;
	}
	getHitBoxY() {
		return this.getY() + this.getHeight();
	}
	updateHitBox() {
		this.hitbox = [];

		//   Visualisation de la hitbox:
		// 
		//	(0)-------(3)
		//   |		   |
		//	 |		   |
		//	 |		   |
		//	(1)-------(2)

		if(this.is('Bullet')) {
			this.hitbox[0] = [this.scrollX - this.width, this.y - this.height];
			this.hitbox[1] = [this.scrollX - this.width, this.y + this.height];
			this.hitbox[2] = [this.scrollX + this.width, this.y - this.height];
			this.hitbox[3] = [this.scrollX + this.width, this.y + this.height];
		}
		else {
			this.hitbox[0] = [this.scrollX, this.y + this.height];
			this.hitbox[1] = [this.scrollX, this.y];
			this.hitbox[2] = [this.scrollX + this.width, this.y];
			this.hitbox[3] = [this.scrollX + this.width, this.y + this.height];
		}

		return this.hitbox;
	}
	drawHitBox() {
		this.updateHitBox();

		begin();
		bg('red');
		move(this.hitbox[0][0], this.hitbox[0][1]);
		line(this.hitbox[1][0], this.hitbox[1][1]);
		line(this.hitbox[3][0], this.hitbox[3][1]);
		line(this.hitbox[2][0], this.hitbox[2][1]);
		line(this.hitbox[0][0], this.hitbox[0][1]);
		fill();
	}
	getFacing() {
		return this.facing;
	}
	getFacingOperator() {  
		return this.facing === 'left' ? -1 : 1;
	}
	getRandomPosition() {
		let plateforms = Common.getElementsOfConstructor('Plateform');
		let rand = parseInt(Common.rand(plateforms.length));
		let plateform = plateforms[rand];

		return {
			x: Common.rand(plateform.getX(), plateform.getHitBoxX()),
			y: plateform.getY() - this.getHeight()
		};
	}
	recalcAiming(carrier = null) {
		if(carrier === null) carrier = this;

		if( ! carrier.weapon) return;

		let mouse = Common.getMousePosition();
		let handPos = carrier.getHandsPos();
		let xDiff = mouse.x - handPos.x;
		let yDiff = mouse.y - handPos.y;
		let lengthBtwPoints = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
		let steps = lengthBtwPoints / carrier.getSpeed();

		this.aiming = {
			length: lengthBtwPoints,
			mouse: mouse,
			steps: {
				x: xDiff / steps,
				y: yDiff / steps
			}
		};
	}

	setWidth(w) {
		this.width = w;
	}
	setHeight(h) {
		this.height = h;
	}
	getWidth() {
		return this.width;
	}
	getHeight() {
		return this.height;
	}
	setSpeed(speed) {
		this.speed = speed;
	}
	getSpeed() {
		return this.speed;
	}

	collidesWith(...constructors) {
		let elements = Common.getElementsOfConstructor(...constructors);
		let collides = false;

		this.updateHitBox();

		for(let i in elements) {
			let element = elements[i];

			element.updateHitBox();

			// On vérifie si un des coins de la hitbox est compris dans ceux de l'élément
			this.hitbox.forEach(hb => {
				if(
					hb[0] > element.hitbox[0][0] &&
					hb[0] < element.hitbox[2][0] &&
					hb[1] > element.hitbox[1][1] &&
					hb[1] < element.hitbox[3][1]
				) {
					collides = element;
					return false;
				}
			});

			if(collides) break;
		}

		return collides;
	}

	draw() {
		// Common.drawPos(this);
	}
}