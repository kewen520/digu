<template>
    <el-scrollbar
            wrapClass="node-table-scroll"
            :native="false"
            :noresize="false"
    >
        <ul>
            <li v-for="(item, k) in value.values" v-if="item.speechNodes && item.speechNodes.length" class="speech-node">
                <h4>{{item.statusName}}</h4>
                <ul class="speech-list">
                    <li v-for="(node, index) in item.speechNodes">
                        <span
                                class="speech-rounds"
                                v-clickoutside="() => clickTipsControl(k, index, true)"
                                @click="clickTipsControl(k, index)"
                        >
                            {{index | indexToZhDigit}}轮话术
                            <TipsControl
                                    :ref="`tipsControl${k}-${index}`"
                                    class="tips-control"
                                    :showDeleteButton="item.speechNodes.length > MIN_SPEECH_NODE && !value.values[k].disabled"
                                    :showAppendButton="item.speechNodes.length < MAX_SPEECH_NODE && !(value.isRoot && k <= 0) && !value.values[k].disabled"
                                    @appendSpeech="appendSpeech(k, index, item.speechNodes)"
                                    @deleteSpeech="deleteSpeech(index, item.speechNodes)"
                            >
                            </TipsControl>
                        </span>
                        <div class="speech-node-editor">
                            <SpeechRichEditor
                                    height="50px"
                                    class="speech-rich-editor"
                                    v-model="value.values[k].speechNodes[index]"
                                    :disabled="!!value.values[k].disabled"
                                    @input="speechRichEditorInput(`${k}-${index}`)"
                                    :ref="`richEditor${k}-${index}`"
                            ></SpeechRichEditor>
                            <Audio
                                    :ref="`audioComponent${k}-${index}`"
                                    class="speech-rich-audio"
                                    iconSize="20px"
                                    :showSlider="false"
                                    :asyncModeHandler="() => asyncAudioHandler(`audioComponent${k}-${index}`, value.values[k].speechNodes[index])"
                            ></Audio>
                        </div>
                    </li>
                </ul>
            </li>
        </ul>
    </el-scrollbar>
</template>

