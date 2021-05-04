import { mk } from "src/fileSystem";
import FileWriter, { FileWriteError } from "src/fileWriter";
import path from "path";

describe("FileWriter", () => {
  const rootPath = "/Users/johndoe/Documents";

  it("writes file contents", () => {
    const fileName = "hello-world.txt";
    const fileContents = "Hello, World!";
    const stubFs = {
      writeFileSync: jest.fn(),
    };
    const fileWriter = new FileWriter(stubFs);
    const file = mk(fileName, fileContents);
    fileWriter.write(rootPath, file);

    expect(stubFs.writeFileSync).toHaveBeenCalledTimes(1);
  });

  it("writes images in binary format", () => {
    const fileName = "avatar.jpg";
    const fileContents = "binary string";
    const stubFs = {
      writeFileSync: jest.fn(),
    };
    const fileWriter = new FileWriter(stubFs);
    const file = mk(fileName, fileContents);
    fileWriter.write(rootPath, file);

    expect(stubFs.writeFileSync).toHaveBeenCalledTimes(1);
    expect(stubFs.writeFileSync).toHaveBeenCalledWith(
      path.join(rootPath, fileName),
      fileContents,
      "binary"
    );
  });

  it("handles write errors", () => {
    const fileName = "hello-world.txt";
    const fileContents = "Hello, World!";
    const stubFs = {
      writeFileSync(_filePath, _contents) {
        throw new Error();
      },
    };
    const fileWriter = new FileWriter(stubFs);
    const file = mk(fileName, fileContents);

    expect(() => fileWriter.write(rootPath, file)).toThrow(FileWriteError);
  });
});

describe("DirWriter", () => {
  const rootPath = "/Users/johndoe/Documents";
  const dirName = "hello-world";
  const fileName = "index.txt";
  const fileContents = "Hello, World!";

  it("writes directory contents", () => {
    const stubFs = {
      mkdirSync: jest.fn(),
      writeFileSync: jest.fn(),
    };
    const dirWriter = new FileWriter(stubFs);
    const dir = mk(dirName, [mk(fileName, fileContents)]);
    dirWriter.write(rootPath, dir);

    expect(stubFs.mkdirSync).toHaveBeenCalledTimes(1);
    expect(stubFs.writeFileSync).toHaveBeenCalledTimes(1);
  });

  it("handles directory write errors", () => {
    const stubFs = {
      mkdirSync(_) {
        throw new Error();
      },
    };
    const dirWriter = new FileWriter(stubFs);
    const dir = mk(dirName, [mk(fileName, fileContents)]);

    expect(() => dirWriter.write(rootPath, dir)).toThrow(FileWriteError);
  });

  it("handles file write errors", () => {
    const stubFs = {
      mkdirSync: jest.fn(),
      writeFileSync(_filePath, _contents) {
        throw new Error();
      },
    };
    const dirWriter = new FileWriter(stubFs);
    const dir = mk(dirName, [mk(fileName, fileContents)]);

    expect(() => dirWriter.write(rootPath, dir)).toThrow(FileWriteError);
  });
});
