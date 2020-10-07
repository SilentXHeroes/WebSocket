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
	getFacing() {
		return this.facing;
	}
	getFacingOperator() {
		return this.facing === 'left' ? -1 : 1;
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
	draw() {
		// Common.drawPos(this);
	}
}