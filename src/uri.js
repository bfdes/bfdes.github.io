export default function (imgStr, ext) {
  const buffer = Buffer.from(imgStr, "binary");
  return `data:image/${ext};base64, ${buffer.toString("base64")}`;
}
