import 'bootstrap'
import '/scss/custom.scss'
import * as RUBIKS_CUBE_GUI from './rubiks-cube/rubiks-cube-gui';

const rubiksCubeColors = rubiksCube.colors;

RUBIKS_CUBE_GUI.container.style.height = '100%';
document.querySelector('#canvas-container').appendChild(RUBIKS_CUBE_GUI.container);

let selectedColor;

Array.from('RLFBUD').forEach(side => {
	document.querySelector(`.color-option-input.color-side-${side.toLowerCase()}`)
		.addEventListener('change', () => {
			selectedColor = side;
		})

	document.querySelector(`.color-option-label.color-side-${side.toLowerCase()}`)
		.style.background = '#' + rubiksCubeColors[side].toString(16).padStart(6, '0');
})

document.addEventListener("DOMContentLoaded", () => {
	RUBIKS_CUBE_GUI.init();
})
