class Bullet extends Handler {

	constructor(shooter, speed, dommage) {
		super();

		speed *= this.getFacingOperator();
		let handsPos = shooter.getHandsPos();
		
		// this.setScrollX(handsPos.x);
		this.setXY(handsPos.x, handsPos.y);
		this.width = 5;
		this.height = 5;
		this.speed = speed;
		this.dommage = dommage;
		this.shooter = shooter;
		this.out = false;

		this.setAim();
	}

	setDommage(amount) {
		this.dommage = amount;
	}

	onHit() {
		let element = this.collidesWith("Plateform", "BadGuy", "Player");
		if(element) {
			// On évite de se tirer sur soi-même
			if(this.shooter.getUniqueID() === element.getUniqueID()) return false;
			// La cible est morte
			if(element.is("Player", "BadGuy") && element.isDead()) return false;

			if(
				(this.shooter.is("BadGuy") && element.is("Player")) ||
			   	(this.shooter.is("Player") && (element.is("BadGuy") || element.is("Player")))
			){
				element.injured(this.dommage);
			}

			return true;
		}
	}

	setAim() {
		this.shooter.setAim();
		this.aiming = this.shooter.getAim();
	}

	getShooter() {
		return this.shooter;
	}

	onDraw() {
		super.draw();
		
		begin();
		bg('black');
		circle(this.getX(), this.getY(), this.width);
		fill();

		if(
			this.getX() > Common.canvas.width + 100 ||
			this.getX() < -100 || 
			this.onHit() || 
			this.getY() < -100 || 
			this.getY() > Common.canvas.height + 100
		) {
			this.destroy();
			return;
		}
		
		this.setX(this.x + this.aiming.steps.x * this.speed);
		this.setY(this.getY() + this.aiming.steps.y * this.speed);
	}
}