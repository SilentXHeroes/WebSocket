class Player extends Moving {

	constructor(player, current = false) {
		super();

		this.id = player.id;
		this.name = player.name;
		this.width = parseInt(player.width);
		this.height = parseInt(player.height);
		this.currentPlayer = current;
		this.jumpingFromKeyDown = false;
		this.onMove = false;
		this.aiming = {x: 0, y: 0};
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
		begin();
		move(this.getX(), this.getHandsPos());
		strokeColor('red');
		line(this.aiming.x, this.aiming.y, 2);
		stroke();

		begin();
		strokeColor('red');
		arc(this.aiming.x, this.aiming.y, 10);
		stroke();
	}

	print() {
		Common.board.font = "15px Comic Sans MS";
		Common.board.fillStyle = "black";
		Common.board.textAlign = "center";
		Common.board.fillText(this.name, this.getX() + this.getWidth() / 2, this.getY() - 10);
		Common.board.fillRect(this.getX(), this.getY(), this.getWidth(), this.getWidth());
	}

	setEvents() {
		if( ! this.currentPlayer) return;

		document.addEventListener("keydown", (e) => {
			this._playerEvents(e);
		});

		document.addEventListener("keyup", (e) => {
			this._playerEvents(e);
		});

		Common.canvas.node.addEventListener("click", (e) => {
			if( ! this.weapon) return;
			this.weapon.fire(e.clientX, e.clientY);
		});

		Common.canvas.node.addEventListener('mousemove', (e) => {
			if( ! this.weapon) return;
			this.aiming = Common.calcMousePosition(e);
		});
	}

	_playerEvents(e) {
		if(e.keyCode === 32) this.weapon.setFire(e.type === 'keydown');
		else if(e.keyCode === 38 || e.keyCode === 90) this.jump(e.type === 'keydown');
		else if(e.keyCode === 37 || e.keyCode === 81 || e.keyCode === 39 || e.keyCode === 68) this.walk(e.type === 'keydown', e.keyCode === 37 || e.keyCode === 81 ? "left" : "right");
	}
}

class BadGuy extends Moving {
	health;
	totalHealth;
	isDead;

	constructor(x, y, health) {
		super();

		this.width = 25;
		this.height = 25;
		this.health = health;
		this.totalHealth = health;
		this.isDead = false;

		this.setXY(50, Common.canvas.floor - this.getWidth() * 2);
		this.onDraw();
	}

	injured(amount) {
		this.health -= amount;

		if(this.health <= 0) {
			this.isDead = true;
		}
	}

	onDraw() {
		super.onDraw();
		Common.board.fillStyle = "red";
		Common.board.fillRect(this.getX() + this.getWidth() / 2 - 50 / 2, this.getY() - this.getWidth() / 2, 50, 10);
		Common.board.fillStyle = "green";
		Common.board.fillRect(this.x + this.getWidth() / 2 - 50 / 2, this.getY() - this.getWidth() / 2, 50 * ( this.health / this.totalHealth ), 10);
		Common.board.fillStyle = "black";
		Common.board.fillRect(this.getX(), this.getY(), this.getWidth(), this.getWidth());
	}
}