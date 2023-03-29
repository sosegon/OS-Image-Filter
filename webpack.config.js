// webpack.config.js
const fs = require('fs');
const path = require('path');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const packageJson = require('./package.json');

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';

  return {
    entry: {
      index: './src/js/content/index.jsx',
      background: './src/js/background.js',
    },
    output: {
      path: path.resolve(
        __dirname,
        isDevelopment ? 'dev-simple-segmentation' : 'dist',
      ),
      filename: pathData => {
        const { chunk } = pathData;
        return chunk.name === 'index' ? 'js/content/[name].js' : 'js/[name].js';
      },
    },
    devtool: isDevelopment ? 'inline-source-map' : 'source-map',
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              configFile: path.resolve(__dirname, 'babel.config.js'),
            },
          },
        },
        {
          test: /\.png$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]',
                outputPath: 'images',
              },
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx'],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new CopyWebpackPlugin({
        patterns: [{ from: './src/images', to: 'images' }],
      }),
      new WebpackManifestPlugin({
        fileName: 'manifest.json',
        generate: (seed, files) => {
          const manifestPath = path.resolve(__dirname, 'src/manifest.json');
          const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
          return {
            ...manifest,
            name: `${packageJson.name}-simple-segmentation`,
            short_name: `${packageJson.short_name}SIMPLESEGMENTATION`,
            description: packageJson.description,
            version: packageJson.version,
            content_scripts: [
              {
                matches: ['<all_urls>'],
                js: files
                  .filter(
                    file =>
                      file.name.endsWith('.js') &&
                      file.path.includes('content'),
                  )
                  .map(file => `./js/content/${file.name}`),
                run_at: 'document_start',
                all_frames: true,
              },
            ],
          };
        },
      }),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'dev'),
      },
      hot: true,
    },
  };
};
