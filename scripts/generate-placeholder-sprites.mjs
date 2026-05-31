/**
 * Generates placeholder PNG sprite strips for CryptoStrike.
 * Run: npm run sprites:generate
 */
import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SPRITES = path.join(ROOT, 'public', 'sprites');

const manifest = JSON.parse(
  fs.readFileSync(path.join(SPRITES, 'manifest.json'), 'utf8')
);

const POSES = ['idle', 'attack', 'defend', 'hurt', 'victory'];
const FRAME_W = manifest.frameWidth || manifest.frameSize;
const FRAME_H = manifest.frameHeight || manifest.frameSize;
const FRAME_COUNTS = manifest.frameCounts;

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function drawChibiFrame(ctx, frameIndex, totalFrames, color, pose, layerKind = 'body') {
  const w = FRAME_W;
  const h = FRAME_H;
  const cx = w / 2;
  const bounce = Math.sin((frameIndex / totalFrames) * Math.PI * 2) * 3;
  const attackLunge = pose === 'attack' ? (frameIndex / totalFrames) * 18 : 0;
  const hurtShake = pose === 'hurt' ? Math.sin(frameIndex * 2.5) * 6 : 0;

  ctx.clearRect(0, 0, w, h);

  const baseY = h - 24 + bounce;
  const offsetX = attackLunge + hurtShake;

  if (layerKind === 'body') {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(cx + offsetX, h - 10, 22, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.fillStyle = '#1C1A27';
    ctx.fillRect(cx - 14 + offsetX, baseY - 8, 10, 14);
    ctx.fillRect(cx + 4 + offsetX, baseY - 8, 10, 14);

    // Torso
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(cx - 18 + offsetX, baseY - 38, 36, 32);
    ctx.globalAlpha = 1;

    // Head
    ctx.fillStyle = '#FCD8BA';
    ctx.beginPath();
    ctx.arc(cx + offsetX, baseY - 48, 16, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#1C1A27';
    ctx.fillRect(cx - 10 + offsetX, baseY - 52, 5, 7);
    ctx.fillRect(cx + 5 + offsetX, baseY - 52, 5, 7);

    // Outline
    ctx.strokeStyle = '#0A0F1E';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 18 + offsetX, baseY - 38, 36, 32);
  } else if (layerKind === 'outfit') {
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.55;
    ctx.fillRect(cx - 20 + offsetX, baseY - 42, 40, 36);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#909FB0';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 20 + offsetX, baseY - 42, 40, 36);
  } else if (layerKind === 'weapon') {
    if (pose === 'attack' || pose === 'idle') {
      ctx.save();
      ctx.translate(cx + 20 + offsetX, baseY - 30);
      ctx.rotate(-0.6 + frameIndex * 0.08);
      ctx.fillStyle = '#F3C37D';
      ctx.fillRect(0, -4, 28, 8);
      ctx.fillStyle = '#FFECA8';
      ctx.fillRect(0, -8, 32, 4);
      ctx.restore();
    }
  } else if (layerKind === 'accessory') {
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.7;
    ctx.fillRect(cx - 8 + offsetX, baseY - 58, 16, 6);
    ctx.globalAlpha = 1;
  }
}

function writeStrip(filePath, frameCount, color, pose, layerKind) {
  const width = FRAME_W * frameCount;
  const canvas = createCanvas(width, FRAME_H);
  const ctx = canvas.getContext('2d');

  for (let i = 0; i < frameCount; i++) {
    ctx.save();
    ctx.translate(i * FRAME_W, 0);
    drawChibiFrame(ctx, i, frameCount, color, pose, layerKind);
    ctx.restore();
  }

  ensureDir(path.dirname(filePath));
  const buf = canvas.toBuffer('image/png');
  fs.writeFileSync(filePath, buf);
}

function writeItemIcon(filePath, color) {
  const size = 32;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#1A2540';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(16, 16, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#F3C37D';
  ctx.lineWidth = 2;
  ctx.strokeRect(2, 2, 28, 28);
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, canvas.toBuffer('image/png'));
}

function writeVfx(filePath, type) {
  const size = 64;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);
  if (type === 'hit_spark') {
    ctx.fillStyle = 'rgba(243, 195, 125, 0.9)';
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(32 + Math.cos(a) * 20, 32 + Math.sin(a) * 20, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'crit_flash') {
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    g.addColorStop(0, 'rgba(255,255,255,0.95)');
    g.addColorStop(1, 'rgba(243,195,125,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  } else if (type === 'heal_glow') {
    const g = ctx.createRadialGradient(32, 32, 4, 32, 32, 28);
    g.addColorStop(0, 'rgba(147, 229, 177, 0.8)');
    g.addColorStop(1, 'rgba(147, 229, 177, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  } else if (type === 'buff_aura') {
    ctx.strokeStyle = 'rgba(147, 229, 177, 0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(32, 32, 24, 0, Math.PI * 2);
    ctx.stroke();
  }
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, canvas.toBuffer('image/png'));
}

// Characters
for (const key of manifest.characters) {
  const color = manifest.characterColors[key] || '#888';
  const dir = path.join(SPRITES, 'characters', key);
  for (const pose of POSES) {
    const count = FRAME_COUNTS[pose];
    writeStrip(path.join(dir, `body_${pose}.png`), count, color, pose, 'body');
  }
}

// Wearables
const wearableMeta = {
  barmor: { dir: 'outfit/barmor', prefix: 'outfit', color: '#909FB0', layer: 'outfit' },
  sblade: { dir: 'weapon/sblade', prefix: 'weapon', color: '#F3C37D', layer: 'weapon' },
  nboots: { dir: 'accessory/nboots', prefix: 'accessory', color: '#8CE5A2', layer: 'accessory' },
  lshield: { dir: 'accessory/lshield', prefix: 'accessory', color: '#9FBAFF', layer: 'accessory' },
  bflag: { dir: 'accessory/bflag', prefix: 'accessory', color: '#F3C37D', layer: 'accessory' },
};

for (const [id, meta] of Object.entries(wearableMeta)) {
  const dir = path.join(SPRITES, 'wearables', meta.dir);
  for (const pose of POSES) {
    const count = FRAME_COUNTS[pose];
    writeStrip(path.join(dir, `${meta.prefix}_${pose}.png`), count, meta.color, pose, meta.layer);
  }
}

// Item UI icons
const itemColors = {
  sblade: '#F3C37D',
  barmor: '#909FB0',
  wsurge: '#5BC0EB',
  fud: '#FF9B9B',
  hstone: '#93E5B1',
  lshield: '#9FBAFF',
  airdrop: '#F3C37D',
  bflag: '#F3C37D',
  nboots: '#8CE5A2',
};
for (const id of manifest.itemUiIds) {
  writeItemIcon(path.join(SPRITES, 'items', 'ui', `${id}.png`), itemColors[id] || '#888');
}

// VFX
const vfxDir = path.join(SPRITES, 'vfx');
for (const name of ['hit_spark', 'crit_flash', 'heal_glow', 'buff_aura']) {
  writeVfx(path.join(vfxDir, `${name}.png`), name);
}

console.log('Placeholder sprites generated in public/sprites/');
