/* eslint-disable spaced-comment */
/// <reference types="@types/node" />
/// <reference types="@types/webpack-dev-server" />
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { join } from 'path';
import { ProvidePlugin, Configuration } from 'webpack';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

const config: Configuration = {
    mode: 'development',
    entry: './src/ui/index.tsx',
    output: {
        filename: 'bundle.js',
        path: join(__dirname, '/../dist')
    },
    devServer: {
        port: 3000,
        compress: true,
        historyApiFallback: true
    },
    devtool: 'source-map',
    plugins: [
        new ForkTsCheckerWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './src/ui/app.ejs',
            meta: {
                viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no'
            }
        }),
        new ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
            // http: 'stream-http',
            // https: 'https-browserify',
            // os: 'os-browserify/browser',
            process: 'process/browser'
            // vm: 'vm-browserify'
        })
    ],
    module: {
        rules: [
            {
                test: /\.(css)$/,
                use: [
                    {
                        loader: 'style-loader' // creates style nodes from JS strings
                    },
                    {
                        loader: 'css-loader' // translates CSS into CommonJS
                    }
                ]
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192
                        }
                    }
                ]
            },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { enforce: 'pre', test: /\.js\.map$/, loader: 'source-map-loader' },

            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                    configFile: 'tsconfig.build.json',
                    projectReferences: true,
                    transpileOnly: true
                }
            }
        ]
    },
    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: ['.ts', '.tsx', '.js', '.json'],
        fallback: {
            assert: require.resolve('assert'),
            crypto: require.resolve('crypto-browserify'),
            fs: false,
            http: require.resolve('stream-http'),
            https: require.resolve('https-browserify'),
            os: require.resolve('os-browserify/browser'),
            process: require.resolve('process/browser'),
            stream: require.resolve('stream-browserify'),
            vm: require.resolve('vm-browserify')
        }
    }
};

export default config;
