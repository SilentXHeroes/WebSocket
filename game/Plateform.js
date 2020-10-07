class Plateform extends Handler {

	constructor(x, y, width, height) {
		super();

		if(width < 0) {
			width = -width;
			x -= width;
		}

		if(height < 0) {
			height = -height;
			y -= height;
		}

		this.width = width;
		this.height = height;
		this.setColor('lightgreen');
		this.setXY(x, y);
	}

	setColor(color) {
		this.color = color;
	}

	onDraw() {
		super.draw();
		
		Common.board.fillStyle = this.color;
		Common.board.fillRect(this.getX(), this.getY(), this.getWidth(), this.getHeight());
	}
}