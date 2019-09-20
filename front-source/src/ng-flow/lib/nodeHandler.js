import { STATUS_LIST, STATUS_EXCEPTION } from '../const';
import { find } from 'lodash/collection';
import { difference } from 'lodash/array';
import { ENGLISH_STATUS_LIST } from '../const';
import { find } from 'lodash/collection';
import {
    STATUS_NORMAL_ENGLISH,
    STATUS_SILENT_ENGLISH,
    STATUS_EXCEPTION_ENGLISH,
    STATUS_REPEAT_ENGLISH
} from '../const';
import { toZhDigit } from './utils';

/**
 * 获取页面中所有的text node
 * @param node
 * @return {Array}
 */
function textNodesUnder(node){
    let all = [];
    for (node = node.firstChild; node; node = node.nextSibling){
        if (node.nodeType === 3) all.push(node);
        else all = all.concat(textNodesUnder(node));
    }
    return all;
}

/**
 * 将xml中话术的html转换为component对象
 * @param contentHtml
 * @return {Array}
 */
function contentHtmlToComponents(contentHtml) {
    const components = [];
    textNodesUnder(contentHtml).forEach(e => {
        // 判断是否是一个音频节点
        const parentNode = e.parentNode;
        if (parentNode && parentNode.getAttribute('path')) {
            // AudioTag
            const id = '';
            const soundPath = parentNode.getAttribute('path') || '';
            const fileName = /.*{(.*?)}$/ig.exec(e.textContent)[1] || '';
            const soundContent = parentNode.getAttribute('content') || '';
            const duration = parentNode.getAttribute('duration') || '';
            components.push({
                component: 'AudioTag',
                data: { id, soundPath, fileName, soundContent, duration },
            });
        } else {
            // TextTag
            components.push({
                component: 'TextTag',
                data: {
                    text: e.textContent || '',
                },
            });
        }
    });

    return components;
}

function componentsToContentHtml(speechNodes) {
    const ret = [];
    speechNodes.forEach((speechNode, index) => {
        let contentHtml = '<div contenteditable="true" class="rich-editor" spellcheck="false">';
        let indexString = '';
        if (index === 0) {
            indexString = '首';
        } else {
            indexString = toZhDigit(index + 1);
        }

        const obj = {
            title: `${indexString}轮话术`,
            name: index + 1,
            content: '',
            isLocked :false,
            recordData: [],
            viewCont: '',
        };

        speechNode.forEach(component => {
            switch (component.component) {
                case 'TextTag':
                    contentHtml += `${component.data.text}`
                    break;
                case 'AudioTag':
                    contentHtml += [
                        `<span isvalid="true" `,
                            `contenteditable="false" `,
                            `class="el-tag" `,
                            `duration="${component.data.duration}" `,
                            `path="${component.data.soundPath}" `,
                            `content="${component.data.soundContent}"`,
                        `>`,
                            `${component.data.soundContent}{${component.data.fileName}}`,
                            `<i contenteditable="false" class="el-icon-close"></i>`,
                        `</span>`,
                    ].join('');

                    break;
                default:
            }
        });

        contentHtml += '</div>';
        obj.content = contentHtml;
        ret.push(obj);
    });

    return ret;
}

/**
 * 将flow robot node转换为xml
 * @param flowRobotNodes
 * @param originXmlString
 * @return {string}
 */
export const flowRobotDataToXml = (flowRobotNodes, originXmlString) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(originXmlString, 'text/xml');
    xmlDoc.querySelectorAll('Start, Robot').forEach((ele, index) => {
        const robotSpeechCraftData = flowRobotNodes[index];
        if (robotSpeechCraftData) {
            const data = {};
            data[STATUS_NORMAL_ENGLISH] = componentsToContentHtml(robotSpeechCraftData.values[0].speechNodes);
            data[STATUS_SILENT_ENGLISH] = componentsToContentHtml(robotSpeechCraftData.values[1].speechNodes);
            data[STATUS_EXCEPTION_ENGLISH] = componentsToContentHtml(robotSpeechCraftData.values[2].speechNodes);
            data[STATUS_REPEAT_ENGLISH] = componentsToContentHtml(robotSpeechCraftData.values[3].speechNodes);
            ele.setAttribute('speechcraft', JSON.stringify(data));
        }
    });

    return (new XMLSerializer()).serializeToString(xmlDoc);
};

/**
 * 将xml字符串转化为flow robot node
 * @param xmlString
 */
export const xmlToFlowRobotData = xmlString => {
    const flowRobotNodes = [];
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    xmlDoc.querySelectorAll('Start, Robot').forEach(ele => {
        let speechCraft = {};
        try {
            speechCraft = JSON.parse(ele.getAttribute('speechcraft') || '{}');
        } catch (e) {
            return;
        }

        const ret = {
            label: ele.getAttribute('label'),
            values: [],
        };

        Object.keys(speechCraft).forEach(key => {
            const nodeData = speechCraft[key];
            const node = {
                statusName: ENGLISH_STATUS_LIST[key],
                speechNodes: [],
            };

            nodeData.forEach(n => {
                node.speechNodes.push(
                    contentHtmlToComponents(parser.parseFromString(n.content || '', 'text/html'))
                );
            });

            ret.values.push(node);
        });

        if (ele.tagName === 'Start') {
            ret.isRoot = true;
        }

        if (ele.getAttribute('isEXCSkip') === 'true') {
            ret.disabledExcSpeech = true;
        }

        flowRobotNodes.push(ret);
    });

    return fillAndSortNode(flowRobotNodes);
};

/**
 * 排序和填充话术节点
 * @param data
 * @param originData
 * @return {*}
 */
export const fillAndSortNode = (data, originData) => {
    // 填充不存在的node
    data = data.map(item => {
        item = Object.assign({}, item);
        item.values = [ ... item.values ];
        let statusList = [ ... STATUS_LIST ];
        item.values.forEach(value => {
            if (value.speechNodes && value.speechNodes.length === 0) {
                value.speechNodes.push([]);
            }

            const statusName = value.statusName;
            const index = statusList.indexOf(statusName);
            if (index >= 0) {
                statusList.splice(index, 1);
            }
        });

        statusList.forEach(statusName => {
            item.values.push({
                statusName,
                speechNodes: [[]],
            })
        });

        return item;
    });

    // 排序node
    data = data.map(item => {
        item = Object.assign({}, item);
        item.values = [ ... item.values ];
        const values = [];
        STATUS_LIST.forEach(statusName => {
            const node = find(item.values, { statusName });
            if (item.disabledExcSpeech && statusName === STATUS_EXCEPTION) {
                node.disabled = true;
                delete item.disabledExcSpeech;
            }
            values.push(node)
        });
        item.values = values;
        return item;
    });

    // 和原始数据进行比对
    if (originData) {
        originData.forEach((item, itemKey) => {
            item.values.forEach(((value, valueKey) => {
                const diffKeys = difference(Object.keys(value), Object.keys(data[itemKey].values[valueKey]));
                diffKeys.forEach(diffKey => {
                    data[itemKey].values[valueKey][diffKey] = value[diffKey];
                });
            }));
        });
    }

    return data;
};
