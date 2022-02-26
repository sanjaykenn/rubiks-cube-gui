import 'bootstrap'
import '/scss/custom.scss'
import * as RUBIKS_CUBE_GUI from './rubiks-cube/rubiks-cube-gui';
import {resetCamera} from "./rubiks-cube/rubiks-cube-gui";

const rubiksCubeColors = rubiksCube.colors;
const scrambleSolution = document.querySelector('#scramble-solution');
const solveCube = document.querySelector('#solve-cube');
const solveTime = document.querySelector('#solve-time');
const invalidScramble = document.querySelector('#invalid-scramble');

const socket = new WebSocket(`ws://${configWebsocket.host ?? window.location.hostname}:${configWebsocket.port}`)

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
	} else {
		const data = JSON.parse(e.data);

		resetCamera();
		scrambleSolution.innerText = data.solution;
		solveTime.classList.remove('d-none');
		solveTime.innerText = `${data.time.toFixed(5)}s`;
		invalidScramble.classList.add('d-none');
	}

	solveCube.disabled = false;
})

solveCube.addEventListener('click', () => {
	socket.send(RUBIKS_CUBE_GUI.getUV());
	solveCube.disabled = true;
});

document.addEventListener("DOMContentLoaded", () => {
	RUBIKS_CUBE_GUI.init();
})
