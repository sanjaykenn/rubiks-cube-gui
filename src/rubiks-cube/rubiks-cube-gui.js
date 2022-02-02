import * as THREE from 'three';


let theta = 0;
const radius = 100;
const FOV = configGUI?.fov ?? 10;
const BACKGROUND = new THREE.Color(parseInt(configGUI?.background ?? '0xf0f0f0'));


export const container = document.createElement('div');

const camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, 1, 10000);
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
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
	camera.position.y = radius * Math.sin(Math.PI / 4);
	scene.background = BACKGROUND

	pieces.forEach(piece => scene.add(piece));

	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);

	container.appendChild(renderer.domElement);
	window.addEventListener('resize', onWindowResize);
}

function animate() {
	requestAnimationFrame(animate);
	render();
}

function render() {
	theta += Math.PI * 0.005;

	camera.position.x = radius * Math.sin(theta);
	camera.position.z = radius * Math.cos(theta);
	camera.lookAt(scene.position);

	camera.updateMatrixWorld();

	renderer.render(scene, camera);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
animate();
