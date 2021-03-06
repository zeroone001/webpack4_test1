const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const argv = require('yargs').argv;
const CopyWebpackPlugin = require('copy-webpack-plugin');       
const WebpackManifestPlugin = require('webpack-manifest-plugin');    
const HappyPack = require('happypack');           
const os = require('os'); 
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
// const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');

const resolvePath = (_src) => {
    return path.resolve(__dirname, './', _src);
}
const resolve = dir => path.join(__dirname, './', dir);
// console.log('resolve:', resolve('src'));
let idProduction = argv.mode === 'production';
let prodConfig = {
    entry: {
        index: './src/js/index.js',
        haojia: './src/js/haojia.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'js/[name].[chunkhash:7].js',
        publicPath: '../'
    }, 
    devtool: idProduction ? '' : 'source-map',
    stats: {
        colors: true
    },
    // 新的公共代码抽取工具
    // uglifyjs-webpack-plugin 是依赖于uglify-js@3 的，compress配置可以在这里查到
    // uglifyjs-webpack-plugin 里面有些配置写的不是很清楚 
    optimization: {
        minimizer: [
            // new OptimizeCssAssetsPlugin({})
            
            /*new ParallelUglifyPlugin({
                uglifyJS: {
                    output: {
                      // 最紧凑的输出
                      beautify: false,
                      // 删除所有的注释
                      comments: false,
                    },
                    compress: {
                      // 在UglifyJs删除没有用到的代码时不输出警告
                      warnings: false,
                      // 删除所有的 `console` 语句，可以兼容ie浏览器
                      drop_console: true,
                      // 内嵌定义了但是只用到一次的变量
                      collapse_vars: true,
                      // 提取出出现多次但是没有定义成变量去引用的静态值
                      reduce_vars: true,
                      unused: false
                    }
                },
            })*/
        ],
        // webpack4移除了CommonsChunkPlugin插件，取而代之的是splitChunks
        splitChunks: {
            chunks: 'all',
            minSize: 1,
            maxSize: 0,
            minChunks: 1,
            // 按需加载时并行请求的最大数目。
            // maxAsyncRequests（最大的异步请求数）和maxInitialRequests（最大的初始请求数）
            // 这两个参数则是为了限制代码块划分的过于细致，导致大量的文件请求。
            maxAsyncRequests: 5,
            maxInitialRequests: 2,
            name: false,
            cacheGroups: {
                commons: {
                    name: 'commons',
                    minChunks: 2,
                    // 这个配置允许我们使用已经存在的代码块
                    reuseExistingChunk: true,
                    priority: -10
                },
                // commonsCss: {
                //     name: 'commons',
                //     minChunks: 2,
                //     reuseExistingChunk: true,
                //     priority: -20
                // }
            }
        },
        // 将webpack生成的 runtime 作为独立 chunk ，
        // runtime包含在模块交互时，模块所需的加载和解析逻辑（manifest）
        runtimeChunk: {
            name: 'manifest'
        }
    },
    resolve: {
        alias: {
            js: resolvePath('src/js'),
            css: resolvePath('src/css'),
            img: resolvePath('src/img')
        },
        extensions: ['.js', '.json', '.css'],
        modules: [
            resolve('src'),
            resolve('node_modules')
        ]
    },
    module: {
        rules: [
            // {
            //     test: /\.js$/,
            //     exclude: /node_modules/,
            //     use: {
            //         loader: "babel-loader"
            //     }
            // },
            
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
                            name: 'img/[name].[ext]',
                            publicPath: 'https://res.smzdm.com/mobile/wap_v2/dist'
                        }
                    }
                ]

            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'happypack/loader?id=jsbabel'
            }
        ]
    },
    plugins: [
        // 注意这里不能写[hash]，否则无法实现热跟新 filename: "css/[name].[contenthash:7].css"
        new MiniCssExtractPlugin({
            filename: "css/[name].[contenthash:7].css"
        }),
        // 压缩CSS
        new OptimizeCssAssetsPlugin({
            assetNameRegExp: /\.css$/g, // 这个不加也可以，默认就是这个
            cssProcessor: require('cssnano'),
            cssProcessorPluginOptions: {
                preset: ['default', { discardComments: { removeAll: true } }],
            },
            canPrint: true
        }),
        // 将单个文件或整个目录复制到生成目录
        new CopyWebpackPlugin([
            {
                from: path.join(__dirname, 'src/img'),
                to: 'img'
            }
        ],{}),
        new WebpackManifestPlugin({
            publicPath: '',
            filter: function (FileDescriptor) {
                return FileDescriptor.isChunk;
            }
        }),
        new HtmlWebpackPlugin({
            template: resolvePath('src/tpl/index.html'),
            filename: resolvePath('dist/page/index.html'),
            chunks: ['manifest','commons', 'index'],
            chunksSortMode: 'dependency'
        }),
        new HtmlWebpackPlugin({
            template: resolvePath('src/tpl/haojia.html'),
            filename: resolvePath('dist/page/haojia.html'),
            chunks: ['manifest','commons','haojia'],
            chunksSortMode: 'dependency'
        }),
        new HappyPack({
            id: 'jsbabel',
            loaders: [
            {
                loader: 'babel-loader?cacheDirectory=true'
            }],
            threadPool: happyThreadPool
            // verbose: true 默认就是true不需要加
        }),
        

    ]
};
if (idProduction) {
    prodConfig.optimization.minimizer = [
        // new UglifyJsPlugin()，这个插件我们可以在optimize中配置，效果是一样的
        new UglifyJsPlugin({
            test: /\.js(\?.*)?$/i,
            cache: true,
            // 使用多进程并行运行来提高构建速度。默认并发运行数
            parallel: true,
            uglifyOptions: {
                compress:{
                    drop_console: true,
                    drop_debugger: true, // 默认就是true
                    // 已经压缩过的代码，不再压缩，特别是echarts
                    unused: false
                }
            }
        })
    ];
}

module.exports = prodConfig;