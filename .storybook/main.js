module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  staticDirs: ["../public"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-actions"
  ],
  framework: "@storybook/vue3",
  core: {
    builder: "@storybook/builder-vite"
  },
  features: {
    interactionsDebugger: true
  },
  async viteFinal(config) {
    return {
      ...config,
      define: {
        ...config.define,
        global: "window"
      },
      esbuild: {
        ...config.esbuild
        //jsxInject: `import React from 'react'`,
      }
    };
  }
};
