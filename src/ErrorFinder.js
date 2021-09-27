import Constants from "./constants.js";
import FS from 'fs';
import Path from 'path';
import ReadLine from 'readline';
import Packer from "./Packer.js";
import Extractor from "./Extractor.js";
import StrToStream from "string-to-stream";

/**
 * Convert a global error from TTS to a local error.
 * Used to identify error line in include files.
 */
class ErrorFinder {
    async find(errorMessage) {
        console.log(errorMessage);
        this.errorMessage = errorMessage;
        let split = errorMessage.error.split(":");

        if (split.length === 1) {
            this.message = errorMessage.error;
            return;
        }

        this.message = split[2];
        this.location = split[1].substr(1, split[1].length - 2);
        this.path = "";

        this.srcLineNumber = this.location.split(",")[0];
        this.chars = this.location.split(",")[1];

        this.errorReport = await this.seek(this.errorMessage.guid, this.srcLineNumber);
    }

    report() {
        console.log("------------------------------");
        console.log("Error: " + this.message);
        console.log("source (guid:line) " + this.errorMessage.guid + ":" + this.srcLineNumber);
        console.log("file: " + this.path);
        console.log(this.errorReport);
        console.log("> " + this.errorLine);
        console.log("------------------------------");
    }

    /**
     * Given a guid and linenumber, find the corresponding line number in source files.
     * @param {*} guid 
     * @param {*} lineNumber 
     */
    async seek(guid, lineNumber) {
        let filename = guid + ".lua";
        if (guid === "-1") filename = Constants.GLOBAL_FILENAME + ".lua";

        this.targetLine = parseInt(lineNumber);
        const ex = new Extractor();
        await ex.extract();

        // Is a script file
        if (FS.existsSync(Path.join(Constants.SENT_FILE_DIR, filename))) {
            this.path = Path.join(Constants.SENT_FILE_DIR, filename);
            const stream = FS.createReadStream(this.path);            
            const r = await this.seekFile(stream);
            stream.close();
            return r;
        }
        // Is an object file
        else if (ex.getTTSObject(guid)) {
            this.path = Packer.filepath(guid);
            const stream = StrToStream(ex.getTTSObject(guid).LuaScript);
            return await this.seekFile(stream);
        }
        else {
            console.log("Script file not found: " + Path.join(Constants.SCRIPT_DIR, filename));
        }

    }

    async seekText(text) {

    }

    /**
     * Search a file line by line until target line number is reached.
     * Reports the number of lines since latest start of an include.
     * @param {string} filename 
     */
    async seekFile(readStream) {
        let lineStack = [];
        let includeStack = [];
        let currentInclude = this.path;
        let localLine = 0;
        let globalLine = 0;

        let rl = ReadLine.createInterface({
            input: readStream,
            crlfDelay: Infinity
        });

        for await (const line of rl) {
            globalLine = globalLine + 1;
            localLine = localLine + 1;

            if (globalLine === this.targetLine) {
                this.errorLine = line;                
                return `${currentInclude}:${localLine}`;
            }

            if (line.match(/^---[>-] ?#include [a-zA-Z0-9./]+[ \t]*/)) {
                includeStack.push(currentInclude);
                console.log("push " + currentInclude);
                currentInclude = line.substring(line.indexOf(" ")).trim();
                let path = this.getIncludePath(currentInclude);
                lineStack.push(localLine);                                
                localLine = 0;
            }

            if (line.match(/^---[<-] ?#include [a-zA-Z0-9./]+[ \t]*/)) {
                localLine = lineStack.pop();
                currentInclude = includeStack.pop();
                console.log("pop " + currentInclude);
            }
        }
        
        return undefined;
    }

    /**
     * Create a readstream for the include file, 'filename'.
     * Searches in the include directory, for .lua first then .ttslua second.
     * Return null if the include file is not found.
     * @param {*} filename 
     */
    getIncludePath(filename) {
        let path = null;
        path = path ?? this.getIncludeExt(filename, ".lua");
        path = path ?? this.getIncludeExt(filename, ".ttslua");
        return path;
    }

    /**
     * Return true if the filename with extension exists.
     * @param {*} filename 
     * @param {*} ext 
     */
    getIncludeExt(filename, ext) {
        let path = Path.join(Constants.INCLUDE_DIR, filename + ext);
        return FS.existsSync(path) ? path : null;
    }
}

export default ErrorFinder;