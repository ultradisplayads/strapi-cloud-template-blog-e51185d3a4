// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button
} from '@strapi/design-system';

// Available widget types with their display names
const AVAILABLE_WIDGETS = [
  { id: 'radio', name: 'Radio Widget', description: 'Live radio streaming', category: 'Media' },
  { id: 'weather', name: 'Weather Widget', description: 'Current weather and forecasts', category: 'Information' },
  { id: 'news', name: 'News Widget', description: 'Latest news articles', category: 'Information' },
  { id: 'events', name: 'Events Widget', description: 'Upcoming events calendar', category: 'Information' },
  { id: 'deals', name: 'Hot Deals Widget', description: 'Special offers and deals', category: 'Commerce' },
  { id: 'business', name: 'Business Spotlight', description: 'Featured business listings', category: 'Commerce' },
  { id: 'social', name: 'Social Feed Widget', description: 'Social media feeds', category: 'Media' },
  { id: 'traffic', name: 'Traffic Widget', description: 'Traffic updates and maps', category: 'Information' },
  { id: 'youtube', name: 'YouTube Widget', description: 'YouTube video feeds', category: 'Media' },
  { id: 'photos', name: 'Photo Gallery Widget', description: 'Photo gallery and images', category: 'Media' },
  { id: 'quick-links', name: 'Quick Links Widget', description: 'Quick navigation links', category: 'Navigation' },
  { id: 'trending', name: 'Trending Widget', description: 'Trending topics and content', category: 'Social' },
  { id: 'breaking-news', name: 'Breaking News Widget', description: 'Breaking news alerts', category: 'Information' },
  { id: 'live-events', name: 'Live Events Widget', description: 'Live event streaming', category: 'Media' },
  { id: 'currency-converter', name: 'Currency Converter', description: 'Currency exchange rates', category: 'Tools' },
  { id: 'google-reviews', name: 'Google Reviews', description: 'Business reviews and ratings', category: 'Commerce' },
  { id: 'flight-tracker', name: 'Flight Tracker', description: 'Flight information and tracking', category: 'Travel' },
  { id: 'restaurant', name: 'Restaurant Widget', description: 'Restaurant listings and menus', category: 'Commerce' },
  { id: 'movie', name: 'Movie Widget', description: 'Movie showtimes and information', category: 'Entertainment' },
  { id: 'travel', name: 'Travel Widget', description: 'Travel information and bookings', category: 'Travel' }
];

// Group widgets by category
const widgetsByCategory = AVAILABLE_WIDGETS.reduce((acc, widget) => {
  if (!acc[widget.category]) {
    acc[widget.category] = [];
  }
  acc[widget.category].push(widget);
  return acc;
}, {});

const WidgetSelectorField = ({ name, value, onChange, attribute }) => {
  const [selectedWidgets, setSelectedWidgets] = useState([]);

  useEffect(() => {
    // Initialize with current value
    if (value && Array.isArray(value)) {
      setSelectedWidgets(value);
    } else {
      setSelectedWidgets([]);
    }
  }, [value]);

  const handleWidgetToggle = (widgetId) => {
    const newSelection = selectedWidgets.includes(widgetId)
      ? selectedWidgets.filter(id => id !== widgetId)
      : [...selectedWidgets, widgetId];
    
    setSelectedWidgets(newSelection);
    onChange({ target: { name, value: newSelection } });
  };

  const handleSelectAll = () => {
    const allWidgetIds = AVAILABLE_WIDGETS.map(widget => widget.id);
    setSelectedWidgets(allWidgetIds);
    onChange({ target: { name, value: allWidgetIds } });
  };

  const handleSelectNone = () => {
    setSelectedWidgets([]);
    onChange({ target: { name, value: [] } });
  };

  const handleSelectPopular = () => {
    const popularWidgets = ['radio', 'weather', 'news', 'events', 'deals', 'photos', 'trending'];
    setSelectedWidgets(popularWidgets);
    onChange({ target: { name, value: popularWidgets } });
  };

  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 'bold' }}>
        Select Widgets for Sponsorship Display
      </h2>
      
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" onClick={handleSelectAll}>Select All</Button>
          <Button variant="secondary" onClick={handleSelectPopular}>Select Popular</Button>
          <Button variant="secondary" onClick={handleSelectNone}>Select None</Button>
        </div>
      </div>

      <hr style={{ marginBottom: '16px', border: '1px solid #e0e0e0' }} />

      <div>
        {Object.entries(widgetsByCategory).map(([category, widgets]) => (
          <div key={category} style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 'bold' }}>
              {category}
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '12px',
              marginLeft: '20px'
            }}>
              {widgets.map((widget) => (
                <div key={widget.id} style={{ 
                  padding: '12px', 
                  border: '1px solid #e0e0e0', 
                  borderRadius: '4px',
                  backgroundColor: '#f9f9f9'
                }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={selectedWidgets.includes(widget.id)}
                      onChange={() => handleWidgetToggle(widget.id)}
                      style={{ margin: 0, marginTop: '2px' }}
                    />
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                        {widget.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {widget.description}
                      </div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ 
        marginTop: '16px', 
        padding: '12px', 
        backgroundColor: '#f0f0f0', 
        borderRadius: '4px' 
      }}>
        <div style={{ fontSize: '14px', color: '#666' }}>
          <strong>Selected Widgets:</strong> {selectedWidgets.length} of {AVAILABLE_WIDGETS.length}
        </div>
        {selectedWidgets.length > 0 && (
          <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
            {selectedWidgets.join(', ')}
          </div>
        )}
      </div>
    </div>
  );
};

export default WidgetSelectorField;