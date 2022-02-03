const webpack = require('webpack');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('config.json'));
const configGUI = config?.gui;

const uv = JSON.parse(fs.readFileSync('uv.json'));

const rubiksCube = require('./src/rubiks-cube/rubiks-cube').createRubiksCube(config.rubiksCube);

module.exports = {
	plugins: [
		new webpack.DefinePlugin({
			rubiksCube,
			configGUI,
			uv
		})
	],
	module: {
		rules: [
			{
				test: /\.s[ac]ss$/i,
				use: [
					"style-loader",
					"css-loader",
					"sass-loader",
				],
			},
		],
	}
};
