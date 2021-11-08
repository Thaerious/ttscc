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
    buildMessage(rootGameObject){
        const msg = {
            messageID: 1,
            scriptStates:[]
        };

        msg.scriptStates.push(this.buildMessageElement(rootGameObject));

        /* recurse over any contained objects */
        for(const childState of rootGameObject["ObjectStates"]){
            msg.scriptStates.push(this.buildMessageElement(childState));
        }

        return msg;
    }

    buildMessageElement(gameObject){
        console.log(gameObject);

        let element = {
            "guid" : gameObject.GUID ?? "-1",
            "name" : gameObject.Nickname,
            "script" : gameObject.LuaScript
        };
        return element;
    }
}

export default Uploader;