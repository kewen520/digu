<template>
    <div class="flow-drawer-outer" :class="!drawer && drawerClosed ? 'close' : ''">
        <div
                v-if="drawerClosed"
                class="switch-button switch-button-fixed el-icon-arrow-left"
                @click="drawer = true"
        ></div>
        <el-drawer
                class="flow-drawer"
                title="音频列表"
                size=352
                custom-class="flow-drawer-content"
                :close-on-press-escape="false"
                :modal-append-to-body="false"
                :append-to-body="false"
                :modal="false"
                :visible.sync="drawer"
                :direction="direction"
                :show-close="false"
                :wrapperClosable="false"
                @open="openCallback"
                @close="closeCallback"
                @closed="drawerClosed = true"
        >
            <div
                    v-if="!drawerClosed"
                    class="switch-button el-icon-arrow-right"
                    @click="drawer = false"
            ></div>
            <div class="flow-drawer-container">
                <el-input
                        v-model="audioSearchKeyWord"
                        class="search-audio-input"
                        placeholder="输入音频关键词"
                        :clearable="true"
                        @keyup.native.13="search"
                ></el-input>
                <el-button type="primary" @click="search" class="search-audio-button">查找</el-button>
                <div v-if="!showDetailCate" class="audio-dir">
                    <h3>文件夹</h3>
                    <el-scrollbar
                        class="audio-dir-scrollbar"
                        wrapClass="audio-dir-scrollbar-warp"
                        :native="false"
                        :noresize="false"
                    >
                        <el-collapse v-model="collapseActiveNames">
                            <el-collapse-item class="speech-audio" name="speechAudio">
                                <template slot="title">
                                    话术音频
                                </template>
                                <ul class="speech-audio-list">
                                    <li
                                            :class="index === 0 ? 'is-common' : ''"
                                            v-for="(cate, index) in audioList.speechAudio"
                                            @click="showDetailCate=cate"
                                    >{{cate.name}}</li>
                                </ul>
                            </el-collapse-item>
                            <el-collapse-item name="knowledgeAudio">
                                <template slot="title">
                                    知识库音频
                                </template>
                                <ul class="speech-audio-list">
                                    <li
                                            :class="index === 0 ? 'is-common' : ''"
                                            v-for="(cate, index) in audioList.knowledgeAudio"
                                            @click="showDetailCate=cate"
                                    >{{cate.name}}</li>
                                </ul>
                            </el-collapse-item>
                        </el-collapse>
                    </el-scrollbar>
                </div>
                <div v-else class="audio-files">
                    <h3>
                        <a @click="showDetailCate = null">话术音频</a>
                        <span>/&nbsp;{{showDetailCate.name}}</span>
                    </h3>
                    <el-scrollbar
                            class="audio-dir-scrollbar"
                            wrapClass="audio-dir-scrollbar-warp"
                            :native="false"
                            :noresize="false"
                    >
                        <ul class="audio-files-list" v-infinite-scroll="audioFilesListLoad">
                            <li
                                    v-for="(item, index) in showDetailCate.child"
                                    draggable="true"
                                    @dragstart="(e) => audioFileDragStart(e, item)"
                                    @dragend="audioFileDragEnd"
                            >{{item.soundContent}}{{'{' + item.fileName + '}'}}</li>
                        </ul>
                    </el-scrollbar>
                </div>
            </div>
        </el-drawer>
    </div>
</template>

