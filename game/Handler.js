class Handler {

	constructor() {
		this.setUniqueID();
		this.nextSocketIgnored = false;
		Common.addElement(this);
	}

	is(...constructors) {
		if((constructors.includes("CurrentPlayer") || constructors.includes("AnotherPlayer")) && this.is("Player")) {
			if(
				(this.isCurrentPlayer() && constructors.includes("CurrentPlayer")) ||
				(this.isCurrentPlayer() === false && constructors.includes("AnotherPlayer"))
			)
			{
				return true;
			}
		}
		return constructors.includes(this.constructor.name);
	}
	setUniqueID(id = null) {
		if(id === null) id = Common.newUniqueID();

		this.uniqueID = id;
	}
	getUniqueID() {
		return this.uniqueID;
	}
	destroy() {
		Common.destroyElement(this.uniqueID);
	}
	setX(x) {
		this.setXY(x, this.getY());
	}
	setXOrigin(x) {
		this.xOrigin = x;
	}
	getXOrigin() {
		return this.xOrigin;
	}
	// setScrollX(scrollX) {
	// 	this.scrollX = scrollX;
	// }
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
		}

		this.x = x;
		this.y = y;

		if(this.is("CurrentPlayer")) {
			Common.updateScroll();
		}

		if(this.getHitBoxY() < 0) {
			if(this.is("Player", "BadGuy")) {
				this.standing();
				this.setXY(50, 100);
			}
		}
	}
	setPosition(coords) {
		this.setXY(coords.x, coords.y);
	}

	getX() {
		return this.x;
	}
	getY() {
		return this.y;
	}
	getHitBoxX() {
		return this.getX() + this.getWidth();
	}
	getHitBoxY() {
		return this.getY() + this.getHeight();
	}
	getPosition() {
		// return { x: this.getScrollX(), y: this.getY() };
		return { x: this.getX(), y: this.getY() };
	}
	updateHitBox() {
		this.hitbox = {
			// Valeurs simple
			left: 0,
			right: 0,
			top: 0,
			bottom: 0,

			// Coordonnées
			topLeft: { X: 0, Y: 0 },
			topRight: { X: 0, Y: 0 },
			bottomLeft: { X: 0, Y: 0 },
			bottomRight: { X: 0, Y: 0 },
		};

		//   Visualisation de la hitbox:
		// 
		//	(0)-------(3)
		//   |		   |
		//	 |		   |
		//	 |		   |
		//	(1)-------(2)

		if(this.is('Bullet')) {
			this.hitbox.topLeft = 		{ X: this.getX() - this.width, Y: this.getY() - this.height };
			this.hitbox.bottomLeft = 	{ X: this.getX() - this.width, Y: this.getY() + this.height };
			this.hitbox.bottomRight = 	{ X: this.getX() + this.width, Y: this.getY() + this.height };
			this.hitbox.topRight = 		{ X: this.getX() + this.width, Y: this.getY() - this.height };
		}
		else {
			this.hitbox.topLeft = 		{ X: this.getX(), 				Y: this.getHitBoxY() };
			this.hitbox.bottomLeft = 	{ X: this.getX(), 				Y: this.getY() };
			this.hitbox.bottomRight = 	{ X: this.getX() + this.width, 	Y: this.getY() };
			this.hitbox.topRight = 		{ X: this.getX() + this.width, 	Y: this.getHitBoxY() };
		}

		if( ! this.is("Plateform")) {
			let increaseHitbox = 5;
			let isPlayerAttacking = this.is("Player", "BadGuy") && this.isAttacking();

			let increaseWeaponHitboxX = 0;
			if(isPlayerAttacking && this.getFacing() === "left" && this.sprites.currentSpriteIndex > 7) {
				increaseWeaponHitboxX = 30;
			}

			this.hitbox.topLeft.X -= increaseHitbox + increaseWeaponHitboxX;
			this.hitbox.bottomLeft.X -= increaseHitbox + increaseWeaponHitboxX;

			increaseWeaponHitboxX = 0;
			if(isPlayerAttacking && this.getFacing() === "right" && this.sprites.currentSpriteIndex > 7) {
				increaseWeaponHitboxX = 30;
			}

			this.hitbox.bottomRight.X += increaseHitbox + increaseWeaponHitboxX;
			this.hitbox.topRight.X += increaseHitbox + increaseWeaponHitboxX;

			let increaseWeaponHitboxY = 0;
			if(this.is("Player")) {
				increaseHitbox = 0;
				if(isPlayerAttacking && this.sprites.currentSpriteIndex > 7) {
					increaseWeaponHitboxY = 5;
				}
			}
			else {
				increaseHitbox = 5;
			}

			this.hitbox.topLeft.Y += increaseHitbox + increaseWeaponHitboxY;
			// this.hitbox.bottomLeft.Y -= increaseHitbox;
			// this.hitbox.bottomRight.Y -= increaseHitbox;
			this.hitbox.topRight.Y += increaseHitbox + increaseWeaponHitboxY;
		}

		this.hitbox.left = this.hitbox.topLeft.X;
		this.hitbox.top = this.hitbox.topLeft.Y;
		this.hitbox.right = this.hitbox.bottomRight.X;
		this.hitbox.bottom = this.hitbox.bottomRight.Y;

		return this.hitbox;
	}
	drawHitBox() {
		if(this.hitbox) {
			begin();
			bg('rgba(255,0,0,0.3)');
			move(this.hitbox.topLeft.X, this.hitbox.topLeft.Y);
			line(this.hitbox.bottomLeft.X, this.hitbox.bottomLeft.Y);
			line(this.hitbox.bottomRight.X, this.hitbox.bottomRight.Y);
			line(this.hitbox.topRight.X, this.hitbox.topRight.Y);
			fill();

			if(this.is("Plateform")) {
				let shift = this.getWidth() < 50 ? 1 : 0;
				bg("black");
				font(10, "Sans-Serif", "bold");
				text(this.hitbox.topLeft.X + ';' + this.hitbox.topLeft.Y, this.hitbox.topLeft.X - shift * 40, this.hitbox.topLeft.Y + 5);
				text(this.hitbox.bottomLeft.X + ';' + this.hitbox.bottomLeft.Y, this.hitbox.bottomLeft.X - shift * 40, this.hitbox.bottomLeft.Y - 10);
				text(this.hitbox.bottomRight.X + ';' + this.hitbox.bottomRight.Y, this.hitbox.bottomRight.X + shift, this.hitbox.bottomRight.Y - 10);
				text(this.hitbox.topRight.X + ';' + this.hitbox.topRight.Y, this.hitbox.topRight.X + shift, this.hitbox.topRight.Y + 5);
			}
		}
	}
	getFacing() {
		return this.facing;
	}
	isFacingLeft() {
		return this.facing === "left";
	}
	isFacingRight() {
		return this.facing === "right";
	}
	getFacingOperator() {  
		return this.facing === 'left' ? -1 : 1;
	}
	getOppositeFacingOperator() {  
		return this.facing === 'left' ? 1 : -1;
	}
	getRandomPosition() {
		let plateforms = Common.getElementsOfConstructor('Plateform');
		let rand = parseInt(Common.rand(0, plateforms.length));
		let plateform = plateforms[rand];
		return {
			x: Common.rand(plateform.getX(), plateform.getHitBoxX()),
			y: plateform.getHitBoxY() + 50
		};
	}
	getSiblingsElements(...constructors) {
		let elements = Common.getElements();
		if(constructors.length > 0) elements = elements.filter(element => element.is(...constructors));
		return elements.filter(element => {
				// Hitbox droite dans l'élément
			return (this.getX() < element.getX() && this.getHitBoxX() > element.getX()) ||
				// Touche le coté gauche de l'élément
				(this.getX() > element.getX() && this.getX() < element.getHitBoxX()) ||
				// Touche le coté droit de l'élément
				(this.getHitBoxX() > element.getHitBoxX() && this.getX() < element.getHitBoxX()) ||
				// Proche de la gauche
				(this.getHitBoxX() < element.getX() && this.getHitBoxX() + 50 > element.getX()) ||
				// Proche de la droite
				(this.getX() > element.getHitBoxX() && this.getX() - 50 < element.getHitBoxX())
		})
		// .map(element => Object.assign(Object.create(Object.getPrototypeOf(element)), element));
	}
	drawPos() {
		// var txt = Math.floor(this.getScrollX()) + ' ; ' + Math.floor(this.getY());
		var txt = Math.floor(this.getX()) + ' ; ' + Math.floor(this.getY());
		bg("black");
		font(12, "Sans-Serif");
		align("center");
		text(txt, this.getX() + this.getWidth() / 2, this.getHitBoxY() + 10);
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
	getHalfWidth() {
		return this.width / 2;
	}
	getHeight() {
		return this.height;
	}

	isThis(element) {
		return element.getUniqueID() === this.getUniqueID();
	}

	isMouseOver() {
		// this.updateHitBox();

		//	(0)-------(3)
		//   |		   |
		//	 |		   |
		//	 |		   |
		//	(1)-------(2)

			   // X
		return Common.mouse.x >= this.hitbox.topLeft.X &&
			   Common.mouse.x <= this.hitbox.topRight.X &&
			   // Y
			   Common.mouse.y <= this.hitbox.topLeft.Y &&
			   Common.mouse.y >= this.hitbox.bottomLeft.Y;
	}

	collidesWith(...list) {
		if(typeof this.hitbox === "undefined") return false;

		let elements;

		// Instance
		if(typeof list[0] === "object") {
			elements = list;
		}
		// Joueur local
		else if(list[0] === "CurrentPlayer") {
			elements = [Common.current];
		}
		else if(list[0] === "AnotherPlayer") {
			elements = this.getOtherPlayers();
		}
		// Par identifiant unique
		else if(Common.isUniqueID(list[0])) {
			let element = Common.getElementById(list[0]);
			if(typeof element === "undefined") return false;
			elements = [ element ];
		}
		// Tous les objets d'une instance
		else {
			elements = Common.getElementsOfConstructor(...list);
		}

		if(elements.length === 0) return false;

		let selfCalled = list[list.length - 1] === true;
		let collidingElement = false;

		for(let i in elements) {
			let element = elements[i];

			if(typeof element === "undefined") continue;

			if( ! element.hitbox) element.updateHitBox();

			// if( ! this.is("Bullet") &&
			// 	selfCalled === false && 
			// 	element.collidesWith(this, true)
			// ) {
			// 	collidingElement = element;
			// 	break;
			// }

			let v = { x: 0, y: 0 };
			let elementV = { x: 0, y: 0 };
			// if(this.is("Player", "BadGuy", "Bullet")) {
			// 	v = this.getVelocity();
			// 	if()
			// }
			// if(element.is("Player", "BadGuy", "Bullet")) {
			// 	elementV = element.getVelocity();
			// }

			if(
				// Trop à gauche
				this.hitbox.right + v.x < element.hitbox.left + elementV.x ||
				// Trop à droite
				this.hitbox.left + v.x > element.hitbox.right + elementV.x ||
				// Trop haut
				this.hitbox.bottom > element.hitbox.top ||
				// Trop bas
				this.hitbox.top < element.hitbox.bottom
			) {
				continue;
			}

			collidingElement = element;
			break;
		}

		this.log = false;

		return collidingElement;
	}

	getOtherPlayers() {
		return Common.getElementsOfConstructor("Player").filter(player => {
			return player.getUniqueID() !== this.getUniqueID();
		});
	}

	ignoreNextSocket() {
		this.nextSocketIgnored = true;
	}

	sendSocket(data, force = false) {
		if(this.nextSocketIgnored === true) {
			this.nextSocketIgnored = false;
			return;
		}
		if(
			this.is("CurrentPlayer") ||
			(this.is("Weapon") && this.carrier.isCurrentPlayer()) ||
			force === true
		) {
			if(this.is("Player")) {
				data.position = this.getPosition();
				data.health = this.getHealth();
				data.vitality = this.vitality;
			}
			Common.socket.emit("player-update", data);
		}
	}

	draw() {
		if(Common.updateFrame) {
			this.updateHitBox();
		}
		// this.drawHitBox();
		// this.drawPos();
	}
}