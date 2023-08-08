const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');

// const { WebWorkerPlugin } = require('@shopify/web-worker/webpack');

//const WebWorkerPlugin = require('worker-plugin');

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), withReact(), (config) => {
  // Update the webpack config as needed here.
  // e.g. `config.plugins.push(new MyPlugin())`

  config.output = {
    ...config.output,
    publicPath: 'auto',
    scriptType: 'text/javascript',
  };

  //config.plugins.unshift(new WebWorkerPlugin());
  return config;
});
