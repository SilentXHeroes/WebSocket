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
console.log(this.getPath());
		let step = this.getPath().step;
		let plateforms = Common
			.getElementsOfConstructor("Plateform")
			.filter(plateform => {
				plateform.setColor("lightgreen");
				return (
					// Plateforme à droite si tire à gauche
					(step.x >= 0 && plateform.getHitBoxX() < this.getShooter().getHitBoxX()) ||
					// Plateforme à gauche si tire à droite
					(step.x < 0 && plateform.getX() > this.getShooter().getX()) ||
					// Plateforme trop à droite si tire à droite et valeur max atteinte à droite
					(step.x >= 0 && plateform.getX() > this.getPath().fy(Common.canvas.height)) ||
					// Plateforme trop à gauche si tire à gauche et valeur max atteinte à gauche
					(step.x < 0 && plateform.getHitBoxX() < this.getPath().fy(Common.canvas.height)) ||
					// Plateforme trop à droite si tire à droite et valeur max atteinte à droite
					(step.y >= 0 && (step.x >= 0 ? plateform.getX() : plateform.getHitBoxX()) < this.getPath().fy(plateform.getY())) ||
					// Plateforme trop à gauche si tire à gauche et valeur max atteinte à gauche
					(step.y < 0 && (step.x >= 0 ? plateform.getX() : plateform.getHitBoxX()) > this.getPath().fy(plateform.getHitBoxY())) ||
					// Plateforme trop basse si tire vers le haut
					(step.y >= 0 && plateform.getHitBoxY() < this.getShooter().getHitBoxY()) ||
					// Plateforme trop haute si tire vers le bas
					(step.y < 0 && plateform.getY() > this.getShooter().getHitBoxY())
				) === false
			});

		this.impacts = [];
		plateforms.forEach(plateform => {
			plateform.setColor("red");
			let xA = this.getPath().fy(plateform.getY());
			let yA = this.getPath().fx(plateform.getX());
			let xB = this.getPath().fy(plateform.getHitBoxY());
			let yB = this.getPath().fx(plateform.getHitBoxX());

			let firstHitbox = step.x > 0 ? plateform.getY() : plateform.getHitBoxY();
			let secondHitbox = step.x > 0 ? plateform.getHitBoxY() : plateform.getY();

			// if((yA < firstHitbox && yB > secondHitbox) || (yA >= firstHitbox && yB <= secondHitbox)) {
				this.impacts.push({ x: plateform.getX(), y: yA }, { x: plateform.getHitBoxX(), y: yB }, { x: xA, y: plateform.getY() }, { x: xB, y: plateform.getHitBoxY() });
			// }
		});
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
		return this.getShooter().getAim();
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

		this.impacts.forEach(impact => {
			begin();
			bg("red");
			circle(impact.x, impact.y, 5);
			fill();
		});

		if(
			this.onHit() || 
			this.getX() < -100 || 
			this.getY() < -100 || 
			this.getX() > Common.canvas.width + 100 ||
			this.getY() > Common.canvas.height + 100
		) {
			this.destroy();
			return;
		}

		this.setX(this.x + this.getVelocity().x);
		this.setY(this.getPath().fx(this.getX()));
		// this.setY(this.getY() + this.getVelocity().y);
	}
}