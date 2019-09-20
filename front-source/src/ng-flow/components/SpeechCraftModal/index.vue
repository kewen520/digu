<template>
    <el-dialog
            title="话术设置"
            :visible.sync="visible"
            width="400px"
            :modal-append-to-body="false"
            :append-to-body="true"
            :destroy-on-close="true"
            @open="openHandler"
            class="speech-craft-modal"
    >
        <el-form ref="speechForm" :rules="settingSpeechRules" :model="speechForm">
            <el-form-item label="话术名称" :label-width="formLabelWidth" prop="speechcraftName">
                <el-input width="320px"
                          v-model="speechForm.speechcraftName"
                          autocomplete="off"
                          placeholder="请输入话术名称"
                          maxlength="15"
                          :disabled="isDisabled"
                ></el-input>
            </el-form-item>
            <el-form-item label="方案类型" :label-width="formLabelWidth">
                <el-select v-model="speechCraftType" disabled></el-select>
            </el-form-item>
            <el-form-item label="所属行业" :label-width="formLabelWidth">
                <el-select v-model="speechForm.industryName" disabled></el-select>
            </el-form-item>
            <el-form-item
                    label="App Key"
                    :label-width="formLabelWidth"
                    class="app-key-copy-item"
                    @mouseenter.native="showAppKeyCopyIcon = true"
                    @mouseleave.native="showAppKeyCopyIcon = true"
            >
                <el-input class="is-disabled" ref="speechFormAppKey" width="320px" v-model="speechForm.nluAppKey" readonly></el-input>
                <i v-if="showAppKeyCopyIcon" class="app-key-copy-icon el-icon-document-copy" @click="appKeyCopy"></i>
            </el-form-item>
            <el-form-item :label-width="formLabelWidth">
                <el-checkbox v-model="speechForm.isArtificial" @change="handleArtificialChange" :disabled="isDisabled">允许挂机转人工</el-checkbox>
                <el-select
                        v-model="speechForm.artificialIntention"
                        v-if="speechForm.isArtificial"
                        @change="handleArtificialIntentionChange"
                        filterable
                        multiple
                        placeholder="请选择转人工意图类型"
                        :disabled="isDisabled"
                >
                    <el-option
                            v-for="item in artificialIntentionOptions"
                            :key="item.id"
                            :label="item.label"
                            :value="item.value">
                    </el-option>
                </el-select>
                <el-checkbox v-model="speechForm.isInterrupt" @change="handleInterruptChange" :disabled="isDisabled">允许打断(不包含开场白和结束语)
                    <el-tooltip effect="light" placement="bottom-end" popper-class="speech-editor-tip">
                        <div slot="content">{{isInterruptContent}}</div>
                        <i class="el-icon-question"></i>
                    </el-tooltip>
                </el-checkbox>
            </el-form-item>
        </el-form>
        <div slot="footer" class="w-dialog dialog-footer">
            <el-button @click="$emit('update:dialogSpeechSettingVisible', false)">取 消</el-button>
            <el-button type="primary" @click="setting()" :disabled="isDisabled">确 定</el-button>
        </div>
    </el-dialog>
</template>

