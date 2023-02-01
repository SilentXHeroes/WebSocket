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

		let step = this.getPath().step;
		let maxPathX = this.getPath().fy(step.y >= 0 ? Common.canvas.height : 0);
		let plateforms = Common
			.getElementsOfConstructor("Plateform")
			.filter((plateform, index) => {
				plateform.resetDefaultColor();

				let firstHitboxX = step.x > 0 ? plateform.getX() : plateform.getHitBoxX();
				let secondHitboxX = step.x > 0 ? plateform.getHitBoxX() : plateform.getX();

				if(Common.EnableLogs) {
					// Plateforme à droite si tire à gauche
					console.log(
						step.x >= 0 && plateform.getHitBoxX() < this.getShooter().getHitBoxX(),
						// Plateforme à gauche si tire à droite
						step.x < 0 && plateform.getX() > this.getShooter().getX(),
						// Plateforme trop basse si tire vers le haut
						step.y >= 0 && plateform.getHitBoxY() < this.getShooter().getHitBoxY(),
						// Plateforme trop haute si tire vers le bas
						step.y, plateform.getY(), this.getShooter().getHitBoxY(), step.y < 0 && plateform.getY() > this.getShooter().getHitBoxY(),
						// Plateforme trop à droite si tire à droite et valeur max atteinte à droite
						step.x, plateform.getX(), maxPathX, step.x >= 0 && plateform.getX() > maxPathX,
						// Plateforme trop à gauche si tire à gauche et valeur max atteinte à gauche
						step.x < 0 && plateform.getHitBoxX() < maxPathX,
						"&&",
						plateform.getX(),'<=',this.getPath().fy(plateform.getY()),'&&',plateform.getHitBoxX(), '>=', this.getPath().fy(plateform.getY()),
						plateform.getX() <= this.getPath().fy(plateform.getY()) && plateform.getHitBoxX() >= this.getPath().fy(plateform.getY()),
						//// Plateforme trop à droite si tire à droite et valeur max atteinte à droite
						plateform.getY() <= this.getPath().fx(firstHitboxX) && plateform.getHitBoxY() >= this.getPath().fx(firstHitboxX),
						plateform.getY() <= this.getPath().fx(secondHitboxX) && plateform.getHitBoxY() >= this.getPath().fx(secondHitboxX)
					);
				}

				return (
						// Plateforme à droite si tire à gauche
						(step.x >= 0 && plateform.getHitBoxX() < this.getShooter().getHitBoxX()) ||
						// Plateforme à gauche si tire à droite
						(step.x < 0 && plateform.getX() > this.getShooter().getX()) ||
						// Plateforme trop basse si tire vers le haut
						(step.y >= 0 && plateform.getHitBoxY() < this.getShooter().getHitBoxY()) ||
						// Plateforme trop haute si tire vers le bas
						(step.y < 0 && plateform.getY() > this.getShooter().getHitBoxY()) ||
						// Plateforme trop à droite si tire à droite et valeur max atteinte à droite
						(step.x >= 0 && plateform.getX() > maxPathX) ||
						// Plateforme trop à gauche si tire à gauche et valeur max atteinte à gauche
						(step.x < 0 && plateform.getHitBoxX() < maxPathX)
					) === false
					&&
					(
						//
						(plateform.getX() <= this.getPath().fy(plateform.getY()) && plateform.getHitBoxX() >= this.getPath().fy(plateform.getY())) ||
						// Plateforme trop à droite si tire à droite et valeur max atteinte à droite
						(plateform.getY() <= this.getPath().fx(firstHitboxX) && plateform.getHitBoxY() >= this.getPath().fx(firstHitboxX)) ||
						//
						(plateform.getY() <= this.getPath().fx(secondHitboxX) && plateform.getHitBoxY() >= this.getPath().fx(secondHitboxX))
					);
			});

		this.impacts = [];

		let minDistance = null;
		let closestPlateform = null;
		plateforms.forEach(plateform => {			
			let xA = this.getPath().fy(plateform.getY());
			let yA = this.getPath().fx(plateform.getX());
			let xB = this.getPath().fy(plateform.getHitBoxY());
			let yB = this.getPath().fx(plateform.getHitBoxX());

			let hitLeft = this.getPath().step.x >= 0 && yA >= plateform.getY() && yA <= plateform.getHitBoxY();
			let hitRight = this.getPath().step.x < 0 && yB >= plateform.getY() && yB <= plateform.getHitBoxY();
			let hitBottom = this.getPath().step.y >= 0 && xA >= plateform.getX() && xA <= plateform.getHitBoxX();
			let hitTop = this.getPath().step.y < 0 && xB >= plateform.getX() && xB <= plateform.getHitBoxX();
			let hitCoordinates;

			if(hitLeft) hitCoordinates = { x: plateform.getX(), y: yA };
			if(hitRight) hitCoordinates = { x: plateform.getHitBoxX(), y: yB };
			if(hitBottom) hitCoordinates = { x: xA, y: plateform.getY() };
			if(hitTop) hitCoordinates = { x: xB, y: plateform.getHitBoxY() };

			if(hitLeft || hitRight || hitBottom || hitTop) {
				let distance = getDistanceBetweenPoints(this.path.handPos, hitCoordinates);
				if(Common.EnableLogs) this.impacts.push(hitCoordinates);
				if(minDistance === null || distance.length < minDistance) {
					minDistance = distance.length;
					closestPlateform = plateform;
					console.log(minDistance, closestPlateform);
				}
			}
		});

		closestPlateform.setColor("red");
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

		if(
			this.getX() < -100 || 
			this.getY() < -100 || 
			this.getX() > Common.canvas.width + 100 ||
			this.getY() > Common.canvas.height + 100 ||
			(Common.updateFrame && this.onHit())
		) {
			this.destroy();
			return;
		}

		if(Common.updateFrame) {
			this.setX(this.x + this.getVelocity().x);
			this.setY(this.getPath().fx(this.getX()));
		}
		// this.setY(this.getY() + this.getVelocity().y);
	}
}