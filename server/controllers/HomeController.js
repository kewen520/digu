module.exports = {
  async index(ctx, next) {
    const homeData = await ctx.service.TestService.homeData();
    ctx.body = `this is home index.${homeData}`;
  }
};
