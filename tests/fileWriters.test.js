import path from "path";
import { mk } from "src/fileSystem";
import FileWriter, { FileWriteError } from "src/fileWriter";

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

  it("fails when files cannot be written", () => {
    const fileName = "hello-world.txt";
    const fileContents = "Hello, World!";
    const stubFs = {
      writeFileSync() {
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

  it("fails when directories cannot be written", () => {
    const stubFs = {
      mkdirSync() {
        throw new Error();
      },
    };
    const dirWriter = new FileWriter(stubFs);
    const dir = mk(dirName, [mk(fileName, fileContents)]);

    expect(() => dirWriter.write(rootPath, dir)).toThrow(FileWriteError);
  });

  it("fails when files cannot be written", () => {
    const stubFs = {
      mkdirSync: jest.fn(),
      writeFileSync() {
        throw new Error();
      },
    };
    const dirWriter = new FileWriter(stubFs);
    const dir = mk(dirName, [mk(fileName, fileContents)]);

    expect(() => dirWriter.write(rootPath, dir)).toThrow(FileWriteError);
  });
});
