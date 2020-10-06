class Moving extends Handler {

	constructor() {
		super();

		this.speed = 1;
		this.initialSpeed = this.speed;

		this.setVelocity(1);
		this.setWalking(false);
		this.setFacing('right');
		this.weapon = false;
		this.wallJump = false;
		this.colision = {
			left: false,
			right: false
		};
	}

	// SETTERS

	setVelocity(v) {
		this.vy = v;
	}
	setFacing(side) {
		this.facing = side;
	}
	setSpeed(speed) {
		this.speed = speed;
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
			this.setSpeed(this.getSpeed());
			this.setWalking(false);
		}
		else {
			// this.setSpeed(this.getSpeed() * -1);
			this.setWalking(true);
		}
		this.wallJump = side;
	}
	setSiblingsPlateforms() {
		let moving = this;
		this.siblingsPlateforms = Common.getElements().filter(function(element) {
			return element.is('Plateform') && moving.getHitBoxX() + 10 > element.getX() && moving.getX() - 10 < element.getHitBoxX();
		});
	}

	// GETTERS

	getVelocity() {
		return this.vy;
	}
	getSpeed() {
		return this.speed;
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
		return this.getY(false) + this.getWidth() / 2;
	}

	// Prototypes

	fire() {
		this.weapon.setFire(true);
	}

	stopFire() {
		this.weapon.setFire(false);
	}

	carryWeapon() {
		this.weapon = Common.newElement('Weapon', this);
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
				this.setVelocity(-15);
			}
		}
	}

	walk(walking, side = false) {
		if(this.is('Player')) {
			this.keydown[side] = walking;

			var opposite = side === 'left' ? 'right' : 'left';

			// Si appui des touches directionnelles constant
			// On vérifie si une touche est toujours appuyée
			if(!walking) {
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

			if(walking && this.hasWallJump() && this.getSpeed() < 5 && side === this.hasWallJump()) {
				this.setSpeed(Math.abs(this.getSpeed()));
			}
		}

		this.setFacing(side);
		this.setWalking(walking);
	}

	// Helpers

	isCurrentPlateform(plateform) {
		return this.isOnGround() &&
				this.currentPlateform.getX() === plateform.getX() &&
				this.currentPlateform.getY() === plateform.getY() &&
				this.currentPlateform.getWidth() === plateform.getWidth();
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
		if(this.is('Player') && this.getSpeed() < 5) {
			this.setSpeed(this.getSpeed() + 0.15);
		}

		if(this.walking) {
			this.setSiblingsPlateforms();
			this.isFalling();

			if(this.is('Player') && this.isCurrentPlayer() && !this.onHitWall()) {
				var vX = this.getSpeed() * this.getFacingOperator();
				var x = this.getScrollX() + vX;

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
			if(this.is('Player') && (this.isWallCLimbing('left') || this.isWallCLimbing('right'))) this.setVelocity(1.5);
			// Jumping
			else this.setVelocity(this.getVelocity() + 1);

			this.setY(this.getY() + this.getVelocity());
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
				!this.isCurrentPlateform(plateform) &&
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

	onDraw() {
		super.draw();
		
		this.setSiblingsPlateforms();
		this.isWalking();
		this.onGround();
	}
}