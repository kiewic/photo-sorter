'use strict';

var fs = require('fs');
var path = require('path');

function walk(directoryName, done) {
    console.log(`Walking through ${directoryName}`);
    fs.readdir(directoryName, function (err, files) {
        if (err) {
            throw err;
        }

        const filePromises = [];
        const onlyFiles = [];
        files.forEach(fileName => {
            let fullPath = path.join(directoryName, fileName);
            filePromises.push(new Promise((resolve) => {
                fs.stat(fullPath, function(err, stats) {
                    if (stats.isDirectory()) {
                        walk(fullPath, resolve);
                    } else {
                        onlyFiles.push(fileName);
                        resolve();
                    }
                });
            }));
        });

        Promise.all(filePromises).then(() => {
            info.add(directoryName, onlyFiles);
            done();
        });
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

const label = "main";
console.time(label);
let info = new Info();
walk("C:/Users/kiewi/OneDrive/Pictures", () => {
    info.summary();
    console.timeEnd(label);
});
