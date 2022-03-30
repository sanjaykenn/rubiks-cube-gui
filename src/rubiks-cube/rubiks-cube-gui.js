import * as CONFIG from '/config.json';
import * as UV_TRANSLATION from '/uv.json'
import * as FACE_ROTATIONS from '/face-rotations.json';

import * as RUBIKS_CUBE from './rubiks-cube';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';


export const rubiksCube = RUBIKS_CUBE.createRubiksCube(CONFIG?.rubiksCube);

const COLORS = rubiksCube.colors;
const FOV = CONFIG?.gui.fov ?? 10;
const MIN_DISTANCE = CONFIG?.gui.minDistance ?? 50;
const MAX_DISTANCE = CONFIG?.gui.maxDistance ?? 250;
const DAMPING_FACTOR = CONFIG?.gui.dampingFactor ?? 0.05;
const BACKGROUND = new THREE.Color(parseInt(CONFIG?.gui.background ?? '0xf0f0f0'));
const RESET_CAMERA_SPEED = CONFIG?.gui.resetCameraSpeed ?? 0.05;
const RESET_CAMERA_STOP_SPEED = CONFIG?.gui.resetCameraStopSpeed ?? 1;
export const TURN_SPEED = CONFIG?.gui.turnSpeed ?? 0.025;
export const TURN_SPEED_FAST = CONFIG?.gui.turnSpeed ?? 0.1;
export const TURN_PAUSE = CONFIG?.gui.turnPause ?? 50;

const CAMERA_START = new THREE.Vector3(45, 45, 45);

export const container = document.createElement('div');

const camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, 1, 10000);
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({antialias: true});
const controls = new OrbitControls(camera, renderer.domElement);
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const cubeUV = Array.from('UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB');

const pieces = createRubiksCubeMeshes(rubiksCube);
const piecesUV = Object.fromEntries(pieces.map((piece, i) => [piece.id, UV_TRANSLATION[i]]));
const cornersEdges = pieces.slice(6);
const correctPositions = pieces.map(piece => piece.position.clone());
const correctRotations = pieces.map(piece => piece.rotation.clone());


Object.entries(FACE_ROTATIONS.default).forEach(([, faceRotation]) =>
	faceRotation.axis = new THREE.Vector3(...faceRotation.axis)
);

let pieceTranslation = Object.fromEntries(Array.from({length: 26}).map((_, b) => [b, b]));
let uvTranslation = Object.fromEntries(Array.from({length: 54}).map((_, i) => [i, i]));

let selectedFace;
let resettingCamera = false;

let currentMove = null;
let lastMove = null;


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
						.map((_, i) => new THREE.Color(colors[Math.floor(i / 18)])['rgb'[i % 3]]),
					3
				));

			const piece = new THREE.Mesh(pieceGeometry, pieceMaterial);

			Object.keys(position).forEach(j => piece.position[j] = position[j]);
			Object.keys(rotation).forEach(j => piece.rotation[j] = rotation[j]);

			return piece;
		});
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

	onWindowResize()

	container.appendChild(renderer.domElement);
	window.addEventListener('resize', onWindowResize);
	container.addEventListener('click', colorFace);
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

export function addMove(move, turnSpeed, pause = 0, callback=undefined) {
	const nextMove = {
		move: move[0],
		inverse: move.includes("'"),
		double: move.includes('2'),
		currentFrame: 0,
		pause: pause,
		callback: callback ?? (() => {})
	}
	nextMove.turnSpeed = nextMove.inverse ? -turnSpeed : turnSpeed;
	nextMove.totalFrames = Math.floor(1 / turnSpeed * (nextMove.double ? 1 : 0.5));

	if (lastMove === null || lastMove === undefined) {
		currentMove = nextMove;
		lastMove = nextMove;
	} else {
		lastMove.nextMove = nextMove;
		lastMove = nextMove;
	}
}

function applyMove(move) {
	const face = FACE_ROTATIONS[move.move];
	Object.keys(face.pieces).map(piece => pieceTranslation[piece]).forEach(piece => {
		pieces[piece].rotateOnWorldAxis(face.axis, Math.PI * move.turnSpeed);
		pieces[piece].position.applyMatrix4(
			new THREE.Matrix4().makeRotationAxis(face.axis, Math.PI * move.turnSpeed)
		);
	});
}

function applyNextMove() {
	if (currentMove === null || currentMove === undefined) {
		return;
	}

	if (currentMove.currentFrame++ === currentMove.totalFrames) {
		finishCurrentMove();
	} else {
		applyMove(currentMove);
	}
}

