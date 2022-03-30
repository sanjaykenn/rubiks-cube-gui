import * as RUBIKS_CUBE_GUI from './rubiks-cube/rubiks-cube-gui';
import * as CONFIG from '/config.json';

import 'bootstrap'
import '/scss/custom.scss'

const rubiksCubeColors = RUBIKS_CUBE_GUI.rubiksCube.colors;
const scrambleSolution = document.querySelector('#scramble-solution');
const solveCube = document.querySelector('#solve-cube');
const solveTime = document.querySelector('#solve-time');
const invalidScramble = document.querySelector('#invalid-scramble');

const socket = new WebSocket(`ws://${CONFIG.websocket.host ?? window.location.hostname}:${CONFIG.websocket.port}`)

RUBIKS_CUBE_GUI.container.style.height = '100%';
document.querySelector('#canvas-container').appendChild(RUBIKS_CUBE_GUI.container);


Array.from('RLFBUD').forEach(side => {
	document.querySelector(`.color-option-input.color-side-${side.toLowerCase()}`)
		.addEventListener('change', () => {
			RUBIKS_CUBE_GUI.selectFace(side);
		})

	document.querySelector(`.color-option-label.color-side-${side.toLowerCase()}`)
		.style.background = '#' + rubiksCubeColors[side].toString(16).padStart(6, '0');
})

document.addEventListener('keypress', e => {
	if (!'RLFBUD'.includes(e.key.toUpperCase())) {
		return
	}

	document.querySelector(`#color-side-${e.key.toLowerCase()}`).click()
})

socket.addEventListener('message', e => {
	if (e.data === 'invalid') {
		scrambleSolution.innerText = 'Enter Scramble!';
		solveTime.classList.add('d-none');
		invalidScramble.classList.remove('d-none');
		solveCube.disabled = false;
	} else {
		const data = JSON.parse(e.data);

		RUBIKS_CUBE_GUI.resetCamera();
		scrambleSolution.innerText = data.solution;
		solveTime.classList.remove('d-none');
		solveTime.innerText = `${data.time.toFixed(5)}s`;
		invalidScramble.classList.add('d-none');

		const moves = data.solution.split(' ');
		moves.forEach((move, i) => {
			const callback = (i === moves.length - 1) ? (() => solveCube.disabled = false) : (() => {});
			RUBIKS_CUBE_GUI.addMove(move, RUBIKS_CUBE_GUI.TURN_SPEED, RUBIKS_CUBE_GUI.TURN_PAUSE, callback);
		});
	}
})

solveCube.addEventListener('click', () => {
	socket.send(RUBIKS_CUBE_GUI.getUV());
	solveCube.disabled = true;
});

document.addEventListener("DOMContentLoaded", () => {
	RUBIKS_CUBE_GUI.init();
})
