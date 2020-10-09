const Common = new class {

	constructor() {
		let canvas = document.getElementById("canvas");

		this.scrollX 	= 0;
		this.elements 	= [];
		this.socket		= io();
		this.board 		= canvas.getContext("2d");
		this.canvas 	= {
			height: canvas.height,
			width: canvas.width,
			floor: canvas.height - 50,
			node: canvas
		};

		this.sockets();
		this.getFrameRate();

		canvas.addEventListener('mousemove', e => {
			this.mousePosition = this.calcMousePosition(e);
		});
		// this.fps = 60;
	}

	getPlayer(id) {
		let players = this.getElementsOfConstructor('Player');
		return players.find(x => x.getId() === id);
	}
	getElementById(id) {
		return this.elements.find(x => x.uniqueID === id);
	}
	getElements() {
		return this.elements;
	}
	getElementsOfConstructor(...constructor) {
		return this.elements.filter(element => element.is(...constructor));
	}
	newElement(...args) {
		let constructor = args.shift();
		let obj = new (eval(constructor))(...args);

		this.elements.push(obj);

		if(constructor === 'Player' && this.socket.id === obj.getId()) this.current = obj;

		obj.setUniqueID();

		return obj;
	}
	destroyElement(id) {
		this.elements = this.elements.filter(element => element.uniqueID !== id);
	}
	setScroll(distance) {
		this.scrollX += distance;
	}
	clearScroll() {
		this.scrollX = 0;
	}
	getScroll() {
		return this.scrollX;
	}
	drawPos(obj) {
		let x = parseInt(obj.getScrollX());
		var txt = x + ' ; ' + parseInt(obj.getHitBoxY());
		this.board.fillStyle = "black";
		this.board.font = "12px Sans-Serif";
		this.board.fillText(txt, obj.getX() + obj.getWidth() / 2, obj.getY() - 10);
	}
	getMousePosition() {
		return this.mousePosition;
	}
	calcMousePosition(e) {
		let bounds = Common.canvas.node.getBoundingClientRect();
		return {x: e.clientX - bounds.left, y: e.clientY - bounds.top};
	}
	calcForFrameRate(value) {
		// Rafraichissement de référence: 60 Hz
		value = value * ( this.fps / 60 );
		return parseFloat(value.toFixed(2));
	}
	rand(x1,x2 = 0) {
		let max = Math.max(x1,x2);
		let min = Math.min(x1, x2);
		return Math.random() * (max - min) + min;
	}

	sockets() {
		this.socket.on("player-connect", data => {
			Common.newElement('Player', data.id, data.name);
		});

		this.socket.on("show-players", data => {
			for(var i in data) Common.newElement('Player', data[i]);
		});

		this.socket.on("player-disconnect", id => {
			Common.destroyElement(id);
		});

		this.socket.on("player-update", data => {
			let player = Common.getPlayer(data.id);

			player.setXY(data.x, data.y);

			Common.drawPos(player);
		});
	}

	startGame() {
		// Floor
		this.newElement('Plateform', 0, this.canvas.floor, this.canvas.width, 50);

		// Plateforms
		this.newElement('Plateform', this.canvas.width / 2 - 100, this.canvas.height - 150, 150, 25);
		this.newElement('Plateform', this.canvas.width / 2 + 100, this.canvas.height - 125, 75, 15);

		// Wall
		this.newElement('Plateform', this.canvas.width * 90 / 100, this.canvas.floor - 100, 35, -100);
		this.newElement('Plateform', this.canvas.width * 75 / 100, this.canvas.floor - 175, 35, -100);

		this.animate();
	}

	frame() {
		Common.board.clearRect(0, 0, Common.canvas.width, Common.canvas.height);

		var plateforms = Common.getElementsOfConstructor('Plateform');
		var badGuys = Common.getElementsOfConstructor('BadGuy');
		var weapons = Common.getElementsOfConstructor('Weapon');
		var bullets = Common.getElementsOfConstructor('Bullet');
		var players = Common.getElementsOfConstructor('Player');

		for(var i in plateforms) plateforms[i].onDraw();
		for(var i in badGuys) badGuys[i].onDraw();
		for(var i in weapons) weapons[i].onDraw();
		for(var i in players) players[i].onDraw();
		for(var i in bullets) bullets[i].onDraw();

		Common.calculateFrameRate();
		Common.animate();
	}

	getFrameRate(state = true) {
		this.timeExecution = 0;
		this.lastFrameRate = ! state;
		this.framesRates = [];
	}

	calculateFrameRate() {
		if( ! this.lastFrameRate) {
			this.lastFrameRate = performance.now();
			this.timeExecution = 0;
			this.framesRates = [];
		}
		else if(this.timeExecution > 500) {
			this.getFrameRate(false);
		}
		else if(this.lastFrameRate !== true) {
			let fps = Math.ceil(1 / ((performance.now() - this.lastFrameRate) / 1000));

			this.framesRates.push(fps);

			let total = 0;
			this.framesRates.forEach(val => total += val);

			this.fps = parseInt(total / this.framesRates.length);

			this.lastFrameRate = performance.now();
			this.timeExecution++;
		}

		font(30, 'Monospace');
		bg('red');
		text(this.fps, 50, 50);
	}

	animate() {
		requestAnimationFrame(this.frame);
	}

	newUniqueID() {
	    //return id of format 'aaaaaaaa'-'aaaa'-'aaaa'-'aaaa'-'aaaaaaaaaaaa'
	    return this._string() + this._string() + '-' + this._string() + '-' + this._string() + '-' + this._string() + '-' + this._string() + this._string() + this._string();
	}

	_string() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
	}
}