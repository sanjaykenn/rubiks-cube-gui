const HtmlWebpackPlugin = require("html-webpack-plugin");


module.exports = {
//	watch: true,
	plugins: [
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
