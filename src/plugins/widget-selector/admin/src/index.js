export default {
  register(app) {
    // This function is called to load the plugin
    console.log('Widget Selector Plugin registered');
  },
  bootstrap(app) {
    // This function is called after all plugins have been loaded and the app is ready
    console.log('Widget Selector Plugin bootstrapped');
  },
};
