
function to_hex(bytes) {
    let hex = "";
    for (let byte of bytes) {
        hex += byte.toString(16).padStart(2, "0");
    }

    return hex;
}

export { to_hex };
