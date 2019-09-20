<template>
    <div class="empty-div" v-if="isEmpty">
        <div class="big-background-icon"></div>
        <h3>会话列表为空</h3>
        <p>请先去<a href="/index.html#/speech">我的话术</a>创建“智能设备方案”类型的话术模版，才能使用创建任务哦</p>
    </div>
    <div v-else>
        <DialogueDesc
                v-if="openDesc"
                v-bind:dialogueDesc="dialogueDesc"
                v-on:return-back="returnBackToList"
        >
        </DialogueDesc>
        <div v-else class="table table-main">
            <div class="content-box-top">
                <el-input
                        class="search-input"
                        v-model="searchDialogueName"
                        placeholder="筛选关键词"
                        @keyup.native.13="search"
                        @change="searchInputChange"
                        clearable
                ></el-input>
                <el-button class="search-btn" type="primary" @click="search">搜索</el-button>
                <div class="content-box-top-bottom">
                    <el-date-picker
                            v-model="select_date"
                            class="select-date"
                            type="daterange"
                            align="left"
                            unlink-panels
                            range-separator="至"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"
                            prefix-icon="el-icon-time"
                    >
                    </el-date-picker>
                    <el-select v-model="select_channel_name" placeholder="接入渠道"  class="select-channel">
                        <el-option v-for="item in []" :key="item.id" :label="item.name" :value="item.id">
                        </el-option>
                    </el-select>
                    <el-button type="primary" class="select-filter-btn" @click="filter">筛选</el-button>
                </div>
            </div>
            <div class="table-out-header">
                <h2>会话列表</h2>
                <el-button class="export-btn" type="primary" @click="exportFile()">导出报表</el-button>
            </div>
            <el-table class="table" :data="dialogueDataList" @selection-change="handleSelectionChange" stripe>
                <el-table-column type="selection" width="55" align="center"></el-table-column>
                <el-table-column prop="deviceId" label="设备ID" width="200" sortable :formatter="defaultValue" fixed></el-table-column>
                <el-table-column prop="dialogStartTime" label="会话开始时间" :formatter="formatTime" sortable  align="center"></el-table-column>
                <el-table-column prop="dialogEndTime" label="会话结束时间" :formatter="formatTime" sortable align="center"></el-table-column>
                <el-table-column prop="speechcraftName" :formatter="defaultValue" label="话术名称" sortable align="center"></el-table-column>
                <el-table-column prop="channelName" :formatter="defaultValue" label="接入渠道" sortable align="center"></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="text" @click="jumpDesc(scope.$index, scope.row)">详情</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination class="pagination" background @current-change="changePage"
                           layout="total, prev, pager, next,jumper"
                           :total="pagination.total"
                           :page-size="pagination.pageSize"
            >
            </el-pagination>
        </div>
    </div>
</template>

