// @ts-nocheck
import React from 'react';
import { useCMEditViewDataManager } from '@strapi/helper-plugin';
import WidgetSelectorField from '../../components/WidgetSelectorField';

// Custom field components for specific content types
export const CustomFieldComponents = {
  'api::global-sponsorship.global-sponsorship': {
    sponsoredWidgets: (props) => {
      const { modifiedData, onChange } = useCMEditViewDataManager();
      
      return (
        <WidgetSelectorField
          {...props}
          name="sponsoredWidgets"
          value={modifiedData.sponsoredWidgets || []}
          onChange={(e) => onChange({
            target: {
              name: 'sponsoredWidgets',
              value: e.target.value
            }
          })}
        />
      );
    }
  }
};

// Function to get custom field component
export const getCustomFieldComponent = (contentType, fieldName) => {
  if (CustomFieldComponents[contentType] && CustomFieldComponents[contentType][fieldName]) {
    return CustomFieldComponents[contentType][fieldName];
  }
  return null;
};


