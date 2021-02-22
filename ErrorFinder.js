import Constants from "./constants.js";
import FS from 'fs';
import Path from 'path';
import ReadLine from 'readline';

class ErrorFinder {
    async find(errorMessage) {
        this.errorMessage = errorMessage;
        let split = errorMessage.error.split(":");               
        
        this.message = split[2];
        this.location = split[1].substr(1, split[1].length - 2);
        
        let lineNumber = this.location.split(",")[0];
        this.chars = this.location.split(",")[1];

        this.errorReport = await this.seek(this.errorMessage.guid, lineNumber);
    }

    report(){
        console.log("------------------------------");
        console.log("Error: " + this.message);
        console.log(this.errorReport);
        console.log(this.errorLine);
        console.log("------------------------------");
    }

    async seek(guid, lineNumber) {
        let filename = guid + ".lua";
        if (guid === "-1") filename = Constants.GLOBAL_FILENAME + ".lua";

        this.targetLine = parseInt(lineNumber);
        this.globalLine = 0;

        if (!FS.existsSync(Path.join(Constants.SCRIPT_DIR, filename))){
            throw new Error("Error file not found: " + Path.join(Constants.SCRIPT_DIR, filename));
        }

        return await this.seekFile(Path.join(Constants.SCRIPT_DIR, filename));
    }

    async seekFile(filename) {
        let localLine = 0;
        let readStream = FS.createReadStream(filename);

        let rl = ReadLine.createInterface({
            input: readStream,
            crlfDelay: Infinity
        });

        for await (const line of rl) {
            this.globalLine = this.globalLine + 1;
            localLine = localLine + 1;

            if (this.globalLine === this.targetLine){
                this.errorLine = line;
                readStream.close();
                return `${filename}:${localLine}`;
            }

            if (line.match(/^#include [a-zA-Z0-9./]+[ \t]*/)) {
                let filename = line.substring(line.indexOf(" ")).trim();
                let path = this.getIncludePath(filename);
                let result = this.seekFile(path);                
                if (result){
                    readStream.close();
                    return result;
                }
            }
        }

        readStream.close();
        return `line ${this.targetLine} not found in ${this.globalLine} lines searched from file ${filename}`;
    }

    /**
     * Create a readstream for the include file, 'filename'.
     * Searches in the include directory, for .lua first then .ttslua second.
     * @param {*} filename 
     */
    getIncludePath(filename){
        let path = null;
        path = path ?? this.getIncludeExt(filename, ".lua");
        path = path ?? this.getIncludeExt(filename, ".ttslua");

        if (path == null){
            throw new Error("include file not found: " + filename);
        }

        return path;
    }

    /**
     * Return true if the filename with extension exists.
     * @param {*} filename 
     * @param {*} ext 
     */
    getIncludeExt(filename, ext){
        let path = Path.join(Constants.INCLUDE_DIR, filename + ext);
        return FS.existsSync(path) ? path : null;
    }
}

export default ErrorFinder;