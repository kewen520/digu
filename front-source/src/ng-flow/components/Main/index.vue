<template>
    <div>
        <div class="main-container">
            <header>
                <h3>机器人话术列表</h3>
                <div class="header-buttons">
                    <el-button type="primary" class="header-button" @click="exportExcel">导出表格</el-button>
                    <el-button type="primary" class="header-button" @click="importFile">导入表格</el-button>
                    <input ref="uploadFile" @change="fileChange" type="file" style="display: none">
                </div>
            </header>
            <section>
                <NodeList
                        class="main-left"
                        :flowRobotNodes="value"
                        :tabIndex="tabIndex"
                        @tabNodeList="index => tabIndex = index"
                ></NodeList>
                <NodeTable class="main-right" v-model="value[tabIndex]"></NodeTable>
            </section>
        </div>
    </div>
</template>

<script>
    import NodeList from '../NodeList';
    import NodeTable from '../NodeTable';
    import bus from '../../../common/bus';
    import { importExcel, exportExcel } from '../../lib/excel';
    import { fillAndSortNode } from '../../lib/nodeHandler';

    export default {
        props: {
            speechCraft: {
                type: Object,
                default: () => {
                    return {};
                },
            },

            value: {
                type: Array,
                default: () => {
                    return [];
                }
            },
        },

        data() {
            return {
                isDrawerOpen: true,
                tabIndex: 0,
            };
        },

        components: {
            NodeList,
            NodeTable,
        },

        methods: {
            exportExcel() {
                exportExcel(this.value, this.speechCraft.speechcraftName);
            },

            importFile() {
                this.$refs['uploadFile'].click();
            },

            async fileChange() {
                let res = await importExcel(this.$refs['uploadFile']);
                this.$refs['uploadFile'].value = '';
                if (res.length !== this.value.length) {
                    this.$message.error('上传文件的节点数量与当前不一致');
                    return;
                }
                res = fillAndSortNode(res, this.value);
                this.$emit("input", res);
                this.$message.success('上传完成');
            },
        },
    }
</script>
<style lang="less" scoped>
    .main-container {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        background: white;
        border-radius: 4px;
        box-shadow:1px 2px 5px 0 rgba(199,202,208,0.32);

        > section {
            position: absolute;
            left: 0;
            top: 81px;
            right: 0;
            bottom: 0;
        }
    }

    header {
        height: 80px;
        border-bottom: 1px rgba(235,237,240,1) solid;

        h3 {
            float: left;
            color: #647184;
            font-size: 16px;
            text-indent: 33px;
            line-height: 80px;
            font-weight: normal;
        }

        .header-buttons {
            float: right;
            margin-right: 21px;
            margin-top: 17px;
        }

        .header-button {
            width: 96px;
            height: 38px;
            font-size: 14px;
            margin-left: 16px;
        }
    }

    .main-left {
        position: absolute;
        width: 160px;
        left: 0;
        top: 0;
        bottom: 0;
    }

    .main-right {
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        left: 160px;
        border-left: 1px rgba(235,237,240,1) solid;
    }
</style>
