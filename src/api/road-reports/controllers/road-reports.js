'use strict';

module.exports = {
  async submit(ctx) {
    try {
      const { report_type, location, description } = ctx.request.body || {};
      if (!report_type || !location) {
        ctx.status = 400;
        ctx.body = { error: 'report_type and location are required' };
        return;
      }

      const userId = ctx.state.user?.id || null;
      const now = new Date().toISOString();
      //@ts-ignore
      const created = await strapi.entityService.create('api::road-report.road-report', {
        data: {
          ReportType: report_type,
          Location: location,
          Description: description || '',
          Status: 'pending',
          SubmittedAt: now,
          User: userId ? userId : undefined,
        },
      });

      ctx.body = { success: true, data: created };
    } catch (err) {
      ctx.status = 500;
      ctx.body = { error: 'Failed to submit road report' };
    }
  },
};


