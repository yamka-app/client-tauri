import path from 'path'
import webpack from 'webpack'

import PurgecssPlugin from 'purgecss-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import glob from 'glob'
import HtmlWebpackPlugin from 'html-webpack-plugin'


export default function(_, argv): webpack.Configuration[] {
	if (argv.production && argv.dev) {
		throw new Error('Cannot pass the --dev and --production flags!')
	}

	const isProd = !!argv.production
	const outputPath = path.resolve(__dirname, 'dist')
	const outputHtmlFilename = 'index.html'

	const createConfig = (projectName) => {
		const config: webpack.Configuration = {
			devtool: isProd ? false : 'source-map',
			mode: 'none',
			entry: {
				[projectName]: path.resolve(__dirname, 'src/ts/index.tsx')
			},
			output: {
				path: outputPath,
				filename: '[name].js',
			},
			module: {
				rules: [
					{
						test: /css\/.*\.css$/i,
						exclude: /node_modules/,
						use: ['style-loader', 'css-loader', 'postcss-loader']
					},
					{
						test: /theme\/.*\.css$/i,
						exclude: /node_modules/,
						loader: 'raw-loader',
					},
					{
						test: /\.tsx?$/i,
						use: ['babel-loader'],
						exclude: [/node_modules/]
					},
					{
						test: /\.(png|jpe?g|gif)$/i,
						exclude: /node_modules/,
						loader: 'file-loader',
						options: {
							name: 'icons/[name].[ext]'
						}
					},
					{
						test: /\.(ttf|woff2)$/i,
						exclude: /node_modules/,
						loader: 'file-loader',
						options: {
							name: 'fonts/[name].[ext]'
						}
					}
				]
			},
			resolve: {
				extensions: ['.js', '.jsx', '.ts', '.tsx']
			},
			plugins: [
				new PurgecssPlugin({
					paths: glob.sync(`../dist/${projectName}/*`)
				}),
				new HtmlWebpackPlugin({
					filename: outputHtmlFilename,
					template: path.resolve(__dirname, 'src/template.html'),
					minify: isProd
						? {
								collapseWhitespace: true,
								removeComments: true
							}
						: false
				}),
				new webpack.DefinePlugin({
					"process.env": {
						NODE_ENV: "\"production\""
					}
				})
			]
		}

		if (isProd) {
			config.mode = 'production'
			config.optimization = {
				minimizer: [new TerserPlugin()],
			}
		}

		return config
	}

	const outputConfigs = [
		createConfig('app')	
	]

	// Tack on the webserver to the first one...
	if(!isProd) {
		outputConfigs[0].devServer = {
			static: {
				directory: path.join(__dirname, 'dist'),
				watch: true
			},
			compress: true,
			port: 9090
		}
	}

	return outputConfigs
}
