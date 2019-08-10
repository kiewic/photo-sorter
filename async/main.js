'use strict';

var fs = require('fs');
var path = require('path');
var child_process = require('child_process');

function walk(directoryName, info, done) {
    console.log(`Walking through ${directoryName}`);
    fs.readdir(directoryName, function (err, files) {
        if (err) {
            throw err;
        }

        const filePromises = [];
        const onlyFiles = [];
        files.forEach(fileName => {
            if (fileName === "Thumbs.db") {
                return;
            }

            let fullPath = path.join(directoryName, fileName);
            filePromises.push(new Promise((resolve) => {
                fs.stat(fullPath, function(err, stats) {
                    if (err) {
                        throw err;
                    }

                    if (stats.isDirectory()) {
                        walk(fullPath, info, resolve);
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
        }).catch((err) => {
            console.log('Oops: something went wrong.');
            done(err);
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
        console.assert(Array.isArray(files));
        if (Object.keys(this.dirs).includes(directoryName)) {
            throw new Error(`Whoops! Directory already exists: ${directoryName}`);
        }

        // console.log(directoryName, files);
        this.dirs[directoryName] = files;
        this.dirCount++;
        this.fileCount += files.length;
    }

    summary() {
        console.log(`Dir count: ${this.dirCount}`);
        console.log(`File count: ${this.fileCount}`);
    }

    join() {
        const dirs = Object.keys(this.dirs).map(directoryName => this.dirs[directoryName]);
        return dirs.reduce((accumulator, currentValue) => {
            accumulator.push(...currentValue);
            return accumulator;
        }, []);
    }

    compareFileArrays(source, target) {
        const matches = [];
        source.forEach((fileName) => {
            if (target.includes(fileName)) {
                matches.push(fileName);
            };
        })
        return matches;
    }

    findMatch(source) {
        for (const sourceDirName in source.dirs) {
            const result = new HtmlResult();
            result.addTitle(sourceDirName);
            for (const targetDirName in this.dirs) {
                const matches = this.compareFileArrays(source.dirs[sourceDirName], this.dirs[targetDirName]);
                if (matches.length > 0) {
                    console.log(`${matches.length} "${sourceDirName}" "${path.join(targetDirName, matches[0])}"`);
                    result.addMatches(sourceDirName, targetDirName, matches);
                    result.addMissing(sourceDirName, source.dirs[sourceDirName].filter(x => !matches.includes(x)));
                }
            }
            result.save();
        }
    }
}

class HtmlResult {
    constructor() {
        this.output = "";
    }

    addTitle(text) {
        this.output += `<h1>${text}</h1>`;
    }

    addMatches(sourceDirName, targetDirName, matches) {
        console.assert(Array.isArray(matches));
        this.output += `<h2>Matched ${matches.length} with ${targetDirName}</h2>`;
        this.output += `<div>`;
        for (const match of matches) {
            this.output += this.buildImg(sourceDirName, match);
            // this.output += this.buildImg(targetDirName, match); // Disabled to avoid network slowdown
        }
        this.output += `</div>`;
    }

    addMissing(sourceDirName, missing) {
        console.assert(Array.isArray(missing));
        this.output += `<h2>Missing ${missing.length}</h2>`;
        this.output += `<div>`;
        for (const missed of missing) {
            const sourceImg = this.buildImg(sourceDirName, missed);
            this.output += `${sourceImg}`;
        }
        this.output += `</div>`;
    }

    buildImg(dirName, fileName) {
        return `<img width="192" src="${path.join(dirName, fileName)}">`;
    }

    save() {
        const resultsFileName = 'results.html';
        fs.writeFileSync(resultsFileName, this.output);
        child_process.exec(`start ${resultsFileName}`);
    }
}

(function () {
    const label = 'main';
    console.time(label);
    const oneDriveInfo = new Info();
    const promise1 = new Promise((resolve) => {
        walk('C:\\Users\\kiewi\\OneDrive\\Pictures', oneDriveInfo, (err) => {
            oneDriveInfo.summary();
            console.timeEnd(label);
            resolve();
        });
    });

    const sourceInfo = new Info();
    const promise2 = new Promise((resolve) => {
        // const directoryName = 'C:\\passport\\Pictures\\BabyGorilla20121228';
        const directoryName = 'C:\\passport\\Pictures\\OneDrive_Pictures_CameraRoll\\Camera Roll\\OrlandoDisney2016';
        walk(directoryName, sourceInfo, (err) => {
            sourceInfo.summary();
            resolve();
        });
    });

    Promise.all([promise1, promise2]).then(() => {
        oneDriveInfo.findMatch(sourceInfo);
    }).catch((err) => {
        console.error(err);
    });
})();
