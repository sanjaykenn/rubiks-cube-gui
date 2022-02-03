import 'bootstrap'
import '/scss/custom.scss'
import * as RUBIKS_CUBE_GUI from './rubiks-cube/rubiks-cube-gui';

const rubiksCubeColors = rubiksCube.colors;

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
	.addEventListener('click', () => console.log(RUBIKS_CUBE_GUI.getUV()))

document.addEventListener("DOMContentLoaded", () => {
	RUBIKS_CUBE_GUI.init();
})
