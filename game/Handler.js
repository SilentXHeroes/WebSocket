class Handler {

	constructor() {
		this.setUniqueID();
		Common.addElement(this);

		let thos = this;
		this.Hitbox = {
			topLeft: {
				x: function() {
					return thos.hitbox[0][0];
				},
				y: function() {
					return thos.hitbox[0][1];
				}
			},
			topRight: {
				x: function() {
					return thos.hitbox[3][0];
				},
				y: function() {
					return thos.hitbox[3][1];
				}
			},
			bottomLeft: {
				x: function() {
					return thos.hitbox[1][0];
				},
				y: function() {
					return thos.hitbox[1][1];
				}
			},
			bottomRight: {
				x: function() {
					return thos.hitbox[2][0];
				},
				y: function() {
					return thos.hitbox[2][1];
				}
			}
		};
	}

	is(...constructors) {
		if(constructors.includes("CurrentPlayer") && this.is("Player") && this.isCurrentPlayer()) return true;
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
		}

		this.x = x;
		this.y = y;
	}
	setPosition(coords) {
		this.setXY(coords.x, coords.y);
	}

	getX() {
		return this.x - (this.is("CurrentPlayer", "Bullet") ? 0 : Common.getScroll());
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
		return { x: this.getScrollX(), y: this.getY() };
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
			this.hitbox[0] = [this.getX() - this.width, this.getY() - this.height];
			this.hitbox[1] = [this.getX() - this.width, this.getY() + this.height];
			this.hitbox[2] = [this.getX() + this.width, this.getY() + this.height];
			this.hitbox[3] = [this.getX() + this.width, this.getY() - this.height];
		}
		else {
			this.hitbox[0] = [this.getX(), this.getHitBoxY()];
			this.hitbox[1] = [this.getX(), this.getY()];
			this.hitbox[2] = [this.getX() + this.width, this.getY()];
			this.hitbox[3] = [this.getX() + this.width, this.getHitBoxY()];
		}

		if( ! this.is("Plateform")) {
			let addMoreHitbox = 5;

			this.hitbox[0][0] -= addMoreHitbox;
			this.hitbox[1][0] -= addMoreHitbox;
			this.hitbox[2][0] += addMoreHitbox;
			this.hitbox[3][0] += addMoreHitbox;

			if( ! this.is("Player")) {
				this.hitbox[0][1] += addMoreHitbox;
				this.hitbox[1][1] -= addMoreHitbox;
				this.hitbox[2][1] -= addMoreHitbox;
				this.hitbox[3][1] += addMoreHitbox;
			}
		}

		return this.hitbox;
	}
	drawHitBox() {
		this.updateHitBox();

		begin();
		bg('red');
		move(this.hitbox[0][0], this.hitbox[0][1]);
		line(this.hitbox[1][0], this.hitbox[1][1]);
		line(this.hitbox[2][0], this.hitbox[2][1]);
		line(this.hitbox[3][0], this.hitbox[3][1]);
		fill();

		if(this.is("Plateform")) {
			let shift = this.getWidth() < 50 ? 1 : 0;
			bg("black");
			font(10, "Sans-Serif", "bold");
			text(this.hitbox[0][0] + ';' + this.hitbox[0][1], this.hitbox[0][0] - shift * 40, this.hitbox[0][1] + 5);
			text(this.hitbox[1][0] + ';' + this.hitbox[1][1], this.hitbox[1][0] - shift * 40, this.hitbox[1][1] - 10);
			text(this.hitbox[2][0] + ';' + this.hitbox[2][1], this.hitbox[2][0] + shift, this.hitbox[2][1] - 10);
			text(this.hitbox[3][0] + ';' + this.hitbox[3][1], this.hitbox[3][0] + shift, this.hitbox[3][1] + 5);
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
	getRandomPosition() {
		let plateforms = Common.getElementsOfConstructor('Plateform');
		let rand = parseInt(Common.rand(0, plateforms.length));
		let plateform = plateforms[rand];
		return {
			x: Common.rand(plateform.getX(), plateform.getHitBoxX()),
			y: plateform.getHitBoxY() + 10
		};
	}
	getSiblingsElements(...constructors) {
		let elements = Common.getElements();
		if(constructors.length > 0) elements = elements.filter(element => element.is(...constructors));
		return elements.filter(element => {
			return  (this.getX() < element.getX() && this.getHitBoxX() > element.getX()) ||
				// Hitbox gauche dans l'élément
				(this.getX() > element.getX() && this.getX() < element.getHitBoxX()) ||
				// Hitbox droite dans l'élément
				(this.getHitBoxX() > element.getHitBoxX() && this.getX() < element.getHitBoxX()) ||
				// // Proche de la gauche
				(this.getHitBoxX() < element.getX() && this.getHitBoxX() + 50 > element.getX()) ||
				// Proche de la droite
				(this.getX() > element.getHitBoxX() && this.getX() - 50 < element.getHitBoxX())
		});
	}
	drawPos() {
		var txt = parseInt(this.getScrollX()) + ' ; ' + parseInt(this.getY());
		bg("black");
		font(12, "Sans-Serif");
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
	getHeight() {
		return this.height;
	}

	isThis(element) {
		return element.getUniqueID() === this.getUniqueID();
	}

	collidesWith(...list) {
		let elements;

		// Instance
		if(typeof list[0] === "object") {
			elements = list;
		}
		// Joueur local
		else if(list[0] === "CurrentPlayer") {
			elements = [Common.current];
		}
		// Par identifiant
		else if( ! ["Player", "BadGuy", "Plateform", "Weapon", "Bullet", "CurrentPlayer", "object"].includes(list[0])) {
			elements = [Common.getElementById(list[0])];
		}
		// Tous les objets d'une instance
		else {
			elements = Common.getElementsOfConstructor(...list);
		}

		this.updateHitBox();

		let selfCalled = typeof list[list.length - 1] === "boolean";
		if(selfCalled) list.pop();

		let collides = false;		
		for(let i in elements) {
			let element = elements[i];

			if(typeof element === "undefined") continue;

			element.updateHitBox();

			if( ! this.is("Bullet")) {
				if(selfCalled === false) {
					if(element.collidesWith(this, true)) collides = element;
				}
				if(collides) break;
			}

			// On vérifie si un des coins de la hitbox est compris dans ceux de l'élément
			this.hitbox.forEach(hb => {
				//	(0)-------(3)
				//   |		   |
				//	 |		   |
				//	 |		   |
				//	(1)-------(2)
				if(
					// X
					hb[0] >= element.hitbox[0][0] &&
					hb[0] <= element.hitbox[3][0] &&
					// Y
					hb[1] <= element.hitbox[0][1] &&
					hb[1] >= element.hitbox[1][1]
				) {
					collides = element;
					return false;
				}
			});

			if(collides) break;
		}

		this.log = false;

		return collides;
	}

	sendSocket(data) {
		if(
			(this.is("CurrentPlayer")) ||
			(this.is("Weapon") && this.carrier.isCurrentPlayer())
		) {
			if(this.is("Player")) data.position = this.getPosition();
			Common.socket.emit("player-update", data);
		}
	}

	draw() {
		this.drawHitBox();
		// this.drawPos();
	}
}