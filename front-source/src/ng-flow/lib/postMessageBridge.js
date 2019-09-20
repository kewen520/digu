// postMessage的桥接

const target = parent;

function makeId(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

/**
 * post message
 * @param controller
 * @param action
 * @param params
 */
function postMessage(controller, action ='', params = {}) {
    return new Promise((resolve, reject) => {
        if (typeof controller !== 'string' || !controller) {
            reject('controller必须传');
        }
        const randomId = makeId(32);
        target.postMessage({
            controller,
            action,
            params,
            randomId,
        }, '*');

        const event = window.addEventListener("message", e => {
            const data = e.data;
            if (controller === data.controller && action === data.action && randomId === data.randomId) {
                window.removeEventListener('message', event);
                resolve(data.params);
            }
        }, false);
    })
}

/**
 * 话术流程的数据模型
 * @type {{get: (function(): Promise), set: (function(*))}}
 */
export const flow = {
    async get() {
        return await postMessage('flow', 'get');
    },

    async set(xml) {
        return await postMessage('flow', 'set', { xml })
    },
};

/**
 * 回退流程视图
 */
export const backToFlow = () => {
    postMessage('backToFlow')
};

/**
 * 处理话术允许挂机转人工
 * @type {{get: (function(): Promise), set: (function(*))}}
 */
export const handleArtificialChange = {
    async get() {
        return await postMessage('handleArtificialChange', 'get');
    },

    set(val) {
        postMessage('handleArtificialChange', 'set', { val })
    },
};

/**
 * 切换人工意图类型
 * @type {{get: (function(): Promise), set: (function(*))}}
 */
export const handleArtificialIntentionChange = {
    async get() {
        return await postMessage('handleArtificialIntentionChange', 'get');
    },

    set(val) {
        postMessage('handleArtificialIntentionChange', 'set', { val })
    },
};

export const handleInterruptChange = {
    async get() {
        return await postMessage('handleInterruptChange', 'get');
    },

    set(val) {
        postMessage('handleInterruptChange', 'set', { val })
    },
};

/**
 * mxResources的操作
 * @type {{get: (function(*))}}
 */
export const mxResources = {
    async get(name) {
        return await postMessage('mxResources', 'get', { name })
    },
};
