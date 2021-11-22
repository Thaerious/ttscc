import Constants from "./constants.js";
import Path from "path";

/**
 * Determine an objects filename from it's object state (nickname & guid).
 * @param {*} objectState the game object from the game file, or a GUID string.
 * @returns the filename with extension
 */
export default function getFilename(objectState, extension = Constants.SCRIPT_EXTENSION) {
      if (!objectState) throw new SyntaxError("missing 'objectState' parameter");
      if (!objectState.GUID) return `${Constants.GLOBAL_FILENAME}.${extension}`;
      if (objectState.GUID === "-1") return `${Constants.GLOBAL_FILENAME}.${extension}`;
      const nickname = objectState.Nickname ?? "";
      const parsedName = nickname.trim().replaceAll(/[ ]/g, "_");

      if (parsedName === "") return `${objectState.GUID}.${extension}`;
      else return Path.join(parsedName, `${objectState.GUID}.${extension}`);
};