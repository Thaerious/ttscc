import Net from "net";
import Constants from "./constants.js";
import Uploader from "./Uploader.js";

/**
 * The functions in this module provide an interface to an active TTS game.
 */

/**
 * TTS listens for a JSON message with an ID of 0,
 * and responds by sending a JSON message containing scripts and UI XML.
 */
async function download(socket = undefined) {
    if (!socket) {
        socket = new Net.Socket();
        socket.connect({
            port: Constants.WRITE_PORT,
            host: Constants.TTS_URL
        });
    }

    const msg = {
        messageID: 0,
    };

    socket.on("error", (err) => {
        console.log(err);
    });

    socket.on("connect", async () => {
        console.log("CONNECTED");
        socket.write(JSON.stringify(msg));
        console.log(await listenOnce());
    });
}

async function upload(){
    
}

async function listenOnce(server = undefined) {
    return new Promise((resolve, reject) => {
        server = server ?? new Net.Server();
        
        server.listen({
            port: Constants.READ_PORT,
            host: Constants.TTS_URL
        });
        console.log("listening on " + Constants.TTS_URL);

        server.on("connection", async (socket) => {
            console.log("setting up read socket");
            const message = await setupReadSocket(socket);
            server.close();
            resolve(message);
        });
    });
}

async function setupReadSocket(socket) {
    return new Promise((resolve, reject) => {
        socket.setEncoding("utf8");

        let amalgametedData = "";
        socket.on("data", (data) => {
            amalgametedData = amalgametedData + data;
        });

        socket.on("close", () => {
            resolve(JSON.parse(amalgametedData));
        });
    });
}

export { download, listenOnce };