<script>
    import {
        mxResources,
        handleArtificialChange,
        handleArtificialIntentionChange,
        handleInterruptChange
    } from '../../lib/postMessageBridge';
    import axios from 'axios';
    import { API_ERROR_CODE, API_SUCCESS_CODE } from '../../../common/enums';

    export default {
        props: {
            originSpeechForm: {
                type: Object,
                default: () => {
                    return {};
                },
            },
            viewType: {
                type: String,
                default: '',
            },
            dialogSpeechSettingVisible: {
                type: Boolean,
                default: false,
            }
        },

        data() {
            return {
                visible: false,
                showAppKeyCopyIcon: false,
                settingSpeechRules: {
                    speechcraftName:[
                        {
                            required: true,
                            message: '请输入话术名称'
                        },
                    ]
                },
                formLabelWidth:'80px',
                isDisabled: false,
                artificialIntentionOptions: [
                    {id: 1, value: 'main', label:'正常'},
                    {id: 2, value: 'quiet', label:'静默'},
                    {id: 3, value: 'exception', label:'异常'},
                    {id: 4, value: 'retell', label:'复述'}
                ],
                isInterruptContent: '',
                schemeList: [],
                speechForm: {
                    speechcraftId: '',
                    speechcraftName:'',
                    nluAppKey: '',
                    artificialIntention: '',
                    industryName:'',
                    isInterrupt: false,
                    isArtificial: false,
                },
            };
        },

        async created() {
            this.disableHandler();
            await this.fetchSchemeList();
        },

        computed: {
            speechCraftType() {
                const res = this.schemeList.filter(item => item.schemeType);
                return res[0] ? res[0]['schemeName'] : '';
            },
        },

        watch: {
            dialogSpeechSettingVisible(newVal) {
                this.visible = newVal;
            },

            visible(newVal) {
                this.$emit('update:dialogSpeechSettingVisible', newVal);
            },
        },

        methods: {
            async openHandler() {
                Object.keys(this.speechForm).forEach(k => {
                    this.speechForm[k] = this.originSpeechForm[k];
                });
                this.isInterruptContent = await mxResources.get('isInterruptContent');
                this.speechForm.isArtificial = await handleArtificialChange.get();
                this.speechForm.artificialIntention = await handleArtificialIntentionChange.get();
                this.speechForm.isInterrupt = await handleInterruptChange.get();
            },

            /**
             * 获取方案类型
             * @return {Promise.<void>}
             */
            async fetchSchemeList() {
                const res = await axios.post(`${this.$baseUrl}scheme/querySchemeList.json`);
                const { resultMessageEnum, returnObject } = res.data;
                if (resultMessageEnum !== API_SUCCESS_CODE) {
                    this.$message.error('获取方案类型错误');
                    return;
                }
                this.schemeList = returnObject;
            },

            disableHandler() {
                if (this.viewType === null || this.viewType === '' || this.viewType === '0') {
                    this.isDisabled = true;
                }
            },

            appKeyCopy() {
                this.$refs['speechFormAppKey'].$refs.input.select();
                try {
                    const successful = document.execCommand("Copy");
                    if (successful) {
                        this.$message.success(`复制到剪贴板成功`);
                    } else {
                        this.$message.error(`复制到剪贴板失败`);
                    }
                } catch (err) {
                    this.$message.error(`复制到剪贴板失败`);
                }
            },

            handleArtificialChange(val) {
                this.$confirm('此项操作会同时改变流程图视图中的数据').then(() => {
                    this.$emit('updateSpeechForm', 'isArtificial', val);
                    handleArtificialChange.set(val);
                }).catch(() => {
                    this.speechForm.isArtificial = !val;
                });
            },

            handleArtificialIntentionChange(val) {
                this.$emit('updateSpeechForm', 'artificialIntention', val);
                this.$forceUpdate();
                handleArtificialIntentionChange.set(val);
            },

            handleInterruptChange(val) {
                let message = '';
                if (val) {
                    message = '您已在话术编辑器中设置了部分话术可打断，勾选后所有话术均可打断，此项操作会同时改变流程图视图中的数据。';
                } else {
                    message = '取消勾选后，在对话过程中所有话术将不能被打断，此项操作会同时改变流程图视图中的数据';
                }

                this.$confirm(message).then(() => {
                    this.$emit('updateSpeechForm', 'isInterrupt', val);
                    handleInterruptChange.set(val);
                }).catch(() => {
                    this.speechForm.isInterrupt = !val
                });
            },

            setting() {
                this.$refs['speechForm'].validate(async (valid) => {
                    if (valid) {
                        let params = {
                            'modifyKnowledgeFlag': true,
                            'id': this.speechForm.speechcraftId,
                            'speechcraftName': this.speechForm.speechcraftName,
                            'isInterrupt':this.speechForm.isInterrupt ? 1 : 0,
                            'isArtificial': this.speechForm.isArtificial ? 1 : 0,
                            'artificialIntention':this.speechForm.artificialIntention !== ''
                                ? this.speechForm.artificialIntention.join(',')
                                : '',
                        };

                        const res = await axios.post(`${this.$baseUrl}speechcraft/modifySpeechcraft.json`, params);
                        const { resultMessageEnum } = res.data;
                        if (resultMessageEnum !== API_SUCCESS_CODE) {
                            this.$message.error('修改话术错误');
                            return;
                        }
                        this.$emit('updateSpeechForm', 'speechcraftName', this.speechForm.speechcraftName);
                        this.visible = false;
                        this.$message.success('修改成功');
                    } else {
                        return false;
                    }
                });
            },
        }
    }
</script>

<style lang="less" scoped>
    .app-key-copy-item {
        position: relative;
    }

    .app-key-copy-icon {
        position: absolute;
        right: 0;
        top: -18px;
        width: 36px;
        height: 27px;
        color: white;
        cursor: pointer;
        background-color: rgba(39,44,58,0.49);
        display: block;
        font-size: 16px;
        text-align: center;
        line-height: 27px;
        border-radius: 3px;
    }

    .app-key-copy-icon:after {
        position: absolute;
        content: '';
        width: 0;
        height: 0;
        border-width: 6px 3px;
        border-style: solid;
        border-color: rgba(39,44,58,0.49) transparent transparent; /*只设置上面border的颜色，左右和下面都设置为透明，会出现一个倒三角*/
        bottom: -12px;
        left: 50%;
        margin-left: -3px;
    }
</style>

<style lang="less">
    .speech-editor-tip{
        max-width: 157px;
    }
</style>
