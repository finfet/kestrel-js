import { wasm } from '@rollup/plugin-wasm';

export default {
    input: "src/crypto.js",
    output: {
        file: "dist/kestrel-crypto.bundle.js",
        format: "es",
        sourcemap: true
    },
    plugins: [
        wasm({
            maxFileSize: 2097152
        })
    ]
}
