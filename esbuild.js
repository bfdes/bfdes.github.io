require("esbuild")
  .build({
    bundle: true,
    entryPoints: ["src/main.js"],
    jsxFactory: "Template.createElement",
    jsxFragment: "Template.Fragment",
    loader: {
      ".png": "dataurl",
      ".jpg": "binary",
      ".css": "text",
    },
    outfile: "build.js",
    platform: "node",
    target: "node14",
  })
  .catch(() => process.exit(1));
