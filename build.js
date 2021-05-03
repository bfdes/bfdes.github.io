require("esbuild")
  .build({
    entryPoints: ["src/main.jsx"],
    bundle: true,
    jsxFactory: "Template.createElement",
    jsxFragment: "Template.Fragment",
    platform: "node",
    target: "node14",
    outfile: "ssg.js",
  })
  .catch(() => process.exit(1));
