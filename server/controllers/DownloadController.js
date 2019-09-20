const send = require('koa-send');
const path = require('path');

module.exports = {
    async index(ctx, next) {
        const { fileName } = ctx.params;
        await send(ctx, fileName, { root: path.resolve(__dirname,  `../staticFile/`) });
    }
};
