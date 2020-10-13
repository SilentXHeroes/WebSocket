class Weapon extends Handler {

	constructor(data) {
		super();

		let thos = this;
		let createFromWeapon = data instanceof Weapon;

		this.isFiring = false;
		this.speedFire = 0;
		this.img = new Image();

		if(createFromWeapon) {
			this.type = data.type;
			this.img.src = data.img.src;
		}
		else {
			this.type = data;
			this.img.src = "asset/"+ this.type +".png";
		}

		this.gunType = (this.type === 'gun' ? 'semi-' : '') + 'automatic';

		this.img.onload = function () {
			thos.setWidth(this.width);
			thos.setHeight(this.height);

			let position;
			if(createFromWeapon) {
				position = {x: data.carrier.getX() + ( ( data.carrier.getWidth() + 10 ) * data.carrier.getFacingOperator() ), y: data.carrier.getY()};
			}
			else {
				position = thos.getRandomPosition();
				position.y -= 10;
			}

			thos.setXY(position.x, position.y);
		}
	}

	carryBy(player) {
		this.carrier = player;

		Common.canvas.node.addEventListener('mousemove', Common.events.weapon.mouseMove);

		if(this.gunType === 'semi-automatic') {
			Common.canvas.node.addEventListener("click", Common.events.weapon.click);
		}
		else if(this.gunType === 'automatic') {
			Common.canvas.node.addEventListener('mousedown', Common.events.weapon.mouseDown);
			Common.canvas.node.addEventListener('mouseup', Common.events.weapon.mouseUp);
		}
	}

	rapidFire() {
		if(this.isFiring && this.speedFire === 0) {
			this.speedFire = setTimeout(() => {
				this.fire();
				this.speedFire = 0;
			}, 50);
		}
	}

	fire() {
		Common.newElement('Bullet', this.carrier, 5, 5);
	}

	setFire(state) {
		this.isFiring = state;
	}

	onDraw() {
		let player = this.collidesWith('Player');

		if(player) {
			player.carryWeapon(this);
			this.destroy();
		}

		if(this.gunType === 'automatic') this.rapidFire();
		if(this.img) img(this.img, this.x, this.y);
	}
}