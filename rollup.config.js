import typescript from '@rollup/plugin-typescript'

/** @type {import('rollup').RollupOptions} */
export default {
  input: 'src/app.ts',
  output: {
    file: 'dist/poco-language.js',
    format: 'cjs'
  },
  plugins: [typescript()]
}
