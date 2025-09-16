import React from 'react';
import { useCMEditViewDataManager } from '@strapi/helper-plugin';
import WidgetSelectorField from '../../fields/widget-selector';

const ViewManager = () => {
  const { modifiedData, onChange } = useCMEditViewDataManager();

  // Override the sponsoredWidgets field rendering
  const handleWidgetChange = (value) => {
    onChange({
      target: {
        name: 'sponsoredWidgets',
        value: value
      }
    });
  };

  return (
    <div>
      {/* This will be injected into the edit view */}
      <style jsx>{`
        .widget-selector-override {
          margin: 20px 0;
        }
      `}</style>
      <div className="widget-selector-override">
        <WidgetSelectorField
          name="sponsoredWidgets"
          value={modifiedData.sponsoredWidgets || []}
          onChange={handleWidgetChange}
        />
      </div>
    </div>
  );
};

export default ViewManager;
