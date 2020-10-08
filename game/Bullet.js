class Bullet extends Handler {

	constructor(shooter, speed, dommage) {
		super();

		speed *= this.getFacingOperator();
		let handsPos = shooter.getHandsPos();
		
		this.setScrollX(handsPos.x);
		this.setXY(handsPos.x, handsPos.y);
		this.width = 5;
		this.height = 5;
		this.speed = speed;
		this.dommage = dommage;
		this.shooter = shooter;
		this.out = false;

		this.recalcAiming(this.shooter);
	}

	setDommage(amount) {
		this.dommage = amount;
	}

	onHit() {
		let element = this.collidesWith('Plateform', 'BadGuy');
		if(element) {
			if(
				(element.is('Player') && this.shooter.is('BadGuy')) ||
			   	(element.is('BadGuy') && this.shooter.is('Player'))
			){
				element.injured(this.dommage);
			}

			return true;
		}
	}

	onDraw() {
		begin();
		bg('grey');
		arc(this.getScrollX(false), this.getY(false), this.width);
		fill();

		if(
			this.getScrollX(false) > Common.canvas.width + 100 ||
			this.getScrollX(false) < -100 || 
			this.onHit() || 
			this.getY(false) < -100 || 
			this.getY(false) > Common.canvas.height + 100
		) {
			this.destroy();
			return;
		}

		// this.drawHitBox();

		this.setScrollX(this.getScrollX(false) + this.aiming.steps.x * this.speed);
		this.setY(this.getY(false) + this.aiming.steps.y * this.speed);
	}
}