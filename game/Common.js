class _Common {

	constructor() {
		let canvas = document.getElementById("canvas");

		this.scrollX 	= 0;
		this.elements 	= [];
		this.socket		= io();
		this.board 		= canvas.getContext("2d");
		this.stop 		= false;
		this.canvas 	= {
			height: canvas.height,
			width: canvas.width,
			floor: canvas.height - 50,
			node: canvas
		};
		this.nextFrameToUpdate = 0;
		this.framesCounter = 0;
		this.calculatedFpsRatio = false;
		this.frames = {};
		this.toDraw = [];
		this.testFrames = {
			frame: 1,
			counter: 0
		};

		this.Sockets = {
			enableAim: false
		};

		this.toLoad = [ "_Image" ];
		
		this.setFrameRate(60);
		this.sockets();
		this.getFrameRate();

		this.events = {
			mousePosition: e => { this.mousePosition = this.calcMousePosition(e); },			
			mouseClick: e => {
				this.getElementsOfConstructor("BadGuy").forEach(x => x.setPurpose("goToPosition", Common.getMousePosition()))
			},
			weapon: {
				click: () => { if(this.current) this.current.fire(); },
				mouseDown: () => { if(this.current) this.current.setFire(true); },
				mouseUp: () => { if(this.current) this.current.setFire(false); },
				mouseMove: () => { if(this.current) this.current.setAim(); }
			}
		};

		let xhr = new XMLHttpRequest();
		xhr.responseType = "json";
		xhr.open("GET", "asset/player.frames.json");
		xhr.onload = () => { Common.frames.player = xhr.response; };
		xhr.send();

		canvas.addEventListener('mousemove', this.events.mousePosition);
		canvas.addEventListener('mousemove', this.events.weapon.mouseMove);
		canvas.addEventListener('click', this.events.mouseClick);
		canvas.addEventListener("click", this.events.weapon.click);
		canvas.addEventListener('mousedown', this.events.weapon.mouseDown);
		canvas.addEventListener('mouseup', this.events.weapon.mouseUp);
	}

	subscribeDraw(fn) {
		this.toDraw.push(fn);
	}

	getPlateforms(cond = null) {
		let plateforms = this.getElementsOfConstructor('Plateform');
		if(typeof cond === "function") return plateforms.filter(cond);
		return plateforms;
	}

	loaded(obj) {
		this.toLoad = this.toLoad.filter(name => name !== obj.constructor.name);
		this.startGame();
	}

	getPlayers() {
		return this.getElementsOfConstructor('Player');
	}
	getPlayer(id) {
		return this.getPlayers().find(x => x.getId() === id);
	}
	getElementById(id) {
		return this.elements.find(x => x.uniqueID === id);
	}
	getElements() {
		return this.elements;
	}
	getElementsOfConstructor(...constructors) {
		return this.elements.filter(element => element.is(...constructors));
	}
	addElement(obj) {
		this.elements.push(obj);
	}
	newElement(...args) {
		let constructor = args.shift();
		let obj = new (eval(constructor))(...args);

		if(constructor === 'Player' && this.socket.id === obj.getId()) this.current = obj;

		if(typeof obj.onLoad === "function") obj.onLoad();

		return obj;
	}
	destroyElement(obj) {
		let id = typeof obj === "string" ? obj : obj.getUniqueID();
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
		var txt = x + ' ; ' + parseInt(obj.getY());
		bg("black");
		font(12, "Sans-Serif");
		text(txt, obj.getX() + obj.getWidth() / 2, obj.getHitBoxY() + 10);
	}
	getMousePosition() {
		return this.mousePosition;
	}
	calcMousePosition(e) {
		let bounds = Common.canvas.node.getBoundingClientRect();
		return {x: e.clientX - bounds.left, y: Common.canvas.height - (e.clientY - bounds.top)};
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
	cloneClass(obj) {
		return Object.assign(Object.create(Object.getPrototypeOf(obj)), obj);
	}

	sockets() {
		// Construction des structures
		this.socket.on("build", data => {
			Common.buildFromSocket = true;
			switch(data.action) {
				case "build": Common.startGame(data.data); break;

				case "weapon-spawn": Common.newElement("Weapon", data.type); break;
			}
			Common.buildFromSocket = false;
		});

		this.socket.on("player-connect", data => {
			Common.newElement('Player', data);
		});

		this.socket.on("show-players", data => {
			for(var i in data) Common.newElement('Player', data[i]);
		});

		this.socket.on("player-disconnect", id => {
			Common.destroyElement(id);
		});

		this.socket.on("player-update", data => {
			Common.buildFromSocket = true;
			let player = Common.getPlayer(data.id);
			switch(data.action) {
				/*
				 * Player
				 */

				case "player-event": 
					player.setScrollX(data.position.x);
					data.position.x -= Common.getScroll();
					console.log("POSITION: " + data.position.x);
					player.setPosition(data.position);
					player._playerEvents({ keyCode: data.keyCode, type: data.type });
					break;

				/*
				 * Weapon
				 */
				case "carry-weapon": 
					let weapon = new Weapon(data.type);
					player.setAiming(data.aim);
					player.carryWeapon(weapon); 
					break;

				case "fire": 
					player.setAiming(data.aim);
					player.weapon.fire(player.weapon.gunType); 
					break;

				case "aim":
					player.setAiming(data.aim);
					break;
			}
			Common.buildFromSocket = false;
		});
	}

	startGame(plateforms) {
		if(this.toLoad.length > 0) {
			if(typeof this.toBuild === "undefined") this.toBuild = plateforms;
			return;
		}

		if(typeof plateforms === "undefined" && this.toBuild !== "undefined") plateforms = this.toBuild;

		plateforms.forEach(plateform => {
			let x = this.calcX(plateform.x);
			let y = this.calcY(plateform.y);
			let width = this.calcX(plateform.width);
			let height = this.calcY(plateform.height);
			this.newElement('Plateform', plateform.shape, x, y, width, height);
		});

		this.animate();
	}

	calcX(value) {
		return this.calc(value, Common.canvas.width);
	}

	calcY(value) {
		return this.calc(value, Common.canvas.height);
	}

	calc(value, prctFrom) {
		if(typeof value === "string") {
			let matches = value.match(/(\d+(.\d+)?)%/g);
			if(matches !== null) {
				matches.forEach(match => {
					value = value.replace(match, prctFrom * parseFloat(value.replace('%', '')) / 100);
				});
				value = eval(value);
			}
		}

		return value;
	}

	frame() {
		clear();

		if(Common.calculatedFpsRatio === false) {
			Common.calculateFrameRate();
		}

		if(Common.calculatedFpsRatio === true || Common.lastFrameRate === true) {
			if(typeof Common.parsedFps === "undefined") {
				let avgMinFps = Common.fps - 5;
				let avgMaxFps = Common.fps + 5;

				let rates = [240,170,144,120,75,60];
				for(var i in rates) {
					if(avgMinFps <= rates[i] && rates[i] <= avgMaxFps) Common.fps = rates[i];
				}

				Common.parsedFps = true;
				Common.fpsRatio = Common.fps / 60;
				Common.calculatedFpsRatio = true;
				Common.lastFrameRate = false;
				Common.addCounter = parseFloat((60/Common.fps).toFixed(4));
			}

			Common.framesCounter += Common.addCounter;

			var plateforms = Common.getElementsOfConstructor('Plateform');
			var badGuys = Common.getElementsOfConstructor('BadGuy');
			var weapons = Common.getElementsOfConstructor('Weapon');
			var bullets = Common.getElementsOfConstructor('Bullet');
			var players = Common.getElementsOfConstructor('Player');

			for(var i in plateforms) plateforms[i].onDraw();
			for(var i in badGuys) badGuys[i].onDraw(); 

			Common.updateFrame = Common.framesCounter >= Common.frameRate;

			if(Common.updateFrame) {
				Common.calculateFrameRate(false);
				Common.framesCounter -= Common.frameRate;

				Common.testFrames.counter++;
				if(Common.testFrames.counter === 10) {
					Common.testFrames.frame++;
					Common.testFrames.counter = 0;
				}
				if(Common.testFrames.frame > 6) Common.testFrames.frame = 1;
			}
			img(Images.player["frame" + Common.testFrames.frame].png, i, 130, 40, 80);
			Common.displayFrameRate();

			for(var i in players) players[i].onDraw();
			for(var i in bullets) bullets[i].onDraw();
			for(var i in weapons) weapons[i].onDraw();
		}

		Common.toDraw.forEach(fn => fn(Common.board));

		Common.animate();
	}

	setFrameRate(frameRate) {
		this.frameRate = 60 / frameRate;
	}

	round(number, nb) {
		return parseFloat(number.toFixed(nb));
	}
	setAngle(angle) {
		return Common.round(angle * Math.PI / 180, 4);
	}
	getAngle(x) {
		return parseInt(180 * x / Math.PI);
	}

	getFrameRate(state = true) {
		this.timeExecution = 0;
		this.lastFrameRate = ! state;
		this.framesRates = [];
	}

	calculateFrameRate(showFrameRate = true) {
		let now = performance.now();
		if( ! this.lastFrameRate) {
			this.lastFrameRate = now;
			this.timeExecution = 0;
			this.framesRates = [];
		}
		else if(this.timeExecution > 500) {
			this.getFrameRate(false);
		}
		else if(this.lastFrameRate !== true) {
			let fps = Math.ceil(1 / ((now - this.lastFrameRate) / 1000));
			
			this.framesRates.push(fps);

			let total = 0;
			this.framesRates.forEach(val => total += val);

			this.fps = parseInt(total / this.framesRates.length);

			this.lastFrameRate = now;
			this.timeExecution++;
		}

		if(showFrameRate) this.displayFrameRate();
	}

	displayFrameRate() {
		font(30, 'Monospace');
		bg('red');
		text(Common.fps, 50, Common.canvas.height - 50);
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

	generateFrames() {
	    let frameStep = /* frameRate */ 60 / /* Nombre de frames */ 12;
	    let newFrames = Array.from(Common.frames.player.running);
	    let originalFramesLength = newFrames.length;
	    
	    for(let i = 0; i < originalFramesLength; i++) {
	        let fromIndex = i * frameStep;
	        let indexComparer = fromIndex;
	        let framesToAdd = [];
	        let frame = newFrames[indexComparer];
	        
	        indexComparer++;
	        
	        // Dernière frame, on compare à la première
	        if(i === originalFramesLength - 1) indexComparer = 0;
	        
	        let nextFrame = newFrames[indexComparer];
	        
	        for(let j = 1; j < frameStep; j++) {
	            framesToAdd.push(
	                Array.from(frame).map((x,k) => {
	                    if(!(x instanceof Array)) return x;
	                    return x.map((y,l) => {
	                        if(Math.abs(y - nextFrame[k][l]) > 180) {
	                            if(y > 180) nextFrame[k][l] += 360;
	                            else y += 360;
	                        }
	                        return y += (Math.abs(y - nextFrame[k][l]) / frameStep) * (y > nextFrame[k][l] ? -1 : 1) * j;
	                    });
	                })
	            );
	        }
	        
	        newFrames.splice(fromIndex + 1, 0, ...framesToAdd);
	    }
	    
	    return newFrames;
	}
}