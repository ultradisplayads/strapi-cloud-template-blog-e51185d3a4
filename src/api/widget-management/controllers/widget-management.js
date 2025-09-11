'use strict';

/**
 * widget-management controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::widget-management.widget-management', ({ strapi }) => ({
  // Get all widgets with admin controls
  async find(ctx) {
    try {
      const { data, meta } = await super.find(ctx);
      
      // Transform data to include admin control information
      const transformedData = data.map(widget => ({
        ...widget,
        adminControls: widget.adminControls || {
          allowUserResizing: true,
          allowUserMoving: true,
          isMandatory: false,
          canBeDeleted: true,
          isLocked: false
        }
      }));

      return { data: transformedData, meta };
    } catch (error) {
      ctx.throw(400, error.message);
    }
  },

  // Get widget by type
  async findByType(ctx) {
    try {
      const { widgetType } = ctx.params;
      
      const widget = await strapi.entityService.findMany('api::widget-management.widget-management', {
        filters: { widgetType },
        populate: ['adminControls', 'defaultPosition', 'defaultSize', 'sponsorshipSettings']
      });

      if (!widget || widget.length === 0) {
        return ctx.notFound('Widget type not found');
      }

      ctx.body = { data: widget[0] };
    } catch (error) {
      ctx.throw(400, error.message);
    }
  },

  // Get widgets by category
  async findByCategory(ctx) {
    try {
      const { category } = ctx.params;
      
      const widgets = await strapi.entityService.findMany('api::widget-management.widget-management', {
        filters: { category },
        populate: ['adminControls', 'defaultPosition', 'defaultSize', 'sponsorshipSettings']
      });

      ctx.body = { data: widgets };
    } catch (error) {
      ctx.throw(400, error.message);
    }
  },

  // Get mandatory widgets only
  async getMandatoryWidgets(ctx) {
    try {
      const widgets = await strapi.entityService.findMany('api::widget-management.widget-management', {
        filters: {
          adminControls: {
            isMandatory: true
          }
        },
        populate: ['adminControls', 'defaultPosition', 'defaultSize']
      });

      ctx.body = { data: widgets };
    } catch (error) {
      ctx.throw(400, error.message);
    }
  },

  // Get deletable widgets only
  async getDeletableWidgets(ctx) {
    try {
      const widgets = await strapi.entityService.findMany('api::widget-management.widget-management', {
        filters: {
          adminControls: {
            canBeDeleted: true
          }
        },
        populate: ['adminControls', 'defaultPosition', 'defaultSize']
      });

      ctx.body = { data: widgets };
    } catch (error) {
      ctx.throw(400, error.message);
    }
  },

  // Update admin controls for a widget
  async updateAdminControls(ctx) {
    try {
      const { id } = ctx.params;
      const { adminControls } = ctx.request.body.data;

      // Check if user is admin
      const user = ctx.state.user;
      if (!user || user.role?.type !== 'administrator') {
        return ctx.forbidden('Admin access required');
      }

      const widget = await strapi.entityService.update('api::widget-management.widget-management', id, {
        data: {
          adminControls,
          lastModified: new Date()
        }
      });

      ctx.body = { data: widget, message: 'Admin controls updated successfully' };
    } catch (error) {
      ctx.throw(400, error.message);
    }
  },

  // Bulk update admin controls
  async bulkUpdateAdminControls(ctx) {
    try {
      const { widgetUpdates } = ctx.request.body.data;

      // Check if user is admin
      const user = ctx.state.user;
      if (!user || user.role?.type !== 'administrator') {
        return ctx.forbidden('Admin access required');
      }

      const updatedWidgets = [];

      for (const update of widgetUpdates) {
        const widget = await strapi.entityService.update('api::widget-management.widget-management', update.id, {
          data: {
            adminControls: update.adminControls,
            lastModified: new Date()
          }
        });
        updatedWidgets.push(widget);
      }

      ctx.body = { data: updatedWidgets, message: 'Bulk admin controls updated successfully' };
    } catch (error) {
      ctx.throw(400, error.message);
    }
  },

  // Get widget permissions summary
  async getPermissionsSummary(ctx) {
    try {
      const widgets = await strapi.entityService.findMany('api::widget-management.widget-management', {
        populate: ['adminControls']
      });

      const summary = {
        total: widgets.length,
        mandatory: widgets.filter(w => w.adminControls?.isMandatory).length,
        deletable: widgets.filter(w => w.adminControls?.canBeDeleted).length,
        resizable: widgets.filter(w => w.adminControls?.allowUserResizing).length,
        movable: widgets.filter(w => w.adminControls?.allowUserMoving).length,
        locked: widgets.filter(w => w.adminControls?.isLocked).length,
        byCategory: {}
      };

      // Group by category
      widgets.forEach(widget => {
        const category = widget.category || 'uncategorized';
        if (!summary.byCategory[category]) {
          summary.byCategory[category] = {
            total: 0,
            mandatory: 0,
            deletable: 0
          };
        }
        summary.byCategory[category].total++;
        if (widget.adminControls?.isMandatory) summary.byCategory[category].mandatory++;
        if (widget.adminControls?.canBeDeleted) summary.byCategory[category].deletable++;
      });

      ctx.body = { data: summary };
    } catch (error) {
      ctx.throw(400, error.message);
    }
  }
}));
