<template>
    <header>
        <h2>
            <span>{{speechCraft.speechcraftName}}</span>
            <i class="el-icon-edit-outline" @click="clickSpeechName"></i>
            <SpeechCraftModal
                    :originSpeechForm="speechCraft"
                    :viewType="viewType"
                    :dialogSpeechSettingVisible.sync="dialogSpeechSettingVisible"
                    @updateSpeechForm="(k, v) => $emit('updateSpeechForm', k, v)"
            ></SpeechCraftModal>
        </h2>
        <div class="header-right">
            <span class="save-info" :class="saveTime ? 'el-icon-circle-check' : ''">{{saveTime ? `保存于${saveTime}` : 'ctrl+s可快捷保存'}}</span>
            <div class="view-switch">
                <a @click="backToFlow" class="icon-flow"></a>
                <a class="icon-list active"></a>
            </div>
        </div>
    </header>
</template>

<script>
    import SpeechCraftModal from '../SpeechCraftModal'

    export default {
        components: {
            SpeechCraftModal
        },

        props: {
            speechCraft: {
                type: Object,
                default: () => {
                    return {};
                },
            },

            viewType: {
                type: String,
                default: '',
            },

            saveTime: {
                type: String,
                default: '',
            },
        },

        data() {
            return {
                dialogSpeechSettingVisible: false,
            }
        },

        methods: {
            backToFlow() {
                this.$emit('backToFlow');
            },

            clickSpeechName() {
                this.dialogSpeechSettingVisible = true;
            },
        }
    }
</script>
<style lang="less" scoped>
    header {
        height: 80px;
        background: white;
        box-shadow:0 2px 10px 0 rgba(97,98,110,0.12);
        z-index: 1;

        h2 {
            padding-left: 33px;
            color: #4E5F6F;
            font-size: 20px;
            line-height: 80px;
            font-weight: normal;
            float: left;

            i {
                color: #4E8FF9;
                margin-left: 10px;
                cursor: pointer;
            }
        }
    }

    .header-right {
        float: right;
        line-height: 80px;
        padding-right: 24px;

        .save-info {
            font-size: 14px;
            color: #ACB5C1;
            margin-right: 53px;
            &:before {
                font-size: 20px;
                margin-right: 10px;
                vertical-align: sub;
                color: #0FD9AC;
            }
        }
    }

    .view-switch {
        display: inline-block;
        height: 50px;
        border: 1px solid #DEE2E6;
        border-radius: 4px;
        margin-top: 15px;
        float: right;
        a {
            width: 50px;
            height: 50px;
            display: inline-block;
            float: left;
            background-repeat: no-repeat;
            background-position: 10px;
            &.active {
                background-color: #6196FF;
            }
        }

        .icon-flow {
            cursor: pointer;
            background-image: url("../../images/icons/flow.png");
        }

        .icon-list {
            background-image: url("../../images/icons/list.png");
        }
    }
</style>
