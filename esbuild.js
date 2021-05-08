require("esbuild")
  .build({
    entryPoints: ["src/main.js"],
    bundle: true,
    loader: {
      ".png": "dataurl",
      ".jpg": "binary",
      ".css": "text",
    },
    jsxFactory: "Template.createElement",
    jsxFragment: "Template.Fragment",
    platform: "node",
    target: "node14",
    outfile: "build.js",
  })
  .catch(() => process.exit(1));
