import fs from "fs";
import path from "path";

class NotImplementedError extends Error {}

export class FileSystem {
  constructor(name, contents) {
    this.name = name;
    this.contents = contents;
  }

  write(_) {
    throw new NotImplementedError();
  }

  static read(_) {
    throw new NotImplementedError();
  }
}

export class File extends FileSystem {
  write(rootPath) {
    const filePath = path.join(rootPath, this.name);
    try {
      fs.writeFileSync(filePath, this.contents);
    } catch (_) {
      console.error(`Could not write to ${filePath}`);
    }
  }

  static read(filePath) {
    try {
      const contents = fs.readFileSync(filePath).toString();
      const name = path.parse(filePath).base;
      return new File(name, contents);
    } catch (_) {
      console.error(`Could not read ${filePath}`);
    }
  }
}

export class Dir extends FileSystem {
  write(rootPath) {
    const dirPath = path.join(rootPath, this.name);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
    this.contents.forEach((file) => file.write(dirPath));
  }

  static read(dirPath) {
    const toAbsPath = (fileName) => path.join(dirPath, fileName);

    function isFileOrDir(filePath) {
      const stats = fs.lstatSync(filePath);
      return stats.isFile() || stats.isDirectory();
    }

    try {
      return fs
        .readdirSync(dirPath)
        .map(toAbsPath)
        .filter(isFileOrDir)
        .map(read);
    } catch (_) {
      console.error(`Could not read ${dirPath}`);
    }
  }
}

function read(path) {
  const stats = fs.lstatSync(path);
  if (stats.isFile()) {
    return File.read(path);
  }
  return Dir.read(path);
}
