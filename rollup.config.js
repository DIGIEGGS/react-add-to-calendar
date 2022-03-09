import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import scss from "rollup-plugin-scss";
import postcss from "postcss";
import autoprefixer from "autoprefixer";
import dts from "rollup-plugin-dts";
import { terser } from "rollup-plugin-terser";
import peerDepsExternal from "rollup-plugin-peer-deps-external";

// custom
import * as packageJson from "./package.json";

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: packageJson.main,
        format: "cjs",
        sourcemap: true
      },
      {
        file: packageJson.module,
        format: "esm",
        sourcemap: true
      }
    ],
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.json"
      }),
      scss({
        processor: () => postcss([autoprefixer()]),
        outputStyle: "compressed",
        includePaths: ["src/*"]
      }),
      terser()
    ]
  },
  {
    input: "dist/esm/types/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "esm" }],
    plugins: [dts()],
    external: [/\.scss$/]
  }
];
