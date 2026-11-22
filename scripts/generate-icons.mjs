import fs from 'node:fs';
import path from 'node:path';
import { deflateSync } from 'node:zlib';

const dir = path.join('static', 'icons');
fs.mkdirSync(dir, { recursive: true });

function writePng(size, fileName) {
	const header = Buffer.from([
		0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52
	]);
	const ihdr = Buffer.alloc(13);
	ihdr.writeUInt32BE(size, 0);
	ihdr.writeUInt32BE(size, 4);
	ihdr[8] = 8;
	ihdr[9] = 2;
	ihdr[10] = 0;
	ihdr[11] = 0;
	ihdr[12] = 0;

	const row = Buffer.alloc(1 + size * 3);
	row[0] = 0;
	for (let i = 1; i < row.length; i += 3) {
		row[i] = 0x3b;
		row[i + 1] = 0x82;
		row[i + 2] = 0xf6;
	}
	const raw = Buffer.concat(Array.from({ length: size }, () => row));
	const crc32 = (data) => {
		let c = ~0;
		for (const byte of data) {
			c ^= byte;
			for (let k = 0; k < 8; k += 1) {
				c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
			}
		}
		return ~c >>> 0;
	};
	const chunk = (type, data) => {
		const len = Buffer.alloc(4);
		len.writeUInt32BE(data.length);
		const t = Buffer.from(type);
		const body = Buffer.concat([t, data]);
		const crc = Buffer.alloc(4);
		crc.writeUInt32BE(crc32(body));
		return Buffer.concat([len, body, crc]);
	};

	const png = Buffer.concat([
		header,
		chunk('IHDR', ihdr),
		chunk('IDAT', deflateSync(raw)),
		chunk('IEND', Buffer.alloc(0))
	]);
	fs.writeFileSync(path.join(dir, fileName), png);
}

writePng(192, 'icon-192.png');
writePng(512, 'icon-512.png');
console.log('Wrote PWA icons');