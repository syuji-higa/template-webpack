const { join, resolve, relative } = require('path')
const glob = require('glob')

const isProduction = process.env.NODE_ENV === 'production'

const src = resolve(__dirname, 'src')
const dist = resolve(__dirname, 'dist')

const config = {
  entry: {
    ['assets/js/app.js']: join(src, 'assets/js/app.js'),
    ['../.trash/pug.js']: [...glob.sync(join(src, '**/*.pug'))]
  },
  output: {
    path: dist,
    filename: '[name]'
  },
  devServer: {
    contentBase: dist,
    watchContentBase: true
  },
  module: {
    rules: [
      // HTML
      {
        enforce: 'pre',
        test: /\.pug$/,
        use: [
          {
            loader: 'pug-lint-loader',
            options: require('./.pug-lintrc.js')
          }
        ],
        exclude: /node_modules/
      },
      {
        test: /\.pug$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath(url, resourcePath, context) {
                return relative(src, resourcePath.replace('.pug', '.html'))
              }
            }
          },
          'extract-loader',
          {
            loader: 'html-loader',
            options: {
              attrs: ['link:href', 'img:src', ':data-src']
            }
          },
          'htmlhint-loader',
          {
            loader: 'pug-html-loader',
            options: {
              pretty: !isProduction
            }
          }
        ]
      },
      // CSS
      {
        enforce: 'pre',
        test: /\.styl$/,
        use: 'stlint-loader',
        exclude: /node_modules/
      },
      {
        test: /\.styl$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath(url, resourcePath, context) {
                if (isProduction) {
                  const hash = url.replace(/\.styl$/, '')
                  return `${join(
                    '/',
                    relative(src, resourcePath).replace('.styl', '.css')
                  )}?hash=${hash}`
                } else {
                  return url.replace('.styl', '.css')
                }
              }
            }
          },
          'extract-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: !isProduction
            }
          },
          {
            loader: 'stylus-loader',
            options: {
              compress: isProduction,
              sourceMap: !isProduction
            }
          }
        ]
      },
      // JavaScript
      {
        enforce: 'pre',
        test: /\.js$/,
        use: 'eslint-loader',
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  }
}

module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    config.devtool = 'cheap-module-eval-source-map'
    config.module.rules.push(
      // Image
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: {
          loader: 'file-loader',
          options: {
            publicPath(url, resourcePath, context) {
              return join('/', url)
            }
          }
        }
      }
    )
  }

  if (argv.mode === 'production') {
    config.module.rules.push(
      // Image
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: {
          loader: 'file-loader',
          options: {
            outputPath(url, resourcePath, context) {
              return relative(src, resourcePath)
            },
            publicPath(url, resourcePath, context) {
              const hash = url.replace(/\.(png|jpg|gif|svg)$/, '')
              return `${join('/', relative(src, resourcePath))}?hash=${hash}`
            }
          }
        }
      }
    )
  }

  return config
}
