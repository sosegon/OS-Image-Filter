// webpack.config.js
const packageJson = require("./package.json");
const fs = require("fs");
const path = require("path");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === "development";

  return {
    entry: {
      index: "./src/js/content/index.js",
      popup: "./src/js/popup.js",
      options: "./src/js/options.js",
      background: "./src/js/background.js",
    },
    output: {
      path: path.resolve(__dirname, isDevelopment ? "dev" : "dist"),
      filename: (pathData) => {
        const { chunk } = pathData;
        return chunk.name === "index" ? "js/content/[name].js" : "js/[name].js";
      },
    },
    devtool: isDevelopment ? "inline-source-map" : "source-map",
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        },
        {
          test: /\.png$/,
          use: [
            {
              loader: "file-loader",
              options: {
                name: "[name].[ext]",
                outputPath: "images",
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: "./src/popup.htm",
        filename: "popup.htm",
        chunks: ["popup"],
      }),
      new HtmlWebpackPlugin({
        template: "./src/options.htm",
        filename: "options.htm",
        chunks: ["options"],
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: "./src/images", to: "images" },
        ],
      }),
      new WebpackManifestPlugin({
        fileName: "manifest.json",
        generate: (seed, files) => {
          const manifestPath = path.resolve(__dirname, "src/manifest.json");
          const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
          return {
            ...manifest,
            name: packageJson.name,
            short_name: packageJson.short_name,
            description: packageJson.description,
            version: packageJson.version,
            content_scripts: [
              {
                matches: ["<all_urls>"],
                js: files
                  .filter((file) => file.name.endsWith(".js") && file.path.includes("content"))
                  .map((file) => `./js/content/${file.name}`),
                run_at: "document_start",
                all_frames: true,
              },
            ],
          };
        },
      }),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, "dev"),
      },
      hot: true,
    },
  };
};
