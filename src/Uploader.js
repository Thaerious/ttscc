import Constants from './include/constants.js';
import FS from 'fs';
import Path from 'path';
import Net from 'net';
import Injector from "./Injector.js";

/**
 * Upload scripts from project directories to a live TTS game.
 */
class Uploader extends Injector{

    constructor(){
        super();
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

    /**
     * Create the JSON message for TSS save & play.
     * @returns
     */
    buildMessage(){
        const dictionary = this.getDictionary();

        let msg = {
            messageID: 1,
            scriptStates:[]
        };

        for (let guid in dictionary){
            const element = this.buildElement(guid, dictionary);
            if (element) msg.scriptStates.push(element);
        }

        return JSON.stringify(msg);
    }

    buildElement(guid, dictionary){
        const filename = dictionary[guid];
        const path = Path.join(this.projectDirectory, Constants.PACKED_DIRECTORY, filename + ".tua");

        if (!FS.existsSync(path)) return undefined;

        let element = {};
        element.guid = guid;
        element.name = dictionary[guid];

        let data = FS.readFileSync(path);
        element.script = data.toString('ascii', 0, data.length);

        return element;
    }
}

export default Uploader;