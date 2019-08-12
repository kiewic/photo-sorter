'use strict';

const fs = require('fs');
const child_process = require('child_process');
const path = require('path');

// TODO: Can this be a static property?
let fileId = 1;

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
        let count = 0;
        for (const match of matches) {
            this.output += this.buildImg(sourceDirName, match);
            this.output += this.buildImg(targetDirName, match); // Disabled to avoid network slowdown

            // Limit to 5 matches
            if (++count > 5) {
                break;
            }
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
        return `<img width="192" src="${path.join(dirName, fileName)}" title="${fileName}">`;
    }

    save() {
        const resultsFileName = `results${fileId++}.html`;
        fs.writeFileSync(resultsFileName, this.output);
        child_process.exec(`start ${resultsFileName}`);
    }
}

module.exports = HtmlResult;
