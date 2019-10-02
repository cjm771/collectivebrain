require('dotenv').config();
const path = require('path');
const webpack = require('webpack');
const ENV = process.env.NODE_ENV || 'development';
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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
            loader: MiniCssExtractPlugin.loader,
            options: {
              fallback: 'style-loader', 
              sourceMap: true
            },
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            modules: {
                mode: 'local',
                localIdentName: '[name]__[local]___[hash:base64:5]',
              },
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
        NODE_ENV:  JSON.stringify( ENV ),
        DOMAIN: JSON.stringify( process.env.DOMAIN )
      },
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // all options are optional
      filename: '../css/[name].bundle.css',
    }),
  ],
  output: {
    pathinfo: false,
    path: path.resolve(__dirname + '/client/dist/js'),
    publicPath: '/dist/js',
    filename: '[name].bundle.js'
  }
};