import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

// Pass an original PNG and the output name. Originals remain untouched.
const [source, name] = process.argv.slice(2);
if (!source || !name || !/^[a-z-]+$/.test(name))
	throw new Error('Usage: node scripts/optimize-images.mjs input.png asset-name');
await mkdir('static/images', { recursive: true });
await sharp(source)
	.resize({ width: name === 'hero' ? 1600 : 960, withoutEnlargement: true })
	.webp({ quality: 86 })
	.toFile(`static/images/${name}.webp`);
