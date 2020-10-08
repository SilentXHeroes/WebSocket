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
	getHitBox() {
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
		let hitbox = this.getHitBox();

		begin();
		bg('red');
		move(hitbox[0][0], hitbox[0][1]);
		line(hitbox[1][0], hitbox[1][1]);
		line(hitbox[3][0], hitbox[3][1]);
		line(hitbox[2][0], hitbox[2][1]);
		line(hitbox[0][0], hitbox[0][1]);
		fill();
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

	collidesWith(element) {
		let thisHB = this.getHitBox();
		let elemHB = element.getHitBox();
		let i;

		for(i = 0; i < 4; i++) {
			// handsPos.x > plateform.getX() &&
			// handsPos.x < plateform.getHitBoxX() &&
			// handsPos.y > plateform.getY() &&
			// handsPos.y < plateform.getHitBoxY()
			if(
				thisHB[i][0] > elemHB[0][0] &&
				thisHB[i][0] < elemHB[1][0] &&
				thisHB[i][1] > elemHB[2][1] &&
				thisHB[i][1] < elemHB[3][1]
			) {
				return true;
			}
		}

		return false;
	}

	draw() {
		// Common.drawPos(this);
	}
}