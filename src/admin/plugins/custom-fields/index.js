import WidgetSelectorField from '../../fields/widget-selector';

export default {
  register(app) {
    // Register custom field types
    app.addFields({
      type: 'widget-selector',
      Component: WidgetSelectorField,
    });
  },
  bootstrap(app) {
    console.log('Custom fields plugin loaded');
  },
};
