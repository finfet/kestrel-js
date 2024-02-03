import { deriveKey } from "@stablelib/scrypt";
import { encode } from "@stablelib/hex";

export function scrypt(password) {
    const passBytes = new TextEncoder().encode(password);
    const salt = new TextEncoder().encode("yellowsubmarine.");
    let key = deriveKey(passBytes, salt, 32768, 8, 1, 32);
    return encode(key, true);
}


