class Player extends Entity {

	constructor(player, current = false) {
		super();

		let speed = 5;
		let jumpH = 15;

		if(typeof player.speed !== 'undefined') speed = player.speed;
		if(typeof player.jumpH !== 'undefined') jumpH = player.jumpH;

		this.id = player.id;
		this.name = player.name;
		this.spriteW = 1851 / 18;
		this.spriteH = 630 / 9;
		// this.speed = speed;
		// this.initialSpeed = speed;
		// this.velocity = jumpH * -1;
		this.height = this.spriteH - 10;
		this.width = (this.spriteW / 2) - 10;
		this.currentPlayer = current;
		this.jumpingFromKeyDown = false;
		this.onMove = false;
		this.aiming = false;
		this.health = 100;
		this.vitality = 100;
		this.color = 'burlywood';

		if(typeof player.posX === 'undefined') player.posX = Common.calcX(50);
		if(typeof player.posY === 'undefined') player.posY = Common.calcY(80);

		this.spritesRight = Images.sprites.right;
		this.spritesLeft = Images.sprites.left;
		this.sprites = {
			attacking: { y: 0, count: 12, elapsed: 2, value: 0 },
			dying: { y: this.spriteH, count: 15, elapsed: 4, value: 0 },
			hurt: { y: this.spriteH * 2, count: 12, elapsed: 5, value: 0 },
			standing: { y: this.spriteH * 3, count: 12, elapsed: 5, value: 0 },
			// "Idle Blink": { y: this.spriteH * 4, count: 12 },
			jumpLoop: { y: this.spriteH * 5, count: 6, elapsed: 5, value: 0 },
			jump: { y: this.spriteH * 6, count: 6, elapsed: 5, value: 0, over: false },
			// "Taunt": { y: this.spriteH * 7, count: 18 },
			running: { y: this.spriteH * 8, count: 18, elapsed: 3, value: 0 },
			current: null
		};

		this.setXY(player.posX, player.posY);
		this.onDraw();
		this.setEvents();
	}

	getId() {
		return this.id;
	}

	isCurrentPlayer() {
		return this.currentPlayer;
	}

	onDraw() {
		super.onDraw();
		
		if(this.isJumping() || this.walking) {
			let weapon = this.collidesWith("Weapon");
			if(weapon) this.carryWeapon(weapon);
		}

		this.verifyKeyDowns();

		if(this.getHealth() < 100) this.printVitality();
	}

	verifyKeyDowns() {
		let side = this.keydown.left ? 'left' : (this.keydown.right ? 'right' : false);

		// Saut permanent
		if(this.keydown.jump && !this.getColision()) {
			this.jumpingFromKeyDown = true;
			this.jump(true);
		}

		// On autorise le déplacement après une colision
		if(side && ! this.getColision(side) && ! this.hasWallJump()) this.walk(true, side);
	}

	setEvents() {
		if( ! this.currentPlayer) return;

		document.addEventListener("keydown", e => this._playerEvents(e));
		document.addEventListener("keyup", e => this._playerEvents(e));
		document.addEventListener("click", e => this._playerEvents(e));
		
	}

	_playerEvents(e) {
		if(e.type === "click") {
			this.setWalking(false);
			this.attack();
		 	return;
		}
		if(e.keyCode === 32) this.weapon.setFire(e.type === 'keydown');
		else if(e.keyCode === 38 || e.keyCode === 90) this.jump(e.type === 'keydown');
		else if(e.keyCode === 37 || e.keyCode === 81 || e.keyCode === 39 || e.keyCode === 68) this.walk(e.type === 'keydown', e.keyCode === 37 || e.keyCode === 81 ? "left" : "right");

		let enableSocket = this.lastEventSend !== e.keyCode + e.type;
		this.lastEventSend = e.keyCode + e.type;
		if(enableSocket) this.sendSocket({ action: "player-event", position: this.getPosition(), keyCode: e.keyCode, type: e.type });
	}
}

class BadGuy extends Entity {

	constructor() {
		super();

		let health = parseInt(Common.rand(100,300));

		this.purpose = null;
		this.target = null;
		this.health = health;
		this.vitality = health;
		this.color = 'saddlebrown';

		let position = this.getRandomPosition();

		this.setXY(position.x, position.y);
	}

	setPurpose(...args)
	{
		this.purpose = args[0];

		if(args.length > 1)
		{
			if(this.purpose === "goToPosition")
			{
				this.target = {
					x: args[1].x,
					comparer: args[1].x < this.getX() ? -1 : 1
				};
				this.walk(true, this.target.comparer < 0 ? "left" : "right");
				this.running();
			}
		}
	}

	pathIA() {
		if(this.purpose === null || this.target === null) return;

		// begin();
		// strokeColor("red");
		// move(this.fakeJump.X, this.fakeJump.Y);

		// while(this.fakeJump.hit.plateform === null && this.fakeJump.Y > 0)
		// {
		// 	let x = this.fakeJump.X;
		// 	let y = this.fakeJump.Y;
		// 	let x1 = this.fakeJump.X1;
		// 	let y1 = this.fakeJump.Y1;
		// 	let nextStep = this.speed * this.getFacingOperator();

		// 	this.fakeJump.velocity -= this.velocity.jump;

		// 	x 	+= nextStep;
		// 	x1 	+= nextStep;
		// 	y 	+= this.fakeJump.velocity;
		// 	y1 	+= this.fakeJump.velocity;

		// 	this.fakeJump.X = x;
		// 	this.fakeJump.Y = y;

		// 	this.fakeJump.X1 = x1;
		// 	this.fakeJump.Y1 = y1;

		// 	line(x, y, 2, 'round');
		// }

		// stroke();

		let targets = this.canJump();
		let newTarget = false;
		if(targets.length > 0) {
			let id = targets[0].obj.getUniqueID();
			newTarget = id !== this.plateformTargetID;
			this.plateformTargetID = id;
		}

		if(this.isRunning && newTarget) {
			this.jump(true, false);
			this.plateformTargetID = null;
		}
	}

	checkPurpose() {
		if(typeof this.target !== "undefined" && this.target !== null)
		{
			if(
				(this.target.comparer < 0 && this.getX() < this.target.x) ||
				(this.target.comparer > 0 && this.getX() > this.target.x)
			)
			{
				this.target = null;
				this.purpose = null;
				this.walk(false, this.getFacing());
			}
		}
	}

	onDraw() {
		super.onDraw();
		this.printVitality();

		if(Common.updateFrame) {
			this.checkPurpose();
		}
	}
}