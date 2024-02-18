
export function toHex(bytes) {
    let hex = "";
    for (let byte of bytes) {
        hex += byte.toString(16).padStart(2, "0");
    }

    return hex;
}

export function toUtf8Bytes(str) {
    let utf8 = [];
    for (let i = 0; i < str.length; i++) {
        let charcode = str.charCodeAt(i);
        if (charcode < 0x80) {
            utf8.push(charcode);
        } else if (charcode < 0x800) {
            utf8.push(
                0xc0 | (charcode >> 6),
                0x80 | (charcode & 0x3f)
            );
        } else if (charcode < 0xd800 || charcode >= 0xe000) {
            utf8.push(
                0xe0 | (charcode >> 12),
                0x80 | ((charcode>>6) & 0x3f),
                0x80 | (charcode & 0x3f)
            );
        } else { // surrogate pair
            i++;
            // UTF-16 encodes 0x10000-0x10FFFF by
            // subtracting 0x10000 and splitting the
            // 20 bits of 0x0-0xFFFFF into two halves
            charcode = 0x10000 + (((charcode & 0x3ff)<<10)
                | (str.charCodeAt(i) & 0x3ff));
            utf8.push(0xf0 | (charcode >>18),
                0x80 | ((charcode>>12) & 0x3f),
                0x80 | ((charcode>>6) & 0x3f),
                0x80 | (charcode & 0x3f)
            );
        }
    }
    return new Uint8Array(utf8);
}

export function fromHex(hex) {
    if (hex.length % 2 !== 0) {
        throw new Error("hex string is not a multiple of 2");
    }
    const numBytes = hex.length / 2;
    const bytes = new Uint8Array(numBytes);
    for (let i = 0; i < numBytes; i++) {
        bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
    }

    return bytes;
}

export function secureRandom(len) {
    const randBytes = new Uint8Array(len);
    globalThis.crypto.getRandomValues(randBytes);
    return randBytes;
}
