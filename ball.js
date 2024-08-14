const input = {
	pressedKeys: {},
	mouseInput: { x: 0, y: 0 },
};

document.addEventListener('keydown', evt => input[evt.key] = true);
document.addEventListener('keyup', evt => input[evt.key] = false);

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
	deceleration: 1,
};

const object = {
	// static data
	transform: { x: 0, y: 0 },
	direction: null,
	mass: 1,
	dimensions: { w: 32, h: 32 },

	// dynamic data
	force: { x: 0, y: 0 },
	acceleration: { x: 0, y: 0 },
	velocity: { x: 0, y: 0 },

	update(deltaTime) {
		if (input.pressedKeys['ArrowUp']) this.force.y = -1;
		if (input.pressedKeys['ArrowRight']) this.force.x = 1;
		if (input.pressedKeys['ArrowDown']) this.force.y = 1;
		if (input.pressedKeys['ArrowLeft']) this.force.x = -1;

		this.acceleration.x = this.force.x / this.mass;
		this.acceleration.y = this.force.y / this.mass;
		this.velocity.x = this.acceleration.x * deltaTime;
		this.velocity.y = this.acceleration.y * deltaTime;
		this.transform.x += this.velocity.x;
		this.transform.y += this.velocity.y;

		this.velocity.x = (this.velocity.x < 0) ? (0) : (this.velocity.x - physics.deceleration);
		this.velocity.y = (this.velocity.y < 0) ? (0) : (this.velocity.y - physics.deceleration);
		this.force.x = 0;
		this.force.y = 0;
	},

	draw(painter) {
		painter.fillStyle = 'black';
		painter.fillRect(this.transform.x, this.transform.y, this.dimensions.w, this.dimensions.h);
	}
};

const time = {
	previousTime: 0,
	currentTime: 0,

	getDeltaTime() {
		return this.currentTime - this.previousTime;
	}
}

function update(deltaTime) {
	object.update(deltaTime);
}

function draw(painter) {
	painter.clearRect(0, 0, drawer.screen.width, drawer.screen.height);

	object.draw(painter);
}

function setup() {
	drawer.initialize();
}

function run() {
	update(time.getDeltaTime());
	draw(drawer.painter);

	requestAnimationFrame(run);
}

function start() {
	setup();

	run();
}

start();
