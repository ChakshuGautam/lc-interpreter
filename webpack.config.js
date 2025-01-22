const path = require('path');

module.exports = {
    entry: './www/js/main.js',
    output: {
        path: path.resolve(__dirname, 'www'),
        filename: 'js/bundle.js'
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'www'),
        },
        compress: true,
        port: 9000,
        hot: true,
        watchFiles: ['www/**/*'],
        liveReload: true
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    }
}; 