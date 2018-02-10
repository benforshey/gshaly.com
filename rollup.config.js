import babel from 'rollup-plugin-babel'

export default {
  entry: './main.js',
  format: 'cjs',
  plugins: [ babel() ],
  dest: '/static/dist/script/bundle.js'
}
