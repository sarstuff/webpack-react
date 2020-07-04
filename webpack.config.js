const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { GenerateSW, InjectManifest } = require("workbox-webpack-plugin");

module.exports = function (_env, argv) {
  const isProduction = argv.mode === "production";
  const isDevelopment = !isProduction;

  return {
    devtool: isDevelopment && "cheap-module-source-map",
    entry: "./src/index.js",
    output: {
      path: path.resolve(__dirname, "build"),
      filename: "assets/js/[name].js",
      // filename: "assets/js/[name].[contenthash:8].js",
      publicPath: "/",
    },
    resolve: {
      extensions: [".js", ".jsx"],
      alias: {
        "react-dom": "@hot-loader/react-dom",
      },
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          // loader: "babel-loader",
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              cacheDirectory: true,
              cacheCompression: false,
              envName: isProduction ? "production" : "development",
            },
          },
        },

        {
          test: /\.css$/,
          use: [isProduction ? MiniCssExtractPlugin.loader : "style-loader", "css-loader"],
        },
        {
          test: /\.(png|jpg|gif)$/i,
          use: {
            loader: "url-loader",
            options: {
              limit: 8192,
              name: "static/media/[name].[hash:8].[ext]",
            },
          },
        },
        {
          test: /\.svg$/,
          use: ["@svgr/webpack"],
        },
        {
          test: /\.(eot|otf|ttf|woff|woff2)$/,
          loader: require.resolve("file-loader"),
          options: {
            name: "static/media/[name].[hash:8].[ext]",
          },
        },
      ],
    },
    plugins: [
      isProduction && new CleanWebpackPlugin(),
      new MiniCssExtractPlugin({
        filename: "assets/css/[name].css",
        chunkFilename: "assets/css/[name].[contenthash:8].chunk.css",
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "src/index.html"),
        inject: true,
      }),
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(isProduction ? "production" : "development"),
      }),
      // new GenerateSW({
      //   include: [/\.html$/, /\.js$/, /\.css$/],
      //   exclude: ["/node_modules"],
      // }),
      new InjectManifest({
        swSrc: "./src/sw-config.js",
        swDest: "sw.js",
        maximumFileSizeToCacheInBytes: 9961472,
        // include: ["**/*.{html,js,css}"],
      }),
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, "src", "assets/images"),
            to: path.resolve(__dirname, "build", "assets/images"),
          },
          {
            from: path.resolve(__dirname, "src", "manifest.json"),
            to: path.resolve(__dirname, "build", "manifest.json"),
          },

          {
            from: path.resolve(__dirname, "src", "favicon.ico"),
            to: path.resolve(__dirname, "build", "favicon.ico"),
          },
        ],
      }),
    ].filter(Boolean),

    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserWebpackPlugin({
          terserOptions: {
            compress: {
              comparisons: false,
            },
            mangle: {
              safari10: true,
            },
            output: {
              comments: false,
              ascii_only: true,
            },
            warnings: false,
          },
        }),
        new OptimizeCssAssetsPlugin(),
      ],
      splitChunks: {
        chunks: "all",
        minSize: 0,
        maxInitialRequests: 10,
        maxAsyncRequests: 10,
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name(module, chunks, cacheGroupKey) {
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
              return `${cacheGroupKey}.${packageName.replace("@", "")}`;
            },
          },
          common: {
            minChunks: 2,
            priority: -10,
          },
        },
      },
      runtimeChunk: "single",
    },
    devServer: {
      compress: true,
      historyApiFallback: true,
      open: true,
      overlay: true,
      port: 3000,
      contentBase: "./src/",
    },
  };
};
