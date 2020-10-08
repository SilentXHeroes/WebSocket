class Player extends Entity {

	constructor(player, current = false) {
		super();

		let speed = 5;
		let jumpH = 15;

		if(typeof player.speed !== 'undefined') speed = player.speed;
		if(typeof player.jumpH !== 'undefined') jumpH = player.jumpH;

		this.id = player.id;
		this.name = player.name;
		this.width = parseInt(player.width);
		this.height = parseInt(player.height);
		// this.speed = speed;
		// this.initialSpeed = speed;
		// this.velocity = jumpH * -1;
		this.currentPlayer = current;
		this.jumpingFromKeyDown = false;
		this.onMove = false;
		this.aiming = false;
		this.keydown = {
			left: false,
			right: false,
			jump: false
		};

		if(typeof player.posX === 'undefined') player.posX = 50;
		if(typeof player.posY === 'undefined') player.posY = Common.canvas.floor - this.getWidth() * 2;

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
		
		this.stopWalling();
		this.verifyKeyDowns();
		this.printAim();
		this.print();
	}

	stopWalling() {
		if( ! this.isOnGround()) {
			let plateform = this.getColision();
			if(plateform && (this.getY() > plateform.getHitBoxY() || this.getHitBoxY() < plateform.getY())) this.removeColision();
		}
	}

	verifyKeyDowns() {
		let side = this.keydown.left ? 'left' : (this.keydown.right ? 'right' : false);

		// Saut permanent
		if(this.keydown.jump && !this.getColision()) {
			this.jumpingFromKeyDown = true;
			this.jump(true);
		}

		// On autorise le déplacement après une colision
		if(side && !this.getColision(side) && !this.hasWallJump()) {
			this.walk(true, side);
		}
	}

	printAim() {
		if( ! this.weapon || ! this.aiming) return;

		Common.getElementsOfConstructor('Plateform').forEach(x => x.setColor('lightgreen'));

		let handsPos = this.getHandsPos();
		let stepX = this.aiming.steps.x;
		let stepY = this.aiming.steps.y;

		begin();
		move(handsPos.x, handsPos.y);
		strokeColor('red');
		line(this.aiming.mouse.x, this.aiming.mouse.y, 2);
		stroke();

		begin();
		strokeColor('red');
		arc(this.aiming.mouse.x, this.aiming.mouse.y, 10);
		stroke();

		// while(handsPos.x > 0 && handsPos.y > 0 && handsPos.x < Common.canvas.width && handsPos.y < Common.canvas.height) {
		// 	let plateforms = Common.getElementsOfConstructor('Plateform');

		// 	plateforms.forEach(plateform => {
		// 		if(
		// 			handsPos.x > plateform.getX() &&
		// 			handsPos.x < plateform.getHitBoxX() &&
		// 			handsPos.y > plateform.getY() &&
		// 			handsPos.y < plateform.getHitBoxY()
		// 			// this.collidesWith(plateform)
		// 		) {
		// 			begin();
		// 			bg('grey');
		// 			arc(handsPos.x, handsPos.y, 4);
		// 			fill();
		// 		}
		// 	});

		// 	handsPos.x += stepX;
		// 	handsPos.y += stepY;
		// }
	}

	print() {
		font(15, 'Comic Sans MS');
		bg('black');
		align('center');
		text(this.name, this.getX() + this.getWidth() / 2, this.getY() - 10);
		rect(this.getX(), this.getY(), this.getWidth(), this.getHeight());
	}

	setEvents() {
		if( ! this.currentPlayer) return;

		document.addEventListener("keydown", (e) => {
			this._playerEvents(e);
		});

		document.addEventListener("keyup", (e) => {
			this._playerEvents(e);
		});

		Common.canvas.node.addEventListener("click", () => {
			if( ! this.weapon) return;
			this.weapon.fire();
		});

		Common.canvas.node.addEventListener('mousemove', () => {
			if( ! this.weapon) return;
			this.recalcAiming();
			// this.weapon.fire(e);
		});
	}

	_playerEvents(e) {
		if(e.keyCode === 32) this.weapon.setFire(e.type === 'keydown');
		else if(e.keyCode === 38 || e.keyCode === 90) this.jump(e.type === 'keydown');
		else if(e.keyCode === 37 || e.keyCode === 81 || e.keyCode === 39 || e.keyCode === 68) this.walk(e.type === 'keydown', e.keyCode === 37 || e.keyCode === 81 ? "left" : "right");
	}
}

class BadGuy extends Entity {

	constructor() {
		super();

		let health = parseInt(Common.rand(100,300));

		this.width = 25;
		this.height = 25;
		this.health = health;
		this.totalHealth = health;
		this.isDead = false;

		let position = this.getRandomPosition();

		this.setXY(position.x, position.y);
	}

	injured(amount) {
		this.health -= amount;

		if(this.health <= 0) this.destroy();
	}

	onDraw() {
		super.onDraw();
		this.printVitality();

		begin();
		bg('black');
		rect(this.getX(), this.getY(), this.getWidth(), this.getWidth());
		fill();
	}
}