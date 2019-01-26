const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
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
    mode: 'development',
    devServer: {
        host: '0.0.0.0',
        hot: true,
        open: true,
        // hotOnly:true,
        contentBase: path.join(__dirname, 'dist'),
        // 告诉dev server监视dev server.contentbase选项提供的文件。
        // 默认情况下禁用。启用后，文件更改将触发整页重新加载。
        watchContentBase: true,
        // 当设置为true时，此选项将绕过主机检查。
        // 不建议这样做，因为不检查主机的应用程序容易受到DNS重新绑定攻击。
        disableHostCheck: true,
        // 打开Gzip压缩
        compress: true,
        // 当存在编译器错误或警告时，在浏览器中显示全屏覆盖。
        overlay: {
            warnings: true,
            errors: true
        },
        port: 8083,
        stats: 'errors-only',
        // before: function (app, server) {
        //     app.get('/', (req, res) => {
        //         var resHtml = `<!DOCTYPE html>
        //         <html lang="en">
        //         <head>
        //             <meta charset="UTF-8">
        //             <title>index</title>
        //         </head>
        //         <body>
        //             <ul>`;
                
        //             resHtml += `<li><a href="page/index.html">pages/index.html</a></li>`;
                
        //         resHtml += `</ul>
        //         </body>
        //         </html>`;
        //         res.send(resHtml);
        //     });
        //     const chokidar = require('chokidar');
        //     const files = [path.join(__dirname, 'src/tpl/**/*.ejs')];
        //     const options = {
        //         followSymlinks: false,
        //         depth: 5
        //     };
        //     let watcher = chokidar.watch(files, options);
        //     watcher.on('all', _ => {
        //         server.sockWrite(server.sockets, 'content-changed');
        //     });
        // }
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
                include: resolvePath('src'),
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
            filename: "css/[name].css"
        }),
        // HMR 热替换
        new webpack.HotModuleReplacementPlugin(), 
        // 此插件将导致启用HMR时显示模块的相对路径， 默认就有，不用加
        // new webpack.NamedModulesPlugin(), 
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