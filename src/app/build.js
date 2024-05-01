import process from "node:process";
import * as esbuild from "esbuild";

async function build() {
    let buildType = "development";
    let watchMode = false;
    let minify = false;
    let sourcemap = true;

    for (const arg of process.argv) {
        if (arg == "--prod") {
            buildType = "production";
            minify = true;
            sourcemap = false;
        } else if (arg == "--watch") {
            watchMode = true;
        }
    }

    const buildOptions = {
        entryPoints: [
            { out: "app.bundle", in: "src/js/index.js" },
            { out: "worker.bundle", in: "src/js/worker.js" }
        ],
        format: "iife",
        bundle: true,
        outdir: "dist",
        outbase: "src/js",
        target: "esnext",
        minify: minify,
        sourcemap: sourcemap,
        loader: {
            ".js": "jsx"
        },
        jsx: "automatic",
        define: {
            "process.env.NODE_ENV": `"${buildType}"`
        },
        logOverride: {
            "empty-import-meta": "silent"
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
