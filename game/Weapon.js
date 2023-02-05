class Weapon extends Handler {

	constructor(data) {
		super();

		let createFromWeapon = data instanceof Weapon;

		this.isFiring = false;
		this.speedFire = 0;
		this.carrier = null;
		this.lastAimTimeStamp = null;

		if(createFromWeapon || Common.buildFromSocket) {
			this.type = data.type;
		}
		else {
			this.type = data;
		}

		this.img = Images.weapons[this.type];
		this.gunType = (this.type === 'gun' ? 'semi-' : '') + 'automatic';

		if(typeof this.img === "undefined") this.img = Images.weapons.gun;

		this.setWidth(this.img.width);
		this.setHeight(this.img.height);

		let position;
		if(createFromWeapon) {
			let operator = data.carrier.getFacingOperator();
			position = {x: (operator < 0 ? data.carrier.getX() : data.carrier.getHitBoxX()) + 20 * operator, y: data.carrier.getY() + 15};
		}
		else if(Common.buildFromSocket) {
			position = data.position;
		}
		else {
			position = this.getRandomPosition();
			position.y += 5;
		}

		this.setPosition(position);

		if(Common.buildFromSocket) return;

		Common.socket.emit("build", { action: "weapon-spawn", type: this.type, position: position });
	}

	carryBy(player) {
		this.carrier = player;
	}

	rapidFire() {
		if(this.gunType === 'automatic' && this.isFiring && this.speedFire === 0) {
			this.speedFire = setTimeout(() => {
				this.fire("automatic");
				this.speedFire = 0;
			}, 50);
		}
	}

	fire(type) {
		if(type !== this.gunType) return;

		Common.newElement('Bullet', this.carrier, 7, 10);

		this.sendSocket({ action: "fire", aim: this.getAim() });
	}

	setFire(state) {
		this.isFiring = state;
	}

	isUsed() {
		return this.carrier !== null;
	}

	isUnused() {
		return this.carrier === null;
	}

	getCarrier() {
		return this.carrier;
	}

	setAim(mouseXY = null, handXY = null) {
		let preventAim = this.isUnused() || ! this.getCarrier().isCurrentPlayer();
		if(preventAim && mouseXY === null && handXY === null) {
			return;
		}

		if(mouseXY === null) mouseXY = Common.getMousePosition();
		if(handXY === null) handXY = this.getCarrier().getHandsPos();
		let line = getLineEquation(handXY, mouseXY);
		let step = line.length / this.getCarrier().getSpeed();

		this.aiming = {
			length: line.length,
			mouse: mouseXY,
			handPos: handXY,
			step: {
				x: line.diff.x / step,
				y: line.diff.y / step
			},
			comparer: {
				x: line.diff.x < 0 ? -1 : 1,
				y: line.diff.y < 0 ? -1 : 1
			},
			toTop: line.diff.y >= 0,
			toBottom: line.diff.y < 0,
			toLeft: line.diff.x < 0,
			toRight: line.diff.x >= 0,
			line: line,
			fx: line.Fx,
			fy: line.Fy
		};

		if(preventAim === false && Common.updateFrame && Common.Sockets.enableAim) {
			// console.log(this.lastAimTimeStamp, Common.mouse.e.mousemove.timeStamp, Common.mouse.e.mousemove.timeStamp - this.lastAimTimeStamp);
			if(this.lastAimTimeStamp === null || Common.mouse.e.mousemove.timeStamp - this.lastAimTimeStamp > 50) {
			// if(Common.mouse.e.deltaTime.mousemove > 50) {
				this.lastAimTimeStamp = Common.mouse.e.mousemove.timeStamp;
				this.sendSocket({ action: "aim", aim: this.aiming });
			}
		}

		return this.aiming;
	}

	getAim() {
		return this.aiming;
	}

	printAim() {
		if(this.isUnused() || typeof this.getAim() === "undefined" || Common.Sockets.enableAim === false) return;

		let aim = this.getAim();
		let hit = this.collidesPlateform(aim, this.getCarrier());
		let handsPos = this.getCarrier().getHandsPos();
		let maxY = aim.toTop ? Common.canvas.height : 0;
		
		let coordinates = { x: aim.fy(maxY), y: maxY };
		if(hit) coordinates = hit.hitAt;

		begin();
		move(handsPos.x, handsPos.y);
		strokeColor('red');
		line(coordinates.x, coordinates.y, 2);
		stroke();

		if(hit) {
			begin();
			bg('red');
			circle(hit.hitAt.x, hit.hitAt.y, 7);
			fill();
			fontSize(15);
			align("center");
			// text(`${hit.hitAt.x} ; ${hit.hitAt.y}`, hit.hitAt.x - 3.5, hit.hitAt.y + 10);
		}
	}

	printPointer() {
		if(this.isUsed() && Common.Sockets.enableAim) {
			let mouse = Common.getMousePosition();
			if(typeof mouse !== "undefined")
			{
				begin();
				bg('red');
				circle(mouse.x, mouse.y, 7);
				fill();
			}
		}
	}

	onDraw() {
		super.draw();

		if(this.isUnused()) img(this.img, this.getX() - Common.getScroll(), this.getY() + this.getHeight());

		if(this.isUsed()) {
			if(Common.updateFrame) this.rapidFire();
			this.printAim();
			// this.printPointer();
		}
	}
}