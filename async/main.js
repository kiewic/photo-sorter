'use strict';

const fs = require('fs');
const path = require('path');
const DirectoryInfo = require('./DirectoryInfo');

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
            if (fileName === "Missing") {
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
                        onlyFiles.push([fileName, stats.size]);
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

(function () {
    const label = 'main';
    console.time(label);
    const oneDriveInfo = new DirectoryInfo();
    const promise1 = new Promise((resolve) => {
        const directoryName = 'C:\\Users\\kiewi\\OneDrive\\Pictures';
        walk(directoryName, oneDriveInfo, (err) => {
            oneDriveInfo.summary();
            console.timeEnd(label);
            resolve();
        });
    });

    const sourceInfo = new DirectoryInfo();
    const promise2 = new Promise((resolve) => {
        const directoryName = 'C:\\passport\\Vaio\\';
        walk(directoryName, sourceInfo, (err) => {
            sourceInfo.summary();
            resolve();
        });
    });

    Promise.all([promise1, promise2]).then(() => {
        oneDriveInfo.findMatchingFiles(sourceInfo);
    }).catch((err) => {
        console.error(err);
    });
})();
