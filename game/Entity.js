class Entity extends Handler {

	constructor() {
		super();

		// this.speed = Common.calcForFrameRate(5);
		// this.velocity = {
		// 	initial: Common.calcForFrameRate(-20),
		// 	onWall: Common.calcForFrameRate(1.5),
		// 	jump: Common.calcForFrameRate(1.5)
		// };

		// this.speed = 5;
		// this.speedScaleAfterWallJump = 0.15;
		// this.velocity = {
		// 	initial: -20,
		// 	onWall: 2,
		// 	jump: 1.5
		// };

		this.speed = 1; // * 0.25;
		this.speedScaleAfterWallJump = 0.5; // * 0.33
		this.velocity = {
			initial: -5, // * 0.25
			onWall: 0.5, // * 0.25
			jump: 0.1 // * 0.066
		};

		// console.log(this.speed);
		// console.log(this.velocity);

		this.initialSpeed = this.speed;

		this.setVelocity(1);
		this.setWalking(false);
		this.weapon = false;
		this.wallJump = false;
		this.bodyHeight = 30;
		this.memberLength = this.bodyHeight * 0.25;
		this.colision = {
			left: false,
			right: false
		};

		this.standing();

		if(typeof Common.events.weapon === 'undefined') {
			Common.events.weapon = {
				click: () => { this.weapon.fire(); },
				mouseDown: () => { this.weapon.setFire(true); },
				mouseUp: () => { this.weapon.setFire(false); },
				mouseMove: () => { this.recalcAiming(); }
			};
		}
	}

	// SETTERS

	setVelocity(v) {
		this.vy = v;
	}
	setFacing(side) {
		this.facing = side;
	}
	setColision(side, value) {
		this.colision[side] = value;
	}
	removeColision() {
		this.colision.left = false;
		this.colision.right = false;
	}
	setCurrentPlateform(value) {
		if( ! value) delete this.currentPlateform;
		else this.currentPlateform = value;
	}
	setWalking(walking) {
		this.walking = walking;
	}
	setWallJump(side) {
		if(!side) {
			this.setSpeed(this.speed);
			this.setWalking(false);
		}
		else {
			// this.setSpeed(this.speed * -1);
			this.setWalking(true);
		}
		this.wallJump = side;
	}
	setSiblingsPlateforms() {
		this.siblingsPlateforms = Common.elements.filter(element => {
			if( ! element.is('Plateform')) return false;
			// Proche gauche OU proche droite
			return this.getX() - 50 < element.getHitBoxX() || this.getHitBoxX() + 50 > element.getX();
		});
	}

	// GETTERS

	getVelocity() {
		return this.vy;
	}
	getOppositeFacing() {
		return this.facing === 'left' ? 'right' : 'left';
	}
	getColision(side = false) {
		if(!side) {
			if(this.colision.left) {
				return this.colision.left;
			}
			else if(this.colision.right) {
				return this.colision.right;
			}
			else {
				return false;
			}
		}
		else {
			return this.colision[side];
		}
	}
	getColisionSide() {
		if(this.colision.left) return 'left';
		return 'right';
	}
	getCurrentPlateform() {
		return this.currentPlateform;
	}
	getHandsPos() {
		return {
			x: this.getScrollX() + ( this.getFacingOperator() > 0 ? this.getWidth() : 0),
			y: this.getY(false) + this.getWidth() / 2
		};
	}

	printVitality() {
		let vitaWidth = 40;
		let vitaHeight = 5;
		let x = this.getX() + (this.getWidth() / 2) - (vitaWidth / 2);
		let y = this.getY() - (this.getHeight() / 2);

		begin();
		bg('red');
		rect(x, y, vitaWidth, vitaHeight);
		fill();
		begin();
		bg('green');
		rect(x, y, vitaWidth * ( this.health / this.totalHealth ), vitaHeight);
		fill();
	}

	// Prototypes

	fire() {
		this.weapon.setFire(true);
	}

	stopFire() {
		this.weapon.setFire(false);
	}

	dropWeapon() {
		Common.newElement('Weapon', this.weapon);

		this.weapon = false;

		Common.canvas.node.removeEventListener("click", Common.events.weapon.click);
		Common.canvas.node.removeEventListener('mousedown', Common.events.weapon.mouseDown);
		Common.canvas.node.removeEventListener('mouseup', Common.events.weapon.mouseUp);
		Common.canvas.node.removeEventListener('mousemove', Common.events.weapon.mouseMove);
	}

	carryWeapon(weapon) {
		weapon.carryBy(this);
		this.weapon = Common.cloneClass(weapon);
		this.recalcAiming();
	}

	jump(jumping) {
		var colision = this.getColision();

		if(this.is('Player')) {
			this.keydown.jump = jumping;
		}

		if(jumping) {
			if(this.isOnGround() || (colision && this.isWallCLimbing(this.getColisionSide()))) {
				// Saute du côté opposé du mur
				if(this.is('Player') && !this.isOnGround()) {
					this.removeColision();
					this.setFacing(this.getOppositeFacing());
					this.setWallJump(this.getFacing());
					this.setWalking(true);
				}

				this.setCurrentPlateform(false);
				this.setVelocity(this.velocity.initial);
			}
		}
	}

	isJumping() {
		return this.vy !== 0;
	}

	walk(walking, side = false) {
		if(this.is('Player')) {
			this.keydown[side] = walking;

			var opposite = side === 'left' ? 'right' : 'left';

			if(walking) {
				this.running();
			// Si appui des touches directionnelles constant
			// On vérifie si une touche est toujours appuyée
			}
			else {
				this.standing();

				if((side === "left" && this.keydown.right) || (side === "right" && this.keydown.left)) {
					side = opposite;
					walking = true;
				}
				if(this.hasWallJump()) {
					walking = true;
					side = this.getFacing();
				}
			}

			if(this.getColision(side)) {
				walking = false;
			}
			else {
				this.removeColision();
			}

			if(walking && this.hasWallJump() && this.speed < this.initialSpeed && side === this.hasWallJump()) {
				this.setSpeed(Math.abs(this.speed));
			}
		}

		this.setFacing(side);
		this.setWalking(walking);
	}

	// Helpers

	isCurrentPlateform(plateform) {
		return this.isOnGround() && this.currentPlateform.uniqueID === plateform.uniqueID;
	}

	hasWallJump() {
		return this.wallJump;
	}
	isWallCLimbing(side) {
		return this.getColision(side) && this.keydown[side];
	}
	isOnGround() {
		return typeof this.getCurrentPlateform() !== "undefined";
	}

	isWalking() {
		if(this.is('Player') && this.speed < this.initialSpeed) {
			this.setSpeed(this.speed + this.speedScaleAfterWallJump);
		}

		if(this.walking) {
			this.setSiblingsPlateforms();
			this.isFalling();

			if(this.is('Player') && this.isCurrentPlayer() && !this.onHitWall()) {
				var vX = this.speed * this.getFacingOperator();
				var x = this.getScrollX() + vX;

				this.recalcAiming();

				// this.setScrollX(x);

				// Common.screenScrolling = this.getScrollX() - width / 2 > 0;
				// if(Common.screenScrolling) {
				// 	Common.setScroll(vX * -1);
				// }
				// else {
				// 	Common.clearScroll();
					this.setX(x);
			// 	}
			// }
			}
		}
	}

	onGround() {
		if(!this.isOnGround()) {
			// Walling
			if(this.is('Player') && (this.isWallCLimbing('left') || this.isWallCLimbing('right'))) this.setVelocity(this.velocity.onWall);
			// Jumping
			else this.setVelocity(this.getVelocity() + this.velocity.jump);

			this.setY(this.getY() + this.getVelocity());
			this.recalcAiming();
			this.isTouchingGround();

			if(this.getY() > Common.canvas.height) this.setXY(50, Common.canvas.height / 2);
		}
	}

	isFalling() {
		if(this.getCurrentPlateform() && !this.walkingOnPlateform()) {
			this.setCurrentPlateform(false);
			this.setVelocity(0);
		}
	}

	isTouchingGround() {
		for(var i in this.siblingsPlateforms) {
			var plateform = this.siblingsPlateforms[i];

			if(this.headTouchingPlateform(plateform)) {
				this.setY(plateform.getHitBoxY());
				this.setVelocity(0);
				break;
			}
			else if(this.footTouchingPlateform(plateform)) {
				this.setWallJump(false);
				this.setCurrentPlateform(plateform);

				this.setY(plateform.getY() - this.getWidth());
				this.setVelocity(0);
				break;
			}
		}
	}

	// Outch la tête ...
	headTouchingPlateform(plateform) {
		return this.getVelocity() < 0 &&
				this.walkingOnPlateform(plateform) &&
				this.getHitBoxY() > plateform.getHitBoxY() &&
				this.getY() < plateform.getHitBoxY();
	}

	// Plateforme sous nos pieds ?
	footTouchingPlateform(plateform) {
		return this.getVelocity() > 0 &&
				this.walkingOnPlateform(plateform) &&
				this.getHitBoxY() > plateform.getY() &&
				this.getY() < plateform.getY();
	}

	walkingOnPlateform(plateform) {
		if(typeof plateform === "undefined") {
			if(this.isOnGround()) {
				plateform = this.currentPlateform;
			}
			else {
				return false;
			}
		}

		return this.getHitBoxX() > plateform.getX() && this.getX() < plateform.getHitBoxX();
	}

	onHitWall() {
		for(var i in this.siblingsPlateforms) {
			var plateform = this.siblingsPlateforms[i];

			if(i > 0 &&
				! this.isCurrentPlateform(plateform) &&
				this.getHitBoxX() > plateform.getX() && 
				this.getX() < plateform.getHitBoxX() &&
				this.getHitBoxY() > plateform.getY() &&
				this.getY() < plateform.getHitBoxY()
			) {
				this.setWalking(false);

				// Colision right
				if(this.getX() < plateform.getX()) {
					this.setColision('right', plateform);
					this.setX(plateform.getX() - this.getWidth());
				}
				// Colision left
				else {
					this.setColision('left', plateform);
					this.setX(plateform.getHitBoxX());
				}

				return true;
			}
		}

		return false;
	}

	print() {
		let xOrigin = this.getX();
		let yOrigin = this.getY();
		this.members.forEach((member,i) => {
			let yFrom = yOrigin;
			let max1, max2;

			// Legs
			if(i % 2 === 0) {
				max1 = Common.setAngle(member.step1 > 0 ? 0 : -135);
				max2 = Common.setAngle(member.step2 > 0 ? -45 : -180);
				yFrom += this.bodyHeight * 0.1;
			}
			// Arms
			else {
				max1 = Common.setAngle(member.step1 > 0 ? 0 : -135);
				max2 = Common.setAngle(member.step2 > 0 ? 90 : -45);
				yFrom -= this.bodyHeight * 0.5;
			}

			let x = xOrigin + Math.cos(member.x1) * this.memberLength * this.getFacingOperator();
			let y = yFrom - Math.sin(member.x1) * this.memberLength;

			join('round');

			this.drawMember({
				i: i,
				yFrom: yFrom,
				x: x,
				y: y,
				angle: member.x2
			});

			if(i === 1) {
				// Body
				begin();
				move(xOrigin, yOrigin);
				strokeColor('white');
				line(xOrigin, yOrigin - this.bodyHeight + this.bodyHeight * 0.5, this.bodyHeight * 0.375 * 1.1, 'round');
				stroke();

				begin();
				move(xOrigin, yOrigin);
				strokeColor('black');
				line(xOrigin, yOrigin - this.bodyHeight + this.bodyHeight * 0.5, this.bodyHeight * 0.375, 'round');
				stroke();

				begin();
				bg('blue');
				Common.board.arc(xOrigin, yOrigin,  this.bodyHeight * 0.375 / 2, 0, Math.PI);
				fill();

				begin();
				bg('blue');
				rect(xOrigin - this.bodyHeight * 0.375 / 2, yOrigin - this.bodyHeight * 0.15, this.bodyHeight * 0.375, this.bodyHeight * 0.15);
				fill();

				// Head
				begin();
				lineWidth(this.bodyHeight * 0.02);
				strokeColor('white');
				bg(this.color);
				circle(xOrigin, yOrigin - this.bodyHeight + this.bodyHeight * 0.05, this.bodyHeight * 0.26);
				fill();
				stroke();
			}

			if(this.isRunning && ! this.isJumping()) {
				if(member.step1 < 0 && Common.round(member.x1, 4) < max1) member.step1 *= -1;
				if(member.step1 > 0 && Common.round(member.x1, 4) > max1) member.step1 *= -1;
				if(member.step2 < 0 && Common.round(member.x2, 4) < max2) member.step2 *= -1;
				if(member.step2 > 0 && Common.round(member.x2, 4) > max2) member.step2 *= -1;

				member.x1 += member.step1;
				member.x2 += member.step2;
			}
		});

		if(this.is('Player')) {
			font(15, 'Comic Sans MS');
			bg('black');
			align('center');
			text(this.name, this.getX() + this.getWidth() / 2, this.getY() - 10);
		}
	}

	standing() {
		this.isRunning = false;
		this.setMembersAngles([
			[-90, -90],
			[-90, -90],
			[-90, -90],
			[-90, -90]
		]);
	}

	running() {
		if(this.isRunning) return;

		this.isRunning = true;
		this.setMembersAngles([
			[-45, -135],
			[-90, 0],
			[-90, -90],
			[-45, 45]
		]);
	}

	setMembersAngles(angles) {
		let speedrun = 0.03;
		this.members = [];

		angles.forEach((angle,i) => {
			let multiply = i === 0 || i === 3 ? 1 : -1;

			this.members.push({
				x1: Common.setAngle(angle[0]),
				x2: Common.setAngle(angle[1]),
				step1: speedrun * multiply,
				step2: speedrun * multiply
			});
		});
	}

	drawMember(data) {
		let thickness;
		let color = this.color;

		// Legs
		if(data.i % 2 === 0) {
			thickness = this.bodyHeight * 0.3;
			color = this.is('BadGuy') ? 'darkgreen' : 'blue';
		}
		else {
			thickness = this.bodyHeight * 0.23;
		}

		begin();
		move(this.xOrigin, data.yFrom);
		strokeColor('white');
		line(data.x, data.y, thickness * 1.1, 'round');
		line(data.x + Math.cos(data.angle) * this.memberLength * this.getFacingOperator(), data.y - Math.sin(data.angle) * this.memberLength, thickness * 1.1, 'round');
		stroke();

		begin();
		move(this.xOrigin, data.yFrom);
		strokeColor(color);
		line(data.x, data.y, thickness, 'round');
		line(data.x + Math.cos(data.angle) * this.memberLength * this.getFacingOperator(), data.y - Math.sin(data.angle) * this.memberLength, thickness, 'round');
		stroke();
	}

	onDraw() {
		super.draw();
		
		this.setSiblingsPlateforms();
		this.isWalking();
		this.onGround();
		this.print();
	}
}