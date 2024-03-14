
export function toHex(bytes) {
    let hex = "";
    for (let byte of bytes) {
        hex += byte.toString(16).padStart(2, "0");
    }

    return hex;
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

export function toUtf8Bytes(str) {
    const encoder = new TextEncoder();
    return encoder.encode(str);
}

export function fromUtf8Bytes(bytes) {
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
}

export function secureRandom(len) {
    const randBytes = new Uint8Array(len);
    globalThis.crypto.getRandomValues(randBytes);
    return randBytes;
}
