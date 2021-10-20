/**
 * Determine an objects filename from it's object state (nickname & guid).
 * @param {*} objectState
 * @returns the filename without extension
 */
export default function getFilename(objectState) {
      if (!objectState.GUID) return Constants.GLOBAL_FILENAME;
      let nickname = objectState.Nickname ?? "";
      let rawName = nickname.trim();
      let parsedName = rawName.replaceAll(/[ ]/g, "_");
      return `${parsedName}.${objectState.GUID}`;
};