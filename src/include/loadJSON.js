import FS from "fs";

export default function loadJSON(filename) {
    const file = FS.readFileSync(filename);
    const json = JSON.parse(file);
    return json;
}