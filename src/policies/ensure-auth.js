'use strict';

module.exports = async (ctx, next) => {
  if (!ctx.state.user) {
    return ctx.unauthorized('Login required');
  }
  await next();
};


