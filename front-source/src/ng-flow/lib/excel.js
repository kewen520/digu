import XLSX from 'xlsx';
import { toZhDigit } from './utils';
import { MAX_SPEECH_NODE, MIN_SPEECH_NODE } from '../const'

export const importExcel = e => {
    return new Promise((resolve, reject) => {
        if(!e.files || !e.files[0]) {
            return;
        }

        const f = e.files[0];
        const reader = new FileReader();
        const loadendHandler = e => {
            try {
                const data = e.target.result;
                const wb = XLSX.read(data, {
                    type: 'binary'
                });

                const tableData = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]).map((item, index) => {
                    item = Object.assign({}, item) ;
                    const resData = {
                        label: item['编辑器名称'],
                    };

                    delete item['编辑器名称'];
                    if (index === 0) {
                        resData.isRoot = true;
                    }

                    const values = [];
                    Object.keys(item).forEach(k => {
                        const text = item[k].toString().replace(/[\r\n]/g, '').trim();
                        const statusName = k.substring(0, 2);
                        if (text) {
                            const list = values.filter(i => i.statusName === statusName);
                            if (list[0]) {
                                // 每个话术的状态不能超过五轮
                                if (list[0].speechNodes.length >= MAX_SPEECH_NODE) {
                                    return;
                                }
                                // 根节点正常只允许一轮
                                if (resData.isRoot && values.indexOf(list[0]) === 0) {
                                    return;
                                }

                                list[0].speechNodes.push(speechesS2O(text));
                            } else {
                                values.push({
                                    statusName: statusName,
                                    speechNodes: [speechesS2O(text)],
                                });
                            }
                        }
                    });

                    resData.values = values;
                    return resData
                });

                reader.removeEventListener('loadend', loadendHandler);
                resolve(tableData);
            } catch (e) {
                reader.removeEventListener('loadend', loadendHandler);
                reject(e);
            }
        };

        reader.addEventListener("loadend", loadendHandler);
        reader.readAsBinaryString(f);
    });
};

/**
 * 将话术节点字符串转化为对象
 * @param speechesText
 * @return {Array}
 */
function speechesS2O(speechesText) {
    const res = [];
    const matchArray = speechesText.split(/\[(.*)]/g).filter(o => o);
    matchArray.forEach(item => {
        if (item.indexOf('Audio ') >= 0) {
            const data = {};
            item = item.replace('Audio ', '').split(' ');
            item.forEach(str => {
                const [k , v] = str.split('=');
                if (k && v) {
                    data[k] = v;
                }
            });

            if (data.id && data.fileName && data.soundPath && data.soundContent) {
                res.push({
                    "component":"AudioTag",
                    "data": data
                });
            }
        } else {
            res.push({
                "component":"TextTag",
                "data": {
                    "text": item,
                }
            });
        }
    });

    return res;
}

/**
 * 将话术节点转化为字符串
 * @param speeches
 * @return {string}
 */
function speechesO2S(speeches) {
    let text = '';
    speeches.forEach(item => {
        switch (item.component) {
            case 'TextTag':
                text += `${item.data.text}`;
                break;
            case 'AudioTag': text +=
`[Audio
 id=${item.data.id}
 fileName=${item.data.fileName}
 soundPath=${item.data.soundPath}
 soundContent=${item.data.soundContent}
 duration=${item.data.duration}
]`;
                break;
            default:
        }

        text += "\r\n";
    });
    return text;
}

/**
 * 导出excel
 * @param data
 * @param speechName
 */
export const exportExcel = (data, speechName) => {
    const taregtData = data.map(item => {
        const returnItem = {
            '编辑器名称': item.label,
        };

        item.values.forEach((value, itemIndex) => {
            let speechNodes = [ ... value.speechNodes ] ;
            if (speechNodes.length < MAX_SPEECH_NODE) {
                const length = speechNodes.length;
                speechNodes.length = MAX_SPEECH_NODE;
                speechNodes = speechNodes.fill([], length, MAX_SPEECH_NODE)
            }

            speechNodes.forEach((speeches, speechIndex) => {
                let indexString = '';
                if (speechIndex === 0) {
                    indexString = `${value.statusName}首轮`
                } else {
                    const key = `${value.statusName}${toZhDigit(speechIndex + 1)}轮`;
                    if (item.isRoot && itemIndex  === 0) {
                        returnItem[key] = '根话术正常话术只允许一轮';
                        return;
                    }
                    indexString = `${key}`;
                }

                returnItem[indexString] = speechesO2S(speeches);
            });
        });

        return returnItem;
    });

    const ws = XLSX.utils.json_to_sheet(taregtData);
    ws['!cols'] = Object.keys(taregtData[0]).map(k => ({
        wch: 30,
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "列表匹配模式");
    XLSX.writeFile(wb, `列表匹配模式-${speechName}.xlsx`);
};
