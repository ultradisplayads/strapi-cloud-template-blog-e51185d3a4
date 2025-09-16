import WidgetSelector from './components/WidgetSelector';

export default {
  config: {
    // Replace the favicon
    head: {
      favicon: '/favicon.ico',
    },
    // Add a custom logo
    auth: {
      logo: '/logo.png',
    },
    // Override or extend the theme
    theme: {
      // overwrite light theme properties
      light: {
        colors: {
          primary100: '#f6ecfc',
          primary200: '#e0c1f4',
          primary500: '#ac73e6',
          primary600: '#9736e8',
          primary700: '#8312d1',
          danger700: '#b72b1a'
        },
      },
      // overwrite dark theme properties
      dark: {
        colors: {
          primary100: '#f6ecfc',
          primary200: '#e0c1f4',
          primary500: '#ac73e6',
          primary600: '#9736e8',
          primary700: '#8312d1',
          danger700: '#b72b1a'
        },
      },
    },
    // Extend the translations
    translations: {
      en: {
        'app.components.LeftMenu.navbrand.title': 'Pattaya Pulse CMS',
        'app.components.LeftMenu.navbrand.workplace': 'Admin Panel',
        'Auth.form.welcome.title': 'Welcome to Pattaya Pulse',
        'Auth.form.welcome.subtitle': 'Log in to your account',
      },
    },
    // Disable video tutorials
    tutorials: false,
    // Disable notifications about new Strapi releases
    notifications: { releases: false },
  },
  bootstrap(app) {
    console.log('Pattaya Pulse CMS Admin Panel Loaded');
    
    // Register custom field types
    app.addFields({
      type: 'widget-selector',
      Component: WidgetSelector,
    });
  },
};