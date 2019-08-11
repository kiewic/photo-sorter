'use strict';

const HtmlResult = require('./HtmlResult');
const path = require('path');

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

module.exports = DirectoryInfo;
