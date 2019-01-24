const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const argv = require('yargs').argv;
const resolvePath = (_src) => {
    return path.resolve(__dirname, './', _src);
}
let _mode = argv.mode === 'production'
module.exports = {
    entry: {
        index: './src/js/index.js',
        haojia: './src/js/haojia.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'js/[name].[hash:7].js',
        publicPath: '/'
    }, 
    devtool: _mode ? '' : 'source-map',
    stats: {
        colors: true
    },
   
    resolve: {
        alias: {
            js: resolvePath('src/js'),
            css: resolvePath('src/css'),
            img: resolvePath('src/img')
        },
        extensions: ['.js', '.json', '.css']
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.(c|sa|sc)ss$/,
                exclude: /node_modules/,
                use: [
                    'css-hot-loader',
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: () => [
                                require('autoprefixer')({
                                    'browsers': ['> 1%', 'last 10 versions']
                                })
                            ]

                        }
                    },
                    'sass-loader'
                ]
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: "html-loader",
                        options: {
                            minimize: true
                        }
                    }
                ]
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            name: 'img/[name].[hash:7].[ext]',
                            publicPath: 'https://res.smzdm.com/mobile/wap_v2/dist'
                        }
                    }
                ]

            }
        ]
    },
    plugins: [
        // 注意这里不能写[hash]，否则无法实现热跟新 filename: "css/[name].[contenthash:7].css"
        new MiniCssExtractPlugin({
            filename: "css/[name].[contenthash:7].css"
        }),
       
        new HtmlWebpackPlugin({
            template: resolvePath('src/tpl/index.html'),
            filename: resolvePath('dist/page/index.html'),
            chunks: ['index'],
            chunksSortMode: 'dependency'
        }),
        new HtmlWebpackPlugin({
            template: resolvePath('src/tpl/haojia.html'),
            filename: resolvePath('dist/page/haojia.html'),
            chunks: ['haojia'],
            chunksSortMode: 'dependency'
        })
        

    ]
}