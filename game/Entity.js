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
			jump: 1.1,
			ignored: false
		};

		this.setVelocity(0);
		this.setWalking(false);
		this.weapon = null;
		this.wallJump = false;
		this.attacking = false;
		// this.height = Common.calcY("8%");
		// this.width = this.bodyHeight * 0.2;
		this.animationEnabled = true;
		this.animationFrames = Common.frames.player;
		this.siblingsPlateforms = null;
		this.hurt = false;
		this.sprites = {			
			current: null,
			currentSpriteIndex: 0,
			poses: []
		}
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

		// if(this.is("Player")) this.setUniqueID(this.getId());
		// var thos = this;
		// setTimeout(function() {
		// 	let entity = Common.getElementById(thos.getUniqueID());
		// 	thos.members = {
		// 		0: new Member(entity, "arm.left"),
		// 		1: new Member(entity, "leg.left"),
		// 		2: new Member(entity, "body"),
		// 		3: new Member(entity, "head"),
		// 		4: new Member(entity, "leg.right"),
		// 		5: new Member(entity, "arm.right")
		// 	};
		// 	thos.members.arm = {
		// 		left: thos.members[0],
		// 		right: thos.members[5],
		// 	};
		// 	thos.members.leg = {
		// 		left: thos.members[1],
		// 		right: thos.members[4],
		// 	};
		// });
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
		        let total = path.length === 0 ? 0 : path.reduce((a,b) => a + b);
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
		if(value === false) {
			delete this.currentPlateform;
		}
		else {
			this.currentPlateform = value;
		}
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
	setSiblingsPlateforms(force = false) {
		if(this.siblingsPlateforms === null) force = true;

		if(force === false && (this.isFalling() || this.isJumping() || this.walking || this.isHurt()) === false) return;

		this.siblingsPlateforms = this.getSiblingsElements("Plateform");

		for(var i in this.siblingsPlateforms) {
			let plateform = this.siblingsPlateforms[i];
			plateform.type = "TOO FAR";
			// Prochaine position X
			let nextStep = this.speed * this.getFacingOperator();
			// Prochaine position Y
			let nextVelocity = this.getVelocity() - this.velocity.jump;

			let playerX = this.getX();
			let playerNextX = playerX + nextStep;
			let playerY = this.getY();
			let playerNextY = playerY + nextVelocity;
			let playerHBX = this.getHitBoxX();
			let playerNextHBX = playerHBX + nextStep;
			let playerHY = this.getHitBoxY();

			let plateformX = plateform.getX();
			let plateformY = plateform.getY();
			let plateformHBX = plateform.getHitBoxX();
			let plateformHBY = plateform.getHitBoxY();

			plateform.clearBezierCurveCoordinates();
			if(plateform.hasBezierCurves()) {
				console.log(playerY, '>', plateformY);
				if(playerY > plateformY) {
					console.log(plateform.isHill(), "&&", playerNextHBX, '>=', plateformX, "&&", playerNextHBX, '<=', plateformHBX);
					if(
						(plateform.isHill() && playerNextHBX >= plateformX && playerNextHBX <= plateformHBX) ||
						(plateform.isDescent() && playerNextX >= plateformX && playerNextX <= plateformHBX)
					) {
						let coordinates = plateform.calcBezierCurveCoordinates(plateform.isHill() ? playerNextHBX : playerNextX);
						plateform.setBezierCurveCoordinates(coordinates);
						plateformHBY = coordinates.y;
						// Si 2 plateformes sont côte à côte
						// On attend que l'élément soit bien sur la nouvelle plateforme, étant donné qu'on calcule avec sa position future
						if(this.isOnGround() && this.walkingOnPlateform(plateform)) this.setCurrentPlateform(plateform);
					}
				}
			}

			if(this.isCurrentPlateform(plateform)) {
				plateform.type = "current";
			}
			// Plateforme proche du joueur
			else if(playerNextX <= plateformHBX && playerNextHBX >= plateformX) {
				// Se trouve sur la plateforme
				if(
					playerY >= plateformHBY && 
					playerNextY <= plateformHBY
				) {
					plateform.type = "ground";
				}
				// Se trouve sous la plateforme
				else if(
					playerHY <= plateformY && 
					playerHY + nextVelocity >= plateformY
				) {
					plateform.type = "ceil";
				}
				// Se trouve dans la hauteur de la plateforme
				// Potentiellement un mur
				else if(
					playerNextY < plateformHBY && 
					playerHY + nextVelocity > plateformY &&
					plateform.bezierCurveCoordinates === null
				) {
					if(
						// Se déplace vers la gauche
						(
							this.getFacing() === "left" && 
							playerNextX <= plateformHBX && 
							playerNextHBX > plateformHBX
						) ||
						// Se déplace vers la droite
						(
							this.getFacing() === "right" && 
							playerNextHBX >= plateformX && 
							playerNextX < plateformHBX
						)
					) {
						console.log(plateform);
						plateform.type = "wall";
					}
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
	// getAnimationFrame() {
	// 	let animationFrame = this.animationFrames.standing;
	// 	if(this.isRunning) animationFrame = this.animationFrames.running;

	// 	if(this.sprites.currentSpriteIndex >= animationFrame.length) this.sprites.currentSpriteIndex = 0;

	// 	return animationFrame[this.sprites.currentSpriteIndex];
	// }
	animate() {
		this.sprites.currentSpriteIndex++;
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

	isHurt(state = null) {
		if(state !== null) {
			this.hurt = state;

			// Annule l'attaque en cours
			if(state !== false) {
				this.attacking = false;
			}
		}
		return this.hurt !== false;
	}

	isDead() {
		return this.getHealth() <= 0;
	}

	isAlive() {
		return this.getHealth() > 0;
	}
	
	getSpeed() {
		return this.speed;
	}

	// Prototypes

	injured(amount, fromSide = true, sendSocket = true) {
		this.health -= amount;

		// L'élément est déjà en cours d'animation, on la reset
		if(this.isHurt()) this.resetCurrentSprite = true;

		this.isHurt(this.health > 0 ? fromSide : false);

		if(sendSocket) this.sendSocket({ action: "injured", amount: amount, fromSide: fromSide, playerInjuredID: this.getId() }, true);

		// if(this.health <= 0) this.destroy();
	}

	printVitality() {
		let vitaWidth = 40;
		let vitaHeight = 5;
		let x = this.getX() + (this.getWidth() / 2) - (vitaWidth / 2);
		let y = this.getHitBoxY() + 5;

		bg('red');
		rect(x, y, vitaWidth, vitaHeight);

		bg('green');
		rect(x, y, vitaWidth * ( this.health / this.vitality ), vitaHeight);
	}

	fire() {
		if(this.isArmed()) this.getWeapon().fire("semi-automatic");
	}

	setFire(firing) {
		if(this.isArmed()) this.getWeapon().setFire(firing);
	}

	setAimingFromEvent(aim) {
		if(this.isArmed()) this.getWeapon().setAim(aim.mouse, aim.handPos);
	}

	getAim() {
		if(this.isArmed()) {
			return this.getWeapon().getAim();
		}
	}

	setAim() {
		if(Common.Sockets.enableAim && this.isArmed()) {
			return this.getWeapon().setAim();
		}
		return null;
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

		Common.destroyElement(weapon);

		this.setWeapon(weapon);
		this.setAim();
		this.sendSocket({ action: "carry-weapon", type: weapon.type })
	}

	jump(jumping) {
		this.keydown.jump = jumping;

		if(jumping && this.isHurt() === false) {
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

			if(this.isHurt()) {
				walking = false;
				side = this.getFacing();
			}
			else if(walking) {
				if(this.isAttacking() === false) {
					this.running();
				}
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

		// let x = this.is("CurrentPlayer") || this.is("BadGuy") ? this.getX() : this.getScrollX();
		let x = this.getX();
		let y = this.getY();
		let distance = null;

		// Blessé, il est repoussé
		if(this.isHurt()) {
			if(this.hurt === "left" || this.hurt === "right") this.setFacing(this.hurt);

			// L'élément recule uniquement pendant les 6 premières animations
			let dRatio = 6 - this.sprites.currentSpriteIndex;
			if(dRatio < 0) dRatio = 0;
			distance = dRatio * 0.3 * this.getOppositeFacingOperator();
		}
		else if(this.walking) {
			distance = this.speed * this.getFacingOperator();
		}

		if(this.onHitWall() || distance === null) {
			return;
		}

		x += distance;


		let plateform = this.getCurrentPlateform();
		if(typeof plateform !== "undefined" && plateform.bezierCurveCoordinates) {
			y = plateform.getBezierCurveCoordinates().y;
		}

		this.setXY(x, y);
	}

	onGround() {
		if(!this.isOnGround() && this.velocity.ignored === false) {
			// Walling
			if(this.is("Player") && this.isWallClimbing(this.getFacing())) {
				this.setVelocity(this.velocity.onWall);
			}
			// Jumping
			else {
				this.setVelocity(this.getVelocity() - this.velocity.jump);
			}

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

				let y;
				if(plateform.bezierCurveCoordinates) {
					y = plateform.getBezierCurveCoordinates().y;
				}
				else {
					y = plateform.getHitBoxY();
				}
				this.setY(y);
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

		return this.getX() <= plateform.getHitBoxX() && this.getHitBoxX() >= plateform.getX();
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
				let facing = this.getFacing();
				// Si l'élément est blessé, il recule
				// On plaque l'élément dos au mur
				if(this.isHurt()) facing = this.getOppositeFacing();

				if(facing === "right") setX = plateform.getX() - this.getWidth();

				this.setX(setX);

				return true;
			}
		}

		return false;
	}

	isAttacking() {
		return this.attacking === true;
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
		this.sprites.poses.attacking.hit = false;
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

	printNickname() {
		font(15, 'Comic Sans MS');
		bg('black');
		align('center');
		text(this.name, this.getX() + (this.getWidth() / 2), this.getHitBoxY() + 10);
	}

	printCurrentSprite() {
		let currentSprite = this.sprites.poses[this.sprites.current];
		let image = this.facing === "left" ? this.spritesLeft : this.spritesRight;
		let imageX = 
			(Common.isScrolling() && this.is("CurrentPlayer") ? 
				(Common.canvas.width / 2) - this.getWidth() : 
				this.getX() - this.getHalfWidth() - (this.is("AnotherPlayer", "BadGuy") ? Common.getScroll() : 0)
			) - 10;
		let imageY = this.getY() + this.spriteH - 5;
		let plateform = this.getCurrentPlateform();

		// if(this.isOnGround() && plateform.bezierCurveCoordinates) {
		// 	begin();
		// 	bg("red");
		// 	circle(plateform.bezierCurveCoordinates.x, plateform.bezierCurveCoordinates.y, 5);
		// 	fill();
		// }

		if(this.is("BadGuy")) filter("grayscale(0.5) contrast(0.5)");

		img(
			image, 
			this.sprites.currentSpriteIndex * this.spriteW, // X de la portion à découper
			currentSprite.y, // Y de la portion à découper
			this.spriteW, // Largeur découpée
			this.spriteH, // Hauteur découpée
			// Position X dans le canvas
			imageX,
			imageY, // Position Y dans le canvas
			this.spriteW, // Largeur de l'image finale
			this.spriteH // Hauteur de l'image finale
		);

		if(this.is("BadGuy")) filter("none");
	}

	updateCurrentSprite() {		
		let currentSpriteName;
		if(this.isAttacking()) {
			currentSpriteName = "attacking";
		}
		else if(this.isJumping()) {
			if(this.sprites.poses.jump.over === false) {
				currentSpriteName = "jump";
			}
			else {
				currentSpriteName = "jumpLoop";
			}
		}
		else if(this.isRunning) {
			currentSpriteName = "running";
		}
		else if(this.isDead()) {
			currentSpriteName = "dying";
		}
		else if(this.isHurt()) {
			currentSpriteName = "hurt";
		}
		else {
			currentSpriteName = "standing";
		}

		if(currentSpriteName !== "jump" && currentSpriteName !== "jumpLoop" && currentSpriteName !== "dying") this.sprites.poses.jump.over = false;

		// Animations différentes, on force la nouvelle animation
		if(this.sprites.current !== currentSpriteName || this.resetCurrentSprite === true) {
			if(this.sprites.current !== null) this.sprites.poses[this.sprites.current].step = 0;
			this.sprites.currentSpriteIndex = 0;
			this.resetCurrentSprite = false;
		}

		this.sprites.current = currentSpriteName;
	}

	updateAnimationIndex() {		
		if(Common.updateFrame) {
			let currentSprite = this.sprites.poses[this.sprites.current];

			// L'animation peut être trop rapide, on définit alors un nombre de tics avant de passer à l'animation suivante
			if(currentSprite.step >= currentSprite.stepsToIgnoreBetweenSprites) {
				currentSprite.step = 0;

				if(this.sprites.current !== "dying" || currentSprite.over === false) {
					this.animate();
				}

				// Animation terminée
				if(this.sprites.currentSpriteIndex >= currentSprite.count) {
					// Attaque terminée, on change son état
					if(this.sprites.current === "attacking") {
						this.attacking = false;
					}
					// Animation de blessure terminée, l'élément n'est plus blessé
					else if(this.sprites.current === "hurt") {
						this.isHurt(false);
					}
					// Saut à l'infini
					else if(currentSprite.over === false) {
						if(this.sprites.current === "jump" || this.sprites.current === "dying") {
							currentSprite.over = true;
						}
					}
					if(this.sprites.current !== "dying") {
						this.sprites.currentSpriteIndex = 0;
					}
				}

				if(currentSprite.over === true && this.sprites.current === "dying") this.sprites.currentSpriteIndex = currentSprite.count - 1;
			}
			currentSprite.step++;
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

		if(this.isArmed()) {
			this.getWeapon().onDraw();
		}

		if(this.isAttacking() && this.hitbox && this.sprites.currentSpriteIndex > 7 && this.sprites.poses.attacking.hit === false) {
			let elements = Common.getElementsOfConstructor("BadGuy");
			let facing = this.getFacing();
			elements.push(...this.getOtherPlayers());
			for(let i in elements) {
				if(elements[i].isDead()) continue;
				if(
					this.hitbox[facing] >= elements[i].getX() &&
					this.hitbox[facing] <= elements[i].getHitBoxX() &&
					(
						(this.hitbox.top >= elements[i].getY() && this.hitbox.top <= elements[i].getHitBoxY()) ||
						(this.hitbox.bottom >= elements[i].getY() && this.hitbox.bottom <= elements[i].getHitBoxY())
					)
				) {
					elements[i].injured(5, this.getOppositeFacing());
					this.sprites.poses.attacking.hit = true;
					break;
				}
			}
		}

		super.draw();
		this.updateCurrentSprite();
		this.printCurrentSprite();
		this.updateAnimationIndex();
		this.printNickname();
	}
}