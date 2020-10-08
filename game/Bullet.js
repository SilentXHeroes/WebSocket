class Bullet extends Handler {

	constructor(shooter, speed, dommage, aim = false) {
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
		this.aim = Common.getAiming(this);
	}

	setDommage(amount) {
		this.dommage = amount;
	}

	aimTo(event) {
		this.aim = Common.getAiming(this.shooter, event);
	}

	onHit() {
		var elements = Common.getElements();
		for(var i in elements) {
			var element = elements[i];

			if(
				// (
				// 	(this.getHitBoxY() < element.getHitBoxY() && this.getHitBoxY() > element.getY()) ||
				// 	(this.getY() < element.getHitBoxY() && this.getY() > element.getY())
				// ) 
				// && 
				// (
				// 	(this.getFacing() === 'right' && this.getHitBoxX() > element.getScrollX() && this.getHitBoxX() < element.getHitBoxX()) ||
				// 	(this.getFacing() === 'left' && this.getScrollX() < element.getHitBoxX() && this.getScrollX() > element.getScrollX())
				// )
				this.collidesWith(element)
				&& this.shooter.getUniqueId() !== element.getUniqueId()
			) {
				if((element.is('Player') && this.shooter.is('BadGuy')) ||
				   (element.is('BadGuy') && this.shooter.is('Player'))
				) {
					element.injured(this.dommage);
				}

				return true;
			}
		}
	}

	onDraw() {
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

		this.drawHitBox();

		begin();
		bg('grey');
		arc(this.getScrollX(false), this.getY(false), this.width);
		fill();

		this.setScrollX(this.getScrollX(false) + this.aim.steps.x * this.speed);
		this.setY(this.getY(false) + this.aim.steps.y * this.speed);
	}
}