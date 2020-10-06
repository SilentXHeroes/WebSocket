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
		this.setXY(x, y);
	}

	onDraw() {
		super.draw();
		
		Common.board.fillStyle = "lightgreen";
		Common.board.fillRect(this.getX(), this.getY(), this.getWidth(), this.getHeight());
	}
}