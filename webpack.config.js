const webpack = require('webpack');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('config.json'));
const configGUI = config?.gui

const rubiksCube = require('./src/rubiks-cube/rubiks-cube').createRubiksCube(config.rubiksCube);

module.exports = {
	plugins: [
		new webpack.DefinePlugin({
			rubiksCube,
			configGUI,
		})
	]
};
