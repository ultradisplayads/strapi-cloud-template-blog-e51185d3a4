import WidgetSelector from '../../components/WidgetSelector';

export default {
  register(app) {
    app.addFields({ type: 'widget-selector', Component: WidgetSelector });
  },
  bootstrap(app) {
    console.log('Widget Selector plugin loaded');
  },
};
