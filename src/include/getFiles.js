import FS from 'fs';
import Path from 'path';

/**
 * Recursively retrieve a list of files from the specified directory.
 * @param {String} directory 
 * @returns An array of {fullpath, name} obects.
 */
 function getFiles(directory = "."){
      const dirEntries = FS.readdirSync(directory, { withFileTypes: true });
      const files = dirEntries.map((dirEntry) => {
          const resolved = Path.resolve(directory, dirEntry.name);
          return dirEntry.isDirectory() 
               ? getFiles(resolved) 
               : {fullpath : resolved, name : dirEntry.name};
      });
      return files.flat();
  }

  export default getFiles;