<script>

    import bus from '../../common/bus';
    import axios from 'axios';
    import { API_ERROR_CODE, API_SUCCESS_CODE } from '../../common/enums';
    import moment from 'moment';
    import DialogueDesc from './DialogueDesc';

    export default {
        components: {
            DialogueDesc,
        },

        data() {
            return {
                openDesc: false,
                dialogueDesc: null,
                searchDialogueName: '',
                pagination: {
                    total: 0,
                    pageIndex: 1,
                    pageSize: 20,
                },
                dialogueDataList: [],
                multipleSelection: [],
                isEmpty: false,
                select_date: [],
                select_channel_name: '',
            };
        },

        async created() {
            if (!await this.checkSpeechcraftExists()) {
                this.isEmpty = true;
                return;
            }
            bus.$emit('contentTop', true);
            this.fetchList();
        },

        methods: {
            async checkSpeechcraftExists() {
                const res = await axios.get(this.$baseUrl + 'speechcraft/checkSpeechcraftExists.json?speechcraftType=1');

                const { resultMessageEnum, returnObject } = res.data;
                if (resultMessageEnum === API_SUCCESS_CODE) {
                    return returnObject;
                } else {
                    return false;
                }
            },

            defaultValue(row, column, cellValue, index) {
                return cellValue || '-';
            },

            formatTime(row, column, cellValue, index) {
                if (!cellValue) {
                    return '-';
                }
                return moment.unix(Math.floor(cellValue / 1000)).format('YYYY-MM-DD HH:mm:ss');
            },

            async search() {
                if (!this.searchDialogueName) {
                    this.$message.error('请输输入筛选条件');
                } else {
                    await this.fetchList();
                }
            },

            async filter() {
                if (this.select_date <= 0 && !this.select_channel_id) {
                    this.$message.error("请输入筛选条件！");
                    return false;
                }
                this.pagination.pageIndex = 1;
                await this.fetchList();
            },

            async searchInputChange(val) {
                if (!val) {
                    await this.fetchList();
                }
            },

            async fetchList() {
                const params = {
                    currentPage: this.pagination.pageIndex - 1,
                    pageSize: this.pagination.pageSize,
                };

                if (this.searchDialogueName) {
                    params.searchKey = this.searchDialogueName;
                }

                // 日期
                if (this.select_date && this.select_date.length > 0) {
                    const [startTime, endTime] = this.select_date;
                    if (startTime) params.dialogStartTime = moment(startTime).format("YYYY-MM-DD HH:mm:ss");
                    if (endTime) params.dialogEndTime = moment(endTime).format("YYYY-MM-DD HH:mm:ss");
                }

                // 渠道
                if (this.select_channel_name) {
                    data.channelName = this.select_channel_name;
                }

                const { data } = await axios.post(this.$baseUrl + 'dialog/queryDialogList.json', params);
                if (data.resultMessageEnum === API_ERROR_CODE) {
                    this.$message.error('系统异常');
                    return;
                }

                this.dialogueDataList = data.returnObject.recordList;
                this.pagination.total = data.returnObject.totalNumber;
            },

            handleSelectionChange(val) {
                this.multipleSelection = val;
            },

            /**
             * 会话列表导出
             * @return {Promise.<boolean>}
             */
            async exportFile() {
                let list = [];
                if (this.multipleSelection.length){
                    this.multipleSelection.forEach(el => {
                        list.push(el.id);
                    });
                } else {
                    this.$message.error('请选择要导出报表任务！');
                    return false;
                }

                const res = await axios.post(`${this.$baseUrl}dialog/exportDialogExcelFile.json`, list);
                const { resultMessageEnum, returnObject, errorInfoList } = res.data;
                if (resultMessageEnum === API_SUCCESS_CODE) {
                    this.multipleSelection = [];
                    window.location.href = `${this.$baseUrl}file/downloadFile.html?filePath=${returnObject.filePath}`;
                } else {
                    this.$message.error(errorInfoList[0].errorMessage);
                }
            },

            jumpDesc(index, row) {
                this.dialogueDesc = row;
                bus.$emit('contentTop', false);
                this.openDesc = true;
            },

            returnBackToList() {
                this.dialogueDesc = null;
                bus.$emit('contentTop', true);
                this.openDesc = false;
            },

            async changePage(page) {
                this.pagination.pageIndex = page;
                await this.fetchList();
            },

        },

        destroyed() {
            bus.$emit('contentTop', false);
        },
    }
</script>

<style scoped lang="less">
    .empty-div {
        .big-background-icon {
            width: 100%;
            height: 186px;
            margin-top: 210px;
            background: url(../../../static/img/task_empty.png) center center no-repeat;
        }

        h3 {
            color: #A3B1BF;
            font-size: 24px;
            text-align: center;
            font-weight: normal;
            margin-top: 32px;
        }

        p {
            font-size: 16px;
            margin-top: 40px;
            text-align: center;
            color: #647184;
        }
    }

    .content-box-top {
        .search-input {
            width: 240px;
        }

        .search-btn {
            margin-left: 15px;
        }
    }

    .content-box-top-bottom {
        margin-top: 15px;
        .select-date {
            margin-right: 15px;
            vertical-align: middle;
        }

        .select-channel {
            margin-right: 15px;
        }
    }

    .content-box-top {
        height: 110px;
    }

    .table-main {
        padding-top: 50px;
    }

    .table-out-header {
        background: white;
        border-bottom: 1px solid #EBEDF0;
        h2 {
            font-size: 16px;
            color: #647184;
            line-height: 60px;
            text-indent: 32px;
            font-weight: normal;
            display: inline-block;
        }

        .export-btn {
            float: right;
            margin: 11px 30px 0 0;
            width: 90px;
            height: 38px;
        }
    }

    .table {
        font-size: 14px;
        color: #647184;
    }
</style>
