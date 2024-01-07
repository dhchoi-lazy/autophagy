module.exports = {
  // ... other configurations

  module: {
    rules: [
      {
        test: /\.js$/,
        use: ["source-map-loader"],
        enforce: "pre",
        exclude: /node_modules\/@cosmograph\/ui/, // Exclude the problematic package
      },
      // ... other rules
    ],
  },
};
