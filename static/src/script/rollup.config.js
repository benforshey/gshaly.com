import babel from 'rollup-plugin-babel'
import nodeResolve from 'rollup-plugin-node-resolve'

export default {
  entry: './static/src/script/main.js',
  format: 'cjs',
  plugins: [ nodeResolve(), babel() ],
  dest: './static/dist/script/bundle.js'
}
