<template>
    <div class="flow-outer" @keydown.ctrl.83.prevent="saveToFlow" @keydown.meta.83.prevent="saveToFlow" tabindex="1">
        <Header
                :speechCraft="speechCraft"
                :viewType="viewType"
                @updateSpeechForm="updateSpeechForm"
                :saveTime="saveTime"
                @backToFlow="saveBackToFlow"
        ></Header>
        <div class="flow-container">
            <Drawer v-on:drawerOpen="drawerOpen()" v-on:drawerClose="drawerClose()"></Drawer>
            <Main
                    class="main"
                    :class="isDrawerOpen ? '' : 'full-width'"
                    :speechCraft="speechCraft"
                    v-model="flowRobotNodes"
            ></Main>
        </div>
    </div>
</template>

<script>
    import axios from 'axios';
    import { trimStart } from 'lodash/string';
    import queryString from 'query-string';
    import Header from './components/Header';
    import Drawer from './components/Drawer';
    import Main from './components/Main';
    import { API_ERROR_CODE, API_SUCCESS_CODE } from '../common/enums';
    import { flow, backToFlow } from './lib/postMessageBridge';
    import { xmlToFlowRobotData, flowRobotDataToXml } from './lib/nodeHandler';
    import moment from 'moment';

    export default {
        components: {
            Header,
            Drawer,
            Main,
        },

        data() {
            return {
                isDrawerOpen: true,
                speechCraft: {},
                viewType: '',
                flowRobotNodes: [],
                flowXml2JsonData: null,
                saveTime: '',
            };
        },

        async created() {
            const parsedHash = queryString.parse(window.location.hash.replace(/^(.*)\?/g, ''));
            this.viewType = parsedHash.viewType;
            await this.getSpeechCraftDetail(parsedHash.speechcraftId);
            this.flowRobotNodes = xmlToFlowRobotData(await this.getFlowData());
            setInterval(async () => {
                await this.saveToFlow();
            }, 1000 * 60 * 10);
        },

        methods: {
            updateSpeechForm(k, v) {
                this.speechCraft[k] = v;
            },

            async getSpeechCraftDetail(speechcraftId) {
                if (!speechcraftId) {
                    this.$message.error('话术不存在');
                    return;
                }

                const res = await axios.get(`${this.$baseUrl}speechcraft/querySpeechcraftDetail.json?speechcraftId=${speechcraftId}`);
                const { resultMessageEnum, returnObject } = res.data;
                if (resultMessageEnum !== API_SUCCESS_CODE) {
                    this.$message.error('接口数据错误');
                    return;
                }

                this.speechCraft = returnObject;
            },

            getFlowData() {
                return new Promise((resolve, reject) => {
                    try {
                        const getFlowTimer = setInterval(async () => {
                            const res = await flow.get();
                            if (res) {
                                clearTimeout(getFlowTimer);
                                resolve(res);
                            }
                        }, 100)
                    } catch (e) {
                    }
                })
            },

            async saveToFlow() {
                const xml = flowRobotDataToXml(this.flowRobotNodes, await flow.get());
                const ret = await flow.set(xml);
                if (ret === 'success') {
                    this.saveTime = moment().format('HH:mm:ss');
                }
            },

            /**
             * 保存并返回流程图
             * @return {Promise.<void>}
             */
            async saveBackToFlow() {
                await this.saveToFlow();
                backToFlow();
            },

            drawerOpen() {
                this.isDrawerOpen = true;
            },

            drawerClose() {
                this.isDrawerOpen = false;
            },
        },
    }
</script>
<style lang="less">
    body {
        background: repeating-linear-gradient(
                -45deg,
                #E6EBF4,
                #E6EBF4 1px,
                transparent 0,
                transparent 8px
        ) #EDF3FE;
        overflow-x: hidden;
    }

    .main {
        position: absolute;
        left: 31px;
        top: 111px;
        bottom: 32px;
        right: 365px;
        transition: right 0.2s linear;
        &.full-width {
            right: 31px;
        }
    }

    .flow-outer {
        display: flex;
        flex-direction: column;
        height: 100%;
        outline: none;
    }

    .flow-container {
        flex: 1;
    }
</style>

