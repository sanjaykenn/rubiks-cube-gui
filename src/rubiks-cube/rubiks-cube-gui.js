import * as THREE from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";


const COLORS = rubiksCube.colors;
const FOV = configGUI?.fov ?? 10;
const MIN_DISTANCE = configGUI?.minDistance ?? 50;
const MAX_DISTANCE = configGUI?.maxDistance ?? 250;
const DAMPING_FACTOR = configGUI?.dampingFactor ?? 0.05;
const BACKGROUND = new THREE.Color(parseInt(configGUI?.background ?? '0xf0f0f0'));
const RESET_CAMERA_SPEED = configGUI?.resetCameraSpeed ?? 0.1;

const UV_TRANSLATION = uv;
const PIECES_UV = {};
const CAMERA_START = new THREE.Vector3(45, 45, 45);

export const container = document.createElement('div');

const camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, 1, 10000);
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
const controls = new OrbitControls(camera, renderer.domElement);
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const cubeUV = Array.from('UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB');

const pieces = createRubiksCubeMeshes(rubiksCube);
const cornersEdges = pieces.slice(6);

let selectedFace;
let resettingCamera = false;


function createRubiksCubeMeshes(rubiksCube) {
	const centers = rubiksCube.centers;
	const edges = rubiksCube.edges;
	const corners = rubiksCube.corners;

	const pieceMaterial = new THREE.MeshBasicMaterial({
		vertexColors: true
	});

	return centers.concat(edges).concat(corners)
		.map(piece => [piece.position, piece.rotation, piece.colors])
		.map(([position, rotation, colors], i) => {
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
			PIECES_UV[piece.id] = UV_TRANSLATION[i];

			Object.keys(position).forEach(j => piece.position[j] = position[j]);
			Object.keys(rotation).forEach(j => piece.rotation[j] = rotation[j]);

			return piece;
		})
}

export function init() {
	camera.position.set(CAMERA_START.x, CAMERA_START.y, CAMERA_START.z);
	scene.background = BACKGROUND;

	controls.minDistance = MIN_DISTANCE;
	controls.maxDistance = MAX_DISTANCE;
	controls.enableDamping = true;
	controls.dampingFactor = DAMPING_FACTOR;
	controls.enablePan = false;

	pieces.forEach(piece => scene.add(piece));

	renderer.setPixelRatio(container.clientWidth / container.clientHeight);
	renderer.setSize(container.clientWidth, container.clientHeight);
	onWindowResize()

	container.appendChild(renderer.domElement);
	window.addEventListener('resize', onWindowResize);
	container.addEventListener('click', onClick);
	container.addEventListener('mousedown', () => resettingCamera = false)
}

export function selectFace(face) {
	selectedFace = face;
}

export function getUV() {
	return cubeUV.join('');
}

export function resetCamera() {
	resettingCamera = true;
}

function onClick(event) {
	if (selectedFace === undefined) {
		return;
	}

	let x = event.clientX - container.getBoundingClientRect().left;
	let y = event.clientY - container.getBoundingClientRect().top;
	pointer.x = (x / container.clientWidth) * 2 - 1;
	pointer.y = 1 - (y / container.clientHeight) * 2;

	raycaster.setFromCamera(pointer, camera);

	const intersect = raycaster.intersectObjects(cornersEdges)[0]

	if (intersect === undefined) {
		return;
	}

	const face = Math.floor(intersect.faceIndex / 2);

	if (face % 2 !== 0 || face / 2 >= PIECES_UV[intersect.object.id].length) {
		return;
	}

	cubeUV[PIECES_UV[intersect.object.id][Math.floor(face / 2)]] = selectedFace;
	const colors = intersect.object.geometry.getAttribute('color').array;

	Array.from({length: 18})
		.forEach((_, i) => colors[face * 18 + i] = new THREE.Color(COLORS[selectedFace])['rgb'[i % 3]]);

	intersect.object.geometry.setAttribute(
		'color',
		new THREE.Float32BufferAttribute(colors, 3)
	);
}

function animate() {
	requestAnimationFrame(animate);

	if (resettingCamera) {
		camera.position.lerp(CAMERA_START, RESET_CAMERA_SPEED);
	}

	controls.update();
	render();
}

function render() {
	renderer.render(scene, camera);
}

function onWindowResize() {
	camera.aspect = container.clientWidth / container.clientHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(container.clientWidth, container.clientHeight);
}

init();
animate();