<script>
    import axios from 'axios';
    import { API_ERROR_CODE, API_SUCCESS_CODE } from '../../../common/enums';

    export default {
        data() {
            return {
                drawer: true,
                drawerClosed: false,
                collapseActiveNames: [
                    'speechAudio',
                    'knowledgeAudio'
                ],
                direction: 'rtl',
                audioSearchKeyWord: '',
                queryKey: '',
                showDetailCate: null,
                audioList: {
                    // 话术音频
                    speechAudio: [],
                    // 知识库音频
                    knowledgeAudio: [],
                },
            };
        },

        async created() {
            await this.fetchAudioGroupList();
        },

        watch: {
            async audioSearchKeyWord(val) {
                if (val === '' && this.showDetailCate) {
                    this.queryKey = '';
                    this.$nextTick(async () => {
                        await this.audioFilesListLoad();
                    })
                }
            },

            // queryKey有更新要清除恢复所有类别的数据
            queryKey() {
                Object.keys(this.audioList).forEach(key => {
                    this.audioList[key].forEach(cate => this.clearCateData(cate));
                });
            }
        },

        methods: {
            clearCateData(cate) {
                cate.currentPage = 0;
                cate.endPage = -1;
                cate.child = [];
            },

            async search() {
                this.queryKey = this.audioSearchKeyWord;
                this.$nextTick(async () => {
                    await this.audioFilesListLoad();
                });
            },

            /**
             * 拉取话术音频的分类
             * @return {Promise.<void>}
             */
            async fetchAudioGroupList() {
                const { data } = await axios.get(this.$baseUrl + 'sound/querySoundConfigGroupList.json');
                if (data.resultMessageEnum !== API_SUCCESS_CODE) {
                    this.$message.error('数据加载异常');
                    return;
                }

                data.returnObject.forEach(item => {
                    const cate = {
                        id: item.id,
                        name: item.configGroupName,
                        currentPage: 0,
                        endPage: -1,
                        child: [],
                    };

                    if (item.soundConfigGroupType === 1) {
                        // 话术音频
                        this.audioList.speechAudio.push(cate);
                    } else if (item.soundConfigGroupType === 2) {
                        // 知识库音频
                        this.audioList.knowledgeAudio.push(cate);
                    }
                });
            },

            /**
             * 加载音频文件列表
             * @return {Promise.<void>}
             */
            async audioFilesListLoad() {
                if (!this.showDetailCate) {
                    return;
                }

                const param = {
                    configGroupId: this.showDetailCate.id,
                    currentPage: this.showDetailCate.currentPage,
                    pageSize: 20,
                };

                if (this.queryKey) {
                    param.queryKey = this.queryKey;
                }

                const { data } = await axios.post(this.$baseUrl + 'sound/querySoundConfigItemList.json', param);
                if (data.resultMessageEnum !== API_SUCCESS_CODE) {
                    this.$message.error('数据加载异常');
                    return;
                }

                const { recordList } = data.returnObject;
                if (recordList) {
                    if (recordList.length === 0) {
                        this.showDetailCate.endPage = this.showDetailCate.currentPage;
                        return;
                    }

                    recordList.forEach(item => {
                        this.showDetailCate.child.push({
                            id: item.id,
                            fileName: item.fileName,
                            soundPath: item.soundPath,
                            soundContent: item.soundContent,
                            duration: item.soundDuration,
                        });
                    });

                    this.showDetailCate.currentPage++;
                }
            },

            /**
             * 鼠标拖拽的消息传递
             * @param e
             * @param item
             */
            audioFileDragStart(e, item) {
                const message = {
                    command: 'appendComponent',
                    data: {
                        component: 'AudioTag',
                        data: {
                            id: item.id || '',
                            fileName: item.fileName || '',
                            soundPath: item.soundPath || '',
                            soundContent: item.soundContent || '',
                            duration: item.duration || '',
                        },
                    },
                };

                e.dataTransfer.setData('message', JSON.stringify(message));
            },

            /**
             * 拖拽终止的事件
             * @param e
             */
            audioFileDragEnd(e) {
                e.dataTransfer.clearData()
            },

            openCallback() {
                this.drawerClosed = false;
                this.$emit('drawerOpen');
            },

            closeCallback() {
                this.$emit('drawerClose');
            }
        },
    }
</script>

