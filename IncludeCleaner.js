import ReadLine from 'readline';
import FS from 'fs';
import OS from 'os';
import { Readable } from 'stream';

/**
 * Replace included text with the #include header
 */
class IncludeCleaner {
    constructor() {
        this.lastInclude = null;
    }

    async processString(string){
        let rstring = "";
        await this.readString(string, line => rstring = rstring + line + OS.EOL);
        return rstring;
    }

    async readString(string, cb) {
        cb = cb ?? this.online;

        let rl = ReadLine.createInterface({
            input: Readable.from(string),
            crlfDelay: Infinity
        });

        for await (const line of rl) {
            cb(line);
        }
    }

    async readFile(filename) {
        if (!FS.existsSync(filename)) {
            throw new Error(`File "${filename} does not exist.`);
        }

        let rl = ReadLine.createInterface({
            input: FS.createReadStream(filename),
            crlfDelay: Infinity
        });

        for await (const line of rl) {
            this.processLine(line);
        }
    }

    processLine(line){
        if (line.match(/^---> #include [a-zA-Z0-9./]+[ \t]*/)) {
            let filename = line.substring(14).trim();
            if (this.lastInclude === null) {
                this.lastInclude = filename;
                this.online(`#include ${filename}`);
            }
        }
        else if (line.match(/^---< #include [a-zA-Z0-9./]+[ \t]*/)) {
            let filename = line.substring(14).trim();
            if (filename === this.lastInclude) this.lastInclude = null;
        }
        else if (this.lastInclude === null) {
            this.online(line);
        }
    }

    /**
     * Override this method to handle cleaned text.
     * Only lines that are not part of includes are put here.
     * @param {*} line 
     */
    online(line) {
        console.log(line);
    }
}

export default IncludeCleaner;