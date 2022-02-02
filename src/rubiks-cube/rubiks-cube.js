const DEFAULT_SPACE_BETWEEN_PIECES = 0.05;
const DEFAULT_CUBE_COLORS = {
	R: '0xff0000',
	L: '0xff8000',
	U: '0xffffff',
	D: '0xffff00',
	F: '0x00ff00',
	B: '0x0000ff'
};
const DEFAULT_NO_COLOR = 0;

function createRubiksCube(config) {
	const positionMultiplier = 1 + (config?.spaceBetweenPieces ?? DEFAULT_SPACE_BETWEEN_PIECES);

	const cubeColors = Object.fromEntries(Object.entries(DEFAULT_CUBE_COLORS)
		.map(([k, v]) => [
			k,
			parseInt(config?.colors[k] ?? v)
		])
	);
	cubeColors[-1] = parseInt(config?.colors.noColor ?? DEFAULT_NO_COLOR);

	const centers = [{
		colors: [-1, -1, 'U', -1, -1, -1].map(v => cubeColors[v]),
		position: {x: 0, y: positionMultiplier, z: 0},
		rotation: {x: 0, y: 0, z: 0}
	}].concat(Array.from({length: 4}).map((_, i) => {
		return {
			colors: [-1, -1, 'FLBR'[i], -1, -1, -1].map(v => cubeColors[v]),
			position: {
				x: positionMultiplier * Math.cos(Math.PI * (i + 1) / 2),
				y: 0,
				z: positionMultiplier * Math.sin(Math.PI * (i + 1) / 2)
			},
			rotation: {x: Math.PI / 2, y: 0, z: Math.PI * i / 2}
		};
	})).concat([{
		colors: [-1, -1, 'D', -1, -1, -1].map(v => cubeColors[v]),
		position: {x: 0, y: -positionMultiplier, z: 0},
		rotation: {x: Math.PI, y: 0, z: 0}
	}]);

	const corners = Array.from({length: 4}).map((_, i) => {
		return {
			colors: ['RFLB'[i], -1, 'U', -1, 'FLBR'[i], -1].map(v => cubeColors[v]),
			position: {
				x: positionMultiplier * Math.sqrt(2) * Math.cos(Math.PI * (i + 0.5) / 2),
				y: positionMultiplier,
				z: positionMultiplier * Math.sqrt(2) * Math.sin(Math.PI * (i + 0.5) / 2)
			},
			rotation: {x: 0, y: Math.PI * -i / 2, z: 0}
		};
	}).concat(Array.from({length: 4}).map((_, i) => {
		return {
			colors: ['FLBR'[i], -1, 'D', -1, 'RFLB'[i], -1].map(v => cubeColors[v]),
			position: {
				x: positionMultiplier * Math.sqrt(2) * Math.cos(Math.PI * (i + 0.5) / 2),
				y: -positionMultiplier,
				z: positionMultiplier * Math.sqrt(2) * Math.sin(Math.PI * (i + 0.5) / 2)
			},
			rotation: {x: Math.PI, y: Math.PI * (i + 1) / 2, z: 0}
		};
	}));

	const edges = Array.from({length: 4}).map((_, i) => {
		return {
			colors: [-1, -1, 'U', -1, 'FLBR'[i], -1].map(v => cubeColors[v]),
			position: {
				x: positionMultiplier * Math.cos(Math.PI * (i + 1) / 2),
				y: positionMultiplier,
				z: positionMultiplier * Math.sin(Math.PI * (i + 1) / 2)
			},
			rotation: {x: 0, y: Math.PI * -i / 2, z: 0}
		};
	}).concat(Array.from({length: 4}).map((_, i) => {
		return {
			colors: [-1, -1, 'RLLR'[i], -1, 'FFBB'[i], -1].map(v => cubeColors[v]),
			position: {
				x: positionMultiplier * Math.sqrt(2) * Math.cos(Math.PI * (i + 0.5) / 2),
				y: 0,
				z: positionMultiplier * Math.sqrt(2) * Math.sin(Math.PI * (i + 0.5) / 2)
			},
			rotation: {x: Math.PI * (i >> 1), y: 0, z: [-1, 1, 1, -1][i] * Math.PI / 2}
		};
	})).concat(Array.from({length: 4}).map((_, i) => {
		return {
			colors: [-1, -1, 'D', -1, 'FLBR'[i], -1].map(v => cubeColors[v]),
			position: {
				x: positionMultiplier * Math.cos(Math.PI * (i + 1) / 2),
				y: -positionMultiplier,
				z: positionMultiplier * Math.sin(Math.PI * (i + 1) / 2)
			},
			rotation: {x: 0, y: Math.PI * -i / 2, z: Math.PI}
		};
	}));

	return {
		centers: centers,
		corners: corners,
		edges: edges
	};
}

module.exports = {
	createRubiksCube: createRubiksCube
};
