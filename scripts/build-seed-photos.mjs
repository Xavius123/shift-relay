// Draws the fictional shift photos used by the seed data and writes them as PNG
// data URIs to src/features/logs/generated/seedWalkPhotos.ts.
//
// Why drawings: the repo is public and must not carry photos of real places (AGENTS.md).
// Why data URIs: they render the same in React Native's Image on iOS and on web, and keep
// the seed plain, serializable data. No dependencies: a tiny rasterizer and Node's zlib.
//
// Run: npm run seed-photos
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { deflateSync } from 'node:zlib';

const W = 320;
const H = 240;

function hex(value) {
  const n = Number.parseInt(value.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function canvas(background) {
  const pixels = new Uint8Array(W * H * 3);
  const set = (x, y, color) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const i = (y * W + x) * 3;
    pixels[i] = color[0];
    pixels[i + 1] = color[1];
    pixels[i + 2] = color[2];
  };
  const rect = (x, y, w, h, value) => {
    const color = hex(value);
    for (let yy = Math.max(0, y); yy < Math.min(H, y + h); yy += 1)
      for (let xx = Math.max(0, x); xx < Math.min(W, x + w); xx += 1) set(xx, yy, color);
  };
  const circle = (cx, cy, r, value) => {
    const color = hex(value);
    for (let yy = cy - r; yy <= cy + r; yy += 1)
      for (let xx = cx - r; xx <= cx + r; xx += 1)
        if ((xx - cx) ** 2 + (yy - cy) ** 2 <= r * r) set(xx, yy, color);
  };
  // Filled triangle by barycentric test over its bounding box.
  const triangle = (points, value) => {
    const color = hex(value);
    const [[x1, y1], [x2, y2], [x3, y3]] = points;
    const area = (x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1);
    for (let yy = Math.min(y1, y2, y3); yy <= Math.max(y1, y2, y3); yy += 1)
      for (let xx = Math.min(x1, x2, x3); xx <= Math.max(x1, x2, x3); xx += 1) {
        const a = ((x2 - xx) * (y3 - yy) - (x3 - xx) * (y2 - yy)) / area;
        const b = ((x3 - xx) * (y1 - yy) - (x1 - xx) * (y3 - yy)) / area;
        if (a >= 0 && b >= 0 && a + b <= 1) set(xx, yy, color);
      }
  };
  rect(0, 0, W, H, background);
  return { pixels, rect, circle, triangle };
}

const scenes = {
  'Loading dock door'(c) {
    c.rect(0, 0, W, 170, '#9aa3ad');
    c.rect(0, 170, W, 70, '#4b5259');
    c.rect(60, 40, 200, 130, '#d7dce1');
    for (let y = 48; y < 170; y += 12) c.rect(60, y, 200, 3, '#b7bec6');
    c.rect(60, 36, 200, 6, '#3a4046');
    for (const x of [30, 280]) {
      c.rect(x, 120, 14, 60, '#f2c230');
      c.rect(x, 135, 14, 8, '#2b2f33');
      c.rect(x, 155, 14, 8, '#2b2f33');
    }
    c.rect(0, 200, W, 6, '#f2c230');
  },
  'Walk-in cooler'(c) {
    c.rect(0, 0, W, H, '#cfd8de');
    c.rect(0, 200, W, 40, '#8d979f');
    c.rect(90, 30, 140, 180, '#e9eef1');
    c.rect(90, 30, 6, 180, '#b9c3ca');
    c.rect(224, 30, 6, 180, '#b9c3ca');
    c.rect(200, 100, 14, 50, '#6c767e');
    c.rect(245, 60, 50, 30, '#1f2a30');
    for (const [x, w] of [
      [252, 8],
      [264, 8],
      [278, 10],
    ])
      c.rect(x, 68, w, 14, '#3ddc84');
    c.rect(110, 50, 60, 20, '#2f7ec7');
  },
  'Storage aisle'(c) {
    c.rect(0, 0, W, H, '#e8e2d6');
    c.rect(0, 210, W, 30, '#a39a8a');
    for (const x of [20, 170]) {
      c.rect(x, 20, 130, 190, '#5b6770');
      for (const y of [60, 110, 160]) c.rect(x, y, 130, 6, '#3d464d');
      const boxes = ['#c98b4b', '#d9a066', '#b5763c', '#e0b27a'];
      for (const [row, y] of [26, 72, 122, 172].entries())
        for (let i = 0; i < 3; i += 1)
          c.rect(x + 8 + i * 40, y, 34, row === 3 ? 34 : 32, boxes[(row + i) % boxes.length]);
    }
  },
  'Fire exit'(c) {
    c.rect(0, 0, W, H, '#dcd6cc');
    c.rect(0, 205, W, 35, '#8f8778');
    c.rect(110, 50, 100, 155, '#7a4a33');
    c.rect(118, 58, 84, 147, '#8d5a40');
    c.rect(185, 125, 14, 6, '#d6c9a8');
    c.rect(115, 18, 90, 26, '#1f9d55');
    c.triangle(
      [
        [175, 22],
        [195, 31],
        [175, 40],
      ],
      '#ffffff',
    );
    c.rect(130, 27, 45, 8, '#ffffff');
    c.rect(240, 130, 22, 55, '#d33a2c');
    c.rect(246, 118, 10, 14, '#2b2b2b');
    c.circle(251, 116, 6, '#2b2b2b');
  },
  'Parking lot'(c) {
    c.rect(0, 0, W, 110, '#a9cbe8');
    c.circle(265, 38, 18, '#f7d774');
    c.rect(0, 110, W, 130, '#50555a');
    for (let x = 10; x < W; x += 60) c.rect(x, 150, 6, 70, '#f4f4f4');
    c.rect(40, 40, 8, 110, '#6f757a');
    c.rect(40, 40, 40, 8, '#6f757a');
    c.rect(72, 48, 16, 6, '#f7d774');
    c.rect(0, 104, W, 8, '#7a8f5a');
  },
  'Wet floor sign'(c) {
    c.rect(0, 0, W, 130, '#e6ebee');
    c.rect(0, 130, W, 110, '#c2cbd1');
    for (let x = 0; x < W; x += 40) c.rect(x, 130, 2, 110, '#aeb8bf');
    c.triangle(
      [
        [160, 60],
        [215, 200],
        [105, 200],
      ],
      '#f2c230',
    );
    c.rect(154, 100, 12, 50, '#2b2f33');
    c.circle(160, 170, 7, '#2b2f33');
    c.circle(70, 210, 16, '#9fc6e0');
    c.circle(245, 205, 11, '#9fc6e0');
  },
  'Mouse on duty'(c) {
    c.rect(0, 0, W, 175, '#dfe8e9');
    c.rect(0, 175, W, 65, '#aeb9b8');
    c.rect(24, 22, 100, 130, '#7b8b89');
    c.rect(34, 34, 80, 16, '#b8c5c0');
    c.rect(34, 65, 80, 16, '#b8c5c0');
    c.rect(34, 96, 80, 16, '#b8c5c0');
    c.circle(214, 158, 55, '#9a9996');
    c.circle(158, 104, 34, '#a9a8a5');
    c.circle(230, 100, 34, '#a9a8a5');
    c.circle(158, 104, 23, '#dcadb4');
    c.circle(230, 100, 23, '#dcadb4');
    c.circle(194, 128, 55, '#b8b6b2');
    c.rect(162, 171, 96, 37, '#f2c230');
    c.rect(195, 171, 8, 37, '#f8f0d2');
    c.rect(163, 79, 67, 10, '#f2c230');
    c.circle(197, 76, 31, '#f2c230');
    c.circle(174, 125, 5, '#2b2f33');
    c.circle(214, 125, 5, '#2b2f33');
    c.circle(194, 151, 8, '#d9808e');
    for (const y of [149, 155]) {
      c.rect(139, y, 45, 2, '#555b5a');
      c.rect(204, y, 45, 2, '#555b5a');
    }
    c.rect(248, 160, 38, 46, '#d6bd8d');
    c.rect(255, 170, 23, 3, '#77756b');
    c.rect(255, 180, 23, 3, '#77756b');
    c.circle(273, 200, 10, '#b8b6b2');
  },
};

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = crcTable[(c ^ byte) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function png(pixels) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(W, 0);
  header.writeUInt32BE(H, 4);
  header[8] = 8; // bit depth
  header[9] = 2; // truecolor RGB
  const raw = Buffer.alloc((W * 3 + 1) * H);
  for (let y = 0; y < H; y += 1) {
    raw[y * (W * 3 + 1)] = 0; // filter: none
    Buffer.from(pixels.buffer, y * W * 3, W * 3).copy(raw, y * (W * 3 + 1) + 1);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const entries = Object.entries(scenes).map(([label, draw]) => {
  const c = canvas('#ffffff');
  draw(c);
  return { label, uri: `data:image/png;base64,${png(c.pixels).toString('base64')}` };
});

const outFile = path.join(
  process.cwd(),
  'src',
  'features',
  'logs',
  'generated',
  'seedWalkPhotos.ts',
);
mkdirSync(path.dirname(outFile), { recursive: true });
writeFileSync(
  outFile,
  `// Generated by scripts/build-seed-photos.mjs. Do not edit by hand: run \`npm run seed-photos\`.
// Fictional shift drawings, used only by the seed data.

export const seedWalkPhotos: readonly { label: string; uri: string }[] = ${JSON.stringify(entries, null, 2)};
`,
);
const bytes = entries.reduce((sum, entry) => sum + entry.uri.length, 0);
console.log(`seed-photos: ${entries.length} images, ${Math.round(bytes / 1024)} KB of data URIs`);
