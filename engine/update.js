class Player {
	transform = { x: 0, y: 0, z: 0 };

	update() {

	}

	render() {

	}
}

const entities = [
	new Player(),
];

function update() {
	entities.forEach((entity) => {
		entity.update();
	});
}

function render() {
	entities.forEach((entity) => {
		entity.render();
	});
}

function run() {
	update();
	render();

	requestAnimationFrame(run);
}

run();
