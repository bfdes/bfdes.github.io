import path from "path";
import { mk } from "src/fileSystem";
import FileWriter, { FileWriteError } from "src/fileWriter";

describe("FileWriter", () => {
  const rootPath = "/Users/johndoe/Documents";

  it("writes file contents", async () => {
    const fileName = "hello-world.txt";
    const fileContents = "Hello, World!";
    const stubFs = {
      writeFile: jest.fn(),
    };
    const fileWriter = new FileWriter(stubFs);
    const file = mk(fileName, fileContents);
    await fileWriter.write(rootPath, file);

    expect(stubFs.writeFile).toHaveBeenCalledTimes(1);
  });

  it("writes images in binary format", async () => {
    const fileName = "avatar.jpg";
    const fileContents = "binary string";
    const stubFs = {
      writeFile: jest.fn(),
    };
    const fileWriter = new FileWriter(stubFs);
    const file = mk(fileName, fileContents);
    await fileWriter.write(rootPath, file);

    expect(stubFs.writeFile).toHaveBeenCalledTimes(1);
    expect(stubFs.writeFile).toHaveBeenCalledWith(
      path.join(rootPath, fileName),
      fileContents,
      "binary"
    );
  });

  it("fails when files cannot be written", async () => {
    const fileName = "hello-world.txt";
    const fileContents = "Hello, World!";
    const stubFs = {
      async writeFile() {
        throw new Error();
      },
    };
    const fileWriter = new FileWriter(stubFs);
    const file = mk(fileName, fileContents);

    await expect(fileWriter.write(rootPath, file)).rejects.toThrow(
      FileWriteError
    );
  });
});

describe("DirWriter", () => {
  const rootPath = "/Users/johndoe/Documents";
  const dirName = "hello-world";
  const fileName = "index.txt";
  const fileContents = "Hello, World!";

  it("writes directory contents", async () => {
    const stubFs = {
      mkdir: jest.fn(),
      writeFile: jest.fn(),
    };
    const dirWriter = new FileWriter(stubFs);
    const dir = mk(dirName, [mk(fileName, fileContents)]);
    await dirWriter.write(rootPath, dir);

    expect(stubFs.mkdir).toHaveBeenCalledTimes(1);
    expect(stubFs.writeFile).toHaveBeenCalledTimes(1);
  });

  it("fails when directories cannot be written", async () => {
    const stubFs = {
      async mkdir() {
        throw new Error();
      },
    };
    const dirWriter = new FileWriter(stubFs);
    const dir = mk(dirName, [mk(fileName, fileContents)]);

    await expect(dirWriter.write(rootPath, dir)).rejects.toThrow(
      FileWriteError
    );
  });

  it("fails when files cannot be written", async () => {
    const stubFs = {
      mkdir: jest.fn(),
      async writeFile() {
        throw new Error();
      },
    };
    const dirWriter = new FileWriter(stubFs);
    const dir = mk(dirName, [mk(fileName, fileContents)]);

    await expect(dirWriter.write(rootPath, dir)).rejects.toThrow(
      FileWriteError
    );
  });
});