function applyPieceTranslation(move) {
	const translation = {...pieceTranslation};

	if (move.double) {
		const pieces = FACE_ROTATIONS[move.move].pieces;
		Object.entries(pieces).forEach(([k, v]) => pieceTranslation[k] = translation[pieces[v]]);
	} else if (move.inverse) {
		Object.entries(FACE_ROTATIONS[move.move].pieces).forEach(([k, v]) =>
			pieceTranslation[k] = translation[v]
		);
	} else {
		Object.entries(FACE_ROTATIONS[move.move].pieces).forEach(([k, v]) =>
			pieceTranslation[v] = translation[k]
		);
	}
}

function applyUVTranslation(move) {
	const translation = {...uvTranslation};
	const uv = [...cubeUV]

	if (move.double) {
		const pieces = FACE_ROTATIONS[move.move].uv;
		Object.entries(pieces).forEach(([k, v]) => {
			cubeUV[FACE_ROTATIONS[move.move].uv[v]] = uv[k];
			uvTranslation[Object.keys(uvTranslation).find(key => translation[key] == k)] = FACE_ROTATIONS[move.move].uv[v];
		});
	} else if (move.inverse) {
		Object.entries(FACE_ROTATIONS[move.move].uv).forEach(([k, v]) => {
			cubeUV[k] = uv[v];
			uvTranslation[Object.keys(uvTranslation).find(key => translation[key] == v)] = k;
		});
	} else {
		Object.entries(FACE_ROTATIONS[move.move].uv).forEach(([k, v]) => {
			cubeUV[v] = uv[k];
			uvTranslation[Object.keys(uvTranslation).find(key => translation[key] == k)] = v;
		});
	}
}

function finishCurrentMove() {
	applyPieceTranslation(currentMove);
	applyUVTranslation(currentMove);

	let turnedPieces = Object.keys(FACE_ROTATIONS[currentMove.move].pieces).map(piece => pieceTranslation[piece]);

	resetPieces(turnedPieces);
	applyMove({
		move: currentMove.move,
		turnSpeed: currentMove.double ? 1 : (currentMove.inverse ? -0.5 : 0.5)
	});

	turnedPieces.map(i => correctPositions[i].copy(pieces[i].position));
	turnedPieces.map(i => correctRotations[i].copy(pieces[i].rotation));

	const pCurrentMove = currentMove;

	if (currentMove.nextMove !== null && currentMove.nextMove !== undefined) {
		setTimeout(
			() => currentMove = pCurrentMove.nextMove,
			currentMove.pause
		);
	}

	currentMove.callback();

	if (currentMove === lastMove) {
		lastMove = null;
	}

	currentMove = null;
}

function resetPieces(resetPieces) {
	resetPieces.forEach(i => pieces[i].position.copy(correctPositions[i]))
	resetPieces.forEach(i => pieces[i].rotation.copy(correctRotations[i]))
}

function colorFace(event) {
	if (selectedFace === undefined) {
		return;
	}

	let x = event.clientX - container.getBoundingClientRect().left;
	let y = event.clientY - container.getBoundingClientRect().top;
	pointer.x = (x / container.clientWidth) * 2 - 1;
	pointer.y = 1 - (y / container.clientHeight) * 2;

	raycaster.setFromCamera(pointer, camera);

	const intersect = raycaster.intersectObjects(cornersEdges)[0];

	if (intersect === undefined) {
		return;
	}

	const face = Math.floor(intersect.faceIndex / 2);

	if (face % 2 !== 0 || face / 2 >= piecesUV[intersect.object.id].length) {
		return;
	}

	cubeUV[uvTranslation[piecesUV[intersect.object.id][Math.floor(face / 2)]]] = selectedFace;
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
		const currentPosition = camera.position.clone();
		camera.position.lerp(CAMERA_START, RESET_CAMERA_SPEED);

		if (currentPosition.distanceTo(camera.position) <= RESET_CAMERA_STOP_SPEED) {
			resettingCamera = false;
		}
	}

	applyNextMove()

	controls.update();
	render();
}

function render() {
	renderer.render(scene, camera);
}

function onWindowResize() {
	camera.aspect = container.clientWidth / container.clientHeight;
	camera.updateProjectionMatrix();

	renderer.setPixelRatio(container.clientWidth / container.clientHeight);
	renderer.setSize(container.clientWidth, container.clientHeight);
}

init();
animate();
