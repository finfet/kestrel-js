import { createFilter } from "@rollup/pluginutils";
import { readFile } from "node:fs/promises";

// Will make any included data available as a base64 string
// Example:
//
// // file: src/index.js
// import data from "./hello.txt";
// console.log(btoa(data));
//
// // file: rollup.config.js
// import inline from "./rollup-plugin-inline.js";
// export default {
//     input: "src/index.js",
//     output: {
//         file: "bundle.js",
//         format: "es",
//     },
//     plugins: [
//         inline({
//             include: ["**/*.txt"], exclude: ["**/exclude-me.txt"]
//         })
//     ]
// }

export default function inline(options = {}) {
    if (!options.include) {
        throw new Error("Include option is required");
    }

    const filter = createFilter(options.include, options.exclude);
    return {
        name: "inline",
        async transform(data, id) {
            if (!filter(id)) {
                return null;
            }

            const contents = await readFile(id);
            const b64Data = contents.toString("base64");
            const transformedCode = `export default "${b64Data}";`;
            return {
                code: transformedCode,
                map: { mappings: "" }
            };
        }
    };
}
