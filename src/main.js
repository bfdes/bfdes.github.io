import fs from "fs";
import path from "path";
import { RepoReader } from "./fileReaders";
import FileWriter from "./fileWriter";
import Router from "./Router";

const repoReader = new RepoReader(fs);
const fileWriter = new FileWriter(fs);

const markupPath = path.join(__dirname, "posts");
const repo = repoReader.read(markupPath);
const fileOrDir = Router(repo);
fileWriter.write(".", fileOrDir);
