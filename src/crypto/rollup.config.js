import inline from "./rollup-plugin-inline.js";

export default {
    input: "src/crypto.js",
    output: {
        file: "dist/kestrel-crypto.bundle.js",
        format: "es",
        sourcemap: true
    },
    plugins: [
        inline({
            extension: [".wasm"]
        })
    ]
}