<style lang="less" scoped>
    .flow-drawer-outer {
        position: absolute;
        width: 352px;
        top: 0;
        right: 0;
        bottom: 0;
        &.close {
            width: 16px;
        }
    }

    .flow-drawer {
        top: 80px;
        width: 352px;
        left: auto;
    }

    .flow-drawer-container {
        width: 336px;
        padding: 22px 0 22px 20px;
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        background: white;
    }

    .search-audio-input {
        width: 212px;
    }

    .search-audio-button {
        width: 64px;
        height: 38px;
        display: inline-block;
        vertical-align: middle;
        margin-left: 15px;
    }

    .audio-dir, .audio-files {
        h3 {
            font-size: 15px;
            font-weight: normal;
            color: #647184;
            line-height: 20px;
            margin-top: 30px;
        }
    }

    .audio-dir-scrollbar {
        position: absolute;
        top: 120px;
        bottom: 0;
        right: 0;
        left: 0;
    }

    .speech-audio-list {
        padding: 15px 30px;
        li {
            list-style: none;
            color: #647184;
            line-height: 30px;
            cursor: pointer;
            font-size: 14px;
            &:hover {
                color: #4E8FF9;
            }
            &.is-common {
                &:before {
                    content: "通用";
                    width: 36px;
                    height: 24px;
                    display: inline-block;
                    margin-right: 8px;
                    text-align: center;
                    line-height: 24px;
                    color: #FDA412;
                    background: #FDEDD3;
                    border-radius:4px;
                }
            }

            &:not(.is-common) {
                margin-left: 44px;
            }
        }
    }

    .audio-files {
        h3 {
            a {
                color: #4E8FF9;
                cursor: pointer;
            }
            border-bottom: 1px rgba(235,237,240,1) solid;
            padding-bottom: 14px;
            margin-right: 20px;
        }
    }

    .audio-files-list {
        padding: 0 20px 22px 20px;
        li {
            padding: 4px 5px;
            margin-top: 20px;
            list-style: none;
            background: rgba(245,249,255,1);
            border-radius: 2px;
            border: 1px solid rgba(78,143,249,1);
            color: #4B8FFF;
            user-select: none;
            cursor: move;
        }
    }

    .switch-button {
        position: absolute;
        top: 50%;
        left: 0;
        margin-top: -64px;
        width: 16px;
        height: 68px;
        line-height: 68px;
        font-size: 20px;
        border-radius: 3px 0 0 3px;
        color: #647184;
        background: white;
        cursor: pointer;
    }

    .switch-button-fixed {
        position: absolute;
        margin-top: 0;
        left: auto;
        right: 0;
    }
</style>

<style lang="less">
    .flow-drawer {
        z-index: 0 !important;
        > div{
            outline: none !important;
            overflow-x: hidden;
        }
    }

    .search-audio-input {
        width: 212px;
        input {
            height: 38px !important;
            line-height: 38px !important;
        }
    }

    .flow-drawer-content {
        box-shadow: none;
        background: transparent;
        position: relative;
        > header {
            position: absolute;
            right: 0;
            top: 0;
            height: 60px;
            line-height: 60px;
            font-size: 16px;
            color: #647184;
            border-bottom: 1px rgba(235,237,240,1) solid;
            margin-bottom: 0;
            padding: 0 20px;
            width: 296px;
            background: white;
        }

        > section {
            width: 352px;
            background: transparent;
            position: absolute;
            right: 0;
            top: 61px;
            bottom: 0;
        }
    }

    .audio-dir-scrollbar-warp {
        overflow-x: hidden;
    }

    .audio-dir {
        .el-collapse {
            padding-right: 20px;
            border-top: none;
            border-bottom: none;
        }

        .el-collapse-item {
            div[role="button"] {
                color: #647184;
                font-size: 15px;
                text-indent: 30px;
                border-bottom: none;
            }
            div[role="tabpanel"] {
                border-bottom: none;
                > div {
                    padding-bottom: 5px;
                }
            }
        }

        .el-icon-arrow-right {
            margin-left: 23px;
            text-indent: 0;
        }

        .speech-audio {
            .el-icon-arrow-right {
                margin-left: auto;
                margin-right: 23px;
            }

            div[role="button"] {
                color: #4E8FF9;
                background:rgba(247,248,251,1);
            }
        }
    }
</style>
