import * as fs from "node:fs";

function copyFiles() {
    const files = [
        { src: "src/html/index.html", dest: "dist/index.html"}
    ]
    const dirs = [
        { src: "src/css", dest: "dist/assets/css/" },
	    { src: "src/img", dest: "dist/assets/img/" }
    ]

    try {
        fs.mkdirSync("dist/");
    }
    catch {
    }

    for (const file of files) {
        fs.copyFileSync(file.src, file.dest);
    }

    for (const dir of dirs) {
        fs.cpSync(dir.src, dir.dest, { recursive: true });
    }
}

copyFiles();
