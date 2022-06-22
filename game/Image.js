class _Image {
	
	constructor() {
		this.toLoad = 0;
		this.loaded = 0;

		this.weapons = {};
		this.player = {};
		this.sprites = {};
		this.badguys = {};
		this.platform = {};
		this.extra = {};

		this.loadImages();
	}

	loadImages() {
		this.countLoad = true;
		// Weapons
		this.load("weapons.gun", "gun.png");

		// Sprites
		this.load("sprites.right", "sprites-right.png");
		this.load("sprites.left", "sprites-left.png");

		// Player
		this.load("player.frame1.png", "Frame 1.png");
		this.load("player.frame2.png", "Frame 2.png");
		this.load("player.frame3.png", "Frame 3.png");
		this.load("player.frame4.png", "Frame 4.png");
		this.load("player.frame5.png", "Frame 5.png");
		this.load("player.frame6.png", "Frame 6.png");

		this.load("player.frame1.svg", "Frame 1.svg");
		this.load("player.frame2.svg", "Frame 2.svg");
		this.load("player.frame3.svg", "Frame 3.svg");
		this.load("player.frame4.svg", "Frame 4.svg");
		this.load("player.frame5.svg", "Frame 5.svg");
		this.load("player.frame6.svg", "Frame 6.svg");

		this.countLoad = false;
	}

	load(object, src) {
		this.toLoad++;

		let thos = this;
		let path = this;
		let split = object.split('.');
		let name = split.pop();

		split.forEach((obj, index) => {
			if(typeof path[obj] === "undefined") path[obj] = {};
			path = path[obj];
		});

		let image = new Image();
		if(this.countLoad) {			
			image.onload = function() {
				thos.loaded++;
				if(thos.loaded === thos.toLoad) Common.loaded(thos);
			};
		}
		image.src = "asset/" + src;
		
		path[name] = image;

		return image;
	}

}