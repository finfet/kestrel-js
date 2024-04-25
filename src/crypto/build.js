import process from "node:process";
import * as esbuild from "esbuild";

async function build() {
    let watchMode = false;
    for (const arg of process.argv) {
        if (arg == "--watch") {
            watchMode = true;
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
        minify: true,
        sourcemap: true,
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