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

export function base64Encode(bytes) {
    const binStr = Array.from(bytes, (b) => String.fromCodePoint(b)).join("");
    return btoa(binStr);
}

export function base64Decode(b64String) {
    const binStr = atob(b64String);
    return Uint8Array.from(binStr, (m) => m.codePointAt(0));
}

export function toBeBytes(n) {
    const out = new Uint8Array(4);
    out[0] = (n >>> 24) & 0xff;
    out[1] = (n >>> 16) & 0xff;
    out[2] = (n >>> 8) & 0xff;
    out[3] = (n >>> 0) & 0xff;
    return out;
}

export function fromBeBytes(bytes) {
    const n = (bytes[0] << 24) |
        (bytes[1] << 16) |
        (bytes[2] << 8) |
        (bytes[3] << 0);
    return n;
}

export function toLeBytes(n) {
    const out = new Uint8Array(4);
    out[0] = (n >>> 0) & 0xff;
    out[1] = (n >>> 8) & 0xff;
    out[2] = (n >>> 16) & 0xff;
    out[3] = (n >>> 24) & 0xff;
    return out;
}

export function fromLeBytes(bytes) {
    const n = (bytes[0] << 0) |
        (bytes[1] << 8) |
        (bytes[2] << 16) |
        (bytes[3] << 24);
    return n;
}

export class Vec {
    constructor(capacity = 8192) {
        this.capacity = capacity;
        this.len = 0;
        this.data = new Uint8Array(this.capacity);
    }

    push(element) {
        if (element < 0 || element > 255) {
            throw new Error("8 bit data is required");
        }
        if (this.len == this.capacity) {
            this.capacity *= 2;
            const resizedData = new Uint8Array(this.capacity);
            resizedData.set(this.data);
            this.data = resizedData;
        }
        this.data[this.len] = element;
        this.len += 1;
    }

    extend(elements) {
        for (let i = 0; i < elements.length; i++) {
            this.push(elements[i]);
        }
    }

    get(idx) {
        if (idx < 0 || idx >= this.len) {
            throw new Error("Index out of bounds");
        }
        return this.data[idx];
    }

    set(element, idx) {
        if (idx < 0 || idx >= this.len) {
            throw new Error("Index out of bounds");
        } else if (element < 0 || element > 255) {
            throw new Error("8 bit data is required");
        }
        this.data[idx] = element;
    }

    size() {
        return this.len;
    }

    toBytes() {
        const out = new Uint8Array(this.len);
        for (let i = 0; i < this.len; i++) {
            out[i] = this.data[i];
        }
        return out;
    }
}