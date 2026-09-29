import * as THREE from 'three';
export function createNetworkScene(canvas: HTMLCanvasElement) {
	const renderer = new THREE.WebGLRenderer({
		canvas,
		antialias: true,
		alpha: true,
		powerPreference: 'low-power'
	});
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
	camera.position.set(0.6, 0.7, 9);
	camera.lookAt(0, 0, 0);
	scene.add(new THREE.AmbientLight(0xffffff, 1.4));
	const key = new THREE.DirectionalLight(0xffefcf, 2.6);
	key.position.set(-4, 6, 8);
	scene.add(key);
	const fill = new THREE.DirectionalLight(0xb6e8df, 1.8);
	fill.position.set(5, -1, 4);
	scene.add(fill);
	const group = new THREE.Group();
	scene.add(group);
	const positions: THREE.Vector3[][] = [];
	const nodes: THREE.Mesh<THREE.SphereGeometry, THREE.MeshPhysicalMaterial>[][] = [];
	const counts = [2, 4, 1];
	const sphere = new THREE.SphereGeometry(0.33, 28, 20);
	counts.forEach((count, layer) => {
		positions[layer] = [];
		nodes[layer] = [];
		for (let i = 0; i < count; i++) {
			const pos = new THREE.Vector3(
				(layer - 1) * 4.5,
				(i - (count - 1) / 2) * 1.32,
				layer === 1 ? (i % 2 ? 0.3 : -0.3) : 0
			);
			positions[layer].push(pos);
			const material = new THREE.MeshPhysicalMaterial({
				color: layer === 0 ? 0xb8d2b7 : layer === 1 ? 0x2f7c6b : 0xf3b67f,
				roughness: 0.24,
				metalness: 0.12,
				clearcoat: 1,
				emissive: 0x163d2f,
				emissiveIntensity: 0.1
			});
			const mesh = new THREE.Mesh(sphere, material);
			mesh.position.copy(pos);
			group.add(mesh);
			nodes[layer].push(mesh);
		}
	});
	const lineMaterials: THREE.MeshStandardMaterial[] = [];
	const pulseData: { mesh: THREE.Mesh; from: THREE.Vector3; to: THREE.Vector3; phase: number }[] =
		[];
	const pulseGeo = new THREE.SphereGeometry(0.065, 10, 8);
	const pulseMat = new THREE.MeshBasicMaterial({ color: 0xf9dfa1 });
	for (let layer = 0; layer < 2; layer++)
		for (let i = 0; i < positions[layer].length; i++)
			for (let j = 0; j < positions[layer + 1].length; j++) {
				const from = positions[layer][i],
					to = positions[layer + 1][j],
					direction = to.clone().sub(from);
				const mat = new THREE.MeshStandardMaterial({
					color: 0xadc7aa,
					roughness: 0.35,
					metalness: 0.4,
					transparent: true,
					opacity: 0.65
				});
				lineMaterials.push(mat);
				const cylinder = new THREE.Mesh(
					new THREE.CylinderGeometry(0.022, 0.022, direction.length(), 8),
					mat
				);
				cylinder.position.copy(from).add(to).multiplyScalar(0.5);
				cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
				group.add(cylinder);
				const pulse = new THREE.Mesh(pulseGeo, pulseMat);
				group.add(pulse);
				pulseData.push({ mesh: pulse, from, to, phase: (i * 3 + j) * 0.11 });
			}
	const haloGeo = new THREE.TorusGeometry(1, 0.012, 8, 90);
	const haloMat = new THREE.MeshBasicMaterial({
		color: 0xc5d7b7,
		transparent: true,
		opacity: 0.45
	});
	const halo = new THREE.Mesh(haloGeo, haloMat);
	halo.position.x = 4.5;
	halo.rotation.y = 0.25;
	group.add(halo);
	let frame = 0;
	let visible = true;
	let playing = true;
	let rotation = 0;
	let disposed = false;
	let previous = 0;
	let time = 0;
	const reduced = matchMedia('(prefers-reduced-motion: reduce)');
	const resize = new ResizeObserver(() => {
		const width = canvas.clientWidth,
			height = canvas.clientHeight;
		if (!width || !height) return;
		renderer.setSize(width, height, false);
		camera.aspect = width / height;
		camera.position.z = width < 420 ? 14 : 9;
		camera.updateProjectionMatrix();
		render();
	});
	resize.observe(canvas);
	const intersection = new IntersectionObserver((entries) => {
		visible = entries[0].isIntersecting;
		schedule();
	});
	intersection.observe(canvas);
	function render() {
		if (disposed) return;
		group.rotation.y = rotation + (playing && !reduced.matches ? Math.sin(time * 0.25) * 0.08 : 0);
		group.position.y = playing && !reduced.matches ? Math.sin(time * 0.6) * 0.07 : 0;
		for (const p of pulseData) {
			p.mesh.visible = playing && !reduced.matches;
			p.mesh.position.lerpVectors(p.from, p.to, (time * 0.35 + p.phase) % 1);
		}
		renderer.render(scene, camera);
	}
	function animate(stamp: number) {
		frame = 0;
		time += Math.min((stamp - previous) / 1000, 0.05);
		previous = stamp;
		render();
		schedule();
	}
	function schedule() {
		if (disposed) return;
		if (visible && playing && !reduced.matches && !document.hidden) {
			if (!frame) frame = requestAnimationFrame(animate);
		} else {
			if (frame) cancelAnimationFrame(frame);
			frame = 0;
			render();
		}
	}
	function visibility() {
		schedule();
	}
	document.addEventListener('visibilitychange', visibility);
	reduced.addEventListener('change', visibility);
	function update(
		input: number[],
		hidden: number[],
		score: number,
		animate: boolean,
		angle: number
	) {
		playing = animate;
		rotation = angle;
		const values = [input, hidden, [score]];
		nodes.forEach((layer, li) =>
			layer.forEach((mesh, i) => {
				const v = values[li][i];
				mesh.scale.setScalar(0.8 + v * 0.6);
				mesh.material.emissiveIntensity = v * 0.5;
				mesh.material.color
					.set(li === 2 ? 0xf3b67f : li === 0 ? 0xb8d2b7 : 0x2f7c6b)
					.lerp(new THREE.Color(0xcfe6a3), v * 0.35);
			})
		);
		render();
		schedule();
	}
	schedule();
	return {
		update,
		dispose() {
			disposed = true;
			cancelAnimationFrame(frame);
			resize.disconnect();
			intersection.disconnect();
			document.removeEventListener('visibilitychange', visibility);
			reduced.removeEventListener('change', visibility);
			const geometries = new Set<THREE.BufferGeometry>();
			const materials = new Set<THREE.Material>();
			scene.traverse((object) => {
				if (object instanceof THREE.Mesh) {
					geometries.add(object.geometry);
					const mats = Array.isArray(object.material) ? object.material : [object.material];
					mats.forEach((mat) => materials.add(mat));
				}
			});
			geometries.forEach((g) => g.dispose());
			materials.forEach((m) => m.dispose());
			renderer.dispose();
		}
	};
}
