class Weapon extends Handler {

	constructor(data) {
		super();

		let createFromWeapon = data instanceof Weapon;

		this.isFiring = false;
		this.speedFire = 0;
		this.carrier = null;

		if(createFromWeapon) {
			this.type = data.type;
			this.img = Images.weapons[data.type];
		}
		else {
			this.type = data;
			this.img = Images.weapons[data];
		}

		this.gunType = (this.type === 'gun' ? 'semi-' : '') + 'automatic';

		this.setWidth(this.img.width);
		this.setHeight(this.img.height);

		let position;
		if(createFromWeapon) {
			let operator = data.carrier.getFacingOperator();
			position = {x: (operator < 0 ? data.carrier.getX() : data.carrier.getHitBoxX()) + 20 * operator, y: data.carrier.getY() + 15};
		}
		else {
			position = this.getRandomPosition();
			position.y += 5;
		}

		this.setPosition(position);
		this.setAim();

		if(Common.buildFromSocket) return;

		Common.socket.emit("build", { action: "weapon-spawn", type: this.type, src: this.img.src, pos: position });
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

		Common.newElement('Bullet', this.carrier, 3, 10);
		this.sendSocket({ action: "fire", aim: this.carrier.aiming });
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

	setAim() {
		if(this.isUnused() || ! this.getCarrier().isCurrentPlayer()) return;

		let mouse = Common.getMousePosition();
		let handPos = this.getCarrier().getHandsPos();
		let xDiff = mouse.x - handPos.x;
		let yDiff = mouse.y - handPos.y;
		let lengthBtwPoints = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
		let steps = lengthBtwPoints / this.getCarrier().getSpeed();

		this.aiming = {
			length: lengthBtwPoints,
			mouse: mouse,
			steps: {
				x: xDiff / steps,
				y: yDiff / steps
			}
		};

		if(Common.updateFrame && Common.Sockets.enableAim) this.sendSocket({ action: "aim", aim: this.aiming });
	}

	getAim() {
		return this.aiming;
	}

	printAim() {
		if(this.isUnused()) return;

		Common.getElementsOfConstructor('Plateform').forEach(x => x.setColor('lightgreen'));

		let handsPos = this.getCarrier().getHandsPos();
		let aiming = this.getAim();
		let stepX = aiming.steps.x;
		let stepY = aiming.steps.y;

		begin();
		move(handsPos.x, handsPos.y);
		strokeColor('red');
		line(aiming.mouse.x, aiming.mouse.y, 2);
		stroke();

		begin();
		bg('red');
		circle(aiming.mouse.x, aiming.mouse.y, 7);
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
		if(this.isUsed()) {
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

		if(this.isUnused()) img(this.img, this.getX(), this.getY() + this.getHeight());

		if(this.isUsed()) {
			if(Common.updateFrame) this.rapidFire();
			this.printAim();
			this.printPointer();
		}
	}
}