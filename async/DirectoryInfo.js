'use strict';

const fs = require('fs');
const path = require('path');
const HtmlResult = require('./HtmlResult');

class DirectoryInfo {
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

    /** Find matching directories */
    findMatchingDirectories(source) {
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

    /** Find the files matching a file within any subdirectory, and the photos not matching any file. */
    findMatchingFiles(source) {
        for (const sourceDirName in source.dirs) {
            const result = new HtmlResult();
            let sourceFiles = source.dirs[sourceDirName];
            result.addTitle(sourceDirName);
            for (const targetDirName in this.dirs) {
                const matches = this.compareFileArrays(source.dirs[sourceDirName], this.dirs[targetDirName]);
                if (matches.length > 0) {
                    console.log(`${matches.length} "${sourceDirName}" "${path.join(targetDirName, matches[0])}"`);
                    result.addMatches(sourceDirName, targetDirName, matches);
                }
                sourceFiles = sourceFiles.filter(x => !matches.includes(x));
            }

            const tempDirName = path.join(sourceDirName, 'Missing');
            if (!fs.existsSync(tempDirName)) {
                fs.mkdirSync(tempDirName);
            }
            for (const sourceFile of sourceFiles) {
                fs.renameSync(
                    path.join(sourceDirName, sourceFile),
                    path.join(tempDirName, sourceFile)
                );
            }

            result.addMissing(sourceDirName, sourceFiles);
            result.save();
        }
    }
}

module.exports = DirectoryInfo;
