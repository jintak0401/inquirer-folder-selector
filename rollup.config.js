// rollup.config.js

import path from 'node:path'
import alias from '@rollup/plugin-alias'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import { dts } from 'rollup-plugin-dts'

const projectRootDir = path.resolve()

export default [
  {
    input: './src/index.ts',
    output: [
      {
        file: './dist/esm/bundle.mjs',
        format: 'es',
      },
      {
        file: './dist/cjs/bundle.cjs',
        format: 'cjs',
      },
    ],
    plugins: [
      commonjs(),
      nodeResolve({ exportConditions: ['node'] }),
      typescript(),
      alias({
        find: '@',
        replacement: path.resolve(projectRootDir, 'src'),
        // OR place `customResolver` here. See explanation below.
      }),
    ],
  },
  {
    input: './src/types.d.ts',
    output: [
      {
        file: './dist/esm/types.d.ts',
        format: 'es',
      },
      {
        file: './dist/cjs/types.d.ts',
        format: 'cjs',
      },
    ],
    plugins: [dts()],
  },
]
