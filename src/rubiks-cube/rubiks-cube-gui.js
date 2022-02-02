import * as THREE from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";


const FOV = configGUI?.fov ?? 10;
const MIN_DISTANCE = configGUI?.minDistance ?? 50;
const MAX_DISTANCE = configGUI?.maxDistance ?? 250;
const DAMPING_FACTOR = configGUI.dampingFactor ?? 0.05;
const BACKGROUND = new THREE.Color(parseInt(configGUI?.background ?? '0xf0f0f0'));


export const container = document.createElement('div');

const camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, 1, 10000);
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement);

const pieces = createRubiksCubeMeshes(rubiksCube);


function createRubiksCubeMeshes(rubiksCube) {
	const centers = rubiksCube.centers;
	const corners = rubiksCube.corners;
	const edges = rubiksCube.edges;

	const pieceMaterial = new THREE.MeshBasicMaterial({
		vertexColors: true
	});

	return centers.concat(corners).concat(edges)
		.map(piece => [piece.position, piece.rotation, piece.colors])
		.map(([position, rotation, colors]) => {
			const pieceGeometry = new THREE.BoxGeometry(1, 1, 1).toNonIndexed();
			pieceGeometry.setAttribute(
				'color',
				new THREE.Float32BufferAttribute(
					Array.from({length: pieceGeometry.getAttribute('position').count * 3})
						.map((_, i) => new THREE.Color(colors[Math.floor(i / 18)])['rgb'[i % 3]]
						),
					3
				));

			const piece = new THREE.Mesh(pieceGeometry, pieceMaterial);

			for (let k in position) {
				piece.position[k] = position[k];
			}

			for (let k in rotation) {
				piece.rotation[k] = rotation[k];
			}

			return piece;
		})
}


function init() {
	camera.position.set(45, 45, 45);
	scene.background = BACKGROUND;

	controls.minDistance = MIN_DISTANCE;
	controls.maxDistance = MAX_DISTANCE;
	controls.enableDamping = true;
	controls.dampingFactor = DAMPING_FACTOR;
	controls.enablePan = false;

	pieces.forEach(piece => scene.add(piece));

	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);

	container.appendChild(renderer.domElement);
	window.addEventListener('resize', onWindowResize);
}

function animate() {
	requestAnimationFrame(animate);
	controls.update();
	render();
}

function render() {
	renderer.render(scene, camera);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
animate();
