var fs = require('fs');
var path = require('path');

function walk(directoryName) {
    console.log(`Walking through ${directoryName}`);
    fs.readdir(directoryName, function(err, files) {
        if (err) {
            throw err;
        }

        debugger;
        let onlyFiles = [];
        files.forEach(fileName => {
            let fullPath = path.join(directoryName, fileName);
            let stats = fs.statSync(fullPath);
                
            if (stats.isDirectory()) {
                walk(fullPath);
            }
            else {
                onlyFiles.push(fileName);
            }
        });
        info.add(directoryName, onlyFiles);
    });
}

class Info {
    constructor() {
        this.dirCount = 0;
        this.fileCount = 0;
        this.dirs = {};
    }

    add(directoryName, files) {
        if (Object.keys(this.dirs).includes(directoryName)) {
            throw new Error(`Whoops! Directory already exists: ${directoryName}`);
        }

        console.log(directoryName, files);
        this.dirs[directoryName] = files;
        this.dirCount++;
        this.fileCount += files.length;
    }

    summary() {
        console.log(`Dir count: ${this.dirCount}`);
        console.log(`File count: ${this.fileCount}`);
    }
}

let info = new Info();
walk("C:/Users/kiewi/OneDrive/Pictures");
info.summary();
