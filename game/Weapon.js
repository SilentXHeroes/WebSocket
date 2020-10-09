class Weapon extends Handler {

	constructor(type) {
		super();

		this.isFiring = false;
		this.speedFire = 0;

		let img = new Image();

		img.src = "asset/"+ type +".png";

		let thos = this;

		img.onload = function () {
			thos.setWidth(this.width);
			thos.setHeight(this.height);

			let position = thos.getRandomPosition();

			thos.img = this;
			thos.setXY(position.x, position.y - 10);
		}
	}

	carryBy(player) {
		this.carrier = player;
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
		this.rapidFire();

		let player = this.collidesWith('Player');
		if(player) {
			this.carryBy(player);
			player.carryWeapon(this);
			this.img = false;
		}

		if(this.img) {
			img(this.img, this.x, this.y);
		}
	}
}