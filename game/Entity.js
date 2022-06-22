class Entity extends Handler {

	constructor() {
		super();

		this.facing = 'right';
		this.speed = 4;
		this.speedrun = .05;
		this.speedScaleAfterWallJump = 0.5;
		this.maxJumpHeight = 0;
		this.initialSpeed = this.speed;
		this.velocity = {
			initial: 20,
			onWall: -0.5,
			jump: 1.1
		};

		this.setVelocity(0);
		this.setWalking(false);
		this.weapon = null;
		this.wallJump = false;
		this.attacking = false;
		// this.height = Common.calcY("8%");
		// this.width = this.bodyHeight * 0.2;
		this.currentAnimationFrameIndex = 0;
		this.animationEnabled = true;
		this.animationFrames = Common.frames.player;
		this.siblingsPlateforms = [];
		this.isDead = false;
		this.colision = { 
			left: false,
			right: false
		};
		this.keydown = {
			left: false,
			right: false,
			jump: false
		};
	}

	onLoad() {
		this.setMaxValues();

		if(this.is("Player")) this.setUniqueID(this.getId());
		var thos = this;
		setTimeout(function() {
			let entity = Common.getElementById(thos.getUniqueID());
			thos.members = {
				0: new Member(entity, "arm.left"),
				1: new Member(entity, "leg.left"),
				2: new Member(entity, "body"),
				3: new Member(entity, "head"),
				4: new Member(entity, "leg.right"),
				5: new Member(entity, "arm.right")
			};
			thos.members.arm = {
				left: thos.members[0],
				right: thos.members[5],
			};
			thos.members.leg = {
				left: thos.members[1],
				right: thos.members[4],
			};
		});
	}

	setMaxValues() {
		let vy = this.velocity.initial;

		do {
			this.maxJumpHeight += vy;
			vy -= this.velocity.jump;
		} while(vy > 0);

		this.standing();
	}

	canJump(idx = -1) {
		if(idx === -1 && ! this.isFalling() && ! this.isJumping() && ! this.walking) return [];
		let nearCeil = this.siblingsPlateforms.find(plateform =>
			plateform.getHitBoxX() > this.getX() &&
			plateform.getY() > this.getHitBoxY() && 
			plateform.getY() < this.getHitBoxY() + this.maxJumpHeight / 2
		);
		if(nearCeil) {
			nearCeil.type = "near-ceil";
			return [];
		}

		let thos = this;
		let toJump = [];
		let plateforms = Common.getPlateforms();
		if(idx > -1) plateforms = [plateforms[idx]];

		plateforms.forEach(plateform => {
			// On ignore les plateformes
			if(
				// Plateforme utilisée
				plateform.type === "current" ||
				plateform.type === "ground" ||
				// Plateforme trop haute
				(plateform.getHitBoxY() > this.getY() + this.maxJumpHeight) ||
				// Plateforme trop basse
				(plateform.getHitBoxY() < this.getY()) ||
				// Plateformes à gauche de l'entité regardant à droite
				(this.facing === "right" && plateform.getHitBoxX() < this.getX()) ||
				// Plateformes à droite de l'entité regardant à gauche
				(this.facing === "left" && plateform.getX() > this.getHitBoxX())
			) {
				return;
			}

		    function calc(from) {
		        let x = 0;
		        
		        if(from === "x1") x = Math.floor(plateform.getX() + 10);
		        else x = Math.ceil(plateform.getHitBoxX() - 10);
		        
		        x = thos.getX() - x;
		        x = Math.abs(parseInt(x / thos.speed));
		        
		        let path = Array.from({length: x + 1}, (v,k) => thos.velocity.initial - k * thos.velocity.jump <= 0 ? thos.velocity.initial - (k+1) * thos.velocity.jump : thos.velocity.initial - k * thos.velocity.jump);
		        let total = path.reduce((a,b) => a + b);
		        return thos.getY() - plateform.getHitBoxY() + total;
		    }

		    let data = {
		        x1: calc("x1"),
		        x2: calc("x2"),
		        obj: plateform
		    };
		    if(
		    	(data.x1 < 0 && data.x2 < 0 && plateform.getX() < this.getX() && plateform.getHitBoxX() > this.getHitBoxX()) ||
		    	(this.facing === "right" && data.x1 > 0 && data.x2 < 0) || 
		    	(this.facing === "left" && data.x2 > 0 && data.x1 < 0)
	    	) {
		    	toJump.push(data);
			}
		});

		this.log = false;
		return toJump;
	}

	// SETTERS

	setVelocity(v) {
		this.vy = v;
		// this.sendSocket({
		// 	action: "velocity", 
		// 	value: v
		// });
	}
	setFacing(side) {
		this.facing = side;
		// this.sendSocket({
		// 	action: "facing", 
		// 	state: side
		// });
	}
	setColision(plateform) {
		this.colision[this.getFacing()] = plateform;
		// this.sendSocket({
		// 	action: "colision-set", 
		// 	id: plateform.getUniqueID()
		// });
	}
	removeColision() {
		// if(this.getColision()) this.sendSocket({ action: "colision-remove" });
		this.colision.left = false;
		this.colision.right = false;
	}
	setCurrentPlateform(value) {
		if( ! value) delete this.currentPlateform;
		else this.currentPlateform = value;
	}
	setWalking(walking) {
		this.walking = walking;
		// this.sendSocket({
		// 	action: "walk", 
		// 	state: walking,
		// 	side: this.facing,
		// 	x: this.getX(), 
		// 	y: this.getY(), 
		// });
	}
	setWallJump(side) {
		if( ! side) {
			this.setSpeed(this.speed);
			if(this.is("Player")) this.setWalking(false);
		}
		else {
			// this.setSpeed(this.speed * -1);
			this.setWalking(true);
		}
		this.wallJump = side;
	}
	setSiblingsPlateforms() {
		if( ! this.isFalling() && ! this.isJumping() && ! this.walking) return;

		this.siblingsPlateforms = this.getSiblingsElements("Plateform");

		let nextStep = this.speed * this.getFacingOperator();

		for(var i in this.siblingsPlateforms) {
			let plateform = this.siblingsPlateforms[i];
			plateform.type = "TOO FAR";

			if(this.isCurrentPlateform(plateform)) {
				plateform.type = "current";
			}
			else if(this.getX() + nextStep <= plateform.getHitBoxX() && this.getHitBoxX() + nextStep >= plateform.getX()) {
				let nextVelocity = this.getVelocity() - this.velocity.jump;

				if(this.getY() >= plateform.getHitBoxY() && this.getY() + nextVelocity <= plateform.getHitBoxY()) {
					plateform.type = "ground";
				}
				else if(this.getHitBoxY() <= plateform.getY() && this.getHitBoxY() + nextVelocity >= plateform.getY()) {
					plateform.type = "ceil";
				}
				else if(this.getY() + nextVelocity < plateform.getHitBoxY() && this.getHitBoxY() + nextVelocity >= plateform.getY()) {
					plateform.type = "wall";
				}
			}
		}
	}
	setSpeed(speed) {
		this.speed = speed;
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
		if(this.colision.right) return 'right';
		return false;
	}
	getCurrentPlateform() {
		return this.currentPlateform;
	}
	getHandsPos() {
		return {
			x: this.getX() + ( this.getFacingOperator() > 0 ? this.getWidth() : 0),
			y: this.getY() + this.getHeight() / 2
		};
	}
	getAnimationFrame() {
		let animationFrame = this.animationFrames.standing;
		if(this.isRunning) animationFrame = this.animationFrames.running;

		if(this.currentAnimationFrameIndex >= animationFrame.length) this.currentAnimationFrameIndex = 0;

		return animationFrame[this.currentAnimationFrameIndex];
	}
	animate() {
		this.currentAnimationFrameIndex++;
		// return this.getAnimationFrame();
	}
	enableAnimation()
	{
		this.animationEnabled = true;
	}
	disableAnimation()
	{
		this.animationEnabled = false;
	}
	addAnimation() {
		let animationFrame = [
			this.members.arm.left.getAngle(true),
			this.members.leg.left.getAngle(true),
			0,
			0,
			this.members.leg.right.getAngle(true),
			this.members.arm.right.getAngle(true)
		];

		let addTo = this.animationFrames.standing;
		if(this.isRunning) addTo = this.animationFrames.running;

		addTo.push(animationFrame);

		return animationFrame;
	}

	getHealth() {
		return this.health;
	}

	getVitality() {
		return this.vitality;
	}
	
	getSpeed() {
		return this.speed;
	}

	// Prototypes

	injured(amount) {
		this.health -= amount;

		if(this.health <= 0) this.destroy();
	}

	printVitality() {
		let vitaWidth = 40;
		let vitaHeight = 5;
		let x = this.getX() + (this.getWidth() / 2) - (vitaWidth / 2);
		let y = this.getHitBoxY() + 5;

		begin();
		bg('red');
		rect(x, y, vitaWidth, vitaHeight);
		fill();
		begin();
		bg('green');
		rect(x, y, vitaWidth * ( this.health / this.vitality ), vitaHeight);
		fill();
	}

	fire() {
		if(this.weapon) this.weapon.fire("semi-automatic");
	}

	setFire(firing) {
		if(this.weapon) this.weapon.setFire(firing);
	}

	setAiming(aim) {
		this.aiming = aim;
	}

	getAim() {
		if(this.isArmed()) {
			return this.getWeapon().getAim();
		}
	}

	setAim() {
		if(this.isArmed()) {
			this.getWeapon().setAim();
		}
	}

	setWeapon(weapon) {
		this.weapon = weapon;
	}

	getWeapon() {
		return this.weapon;
	}

	isArmed() {
		return this.getWeapon() !== null;
	}

	isUnarmed() {
		return this.getWeapon() === null;
	}

	dropWeapon() {
		if(this.isUnarmed()) return;

		Common.newElement('Weapon', this.getWeapon());

		this.weapon = null;
	}

	carryWeapon(weapon) {
		if(weapon.carrier !== null) return;

		weapon.carryBy(this);
		console.log(Common.getElementsOfConstructor("Weapon"));
		Common.destroyElement(weapon);
		console.log(Common.getElementsOfConstructor("Weapon"));

		this.setWeapon(weapon);
		this.setAim();
		this.sendSocket({ action: "carry-weapon", type: weapon.type, aim: this.aiming })
	}

	jump(jumping) {
		this.keydown.jump = jumping;

		if(jumping) {
			let isWallClimbing = this.isWallClimbing(this.getFacing());
			if(this.isOnGround() || isWallClimbing) {
				this.attacking = false;
				this.setCurrentPlateform(false);
				this.setVelocity(this.velocity.initial);

				// Saute du côté opposé du mur
				if(this.is('Player','BadGuy') && isWallClimbing) {
					this.removeColision();
					this.setFacing(this.getOppositeFacing());
					this.setWallJump(this.getFacing());
					this.setWalking(true);
				}
			}
		}
	}

	isJumping() {
		return this.vy !== 0;
	}

	walk(walking, side = false) {
		if(this.is('Player', 'BadGuy')) {
			this.keydown[side] = walking;

			var opposite = side === 'left' ? 'right' : 'left';

			if(walking) {
				this.attacking = false;
				this.running();
			}
			else {
				this.standing();

				if(this.is("Player") && ((side === "left" && this.keydown.right) || (side === "right" && this.keydown.left))) {
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

			this.setFacing(side);
			this.setWalking(walking);
		}
	}

	// Helpers

	isCurrentPlateform(plateform) {
		return this.isOnGround() && this.currentPlateform.uniqueID === plateform.uniqueID;
	}

	hasWallJump() {
		return this.wallJump;
	}
	isWallClimbing(side) {
		return this.getColision(side) && this.keydown[side];
	}
	isOnGround() {
		return typeof this.getCurrentPlateform() !== "undefined";
	}

	isWalking() {
		if(this.is('Player') && this.speed < this.initialSpeed) {
			this.setSpeed(this.speed + this.speedScaleAfterWallJump);
		}

		this.isFalling();

		if(this.walking) {
			if( ! this.onHitWall()) {
				var vX = this.speed * this.getFacingOperator();
				var x = this.is("CurrentPlayer") ? this.getX() : this.getScrollX();

if( ! this.is("CurrentPlayer")) console.log(x);
				x += vX;

				if(this.is("CurrentPlayer")) {
					this.setScrollX(x + Common.getScroll());
					Common.screenScrolling = this.getScrollX() - Common.canvas.width / 2 > 0;
					if(Common.screenScrolling) {
						Common.setScroll(vX);
						x = Common.canvas.width / 2;
					}
					else {
						Common.clearScroll();
					}
				}
				else {
					this.setScrollX(x + vX);
				}
if( ! this.is("CurrentPlayer")) {
	console.log(this.getScrollX());
	console.log("==========");
}
				this.setX(x);
			}
		}
	}

	onGround() {
		if(!this.isOnGround()) {
			// Walling
			if(this.is("Player") && this.isWallClimbing(this.getFacing())) {
				this.setVelocity(this.velocity.onWall);
			}
			// Jumping
			else this.setVelocity(this.getVelocity() - this.velocity.jump);

			this.setY(this.getY() + this.getVelocity());
			this.setAim();
			this.isTouchingGround();

			// if(this.getY() < -100) this.setXY(50, 50);

			this.stopWalling();
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

			if(this.hitCeil(plateform)) {
				this.setY(plateform.getY() - this.getHeight());
				this.setVelocity(0);
				break;
			}
			else if(this.hitFloor(plateform)) {
				this.setWallJump(false);
				this.setCurrentPlateform(plateform);

				this.setY(plateform.getHitBoxY());
				this.setVelocity(0);
				break;
			}
		}
	}

	// Outch la tête ...
	hitCeil(plateform) {
		return this.getVelocity() > 0 && plateform.isCeil();
	}

	// Plateforme sous nos pieds ?
	hitFloor(plateform) {
		return this.getVelocity() < 0 && plateform.isGround();
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

		return this.getX() < plateform.getHitBoxX() && this.getHitBoxX() > plateform.getX();
	}

	onHitWall() {
		for(var i in this.siblingsPlateforms) {
			var plateform = this.siblingsPlateforms[i];

			if( ! this.isCurrentPlateform(plateform) && plateform.isWall()) {
				if(this.is("BadGuy")) {
					if(this.isOnGround()) this.walk(false, this.getFacing());
				}
				else {
					this.setWalking(false);
				}

				if(this.is("Player") || ! this.isOnGround()) this.setColision(plateform);

				let setX = plateform.getHitBoxX();

				if(this.getFacing() === "right") setX = plateform.getX() - this.getWidth();

				this.setX(setX);

				return true;
			}
		}

		return false;
	}

	isAttacking() {
		return this.attacking === true;
	}

	print() {
		// if(typeof this.members !== "undefined") 
		// {
		// 	let animationFrame = this.getAnimationFrame();
		// 	let drawMembers = [0,1,2,3,4,5];;

		// 	if(this.facing === 'left') drawMembers = [5,4,2,3,1,0];

		// 	drawMembers.forEach(i => {
		// 		let member = this.members[i];
				
		// 		if(Common.updateFrame)
		// 		{
		// 			let angles = animationFrame[i];

		// 			if( ! (angles instanceof Array)) angles = [angles];

		// 			member.setAngle(...angles);
		// 		}
		// 		member.draw();
		// 	});

		// 	// On passe à l'animation suivante
		// 	if(Common.updateFrame) {
		// 		if(this.animationEnabled) {
		// 			this.animate();
		// 		}
		// 	}
		// }

		if(this.is('Player')) {
			let currentSpriteName;
			if(this.isAttacking()) {
				currentSpriteName = "attacking";
			}
			else if(this.isJumping()) {
				if(this.sprites.jump.over === false) {
					currentSpriteName = "jump";
				}
				else {
					currentSpriteName = "jumpLoop";
				}
			}
			else if(this.isRunning) {
				currentSpriteName = "running";
			}
			else {
				currentSpriteName = "standing";
			}

			if(currentSpriteName !== "jump" && currentSpriteName !== "jumpLoop") this.sprites.jump.over = false;

			if(this.sprites.current !== currentSpriteName) {
				if(this.sprites.current !== null) this.sprites[this.sprites.current].value = 0;
				this.currentAnimationFrameIndex = 0;
			}

			this.sprites.current = currentSpriteName;
			let sprite = this.sprites[currentSpriteName];
			let imgSprites = this.facing === "left" ? this.spritesLeft : this.spritesRight;
			
			img(imgSprites, this.currentAnimationFrameIndex * this.spriteW, sprite.y, this.spriteW, this.spriteH, this.getX() - (this.width / 2) - 10, this.getY() + this.spriteH - 5, this.spriteW, this.spriteH);

			if(Common.updateFrame) {
				if(sprite.value === sprite.elapsed) {
					sprite.value = 0;
					this.animate();
					if(this.currentAnimationFrameIndex >= sprite.count) {
						if(currentSpriteName === "attacking") {
							this.attacking = false;
						}
						else if(currentSpriteName === "jump" && sprite.over === false) {
							sprite.over = true;
						}
						this.currentAnimationFrameIndex = 0;
					}
				}
				sprite.value++;
			}

			font(15, 'Comic Sans MS');
			bg('black');
			align('center');
			text(this.name, this.getX() + this.getWidth() / 2, this.getHitBoxY() + 10);
		}
	}

	standing() {
		if( ! this.isRunning) return;
		this.isRunning = false;
		// this.sendSocket({ action: "standing" });
	}

	running() {
		if(this.isRunning) return;
		this.isRunning = true;
		// this.sendSocket({ action: "running" });
	}

	attack() {
		this.attacking = true;
	}

	stopWalling() {
		if( ! this.isOnGround()) {
			let plateform = this.getColision();
			if(plateform && (this.getY() > plateform.getHitBoxY() || this.getHitBoxY() < plateform.getY())) {
				this.removeColision();
				if(this.is("BadGuy")) this.walk(true, this.getFacing());
			}
		}
	}

	onDraw() {
		if(Common.updateFrame) {
			// Appel du pathIA en premier pour définir les plateformes trop proches
			if(this.is("BadGuy")) this.pathIA();
			this.setSiblingsPlateforms();
			this.isWalking();
			this.onGround();
		}

		if(this.isArmed()) this.getWeapon().onDraw();

		super.draw();
		this.print();
	}
}