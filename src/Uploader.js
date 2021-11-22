import Constants from './include/constants.js';
import FS from 'fs';
import Path from 'path';
import Net from 'net';
import Injector from "./Injector.js";

/**
 * Upload scripts from project directories to a live TTS game.
 */
class Uploader{
    /**
     * Upload all GUID script files. 
     */
    upload(message){
        if (typeof message === "object"){
            message = JSON.stringify(message);
        };

        this.socket = new Net.Socket();
        this.socket.connect({
            host: "127.0.0.1",
            port: Constants.WRITE_PORT
        });

        this.socket.on("error", (err)=>{            
            console.log(err);
        });

        this.socket.on("connect", () => {       
            this.socket.write(message);
        });
    }

    /**
     * Create the JSON message for TSS save & play.
     * @returns
     */
    buildMessage(rootGameObject){
        if (!rootGameObject) throw new Error("undefined root game object");

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
        if (!gameObject) throw new Error("undefined game object");

        let element = {
            "guid"   : gameObject.GUID ?? "-1",
            "name"   : gameObject.Nickname,
            "script" : gameObject.LuaScript,
            "ui"     : gameObject.XmlUI
        };
        return element;
    }
}

export default Uploader;