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
		// Coordonnée X de l'impact avec la plateforme
		this.impactAbscissa = null;
		this.path = shooter.getAim();

		let hit = this.collidesPlateform(this.getPath(), this.getShooter());
		this.hitCoordinates = hit ? hit.hitAt : null;
		this.impacts = hit ? hit.impacts : [];
	}

	setDommage(amount) {
		this.dommage = amount;
	}

	onHit() {
		let element = this.collidesWith("BadGuy", "Player");
		if(element) {
			// On évite de se tirer sur soi-même
			if(this.getShooter().getUniqueID() === element.getUniqueID()) return false;
			// La cible est morte
			if(element.is("Player", "BadGuy") && element.isDead()) return false;

			if(
				(this.getShooter().is("BadGuy") && element.is("Player")) ||
			   	(this.getShooter().is("Player") && (element.is("BadGuy") || element.is("Player")))
			){
				element.injured(this.dommage);
			}

			return true;
		}
	}

	getPath() {
		return this.path;
	}

	getShooter() {
		return this.shooter;
	}

	getVelocity() {
		return {
			x: this.getPath().step.x * this.speed,
			y: this.getPath().step.y * this.speed
		};
	}

	onDraw() {
		super.draw();
		
		begin();
		bg('black');
		circle(this.getX(), this.getY(), this.width);
		fill();

		if(Common.EnableLogs) {
			this.impacts.forEach(impact => {
				begin();
				bg("red");
				circle(impact.x, impact.y, 5);
				fill();
			});
		}

		if(Common.updateFrame === false) return;

		let nextX = this.getX() + this.getVelocity().x;
		
		if(
			this.getX() < -100 || 
			this.getY() < -100 || 
			this.getX() > Common.canvas.width + 100 ||
			this.getY() > Common.canvas.height + 100 ||
			(this.hitCoordinates !== null && (
				(this.getPath().step.x >= 0 && this.hitCoordinates.x <= nextX) || 
				(this.getPath().step.x < 0 && this.hitCoordinates.x >= nextX)
			)) ||
			this.onHit()
		) {
			this.destroy();
			return;
		}

		this.setX(nextX);
		this.setY(this.getPath().fx(this.getX()));
	}
}