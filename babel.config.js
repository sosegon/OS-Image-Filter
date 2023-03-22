const path = require("path");

module.exports = {
  presets: ["@babel/preset-env", "@babel/preset-react"],
  plugins: [
    [
      "babel-plugin-module-resolver",
      {
        alias: {
          Components: path.resolve(__dirname, "./src/js/content/components"),
        },
      },
    ],
  ],
};