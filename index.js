const input = {
	pressedKeys: {},
	mouseInput: { x: 0, y: 0 },
};

document.addEventListener('keydown', evt => input.pressedKeys[evt.key] = true);
document.addEventListener('keyup', evt => input.pressedKeys[evt.key] = false);

const drawer = {
	screen: {},
	painter: {},

	initialize() {
		this.screen = document.createElement('canvas');
		this.screen.width = 800;
		this.screen.height = 800;

		this.painter = this.screen.getContext('2d');

		document.body.append(this.screen);
	}
}

const physics = {
	/** simplification */
	deceleration: 15,
	gravity: 2_000,
};

const object = {
	// static data
	transform: { x: 0, y: 0, z: 0 },
	dimensions: { w: 32, h: 32 },
	mass: 1,
	speed: 3_000,
	runPower: 2_000,
	jumpPower: 40_000,

	// information
	jumpCount: 0,
	jumpTime: 0,
	maxJumpTime: 0.2,
	jumpCooldown: 0,
	maxJumpCooldown: 100,
	hasLiftedSpaceBar: true,

	// dynamic data
	force: { x: 0, y: 0, z: 0 },
	acceleration: { x: 0, y: 0, z: 0 },
	velocity: { x: 0, y: 0, z: 0 },

	update(deltaTime) {
		// run
		const calculatedSpeed = input.pressedKeys['Shift'] ? this.speed + this.runPower : this.speed;

		// move
		if (input.pressedKeys['ArrowUp']) this.force.y = -calculatedSpeed;
		if (input.pressedKeys['ArrowRight']) this.force.x = calculatedSpeed;
		if (input.pressedKeys['ArrowDown']) this.force.y = calculatedSpeed;
		if (input.pressedKeys['ArrowLeft']) this.force.x = -calculatedSpeed;

		// jump
		if (input.pressedKeys[' '] && this.transform.z === 0) {
			this.force.z = this.jumpPower; // Apply initial jump force
		}

		// glide
		if (input.pressedKeys['Shift']) {
			this.velocity.z = 0;
		}

		// calculation
		this.acceleration.x = this.force.x / this.mass;
		this.acceleration.y = this.force.y / this.mass;
		this.acceleration.z = (this.force.z / this.mass) - physics.gravity; // gravity is always sucking Z back down :)

		this.velocity.x += this.acceleration.x * deltaTime;
		this.velocity.y += this.acceleration.y * deltaTime;
		this.velocity.z += this.acceleration.z * deltaTime;

		// application
		this.transform.x += this.velocity.x * deltaTime;
		this.transform.y += this.velocity.y * deltaTime;
		this.transform.z += this.velocity.z * deltaTime;

		// calming down
		this.velocity.x *= 1 - physics.deceleration * deltaTime;
		this.velocity.y *= 1 - physics.deceleration * deltaTime;

		if (this.transform.z < 0) {
			this.transform.z = 0;
			this.velocity.z = 0;
			this.jumpCount = 0;
			this.jumpCooldown = 0;
		}

		this.force.x = 0;
		this.force.y = 0;
		this.force.z = 0;
	},

	draw(painter) {
		// shadow
		painter.globalAlpha = 0.5;
		painter.fillStyle = 'black';
		painter.fillRect(this.transform.x, this.transform.y + this.dimensions.h / 2, this.dimensions.w, this.dimensions.h / 2)
		painter.globalAlpha = 1;

		// illusion to simulate jumping upwards
		const yPlusOffset = this.transform.y - this.transform.z;

		painter.fillStyle = 'black';
		painter.fillRect(this.transform.x, yPlusOffset, this.dimensions.w, this.dimensions.h);
	}
};

const time = {
	previousTime: 0,
	deltaTime: 0,
	accumulatedTime: 0,
	maxDeltaTime: 0.1,
	fixedTimeStep: 1 / 60,

	update() {
		const currentTime = performance.now();

		this.deltaTime = Math.min(((currentTime - this.previousTime) / 1000), this.maxDeltaTime);
		this.previousTime = currentTime;
		this.accumulatedTime += this.deltaTime;

		while (this.accumulatedTime >= this.fixedTimeStep) {
			object.update(this.fixedTimeStep);

			this.accumulatedTime -= this.fixedTimeStep;
		}
	},
};

const eventManager = {
	queue: [],

	update() {
		while (this.queue.length > 0) {
			this.process(this.queue.shift());
		}
	},

	emit(event) {
		this.queue.push(event);
	},

	process(event) {
		switch (event.type) {
			case 'attack':
				executeOnCollision((attacker, victim) => {
					victim.hp -= attacker.stats.attack;
				});

			default: break;
		}
	}
};

function update() {
	time.update();
	eventManager.update();
	// entitiesManager.update();
}

function draw(painter) {
	painter.clearRect(0, 0, drawer.screen.width, drawer.screen.height);

	// debug
	painter.fillStyle = 'red';
	painter.fillRect(0, 0, 32, 32);

	object.draw(painter);
}

function setup() {
	drawer.initialize();
}

function run() {
	update();
	draw(drawer.painter);

	requestAnimationFrame(run);
}

function start() {
	setup();

	run();
}

start();
