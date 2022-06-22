class Member {
	
	constructor(entity, member) 
	{
		member = member.split('.');

		this.memberName = member[0];
		this.side = null;

		if(member.length === 2) this.side = member[1];

		this.entity = entity;
		this.angle1 = 0;
		this.angle2 = 0;
		this.length1 = 0;
		this.length2 = 0;

		if(this.memberName === "leg" || this.memberName === "arm") {
			this.angle1 = Common.setAngle(-90);
			this.angle2 = Common.setAngle(-90);
		}
	}

	getMemberName() {
		return this.memberName;
	}

	getSide() {
		return this.side;
	}

	setAngle(a1, a2 = null) 
	{
		if(a1 !== null) this.angle1 = Common.setAngle(a1);
		if(a2 !== null) this.angle2 = Common.setAngle(a2);
	}

	addAngle(a1, a2 = null) 
	{
		let angles = this.getAngle(true);
		if(a1 !== null) this.angle1 = Common.setAngle(angles[0] + a1);
		if(a2 !== null) this.angle2 = Common.setAngle(angles[1] + a1);
	}

	setLength(l1, l2 = null) 
	{
		if(a1 !== null) this.angle1 = a1;
		if(a2 !== null) this.angle2 = a2;	
	}

	getAngle(format = false)
	{
		let a1 = this.angle1, a2 = this.angle2;

		if(format) 
		{
			a1 = Common.getAngle(a1);
			a2 = Common.getAngle(a2);
		}

		if(this.memberName === "head") return a1;

		return [a1, a2];
	}

	getLength() 
	{
		return [this.length1, this.length2];
	}

	draw() {
		let yFrom = this.entity.getY() + this.entity.bodyHeight * .7;

		if(this.memberName === "arm") yFrom += this.entity.bodyHeight * 0.5;

		let xOrigin = this.entity.getX() + this.entity.bodyWidth / 2;
		let yOrigin = this.entity.getY() + this.entity.bodyHeight * .7;

		if(this.memberName === 'body') {
			// begin();
			// move(xOrigin, yOrigin);
			// strokeColor('white');
			// line(xOrigin, yOrigin + this.bodyHeight - this.bodyHeight * 0.5, this.bodyWidth * 1.1, 'round');
			// stroke();

			begin();
			move(xOrigin, yOrigin);
			strokeColor('black');
			line(xOrigin, yOrigin + this.entity.bodyHeight - this.entity.bodyHeight * 0.5, this.entity.bodyWidth, 'round');
			stroke();

			begin();
			bg('blue');
			circle(xOrigin, yOrigin, this.entity.bodyWidth / 2);
			fill();

			begin();
			bg('blue');
			rect(xOrigin - this.entity.bodyWidth / 2, yOrigin, this.entity.bodyWidth, this.entity.bodyHeight * 0.15);
			fill();
		}
		
		if(this.memberName === 'head') {
			begin();
			lineWidth(this.entity.bodyHeight * 0.02);
			strokeColor('white');
			bg(this.entity.color);
			circle(xOrigin, yOrigin + this.entity.bodyHeight - this.entity.bodyHeight * 0.05, this.entity.bodyWidth);
			fill();
			stroke();
		}

		if(this.memberName === "leg" || this.memberName === "arm")
		{
			let firstHalfX = ( this.entity.getX() + this.entity.bodyWidth / 2 ) + Math.cos(this.angle1) * this.entity.memberLength * this.entity.getFacingOperator();
			let firstHalfY = yFrom + Math.sin(this.angle1) * this.entity.memberLength;
			let secondHalfX = firstHalfX + Math.cos(this.angle2) * this.entity.memberLength * this.entity.getFacingOperator();
			let secondHalfY = firstHalfY + Math.sin(this.angle2) * this.entity.memberLength;
			let thickness;
			let color = this.entity.color;

			// Legs
			if(this.memberName === "leg") {
				thickness = this.entity.bodyHeight * 0.3;
				color = this.entity.is('BadGuy') ? 'darkgreen' : 'blue';
			}
			// Arm
			else {
				thickness = this.entity.bodyHeight * 0.23;
			}

			thickness = this.entity.bodyWidth;

			join('round');

			begin();
			move(xOrigin, yFrom);
			strokeColor('white');
			line(firstHalfX, firstHalfY, thickness * 1.1, 'round');
			line(secondHalfX, secondHalfY, thickness * 1.1, 'round');
			stroke();

			begin();
			move(xOrigin, yFrom);
			strokeColor(color);
			line(firstHalfX, firstHalfY, thickness, 'round');
			line(secondHalfX, secondHalfY, thickness, 'round');
			stroke();
		}
	}

}