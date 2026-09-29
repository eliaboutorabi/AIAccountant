import * as THREE from 'three';
import type { FinanceMLP } from './finance-mlp';

type Trace = ReturnType<FinanceMLP['inspect']>;

/** A view of the real MLP trace. No learning or prediction happens inside the renderer. */
export function createTrainedNetworkScene(canvas: HTMLCanvasElement) {
	const renderer = new THREE.WebGLRenderer({
		canvas,
		antialias: true,
		alpha: true,
		powerPreference: 'low-power'
	});
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	const world = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);
	camera.position.set(0, 0.25, 11);
	camera.lookAt(0, 0, 0);
	world.add(new THREE.HemisphereLight(0xfff8e9, 0x688778, 2.6));
	const key = new THREE.DirectionalLight(0xffffff, 3);
	key.position.set(-3, 5, 5);
	world.add(key);
	const rim = new THREE.DirectionalLight(0xdcd3ff, 2);
	rim.position.set(5, 0, 2);
	world.add(rim);
	const group = new THREE.Group();
	world.add(group);
	const sphere = new THREE.SphereGeometry(0.23, 24, 18);
	const cylinder = new THREE.CylinderGeometry(1, 1, 1, 8);
	const nodes: THREE.Mesh<THREE.SphereGeometry, THREE.MeshPhysicalMaterial>[][] = [];
	const edges: {
		mesh: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshStandardMaterial>;
		layer: number;
		from: number;
		to: number;
		length: number;
	}[] = [];
	const positive = new THREE.Color('#357e67');
	const negative = new THREE.Color('#9273bb');
	let hiddenCount = 0;
	let disposed = false;
	let frame = 0;
	let moving = false;
	let visible = true;
	let angle = 0;
	let phase = 0;
	let lastTime = 0;
	const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

	function rebuild(count: number) {
		for (const layer of nodes) for (const mesh of layer) mesh.material.dispose();
		for (const edge of edges) edge.mesh.material.dispose();
		group.clear();
		nodes.length = 0;
		edges.length = 0;
		hiddenCount = count;
		const sizes = [2, count, 1];
		for (let l = 0; l < sizes.length; l++) {
			nodes[l] = [];
			for (let i = 0; i < sizes[l]; i++) {
				const material = new THREE.MeshPhysicalMaterial({
					color: '#78a992',
					roughness: 0.27,
					metalness: 0.06,
					clearcoat: 0.8,
					emissive: '#274e3e',
					emissiveIntensity: 0.08
				});
				const node = new THREE.Mesh(sphere, material);
				node.position.set(
					(l - 1) * 3.25,
					sizes[l] === 1 ? 0 : (i / (sizes[l] - 1) - 0.5) * (l === 1 ? 4 : 2.1),
					l === 1 ? (i % 2 ? 0.2 : -0.2) : 0
				);
				group.add(node);
				nodes[l].push(node);
			}
		}
		for (let l = 0; l < 2; l++)
			for (let from = 0; from < sizes[l]; from++)
				for (let to = 0; to < sizes[l + 1]; to++) {
					const a = nodes[l][from].position;
					const b = nodes[l + 1][to].position;
					const direction = b.clone().sub(a);
					const length = direction.length();
					const mesh = new THREE.Mesh(
						cylinder,
						new THREE.MeshStandardMaterial({
							color: '#80a18e',
							roughness: 0.55,
							transparent: true,
							opacity: 0.6
						})
					);
					mesh.position.copy(a).add(b).multiplyScalar(0.5);
					mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
					group.add(mesh);
					edges.push({ mesh, layer: l, from, to, length });
				}
	}

	function render() {
		if (disposed) return;
		group.rotation.y =
			angle + (moving && !reducedMotion.matches ? Math.sin(phase * 0.35) * 0.09 : 0);
		renderer.render(world, camera);
	}
	function animate(stamp: number) {
		frame = 0;
		phase += Math.min((stamp - lastTime) / 1000, 0.05);
		lastTime = stamp;
		render();
		schedule();
	}
	function schedule() {
		if (disposed) return;
		if (moving && visible && !document.hidden && !reducedMotion.matches) {
			if (!frame) frame = requestAnimationFrame(animate);
		} else {
			cancelAnimationFrame(frame);
			frame = 0;
			render();
		}
	}
	const resize = new ResizeObserver(() => {
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		if (!width || !height) return;
		renderer.setSize(width, height, false);
		camera.aspect = width / height;
		camera.position.z = Math.max(9, 5.8 / camera.aspect);
		camera.updateProjectionMatrix();
		render();
	});
	resize.observe(canvas);
	const intersection = new IntersectionObserver((entries) => {
		visible = entries[0].isIntersecting;
		schedule();
	});
	intersection.observe(canvas);
	document.addEventListener('visibilitychange', schedule);
	reducedMotion.addEventListener('change', schedule);
	return {
		update(trace: Trace, rotation = 0, motion = false) {
			if (disposed) return;
			if (trace.hidden.length !== hiddenCount) rebuild(trace.hidden.length);
			angle = rotation;
			moving = motion;
			const values = [trace.scaledInput, trace.hidden, [trace.probability]];
			for (let l = 0; l < nodes.length; l++)
				for (let i = 0; i < nodes[l].length; i++) {
					const value = values[l][i];
					nodes[l][i].scale.setScalar(0.7 + Math.abs(value) * 0.6);
					nodes[l][i].material.color.copy(value < 0 ? negative : positive);
					if (l === 2) nodes[l][i].material.color.set('#dc9b69');
					nodes[l][i].material.emissiveIntensity = Math.abs(value) * 0.15;
				}
			for (const edge of edges) {
				const weight =
					edge.layer === 0
						? trace.weights[0].values[edge.from * hiddenCount + edge.to]
						: trace.weights[2].values[edge.from];
				const radius = 0.008 + Math.min(Math.abs(weight), 3) * 0.018;
				edge.mesh.scale.set(radius, edge.length, radius);
				edge.mesh.material.color.copy(weight < 0 ? negative : positive);
				edge.mesh.material.opacity = 0.35 + Math.min(Math.abs(weight), 2) * 0.2;
			}
			render();
			schedule();
		},
		dispose() {
			disposed = true;
			cancelAnimationFrame(frame);
			resize.disconnect();
			intersection.disconnect();
			document.removeEventListener('visibilitychange', schedule);
			reducedMotion.removeEventListener('change', schedule);
			for (const layer of nodes) for (const mesh of layer) mesh.material.dispose();
			for (const edge of edges) edge.mesh.material.dispose();
			sphere.dispose();
			cylinder.dispose();
			renderer.dispose();
		}
	};
}
