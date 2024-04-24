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
//             extension: [".txt"]
//         })
//     ]
// }

export default function inline(options = {}) {
    if (!options.extension) {
        throw new Error("Extension option is required");
    }

    return {
        name: "inline",
        async transform(data, id) {
            let extensions = [];
            if (typeof options.extension == "string") {
                extensions = [options.extension];
            } else {
                extensions = [...options.extension];
            }

            let found = false;
            for (const extension of extensions) {
                let idx = id.indexOf(".");
                if (idx == -1) {
                    return null;
                }
                const ext = id.slice(idx);
                if (ext == extension) {
                    found = true;
                    break;
                }
            }

            if (!found) {
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
