// @ts-check

import * as esbuild from "esbuild";

esbuild.build({
  bundle: true,
  entryPoints: ["./out/main.js"],
  external: ["@nestjs/core", "@nestjs/common", "electron"],
  minify: true,
  outfile: "./index.js",
  keepNames: true,
  platform: "node",
});
