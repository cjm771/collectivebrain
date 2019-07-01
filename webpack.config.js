const path = require('path');
const webpack = require('webpack');
const ENV = process.env.NODE_ENV || 'development';

module.exports = {
  // mode: ENV,
  entry: {
    app: './client/src/js/index.js',
  },
  stats: {
    children: false,
    chunks: false,
    chunkModules: false,
    modules: false,
  },
  module: {
    rules: [
      {
        test: /\.(es6|js|jsx)$/,
        exclude: /node_modules/,
        use: [{
          loader:'babel-loader',
          options: {
            presets: ['env','react','stage-2']
          }
        }] 
      },{
        test: /\.(css|scss)$/,
       
        use: [
          {
            loader: 'style-loader',
            options: {
              sourceMap: true
            }
          }, 
          {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          }, 
          {
            loader: 'postcss-loader',
            options: {
              plugins: function() { return [
                // TODO, resolve autoprefixer
                require('autoprefixer')({
                  overrideBrowserslist: ['last 2 versions']
                }),
               ];},
              sourceMap: true
            }
          },
          {loader: 'sass-loader', 
            options:  {
              includePaths: ["scss/"],
              sourceMap: true
          }}
        ]
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js','.es6', '.jsx']
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': { 
        NODE_ENV:  JSON.stringify( ENV )
      },
    })
  ],
  output: {
    pathinfo: false,
    path: path.resolve(__dirname + '/client/dist/js'),
    publicPath: '/dist/js',
    filename: '[name].bundle.js'
  }
};