import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';

const SRC_DIR = 'public/icons';
const BG = { r: 139, g: 92, b: 246, alpha: 1 }; // #8B5CF6 morado

await mkdir(SRC_DIR, { recursive: true });

for (const size of [192, 512]) {
  const src = `${SRC_DIR}/icon-${size}.png`;
  const out = `${SRC_DIR}/icon-${size}-maskable.png`;

  if (!existsSync(src)) {
    console.error(`❌ No existe ${src}. Copia primero los PNG normales.`);
    continue;
  }

  // Maskable: 80% del tamaño como zona segura + 10% de padding en cada lado
  const inner = Math.round(size * 0.8);
  const pad = Math.round((size - inner) / 2);

  const innerBuf = await sharp(src)
    .resize(inner, inner, { fit: 'contain', background: BG })
    .flatten({ background: BG })
    .png()
    .toBuffer();

  await sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([{ input: innerBuf, top: pad, left: pad }])
    .png()
    .toFile(out);

  console.log(`✅ ${out}`);
}

console.log('\n🎉 Maskables generados en public/icons/');