<script>
    import SpeechRichEditor from '../SpeechRichEditor';
    import Audio from '../../../ng-Audio/Audio';
    import TipsControl from './TipsControl';
    import { toZhDigit } from '../../lib/utils';
    import { clickOutSide } from '../../lib/utils';
    import axios from 'axios';
    import { API_ERROR_CODE, API_SUCCESS_CODE } from '../../../common/enums';
    import { MAX_SPEECH_NODE, MIN_SPEECH_NODE } from '../../const';

    export default {
        components: {
            SpeechRichEditor,
            Audio,
            TipsControl,
        },

        props: {
            value: {
                type: Object,
                default: () => {
                    return {
                        label: '标签',
                        values: [],
                    };
                }
            },
        },

        filters: {
            indexToZhDigit(index) {
                index = index + 1;
                if (index === 1) {
                    return '首'
                }
                return toZhDigit(index);
            },
        },

        directives: {
            clickoutside: clickOutSide,
        },

        data() {
            return {
                MAX_SPEECH_NODE,
                MIN_SPEECH_NODE,
            };
        },

        methods: {
            /**
             * 异步的音频加载
             */
            async asyncAudioHandler(index, value) {
                Object.keys(this.$refs).forEach(key => {
                   if (key.indexOf('audioComponent') === 0 && index !== key) {
                      const component = this.$refs[key];
                      if (component && component[0]) {
                          component[0].stop();
                      }
                   }
                });

                return await this.getTestListenFiles(value);
            },

            /**
             * 获取试听文件的地址
             */
            async getTestListenFiles(value) {
                const aliyunSoundBaseUrl = `${this.$baseUrl}file/downloadFile.html?filePath=`;
                const testListenPostData = {
                    audios: [],
                    isAudit: 0,
                };

                value.forEach(item => {
                    switch (item.component) {
                        case 'AudioTag':
                            if (item.data.soundContent && item.data.soundPath) {
                                testListenPostData.audios.push({
                                    text: item.data.soundContent,
                                    url: item.data.soundPath,
                                });
                            }
                            break;
                        case 'TextTag':
                            if (item.data.text) {
                                testListenPostData.audios.push({
                                    text: item.data.text,
                                });
                            }
                            break;
                        default:
                    }
                });

                if (testListenPostData.audios.length === 0) {
                    this.$message.error('试听文本为空');
                    return [];
                }

                const { data } = await axios.post(`${this.$baseUrl}speechcraft/testListen.json`, testListenPostData);
                const {
                    resultMessageEnum,
                    resultMessage,
                    returnObject,
                } = data;
                if (resultMessageEnum !== API_SUCCESS_CODE) {
                    this.$message.error(resultMessage);
                    return [];
                } else if (returnObject.joinUrl) {
                    return [returnObject.joinUrl];
                } else {
                    return returnObject.audios.map(item => {
                        if (item.url.indexOf('http') < 0) {
                            return `${aliyunSoundBaseUrl}${item.url}`;
                        }
                        return item.url
                    });
                }
            },

            /**
             * 当前编辑器修改输入时，暂停音频播放
             */
            speechRichEditorInput(index) {
                const audioComponents = this.$refs[`audioComponent${index}`];
                if (audioComponents && audioComponents[0]) {
                    audioComponents[0].stop();
                }
            },

            /**
             * 点击tips的逻辑
             * @param k
             * @param index
             * @param forceClose
             */
            clickTipsControl(k, index, forceClose) {
                const component = this.$refs[`tipsControl${k}-${index}`][0];
                if (component) {
                    if (forceClose) {
                        component.close();
                    } else {
                        component.toggle();
                    }
                }
            },

            /**
             * 删除分话术
             * @param index
             * @param speechNodes
             */
            deleteSpeech(index, speechNodes) {
                speechNodes.splice(index, 1)
            },

            /**
             * 新增分话术
             * @param k
             * @param index
             * @param speechNodes
             */
            appendSpeech(k, index, speechNodes) {
                speechNodes.splice(index + 1, 0, []);
                // 光标聚焦文本框内
                this.$nextTick(() => {
                    const component = this.$refs[`richEditor${k}-${index + 1}`][0];
                    this.$nextTick(() => component.clickHandler());
                });
            }
        },
    }
</script>

<style lang="less" scoped>
    @border: 1px solid rgba(222,226,230,1);

    ul li {
        list-style: none;
        font-size: 14px;
        color: #647184;
    }

    .speech-node {
        display: flex;
        border-bottom: @border;
        h4 {
            flex:0 0 54px;
            border-right: @border;
            min-height: 41px;
            font-weight: normal;
            text-align: center;
            padding-top: 21px
        }
    }

    .speech-list {
        flex:1;
        li {
            display: flex;
            &:not(:first-child) {
                border-top: @border;
            }

            span {
                flex:0 0 76px;
                border-right: @border;
                min-height: 41px;
                text-align: center;
                padding-top: 21px
            }
        }
        .speech-rounds {
            cursor: pointer;
            position: relative;
            &:before {
                content: "";
                position: absolute;
                right: 0;
                bottom: 0;
                width: 0;
                height: 0;
                border-bottom: 10px solid #BFD5F8;
                border-left: 10px solid transparent;
            }
        }
    }

    .tips-control {
        position: absolute;
        z-index: 1;
        right: -100px;
        bottom: 0;
    }

    .speech-node-editor {
        flex: 1;
        padding: 6px 66px 6px 10px;
        position: relative;
        .speech-rich-editor {
            min-height: 50px !important;
            width: 100%;
            margin-right: 40px;
        }
    }

    .speech-rich-audio {
        position: absolute;
        right: 33px;
        top: 50%;
        margin-top: -10px;
    }

</style>

<style lang="less">
    .node-table-scroll {
        overflow-x: hidden;
    }
</style>
