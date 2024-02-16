import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import babel from "@rollup/plugin-babel";

export default [
    {
        input: "src/js/index.js",
        output: {
            file: "dist/app.bundle.js",
            format: "es",
            sourcemap: true
        },
        plugins: [
            replace({
                "process.env.NODE_ENV": JSON.stringify("development"),
                preventAssignment: true
            }),
            commonjs({
                include: ["**/node_modules/**"],
            }),
            babel({
                exclude: "**/node_modules/**",
                babelHelpers: "bundled",
                presets: [ ["@babel/preset-react", { runtime: "automatic" }]]
            }),
            resolve()
        ]
    },
    {
        input: "src/js/worker.js",
        output: {
            file: "dist/worker.bundle.js",
            format: "es",
            sourcemap: true
        },
        plugins: [
            resolve()
        ]
    }
]
