const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {

    entry: {
        popup: './src/popup/popup.ts',
        background: './src/background.ts',
        content: './src/content/content.ts'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: 'public' },
                { from: 'src/popup/popup.html', to: 'popup.html' },
                { from: 'src/popup/popup.css', to: 'popup.css' },
                { from: 'src/popup/all.min.css', to: 'all.min.css' },
            ],
        }),
    ],
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
    },
};
