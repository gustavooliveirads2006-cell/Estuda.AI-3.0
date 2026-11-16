import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateRawSync } from 'node:zlib';

// Write the deploy archive OUTSIDE public/ and dist/. Never publish source archives.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const release = path.join(root, 'release');
const table = Array.from({ length: 256 }, (_, n) => {
  for (let k = 0; k < 8; k++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = table[(crc ^ byte) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
async function filesAt(dir, prefix = '') {
  const result = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const rel = prefix + entry.name;
    if (entry.isDirectory()) result.push(...await filesAt(path.join(dir, entry.name), rel + '/'));
    else if (entry.isFile()) result.push(rel);
  }
  return result.sort();
}
await fs.access(path.join(dist, 'index.html'));
const files = await filesAt(dist);
if (files.some(f => /(?:^|\/)(?:\.aistudio|node_modules|src)(?:\/|$)|\.(?:zip|tsx?|map|env)$/i.test(f))) {
  throw new Error('Deployment contains development files. Clean dist and rebuild.');
}
const bodies = [], central = [];
let offset = 0;
for (const rel of files) {
  const data = await fs.readFile(path.join(dist, rel));
  const name = Buffer.from(rel, 'utf8');
  const packed = deflateRawSync(data);
  const crc = crc32(data);
  const h = Buffer.alloc(30);
  h.writeUInt32LE(0x04034b50, 0); h.writeUInt16LE(20, 4);
  h.writeUInt16LE(0x800, 6); h.writeUInt16LE(8, 8);
  h.writeUInt16LE(0x21, 12); h.writeUInt32LE(crc, 14);
  h.writeUInt32LE(packed.length, 18); h.writeUInt32LE(data.length, 22);
  h.writeUInt16LE(name.length, 26);
  bodies.push(h, name, packed);
  const c = Buffer.alloc(46);
  c.writeUInt32LE(0x02014b50, 0); c.writeUInt16LE(20, 4); c.writeUInt16LE(20, 6);
  c.writeUInt16LE(0x800, 8); c.writeUInt16LE(8, 10); c.writeUInt16LE(0x21, 14);
  c.writeUInt32LE(crc, 16); c.writeUInt32LE(packed.length, 20); c.writeUInt32LE(data.length, 24);
  c.writeUInt16LE(name.length, 28); c.writeUInt32LE(offset, 42);
  central.push(c, name); offset += h.length + name.length + packed.length;
}
const directory = Buffer.concat(central);
const end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
await fs.mkdir(release, { recursive: true });
const target = path.join(release, 'Site-Estuda-AI-3.1-Hostinger.zip');
await fs.writeFile(target, Buffer.concat([...bodies, directory, end]));
console.log(`Created ${target} (${files.length} deployment files)`);
