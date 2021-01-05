require('dotenv').config();
const path = require('path');
const webpack = require('webpack');
const ENV = process.env.NODE_ENV || 'development';



// plugin
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const brotliCompress = require('iltorb').compress;


let plugins = [
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
  })];

const prodPlugins  = [ 
  new CompressionPlugin({
    filename: "[path].br",
    test: /\.js$|\.css$|\.html$/,
    algorithm: function (buf, options, callback) {
      brotliCompress(buf, {
        mode: 0, // 0 = generic, 1 = text, 2 = font (WOFF2)
        quality: 11, // 0 - 11
        lgwin: 22, // window size
        lgblock: 0 // block size
      }, callback);
    },
    threshold: 0,
    minRatio: 1
  }),  
  new CompressionPlugin({ 
    algorithm: "gzip",
    test: /\.js$|\.css$|\.html$/,
    threshold: 10240,
    minRatio: 0.8
  }),
];
if (ENV === 'production') {
  plugins = [...prodPlugins, ...plugins];
}


module.exports = {
  // mode: ENV,
  entry: {
    app: './client/src/js/index.js',
  },
  devtool: 'source-map',
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
            plugins: [[require('babel-plugin-transform-imports'), {
              '@fortawesome/free-solid-svg-icons': {
                'transform': '@fortawesome/free-solid-svg-icons/${member}',
                'skipDefaultConversion': true
              }}, 
              // {
              // 'three': {
              //   'transform': 'three/${member}',
              //   'skipDefaultConversion': true
              // }}, {
              // 'react-force-graph': {
              //   'transform': 'react-force-graph/${member}',
              //   'skipDefaultConversion': true
              // }},
          ]],
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
              sourceMap: true,
              implementation: require('sass')
          }}
        ]
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js','.es6', '.jsx']
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
    minimizer: [
      new UglifyJsPlugin()
    ]
  },
  plugins: plugins,
  output: {
    pathinfo: false,
    path: path.resolve(__dirname + '/client/dist/js'),
    publicPath: '/dist/js',
    filename: '[name].bundle.js'
  }
};