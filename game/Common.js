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
		// this.fps = 60;
	}

	getPlayer(id) {
		let players = this.getElementsOfConstructor('Player');
		return players.find(x => x.getId() === id);
	}
	getElements() {
		return this.elements;
	}
	getElementsOfConstructor(constructor) {
		return this.elements.filter(element => element.is(constructor));
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
	calcMousePosition(e) {
		let bounds = Common.canvas.node.getBoundingClientRect();
		return {x: e.clientX - bounds.left, y: e.clientY - bounds.top};
	}
	getAiming(entity, coords = false) {
		if( ! coords) {
			return {
				steps: {
					x: entity.getSpeed(), 
					y: entity.getY(false)
				}
			}
		}

		let target = typeof coords.mouse !== 'undefined' ? coords.mouse : Common.calcMousePosition(coords);
		let handPos = entity.getHandsPos();
		let xDiff = target.x - handPos.x;
		let yDiff = target.y - handPos.y;
		let lengthBtwPoints = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
		let steps = lengthBtwPoints / entity.getSpeed();

		return {
			length: lengthBtwPoints,
			mouse: target,
			steps: {
				x: xDiff / steps,
				y: yDiff / steps
			}
		};
	}
	calcForFrameRate(value) {
		// Rafraichissement de référence: 60 Hz
		value = value * ( this.fps / 60 );
		return parseFloat(value.toFixed(2));
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

		var elements = Common.getElementsOfConstructor('Plateform');
		var players = Common.getElementsOfConstructor('Player');
		var badGuys = Common.getElementsOfConstructor('BadGuy');
		// var weapons = Common.getElementsOfConstructor('Weapon');
		var bullets = Common.getElementsOfConstructor('Bullet');
		var shapes = Common.getElementsOfConstructor('Shape');

		for(var i in elements) elements[i].onDraw();
		for(var i in players) players[i].onDraw();
		// for(var i in weapons) weapons[i].onDraw();
		for(var i in badGuys) elements[i].onDraw();
		for(var i in bullets) bullets[i].onDraw();
		for(var i in shapes) shapes[i].onDraw();

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