const webpack = require('webpack');
const config = require('./config.json')
const uv = require('./uv.json')
const HtmlWebpackPlugin = require("html-webpack-plugin");

const configGUI = config?.gui;
const configWebsocket = config?.websocket;

const rubiksCube = require('./src/rubiks-cube/rubiks-cube').createRubiksCube(config.rubiksCube);


module.exports = {
	plugins: [
		new webpack.DefinePlugin({
			rubiksCube,
			configGUI,
			uv,
			configWebsocket
		}),
		new HtmlWebpackPlugin({
			template: 'src/index.html'
		})
	],
	module: {
		rules: [
			{
				test: /\.s[ac]ss$/i,
				use: [
					'style-loader',
					'css-loader',
					'sass-loader',
				],
			},
		],
	}
};
