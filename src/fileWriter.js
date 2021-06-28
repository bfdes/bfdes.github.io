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

  async writeFile(rootPath, file) {
    const filePath = path.join(rootPath, file.name);
    const ext = path.extname(filePath);
    const isImage = [".png", ".jpeg", ".jpg"].includes(ext);
    const encoding = isImage ? "binary" : "utf8";
    try {
      await this.fs.writeFile(filePath, file.content, encoding);
    } catch (_) {
      throw new FileWriteError(filePath);
    }
  }

  async writeDir(rootPath, dir) {
    const dirPath = path.join(rootPath, dir.name);
    try {
      // Create the directory if it does not exist
      await this.fs.mkdir(dirPath, { recursive: true });
    } catch (_) {
      throw new FileWriteError(dirPath);
    }
    const promises = dir.content.map((fileOrDir) =>
      this.write(dirPath, fileOrDir)
    );
    await Promise.all(promises);
  }

  async write(rootPath, fileOrDir) {
    if (fileOrDir instanceof File) {
      await this.writeFile(rootPath, fileOrDir);
    } else if (fileOrDir instanceof Dir) {
      await this.writeDir(rootPath, fileOrDir);
    } else {
      const msg = `Unsupported resource type: ${fileOrDir}`;
      throw new IllegalArgumentError(msg);
    }
  }
}
