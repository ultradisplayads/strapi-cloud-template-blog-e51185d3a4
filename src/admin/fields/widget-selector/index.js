import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  FormControl, 
  FormGroup, 
  FormControlLabel, 
  Checkbox,
  Grid,
  Paper,
  Divider,
  Button,
  ButtonGroup
} from '@strapi/design-system';

// Available widget types with their display names
const AVAILABLE_WIDGETS = [
  { id: 'radio', name: 'Radio Widget', description: 'Live radio streaming' },
  { id: 'weather', name: 'Weather Widget', description: 'Current weather and forecasts' },
  { id: 'news', name: 'News Widget', description: 'Latest news articles' },
  { id: 'events', name: 'Events Widget', description: 'Upcoming events calendar' },
  { id: 'deals', name: 'Hot Deals Widget', description: 'Special offers and deals' },
  { id: 'business', name: 'Business Spotlight', description: 'Featured business listings' },
  { id: 'social', name: 'Social Feed Widget', description: 'Social media feeds' },
  { id: 'traffic', name: 'Traffic Widget', description: 'Traffic updates and maps' },
  { id: 'youtube', name: 'YouTube Widget', description: 'YouTube video feeds' },
  { id: 'photos', name: 'Photo Gallery Widget', description: 'Photo gallery and images' },
  { id: 'quick-links', name: 'Quick Links Widget', description: 'Quick navigation links' },
  { id: 'trending', name: 'Trending Widget', description: 'Trending topics and content' },
  { id: 'breaking-news', name: 'Breaking News Widget', description: 'Breaking news alerts' },
  { id: 'live-events', name: 'Live Events Widget', description: 'Live event streaming' },
  { id: 'currency-converter', name: 'Currency Converter', description: 'Currency exchange rates' },
  { id: 'google-reviews', name: 'Google Reviews', description: 'Business reviews and ratings' },
  { id: 'flight-tracker', name: 'Flight Tracker', description: 'Flight information and tracking' },
  { id: 'restaurant', name: 'Restaurant Widget', description: 'Restaurant listings and menus' },
  { id: 'movie', name: 'Movie Widget', description: 'Movie showtimes and information' },
  { id: 'travel', name: 'Travel Widget', description: 'Travel information and bookings' }
];

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
    <Box>
      <Typography variant="beta" marginBottom={4}>
        Select Widgets for Sponsorship Display
      </Typography>
      
      <Box marginBottom={4}>
        <ButtonGroup>
          <Button variant="secondary" onClick={handleSelectAll}>
            Select All
          </Button>
          <Button variant="secondary" onClick={handleSelectPopular}>
            Select Popular
          </Button>
          <Button variant="secondary" onClick={handleSelectNone}>
            Select None
          </Button>
        </ButtonGroup>
      </Box>

      <Divider marginBottom={4} />

      <Grid gap={3}>
        {AVAILABLE_WIDGETS.map((widget) => (
          <Grid.Item key={widget.id} col={6} s={12} xs={12}>
            <Paper padding={3} hasRadius>
              <FormControl>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedWidgets.includes(widget.id)}
                        onChange={() => handleWidgetToggle(widget.id)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="pi" fontWeight="bold">
                          {widget.name}
                        </Typography>
                        <Typography variant="pi" textColor="neutral600">
                          {widget.description}
                        </Typography>
                      </Box>
                    }
                  />
                </FormGroup>
              </FormControl>
            </Paper>
          </Grid.Item>
        ))}
      </Grid>

      <Box marginTop={4} padding={3} background="neutral100" hasRadius>
        <Typography variant="pi" textColor="neutral600">
          <strong>Selected Widgets:</strong> {selectedWidgets.length} of {AVAILABLE_WIDGETS.length}
        </Typography>
        {selectedWidgets.length > 0 && (
          <Typography variant="pi" textColor="neutral600" marginTop={2}>
            {selectedWidgets.join(', ')}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default WidgetSelectorField;
