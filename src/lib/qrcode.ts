// QR Code generator using GF(256) Reed-Solomon error correction
// Supports Version 2 (25x25), Byte mode, Medium EC level

const GF256_EXP = new Uint8Array(512);
const GF256_LOG = new Uint8Array(256);

// Initialize GF(256) tables
(function initGF() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF256_EXP[i] = x;
    GF256_LOG[x] = i;
    x = (x << 1) ^ (x & 128 ? 0x11d : 0);
  }
  for (let i = 255; i < 512; i++) GF256_EXP[i] = GF256_EXP[i - 255];
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF256_EXP[GF256_LOG[a] + GF256_LOG[b]];
}

function rsEncode(data: number[], ecLen: number): number[] {
  const gen = [1];
  for (let i = 0; i < ecLen; i++) {
    const next = new Array(gen.length + 1).fill(0);
    for (let j = 0; j < gen.length; j++) {
      next[j] ^= gen[j];
      next[j + 1] ^= gfMul(gen[j], GF256_EXP[i]);
    }
    gen.length = next.length;
    for (let j = 0; j < next.length; j++) gen[j] = next[j];
  }
  const res = new Array(ecLen).fill(0);
  for (let i = 0; i < data.length; i++) {
    const coef = data[i] ^ res[0];
    res.shift();
    res.push(0);
    for (let j = 0; j < ecLen; j++) res[j] ^= gfMul(gen[j + 1], coef);
  }
  return res;
}

function placeFinder(m: number[][], r: number, c: number) {
  for (let i = -1; i <= 7; i++) {
    for (let j = -1; j <= 7; j++) {
      const rr = r + i, cc = c + j;
      if (rr < 0 || rr >= 25 || cc < 0 || cc >= 25) continue;
      const inOuter = i === 0 || i === 6 || j === 0 || j === 6;
      const inInner = i >= 2 && i <= 4 && j >= 2 && j <= 4;
      m[rr][cc] = (inOuter || inInner) ? 1 : 0;
    }
  }
}

export function generateQRCodeSVG(data: string): string {
  const SIZE = 25;
  const mat: number[][] = Array.from({ length: SIZE }, () => new Array(SIZE).fill(0));
  const reserved: boolean[][] = Array.from({ length: SIZE }, () => new Array(SIZE).fill(false));

  // 1. Place finder patterns
  placeFinder(mat, 0, 0);
  placeFinder(mat, 0, SIZE - 7);
  placeFinder(mat, SIZE - 7, 0);
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
    if (i < 8 && j < 8) reserved[i][j] = true;
    if (i < 8 && SIZE - 8 + j < SIZE) reserved[i][SIZE - 8 + j] = true;
    if (SIZE - 8 + i < SIZE && j < 8) reserved[SIZE - 8 + i][j] = true;
  }

  // 2. Timing patterns
  for (let i = 8; i < SIZE - 8; i++) { mat[6][i] = i % 2 === 0 ? 1 : 0; reserved[6][i] = true; }
  for (let i = 8; i < SIZE - 8; i++) { mat[i][6] = i % 2 === 0 ? 1 : 0; reserved[i][6] = true; }

  // 3. Dark module
  mat[SIZE - 8][8] = 1; reserved[SIZE - 8][8] = true;

  // 4. Reserve format areas
  for (let i = 0; i < 15; i++) {
    if (i < 6) reserved[8][i] = true;
    else if (i < 8) reserved[8][i + 1] = true;
    else reserved[8][SIZE - 15 + i] = true;
    reserved[i < 8 ? SIZE - 1 - i : 14 - i][8] = true;
  }

  // 5. Encode data in byte mode
  const bytes: number[] = [];
  bytes.push(0b0100); // Byte mode
  bytes.push(data.length); // Character count (8 bits for Version 1-9)
  for (let i = 0; i < data.length; i++) bytes.push(data.charCodeAt(i) & 0xFF);
  // Terminator
  bytes.push(0);
  bytes.push(0);
  // Convert to bits
  const bits: number[] = [];
  for (const b of bytes) for (let i = 7; i >= 0; i--) bits.push((b >> i) & 1);
  // Pad to 184 bits (28 codewords * 8)
  while (bits.length < 184) {
    const pad = bits.length + 8 <= 184 ? 0xEC : 0x11;
    for (let i = 7; i >= 0; i--) bits.push((pad >> i) & 1);
  }
  // Convert to codewords
  const codewords: number[] = [];
  for (let i = 0; i < 184; i += 8) {
    let val = 0;
    for (let j = 0; j < 8; j++) val = (val << 1) | (bits[i + j] || 0);
    codewords.push(val);
  }

  // 6. Reed-Solomon EC
  const EC_PER_BLOCK = 10;
  const block1 = codewords.slice(0, 14);
  const block2 = codewords.slice(14, 28);
  const ec1 = rsEncode(block1, EC_PER_BLOCK);
  const ec2 = rsEncode(block2, EC_PER_BLOCK);

  // 7. Interleave: D1 D15, D2 D16, ..., D14 D28, E1 E11, E2 E12, ..., E10 E20
  const finalBits: number[] = [];
  for (let i = 0; i < 14; i++) {
    for (let b = 0; b < 8; b++) finalBits.push((block1[i] >> (7 - b)) & 1);
    for (let b = 0; b < 8; b++) finalBits.push((block2[i] >> (7 - b)) & 1);
  }
  for (let i = 0; i < EC_PER_BLOCK; i++) {
    for (let b = 0; b < 8; b++) finalBits.push((ec1[i] >> (7 - b)) & 1);
    for (let b = 0; b < 8; b++) finalBits.push((ec2[i] >> (7 - b)) & 1);
  }

  // 8. Place data in zigzag pattern
  let bitIdx = 0;
  for (let right = SIZE - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5; // Skip column 6
    for (let vert = 0; vert < SIZE; vert++) {
      for (let j = 0; j < 2; j++) {
        const col = right - j;
        const upward = ((SIZE - 1 - right) / 2) % 2 === 0;
        const row = upward ? SIZE - 1 - vert : vert;
        if (col >= 0 && col < SIZE && row >= 0 && row < SIZE && !reserved[row][col]) {
          mat[row][col] = bitIdx < finalBits.length ? finalBits[bitIdx] : 0;
          bitIdx++;
        }
      }
    }
  }

  // 9. Apply mask 0 (checkerboard)
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    if (!reserved[r][c] && (r + c) % 2 === 0) mat[r][c] ^= 1;
  }

  // 10. Place format info (EC Level M, Mask 0 = 010, format bits = 101010000010010)
  const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
  for (let i = 0; i < 15; i++) {
    // Around top-left
    if (i < 6) mat[8][i] = formatBits[i];
    else if (i < 8) mat[8][i + 1] = formatBits[i];
    else mat[8][SIZE - 15 + i] = formatBits[i];
    // Around finder patterns
    if (i < 8) mat[SIZE - 1 - i][8] = formatBits[i];
    else mat[14 - i][8] = formatBits[i];
  }

  // 11. Generate SVG
  const cellSize = 6;
  const quiet = 4 * cellSize;
  const total = SIZE * cellSize + quiet * 2;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="${total}" height="${total}"><rect width="${total}" height="${total}" fill="white"/>`;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (mat[r][c]) {
        svg += `<rect x="${quiet + c * cellSize}" y="${quiet + r * cellSize}" width="${cellSize}" height="${cellSize}" fill="black"/>`;
      }
    }
  }
  svg += '</svg>';
  return svg;
}

export function generateQRDataUrl(data: string): string {
  const svg = generateQRCodeSVG(data);
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
