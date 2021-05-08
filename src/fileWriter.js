import path from "path";
import { Dir, File } from "./fileSystem";

class IllegalArgumentError extends Error {}

export class FileWriteError extends Error {
  constructor(filePath, ...args) {
    const msg = `Could not write to ${filePath}`;
    super(msg, ...args);
  }
}

export default class FileWriter {
  constructor(fs) {
    this.fs = fs;
  }

  writeFile(rootPath, file) {
    const filePath = path.join(rootPath, file.name);
    const ext = path.extname(filePath);
    const isImage = [".png", ".jpeg", ".jpg"].includes(ext);
    const encoding = isImage ? "binary" : "utf8";
    try {
      this.fs.writeFileSync(filePath, file.content, encoding);
    } catch (_) {
      throw new FileWriteError(filePath);
    }
  }

  writeDir(rootPath, dir) {
    const dirPath = path.join(rootPath, dir.name);
    try {
      // Create the directory if it does not exist
      this.fs.mkdirSync(dirPath, { recursive: true });
    } catch (_) {
      throw new FileWriteError(dirPath);
    }
    for (const fileOrDir of dir.content) {
      this.write(dirPath, fileOrDir);
    }
  }

  write(rootPath, fileOrDir) {
    if (fileOrDir instanceof File) {
      this.writeFile(rootPath, fileOrDir);
    } else if (fileOrDir instanceof Dir) {
      this.writeDir(rootPath, fileOrDir);
    } else {
      const msg = `Unsupported resource type: ${fileOrDir}`;
      throw new IllegalArgumentError(msg);
    }
  }
}
