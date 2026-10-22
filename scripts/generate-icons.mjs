import sharp from 'sharp';

// Bowling ball SVG on dark gold background
function makeSvg(size) {
  const r = size / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="#1a0e02"/>
  <circle cx="${r}" cy="${r}" r="${r * 0.62}" fill="#1c1c1c"/>
  <circle cx="${r}" cy="${r}" r="${r * 0.62}" fill="url(#grad)"/>
  <defs>
    <radialGradient id="grad" cx="38%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#444"/>
      <stop offset="100%" stop-color="#111"/>
    </radialGradient>
  </defs>
  <!-- finger holes -->
  <circle cx="${r * 0.82}" cy="${r * 0.72}" r="${r * 0.07}" fill="#000" opacity="0.8"/>
  <circle cx="${r * 1.02}" cy="${r * 0.62}" r="${r * 0.07}" fill="#000" opacity="0.8"/>
  <circle cx="${r * 1.18}" cy="${r * 0.78}" r="${r * 0.07}" fill="#000" opacity="0.8"/>
  <!-- shine -->
  <circle cx="${r * 0.72}" cy="${r * 0.68}" r="${r * 0.10}" fill="white" opacity="0.12"/>
  <!-- brand text -->
  <text x="${r}" y="${r * 1.72}" text-anchor="middle" font-family="Georgia,serif" font-size="${r * 0.28}" font-weight="bold" fill="#d4a843">LANE</text>
  <text x="${r}" y="${r * 1.98}" text-anchor="middle" font-family="Georgia,serif" font-size="${r * 0.22}" fill="#a07030">MASTER</text>
</svg>`;
}

const sizes = [192, 512];
for (const size of sizes) {
  const svg = Buffer.from(makeSvg(size));
  await sharp(svg).png().toFile(`public/icon-${size}.png`);
  console.log(`✓ icon-${size}.png`);
}

// Apple touch icon (180x180)
const svg180 = Buffer.from(makeSvg(180));
await sharp(svg180).png().toFile('public/apple-touch-icon.png');
console.log('✓ apple-touch-icon.png');
