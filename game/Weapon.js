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

		this.carrier.setAim(this.setAim());

		Common.newElement('Bullet', this.carrier, 2, 10);

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

		Common.getElementsOfConstructor('Plateform').forEach(x => x.setColor('lightgreen'));

		let handsPos = this.getCarrier().getHandsPos();
		let aim = this.getAim();
		let stepX = aim.step.x;
		let stepY = aim.step.y;

		begin();
		move(handsPos.x, handsPos.y);
		strokeColor('red');
		line(aim.mouse.x, aim.mouse.y, 2);
		stroke();

		begin();
		bg('red');
		circle(aim.mouse.x, aim.mouse.y, 7);
		fill();

		// while(handsPos.x > 0 && handsPos.y > 0 && handsPos.x < Common.canvas.width && handsPos.y < Common.canvas.height) {
		// 	let plateforms = Common.getElementsOfConstructor('Plateform','BadGuy');

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
		// 			circle(handsPos.x, handsPos.y, 4);
		// 			fill();
		// 		}
		// 	});

		// 	handsPos.x += stepX;
		// 	handsPos.y += stepY;
		// }
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
			this.printPointer();
		}
	}
}