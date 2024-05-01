import process from "node:process";
import * as esbuild from "esbuild";

async function build() {
    let watchMode = false;
    let minify = false;
    let sourcemap = true;
    for (const arg of process.argv) {
        if (arg == "--watch") {
            watchMode = true;
        } else if (arg == "--prod") {
            minify = true;
            sourcemap = false;
        }
    }

    const buildOptions = {
        entryPoints: [
            { out: "kestrel-crypto.bundle", in: "src/crypto.js" },
        ],
        bundle: true,
        outdir: "dist",
        outbase: "src",
        target: "esnext",
        format: "esm",
        minify: minify,
        sourcemap: sourcemap,
        loader: {
            ".wasm": "base64"
        }
    }

    if (watchMode) {
        let ctx = await esbuild.context(buildOptions);
        await ctx.watch();
    } else {
        const buildLog = await esbuild.build(buildOptions);
        console.log(buildLog);
    }
}

build();
