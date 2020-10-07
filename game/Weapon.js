class Weapon extends Handler {

	constructor(obj) {
		super();

		this.carrier = obj;
		this.bullets = [];
		this.isFiring = false;
		this.speedFire = 0;
	}

	rapidFire() {
		if(this.isFiring && this.speedFire === 0) {
			this.speedFire = setTimeout(() => {
				this.fire();
				this.speedFire = 0;
			}, 100);
		}
	}

	fire(event = null) {
		let aim = event !== null;
		let bullet = Common.newElement('Bullet', this.carrier, 3, 5, aim);

		if(aim) bullet.aimTo(event);

		this.bullets.push(bullet);
	}

	setFire(state) {
		this.isFiring = state;
	}

	onDraw() {
		// this.rapidFire();
		for(var i in this.bullets) if(this.bullets[i].onDraw() === false) this.bullets.shift();
	}
}