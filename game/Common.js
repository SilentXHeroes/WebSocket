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
		this.fps = 0;
		this.scale = 1;
		this.origin = { X: 0, Y: 0, tmp: { X: 0, Y: 0 } };

		this.mouse = {
			x: 0,
			y: 0,
			clientX: 0,
			clientY: 0,
			down: false,
			up: true,
			move: false,
			deltaX: null,
			deltaY: null,
			originX: null,
			originY: null,
			isGrabbing: function() {
				return Common.mouse.down && Common.mouse.move;
			},
			cursor: {
				grab: function() {
					if(Common.mouse.cursor.hasGrab() === false) {
						Common.canvas.node.classList.add("grab");
					}
				},
				ungrab: function() {
					if(Common.mouse.cursor.hasGrab()) {
						Common.canvas.node.classList.remove("grab");
					}
				},
				grabbing: function() {
					if(Common.mouse.cursor.hasGrabbing() === false) {
						Common.canvas.node.classList.add("grabbing");
					}
				},
				ungrabbing: function() {
					if(Common.mouse.cursor.hasGrabbing()) {
						Common.canvas.node.classList.remove("grabbing");
					}
				},
				default: function() {
					Common.mouse.cursor.ungrab();
					Common.mouse.cursor.ungrabbing();
				},
				hasGrab: function() {
					return Common.canvas.node.classList.contains("grab");
				},
				hasGrabbing: function() {
					return Common.canvas.node.classList.contains("grabbing");
				},
			},
			e: {
				mousemove: null,
				mousedown: null,
				mouseup: null,
				click: null,
				deltaTime: {
					mousemove: 0,
					mousedown: 0,
					mouseup: 0,
					click: 0,
				}
			}
		};

		this.Sockets = {
			enableAim: false
		};

		this.toLoad = [ "_Image" ];

		this.MouseDown = this.subscriber();
		this.MouseMove = this.subscriber();
		this.MouseUp = this.subscriber();
		this.MouseClick = this.subscriber();
		this.MouseWheel = this.subscriber();
		this.Draw = this.subscriber();
		
		this.setFrameRate(60);
		this.sockets();
		this.getFrameRate();

		this.events = {
			mouseClick: e => {
				// this.getElementsOfConstructor("BadGuy").forEach(x => x.setPurpose("goToPosition", Common.getMousePosition()));
				this.updateMouseEvent(e);
				this.MouseClick.execute();
			},
			mouseDown: e => {
				this.mouse.down = true;
				this.mouse.up = false;

				if(this.mouse.originX === null) {
					this.mouse.originX = e.clientX;
					this.mouse.originY = e.clientY;
					this.origin.tmp.X = this.origin.X;
					this.origin.tmp.Y = this.origin.Y;
				}

				if(Common.mouse.cursor.hasGrab()) Common.mouse.cursor.grabbing();

				this.updateMouseEvent(e);
				this.MouseDown.execute();
			},
			mouseMove: e => {
				this.updateMouseCoordinates(e);

				clearTimeout(this.mouse.timeoutMoving);
				this.mouse.move = true;

				if(Common.canvas.node.classList.contains("grabbing")) {
					this.mouse.deltaX = this.mouse.originX - e.clientX;
					this.mouse.deltaY = this.mouse.originY - e.clientY;
					this.origin.X = this.origin.tmp.X - this.mouse.deltaX;
					this.origin.Y = this.origin.tmp.Y - this.mouse.deltaY;
				}

				this.updateMouseEvent(e);
				this.MouseMove.execute();

				let thos = this;
				this.mouse.timeoutMoving = setTimeout(function() {
					thos.mouse.move = false;
				});
			},
			mouseUp: e => {
				this.mouse.up = true;
				this.mouse.down = false;

				this.mouse.originX = null;
				this.mouse.originY = null;
				this.mouse.deltaX = null;
				this.mouse.deltaY = null;

				if(Common.mouse.cursor.hasGrab()) {
					Common.mouse.cursor.ungrabbing();
				}

				this.updateMouseEvent(e);
				this.MouseUp.execute();
			},
			mousewheel: e => {
				e.preventDefault();

				let delta = e.wheelDelta < 0 ? - 1 : 1;
				// let diffY = (this.mouse.y > Common.canvas.height / 2 ? this.mouse.y - Common.canvas.height / 2 : this.mouse.y - Common.canvas.height / 2);
				let diffY = (this.mouse.y - Common.canvas.height / 4) - Common.canvas.height / 4;
				let toTop = diffY >= 0;
				let toBottom = diffY < 0;
				// diffY = diffY / 2 + Common.canvas.height / 2;
				console.log(this.mouse.y, Common.canvas.height / 4, diffY);
				this.scale += 0.05 * delta;
				this.origin.X -= this.mouse.x * 0.05 * delta;
				console.log("BEFORE:", this.origin.Y);
				if(toTop) {
					this.origin.Y -= diffY * 0.05 * delta;
				}
				else {
					this.origin.Y += diffY * 0.05 * delta;
				}
				console.log("AFTER:", this.origin.Y);

				this.MouseWheel.execute();
			},
			keydown: e => {
				if(e.code === "Space") {
					Common.mouse.cursor.grab();
				}
			},
			keyup: e => {
				if(e.code === "Space") {
					Common.mouse.cursor.default();
				}
			}
		};

		// let xhr = new XMLHttpRequest();
		// xhr.responseType = "json";
		// xhr.open("GET", "asset/player.frames.json");
		// xhr.onload = () => { Common.frames.player = xhr.response; };
		// xhr.send();

		canvas.addEventListener('mousedown', this.events.mouseDown);
		canvas.addEventListener('mousemove', this.events.mouseMove);
		canvas.addEventListener('mouseup', this.events.mouseUp);
		canvas.addEventListener('click', this.events.mouseClick);
		canvas.addEventListener("mousewheel", this.events.mousewheel)
		document.addEventListener("keydown", this.events.keydown)
		document.addEventListener("keyup", this.events.keyup)
	}

	subscriber(event, fn) {
		return new class {
			constructor() { this.subs = []; }
			subscribe(fn) { this.subs.push(fn); }
			execute() { this.subs.forEach(sub => sub()) }
		};
	}

	updateMouseEvent(e) {
		if(this.mouse.e[e.type] !== null) {
			this.mouse.e.deltaTime[e.type] = e.timeStamp - this.mouse.e[e.type].timeStamp;
		}
		this.mouse.e[e.type] = e;
	}

	isUniqueID(str) {
		return /^[a-zA-Z0-9]{8}-([a-zA-Z0-9]{4}-){3}[a-zA-Z0-9]{12}$/.test(str);
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
		let matches = this.elements.filter(element => element.is(...constructors))
		// Joueur local
		if(constructors.includes("CurrentPlayer")) {
			matches.push(Common.current);
		}
		return matches;
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

	/*
	 * SCROLLING
	 */
	isScrolling(state = null) {
		if(state !== null) {
			this.scrollOnX = state;
		}
		return this.scrollOnX;
	}
	updateScroll() {
		if(this.current && this.current.velocity.ignored === false) {
			let diff = (this.current.getX() + this.current.getHalfWidth()) - (this.canvas.width / 2);
			this.isScrolling(diff > 0);
			if(this.isScrolling()) {
				this.scrollX = diff;
			}
			else {
				this.clearScroll();
			}
			this.updateMouseCoordinates();
		}
	}
	clearScroll() {
		this.scrollX = 0;
	}
	getScroll() {
		return this.scrollX;
	}

	/**************/

	getMousePosition() {
		return { x: this.mouse.x, y: this.mouse.y };
	}
	updateMouseCoordinates(e = null) {
		let bounds = Common.canvas.node.getBoundingClientRect();
		let mouseClientX = e ? e.clientX : this.mouse.clientX;
		let mouseClientY = e ? e.clientY : this.mouse.clientY;

		this.mouse.x = mouseClientX - bounds.left + Common.getScroll();
		this.mouse.y = Common.canvas.height - (mouseClientY - bounds.top);

		if(e !== null) {
			this.mouse.clientX = e.clientX;
			this.mouse.clientY = e.clientY;
		}
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
				case "build": 
					console.log(data);
					Common.startGame(data.plateforms);
					for(var i in data.players) {
						Common.newElement('Player', data.players[i]);
					}
					break;
				case "weapon-spawn": Common.newElement("Weapon", data); break;
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
			let player = Common.getPlayer(id);
			if(typeof player !== "undefined") {
				Common.destroyElement(player.getUniqueID());
			}
		});

		this.socket.on("player-update", data => {
			Common.buildFromSocket = true;
			let player = Common.getPlayer(data.id);
			if(typeof player === "undefined") return;
			switch(data.action) {
				/*
				 * Player
				 */

				case "player-event": 
					if(data.position) player.setPosition(data.position);
					player._playerEvents({ keyCode: data.keyCode, type: data.type });
					break;

				case "injured":
					let playerInjured = Common.getPlayer(data.playerInjuredID);
					// player.ignoreNextSocket();
					if(typeof playerInjured !== "undefined") {
						playerInjured.injured(data.amount, data.fromSide, false);
					}
					break;

				/*
				 * Weapon
				 */
				case "carry-weapon":
					let weapon = new Weapon(data);
					// player.setAiming(data.aim);
					player.carryWeapon(weapon); 
					break;

				case "fire": 
					player.setAimingFromEvent(data.aim);
					player.weapon.fire(player.weapon.gunType); 
					break;

				case "aim":
					player.setAimingFromEvent(data.aim);
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

		if(typeof plateforms === "undefined") return;

		this.elements = [];
		this.calculatedFpsRatio = false;
		delete this.current;

		plateforms.forEach(plateform => {
			let args = [ "Plateform", plateform.shape ];
			if(plateform.shape === "dots") {
				args.push(plateform.dots);
			}
			else {
				// Coordonnée X
				args.push(this.prctX(plateform.x));
				// Coordonnée Y
				args.push(this.prctY(plateform.y));
				// Largeur
				args.push(this.prctX(plateform.width));
				// Hauteur
				args.push(this.prctY(plateform.height));
			}
			this.newElement(...args);
		});

		this.animate();
	}

	calcX(value) {
		return Common.origin.X + (value - Common.getScroll()) * Common.scale;
	}

	calcY(value) {
		return Common.origin.Y + value * Common.scale;
	}

	prctX(value) {
		return this.calc(value, Common.canvas.width);
	}

	prctY(value) {
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
		Common.mouse.cursor.default();

		if(Common.mouse.down) {
			Common.mouse.cursor.grabbing();
		}

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
			}

			Common.displayFrameRate();

			for(var i in players) players[i].onDraw();
			for(var i in bullets) bullets[i].onDraw();
			for(var i in weapons) weapons[i].onDraw();
		}

		Common.Draw.execute(Common.board);

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
		// this.framesRates = [];
		this.totalFramesRate = 0;
		this.lengthFramesRate = 0;
	}

	calculateFrameRate(showFrameRate = true) {
		let now = performance.now();
		if( ! this.lastFrameRate) {
			this.lastFrameRate = now;
			this.timeExecution = 0;
			// this.framesRates = [];
			this.totalFramesRate = 0;
			this.lengthFramesRate = 0;
		}
		else if(this.timeExecution > 500) {
			this.getFrameRate(false);
		}
		else if(this.lastFrameRate !== true) {
			let fps = Math.ceil(1 / ((now - this.lastFrameRate) / 1000));

			this.totalFramesRate += fps;
			this.lengthFramesRate++;

			this.fps = Math.floor(this.totalFramesRate / this.lengthFramesRate);

			// this.framesRates.push(fps);

			// let total = 0;
			// this.framesRates.forEach(val => total += val);

			// this.fps = Math.floor(total / this.framesRates.length);

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