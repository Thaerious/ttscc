import Constants from './constants.js';
import FS from 'fs';
import Path from 'path';
import Net from 'net';
import Includer from "./Includer.js";

class Uploader{
    constructor(){
        this.options = {
            multiple_includes : false
        }
    }

    reload(){
        this.socket = new Net.Socket();
        this.socket.connect(Constants.WRITE_PORT);

        let msg = {
            messageID: 1
        };

        this.socket.on("error", (err)=>{            
            console.log(err);
        });

        this.socket.on("connect", () => {            
            this.socket.write(JSON.stringify(msg));
        });
    }

    /**
     * Upload all GUID script files. 
     */
    upload(){
        this.socket = new Net.Socket();
        this.socket.connect(Constants.WRITE_PORT);

        this.socket.on("error", (err)=>{            
            console.log(err);
        });

        this.socket.on("connect", () => {            
            const message = this.buildMessage();
            this.socket.write(message);
        });
    }

    buildMessage(){
        let namesJSON = FS.readFileSync(Path.join(Constants.DATA_DIR, Constants.NAME_FILE));
        let names = JSON.parse(namesJSON);

        let msg = {
            messageID: 1,
            scriptStates:[]
        };

        for (let guid in names){
            let element = this.buildElement(guid, names);
            msg.scriptStates.push(element);
        }

        return JSON.stringify(msg);
    }

    buildElement(guid, names){
        let element = {};
        element.guid = guid;            
        element.name = names[guid];
        this.fillElementScript(element);
        this.fillElementUI(element);
        return element;
    }

    fillElementScript(element){
        let filename = element.guid + ".lua";
        if (element.guid === "-1") filename = Constants.GLOBAL_FILENAME + ".lua";

        let path = Path.join(Constants.SCRIPT_DIR, filename);
        if (!FS.existsSync(path)) return;
        let data = FS.readFileSync(path);
        let script = data.toString('ascii', 0, data.length);
        element.script = new Includer().replaceInclude(script, element.guid);

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
}

export default Uploader;