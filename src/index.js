import 'bootstrap'
import '/scss/custom.scss'
import * as RUBIKS_CUBE_GUI from './rubiks-cube/rubiks-cube-gui';
import {resetCamera} from "./rubiks-cube/rubiks-cube-gui";

const rubiksCubeColors = rubiksCube.colors;
const scrambleSolution = document.querySelector('#scramble-solution')
const solveTime = document.querySelector('#solve-time')
const invalidScramble = document.querySelector('#invalid-scramble')


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

document.querySelector('#solve-cube')
	.addEventListener('click', () => {
		fetch(`/solve?scramble=${RUBIKS_CUBE_GUI.getUV()}`)
			.then(response => response.status === 200 ? response.json() : Promise.reject())
			.then(data => {
				resetCamera();
				scrambleSolution.innerText = data.solution;
				solveTime.classList.remove('d-none');
				solveTime.innerText = `${data.time.toFixed(5)}s`;
				invalidScramble.classList.add('d-none');
			})
			.catch(() => {
				scrambleSolution.innerText = 'Enter Scramble!';
				solveTime.classList.add('d-none');
				invalidScramble.classList.remove('d-none')
			})
	})

document.addEventListener("DOMContentLoaded", () => {
	RUBIKS_CUBE_GUI.init();
})
