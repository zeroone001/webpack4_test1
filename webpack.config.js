const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
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
        filename: 'js/[name].[chunkhash:7].js',
        publicPath: 'https://res.smzdm.com/mobile/wap_v2/dist/'
    }, 
    devtool: _mode ? '' : 'source-map',
    stats: {
        colors: true
    },
    devServer: {
        host: '0.0.0.0',
        hot: true,
        // contentBase: path.join(__dirname, 'dist'),
        watchContentBase: true,
        disableHostCheck: true,
        compress: true,
        overlay: {
            warnings: true,
            errors: true
        },
        stats: {
            colors: true,
            chunks: false,
            children: false,
            entrypoints: false,
            modules: false
        },
        before: function (app, server) {
            app.get('/', (req, res) => {
                var resHtml = `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>index</title>
                </head>
                <body>
                    <ul>`;
                
                    resHtml += `<li><a href="page/index.html">pages/index.html</a></li>`;
                
                resHtml += `</ul>
                </body>
                </html>`;
                res.send(resHtml);
            });
            const chokidar = require('chokidar');
            const files = [path.join(__dirname, 'src/tpl/**/*.ejs')];
            const options = {
                followSymlinks: false,
                depth: 5
            };
            let watcher = chokidar.watch(files, options);
            watcher.on('all', _ => {
                server.sockWrite(server.sockets, 'content-changed');
            });
        }
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
                use: [
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
                    }
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
        new MiniCssExtractPlugin({
            filename: "css/[name].[contenthash:7].css"
        }),
        new HtmlWebpackPlugin({
            template: resolvePath('src/tpl/index.html'),
            filename: './page/index.html',
            chunks: ['index'],
            chunksSortMode: 'dependency'
        }),
        new HtmlWebpackPlugin({
            template: resolvePath('src/tpl/haojia.html'),
            filename: './page/haojia.html',
            chunks: ['haojia'],
            chunksSortMode: 'dependency'
        })
        

    ]
}