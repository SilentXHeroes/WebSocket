class Bullet extends Handler {

	constructor(shooter, speed, dommage, aim = false) {
		super();

		var facing = shooter.getFacing();

		if(shooter.getColision(facing)) facing = shooter.getOppositeFacing();

		let faceValue = facing === 'right' ? 1 : -1;

		if(aim) speed *= 1;
		else speed *= faceValue;

		let x = shooter.getScrollX() + ( faceValue > 0 ? shooter.getWidth() : 0);

		this.setScrollX(x);
		this.setXY(x, shooter.getHandsPos());
		this.width = 5;
		this.height = 5;
		this.speed = speed;
		this.dommage = dommage;
		this.shooter = shooter;
		this.out = false;
		this.aim = {
			x: this.speed, 
			y: this.getY(false)
		};
	}

	setDommage(amount) {
		this.dommage = amount;
	}

	aimTo(event) {
		let mousePosition = Common.calcMousePosition(event);
		let xDiff = mousePosition.x - this.getScrollX(false);
		let yDiff = mousePosition.y - this.getY(false);
		let lengthBtwPoints = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
		let steps = lengthBtwPoints / this.speed;

		this.aim.x = xDiff / steps;
		this.aim.y = yDiff / steps;
	}

	onHit() {
		var elements = Common.getElements();
		for(var i in elements) {
			var element = elements[i];

			if(
				(
					(this.getHitBoxY() < element.getHitBoxY() && this.getHitBoxY() > element.getY()) ||
					(this.getY() < element.getHitBoxY() && this.getY() > element.getY())
				) 
				&& 
				(
					(this.getFacing() === 'right' && this.getHitBoxX() > element.getScrollX() && this.getHitBoxX() < element.getHitBoxX()) ||
					(this.getFacing() === 'left' && this.getScrollX() < element.getHitBoxX() && this.getScrollX() > element.getScrollX())
				)
				&& (! element.is('Player') || this.shooter.getId() !== element.getId())
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
		) this.destroy();

		begin();
		bg('silver');
		arc(this.getScrollX(false), this.getY(false), this.width);
		fill();

		this.setScrollX(this.getScrollX(false) + this.aim.x);
		this.setY(this.getY(false) + this.aim.y);
	}
}