import Constants from './constants.js';
import FS from 'fs';
import Path from 'path';
import Net from 'net';
import OS from 'os';

class Uploader{
    constructor(){
        this.options = {
            multiple_includes : false
        }

        this.included = [];
    }

    upload(){
        let socket = new Net.Socket();
        socket.connect(Constants.WRITE_PORT);
        let message = this.buildMessage();

        socket.on("error", (err)=>{
            console.log(err);
            if (err.code === 'ECONNREFUSED') console.log("Connection to TTS refused");
            else console.log(err);
        });

        socket.on("connect", () => {            
            socket.write(message);
        });
    }

    buildMessage(guid){
        let namesJSON = FS.readFileSync(Path.join(Constants.DATA_DIR, Constants.NAME_FILE));
        let names = JSON.parse(namesJSON);

        let msg = {
            messageID: 1,
            scriptStates:[

            ]
        };

        for (let guid in names){
            let element = {};
            element.guid = guid;            
            element.name = names[guid];
            this.fillElementScript(element);
            this.fillElementUI(element);
            msg.scriptStates.push(element);
        }

        console.log(msg);
        return JSON.stringify(msg);
    }

    fillElementScript(element){
        let filename = element.guid + ".lua";
        if (element.guid === "-1") filename = Constants.GLOBAL_FILENAME + ".lua";

        let path = Path.join(Constants.SCRIPT_DIR, filename);
        if (!FS.existsSync(path)) return;
        let data = FS.readFileSync(path);
        let script = data.toString('ascii', 0, data.length);
        element.script = this.replaceInclude(script);

        if (!FS.existsSync(Constants.SENT_FILE_DIR)) FS.mkdirSync(Constants.SENT_FILE_DIR);
        FS.writeFileSync(Path.join(Constants.SENT_FILE_DIR, filename), element.script);
    }

    fillElementUI(element){
        let filename = element.guid + ".xml";
        if (element.guid === "-1") filename = Constants.GLOBAL_FILENAME + ".xml";

        let path = Path.join(Constants.UI_DIR, filename);
        if (!FS.existsSync(path)) return;
        let data = FS.readFileSync(path);
        element.ui = data.toString('ascii', 0, data.length);
    }    

    replaceInclude(text){        
        let targetText = "";
        let lines = text.split(OS.EOL);   
        
        for (let line of lines){
            if (line.match(/^#include [a-zA-Z0-9./]+[ \t]*/)){
                let filename = line.substring(9).trim();                
                let includedText = this.getIncludeFile(filename);
                includedText = this.replaceInclude(includedText);    
                targetText = targetText + includedText;                 
            } else {
                targetText = targetText + line + OS.EOL;                
            }
        }        
        return targetText;
    }

    getIncludeFile(filename){
        if (this.included.indexOf(filename) !== -1 && this.options.multiple_includes === false) return "";

        let contents = null;
        contents = contents ?? this.getIncludeExt(filename, ".lua");
        contents = contents ?? this.getIncludeExt(filename, ".ttslua");

        if (contents !== null){
            this.included.push(filename);
        }

        contents = contents ?? `---- #include ${filename} file not found`;
        return contents;
    }

    getIncludeExt(filename, ext){
        if (FS.existsSync(Path.join(Constants.INCLUDE_DIR, filename + ext))){
            let data = FS.readFileSync(Path.join(Constants.INCLUDE_DIR, filename + ext));
            let contents = data.toString('ascii', 0, data.length);
            contents = `---> #include ${filename}` 
                     + OS.EOL
                     + contents 
                     + OS.EOL 
                     + `---< #include ${filename}`
                     ;
            return contents;
        } 
        return null;
    }
}

export default Uploader;