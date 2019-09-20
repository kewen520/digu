<template>
    <div class="table">
        <div class="content-box-top">
            <el-input v-model="queryKey" clearable placeholder="任务名称" @change="searchChange" class="handle-input mr10" @keyup.native.13="search"></el-input>
            <el-button type="primary" icon="search" @click="search">搜索</el-button>
            <div v-if="userInfo.role.indexOf(1) !== -1 || userInfo.role.indexOf(2) !== -1" class="content-box-top-right">
                <el-button type="primary" icon="iconfont icon-ico_new-task" @click="handleCreat">导出报表</el-button>
            </div>
        </div>
        <el-dropdown v-if="userInfo.role.indexOf(1) !== -1 || userInfo.role.indexOf(2) !== -1" @command="handleCommandType">
            <span class="el-dropdown-link">
                近{{dropdownTextType}}天<i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="7">近7天</el-dropdown-item>
                <el-dropdown-item command="15">近15天</el-dropdown-item>
                <el-dropdown-item command="30">近30天</el-dropdown-item>
                <el-dropdown-item command="60">近60天</el-dropdown-item>
            </el-dropdown-menu>
        </el-dropdown>
        <!--统计数据-->
        <div v-if="userInfo.role.indexOf(1) !== -1 || userInfo.role.indexOf(2) !== -1" class="dashboard-box">
            <el-row :gutter="20" class="mgb20">
                <el-col :span="4">
                    <el-card shadow="hover" :body-style="{padding: '0px'}">
                        <div class="grid-content grid-con-1">
                            <!--<i class="iconfont icon-ico_phone-call grid-con-icon"></i>-->
                            <div class="grid-cont-right">
                                <div><span class="grid-num">{{statisticsData ? statisticsData.tatal : 0}}</span>个</div>
                                <div class="grid-cont-right-tex">总数</div>
                            </div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="4">
                    <el-card shadow="hover" :body-style="{padding: '0px'}">
                        <div class="grid-content grid-con-2">
                            <!--<i class="iconfont icon-ico_ringer grid-con-icon"></i>-->
                            <div class="grid-cont-right">
                                <div><span class="grid-num">{{statisticsData ? statisticsData.tatalInit : 0}}</span>个</div>
                                <div class="grid-cont-right-tex">未释放</div>
                            </div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="4">
                    <el-card shadow="hover" :body-style="{padding: '0px'}">
                        <div class="grid-content grid-con-3">
                            <!--<i class="iconfont icon-ico_phone-call grid-con-icon"></i>-->
                            <div class="grid-cont-right">
                                <div><span class="grid-num">{{statisticsData ? statisticsData.tatalUnclaimed : 0}}</span>个</div>
                                <div class="grid-cont-right-tex">待领取</div>
                            </div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="4">
                    <el-card shadow="hover" :body-style="{padding: '0px'}">
                        <div class="grid-content grid-con-4">
                            <!--<i class="iconfont icon-ico_chat grid-con-icon"></i>-->
                            <div class="grid-cont-right">
                                <div><span class="grid-num">{{statisticsData ? statisticsData.tatalChecking : 0}}</span>个</div>
                                <div class="grid-cont-right-tex">质检中</div>
                            </div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="4">
                    <el-card shadow="hover" :body-style="{padding: '0px'}">
                        <div class="grid-content grid-con-5">
                            <!--<i class="iconfont icon-ico_percentage grid-con-icon"></i>-->
                            <div class="grid-cont-right">
                                <div><span class="grid-num">{{statisticsData ? statisticsData.tatalCompleted : 0}}</span>个</div>
                                <div class="grid-cont-right-tex">已完成</div>
                            </div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
        </div>
        <!--数据展示列表-->
        <div class="w-cantainer task-table-cantainer" >
            <div class="box-card task-card">
                <div class="task-card-top-btn-box" >
                    <el-button type="primary" :disabled="batchReleaseDisable" v-if="activeName === 'first' && userInfo.role.indexOf(2) !== -1" @click="handleReleaseTask">
                        批量释放
                    </el-button>
                    <el-button type="primary"
                               v-if="checkerActiveName === 'first' && userInfo.role.indexOf(1) === -1 && userInfo.role.indexOf(2) === -1"
                               @click="handleRefresh">刷新
                    </el-button>
                    <el-button type="primary" :disabled="batchGetDisable"
                               v-if="checkerActiveName === 'first' && userInfo.role.indexOf(1) === -1 && userInfo.role.indexOf(2) === -1"
                               @click="handleGetTaskCheck">批量领取
                    </el-button>
                    <!--<el-button type="primary" :disabled="batchSubmitDisable"  v-if="checkerActiveName === 'second' && checkerMyActiveName !== 'third'" @click="handleBatchSubmit">批量提交
                    </el-button>-->
                </div>
                <el-tabs v-model="activeName" @tab-click="handleTabClick" v-if="userInfo.role.indexOf(1) !== -1 || userInfo.role.indexOf(2) !== -1">
                    <el-tab-pane label="全部" name="first">
                    </el-tab-pane>
                    <el-tab-pane label="未完成" name="second">
                    </el-tab-pane>
                    <el-tab-pane label="已完成" name="third">
                    </el-tab-pane>
                </el-tabs>
                <el-tabs v-model="checkerActiveName" @tab-click="handleCheckerTabClick" v-else>
                    <el-tab-pane label="待领取" name="first">
                    </el-tab-pane>
                    <el-tab-pane label="我的" name="second">

                    </el-tab-pane>
                </el-tabs>
                <el-tabs v-model="checkerMyActiveName" @tab-click="handleCheckerMyTabClick" v-if="checkerActiveName ==='second'">
                    <el-tab-pane label="全部" name="first">
                    </el-tab-pane>
                    <el-tab-pane label="未完成" name="second">
                    </el-tab-pane>
                    <el-tab-pane label="已完成" name="third">
                    </el-tab-pane>
                </el-tabs>
                <!--主账号、组长数据展示-->
                <el-table v-if="userInfo.role.indexOf(1) !== -1 || userInfo.role.indexOf(2) !== -1 || checkerActiveName == 'first'"
                          :data="taskTableData" stripe class="table"
                          ref="multipleTable"
                          :height="height"
                          :options="options"
                          :pagination="pagination"
                          @sort-change="sortChange"
                          @selection-change="handleSelectionChange"
                          @filter-change="handleFilterChange"
                >
                    <el-table-column :key="Math.random()" :selectable="handleSelectable" type="selection"
                                     v-if="userInfo.role.indexOf(2) !== -1 && activeName === 'first'
                                     || userInfo.role.indexOf(1) === -1 && userInfo.role.indexOf(2) === -1 && checkerActiveName === 'first'"
                                     width="50" align="center"></el-table-column>
                    <el-table-column :key="Math.random()" type="index" :index="handleIndex" width="50" align="center" label="编号"></el-table-column>
                    <el-table-column :key="Math.random()" prop="taskName" label="任务名称"></el-table-column>
                    <el-table-column :key="Math.random()" prop="checkReleaseTime" label="创建时间" :formatter="formatCheckReleaseTime" sortable width="200"></el-table-column>
                    <el-table-column :key="Math.random()" prop="connectedNumber" label="接通数" width="150"></el-table-column>
                    <el-table-column prop="checkStatus" label="任务状态"
                                     :formatter="handleCheckStatus"
                                     width="100"
                                     column-key="checkStatusList"
                                     :filters="checkStatusFilters"
                    >
                    </el-table-column>
                    <el-table-column prop="checkCheckerName"
                                     v-if="userInfo.role.indexOf(1) !== -1 || userInfo.role.indexOf(2) !== -1"
                                     label="操作人" :formatter="formatCheckCheckerName" width="150"
                                     column-key="operatorList"
                                     :filters="operatorFilters"></el-table-column>
                    <el-table-column :key="Math.random()" prop="checkProgress"
                                     v-if="userInfo.role.indexOf(1) !== -1 || userInfo.role.indexOf(2) !== -1"
                                     label="质检进度" :formatter="formatCheckProgress" width="150"></el-table-column>
                    <el-table-column :key="Math.random()" label="操作" width="150" align="center" fixed="right">
                        <template slot-scope="scope">
                            <el-button type="text" @click="handleTaskCheckDesc(scope.$index, scope.row)">详情</el-button>
                            <span v-if="userInfo.role.indexOf(1) !== -1">
                                <el-button type="text"
                                           v-if="(scope.row.checkLeaderId == null || scope.row.checkLeaderId == '') && scope.row.memberId == userInfo.id"
                                           @click="handleReleaseTask(scope.$index, scope.row)"
                                >指派
                                </el-button>
                                <el-button type="text"
                                           v-else-if="scope.row.checkStatus === 1 && scope.row.memberId == userInfo.id"
                                           @click="handleTakeBackTask(scope.$index, scope.row)">收回</el-button>
                            </span>
                            <span v-else-if="userInfo.role.indexOf(2) !== -1">
                                <el-button type="text"
                                           v-if="scope.row.checkStatus === 1"
                                           @click="handleReleaseTask(scope.$index, scope.row)"
                                >释放
                                </el-button>
                                <el-button type="text"
                                           v-else-if="scope.row.checkStatus !== 1 && scope.row.checkStatus !== 4"
                                           @click="handleTakeBackTask(scope.$index, scope.row)">收回</el-button>
                            </span>
                            <span v-else>
                                <el-button type="text" @click="handleGetTaskCheck(scope.$index, scope.row)">领取</el-button>
                            </span>
                        </template>
                    </el-table-column>
                </el-table>
                <!--质检员数据展示-->
                <el-table v-else
                          :data="taskDescTableData" stripe class="table"
                          ref="multipleTable"
                          :height="height"
                          :options="options"
                          :pagination="pagination"
                          @sort-change="sortChange"
                          @selection-change="handleSelectionChange"
                          @filter-change="handleFilterChange"
                >
                    <el-table-column :key="Math.random()" :selectable="handleSelectable" type="selection" width="50"
                                     align="center"
                                     v-if="checkerMyActiveName !== 'third'"></el-table-column>
                    <el-table-column :key="Math.random()" type="index" :index="handleIndex" width="50" align="center" label="编号"></el-table-column>
                    <el-table-column :key="Math.random()" prop="taskName" label="任务名称">
                    </el-table-column>
                    <el-table-column :key="Math.random()" prop="phone" label="外呼号码" width="150">
                    </el-table-column>
                    <el-table-column :key="Math.random()" prop="customerName" label="用户姓名" width="100">
                    </el-table-column>
                    <el-table-column :key="Math.random()"
                            prop="callTime"
                            label="外呼时间"
                            sortable
                            width="150"
                    >
                    </el-table-column>
                    <el-table-column :key="Math.random()" width="100" prop="ringDuration" sortable label="振铃时长">
                    </el-table-column>
                    <el-table-column :key="Math.random()" width="100" prop="connectedDuration" sortable label="通话时长">
                    </el-table-column>
                    <el-table-column :key="Math.random()"
                                     width="100"
                                     prop="connectedResultType"
                                     label="通话结果"
                                     column-key="connectedResultTypeList"
                                     :formatter="connectedResultType"
                    >
                    </el-table-column>
                    <el-table-column :key="Math.random()"
                                     width="100"
                                     prop="intentionLevel"
                                     label="意向级别"
                                     :formatter="intentionLevel"
                                     column-key="intentionLevelList"
                    >
                    </el-table-column>
                    <el-table-column :key="Math.random()" width="100" prop="interactTimes" label="交互次数">
                    </el-table-column>
                    <el-table-column :key="Math.random()" label="操作" width="50" align="center">
                        <template slot-scope="scope">
                            <el-button type="text" @click="queryTaskResultDesc(scope.$index, scope.row)">详情</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="pagination">
                    <el-pagination background
                                   @size-change="handleSizeChange"
                                   @current-change="handleCurrentChange"
                                   layout="total, sizes, prev, pager, next, jumper"
                                   :total="pagination.total"
                                   :page-size="pagination.pageSize"
                                   :page-sizes="[10, 50, 100, 200]"
                    >
                    </el-pagination>
                </div>
            </div>
        </div>

        <!-- 释放弹出框 -->
        <el-dialog :title="releaseTitle" class="creatDialog" :visible.sync="releaseVisible" width="400px">
            <el-form ref="releaseForm" :inline="true" :rules="releaseRules" :model="releaseForm" label-width="80px" v-if="userInfo.role.indexOf(1) !== -1">
                <el-form-item prop="checkLeaderId" label="指派组长" >
                    <el-select clearable v-model="releaseForm.checkLeaderId" placeholder="选择组长">
                        <el-option
                                v-for="item in leaderList"
                                :key="item.id"
                                :label="item.leaderName + '(' + item.groupName + ')'"
                                :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <el-form ref="releaseForm" :inline="true"  :rules="leaderReleaseRules" :model="releaseForm" label-width="80px" v-else>
                <el-form-item prop="releasePath" label="释放路径">
                    <el-select clearable v-model="releaseForm.releasePath" placeholder="选择任务释放路径">
                        <el-option
                                v-for="item in releasePathList"
                                :key="item.id"
                                :label="item.value"
                                :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item prop="checkCheckerId" label="质检员" v-if="releaseForm.releasePath === 2">
                    <el-select clearable v-model="releaseForm.checkCheckerId" placeholder="选择质检员">
                        <el-option
                                v-for="item in checkerList"
                                :key="item.id"
                                :label="item.contactName"
                                :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="releaseVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleConfirmReleaseTask('releaseForm')">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 收回弹出框 -->
        <el-dialog title="收回任务" class="creatDialog" :visible.sync="takeBackTaskVisible" width="350px">
            {{takeBackTaskText}}
            <span slot="footer" class="dialog-footer">
                <el-button @click="takeBackTaskVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleConfirmTakeBackTask('releaseForm')">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 详情弹出框 -->
        <el-dialog title="识别详情" class="video-box" :visible.sync="viewVisible" width="600px">
            <div class="video-contant-box">
                <w-video :source="viewSource" :playing="viewPlaying"/>
            </div>
            <!--识别详情-->
            <el-table
                    :data="viewTableData"
                    :row-style="rowStyle"
                    :height="200"
                    empty-text="暂无识别内容"
                    stripe
                    style="width: 100%;">
                <el-table-column
                        prop="nodeName"
                        label="节点名称"
                        width="180">
                    <template slot-scope="scope">
                        <a class="viewItemText">{{scope.row.nodeName}}</a>
                    </template>
                </el-table-column>
                <el-table-column
                        prop="nodeContent"
                        label="识别内容">
                </el-table-column>
            </el-table >
            <!--质检结果-->
            <el-table
                    :data="taskCheckResult"
                    :row-style="rowStyle"
                    empty-text="暂无质检结果"
                    stripe
                    style="width: 100%;padding-top: 20px">
                <el-table-column
                        prop="checkerName"
                        label="质检人"
                        width="180">
                </el-table-column>
                <el-table-column
                        prop="result"
                        label="质检结果">
                </el-table-column>
            </el-table>
            <!--质检内容-->
            <el-form ref="checkForm" :inline="true" :rules="checkRules" :model="checkForm" label-width="100px"
                     v-if="taskItemResultRecognition.checkItemStatus == 0" style="padding-top: 20px;">
                <el-form-item prop="checkResult" label="质检结果：">
                    <el-input type="textarea" v-model="checkForm.checkResult" placeholder="请输入质检结果" maxlength="200"
                              rows="2"
                              style="width: 480px"
                              show-word-limit
                    ></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer" v-if="taskItemResultRecognition.checkItemStatus == 0">
                <el-button type="primary" @click="handleSubmitCheckResult('checkForm')">保存并提交</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import wVideo from '../base/Video';
    import bus from '../../common/bus';
    import dateTime from '../../common/date';
    import common from '../../common/common';
    import {numeral} from '../../common/numeral.min.js';
    export default {
        name: 'taskCheck',
        data() {
            return {
                dropdownTextType:'7',
                statisticsData:null,
                releaseVisible:false,
                releaseTitle:'指派组长',
                releaseForm: {
                    releasePath:null,
                    checkLeaderId:'',
                    checkCheckerId:'',
                },
                checkForm: {
                    checkResult:'',
                    taskItemId:'',
                },
                releaseRules: {
                    checkLeaderId: [
                        { required: true, message: '请选择组长！', trigger: 'change' }
                    ],
                },
                leaderReleaseRules: {
                    releasePath: [
                        { required: true, message: '请选择释放路径！', trigger: 'change' }
                    ],
                    checkCheckerId: [
                        { required: true, message: '请选择质检员！', trigger: 'change' }
                    ],
                },
                checkRules: {
                    checkResult: [
                        { required: true, message: '质检结果不能为空！', trigger: 'change' }
                    ],
                },
                releasePathList:[
                    {id:1,value:'释放到公共池'},
                    {id:2,value:'指派质检员'},

                ],
                takeBackTaskVisible:false,
                takeBackTaskText:'',
                taskCheckResult:[],
                userInfo:null,
                taskId:'',
                activeName: 'second',
                checkerActiveName:'first',
                checkerMyActiveName:'second',
                tabIndex: 2,
                height:300,
                cerVisible:false,
                taskStatusList:[],
                checkStatusFilters:[{text: '待领取', value: '2'},{text: '质检中', value: '3'}],
                checkStatusList:[2,3],
                operatorFilters:[],
                operatorList:[],
                checkerList:[],
                checkItemStatus:0,
                intentionLevelList:[],
                connectedResultTypeList:[],
                labelPosition:"left",
                taskTableData: [],
                taskDescTableData: [],
                multipleSelectionRelease: [],
                multipleSelectionGet: [],
                multipleSelectionSubmit: [],
                batchReleaseDisable:true,
                batchGetDisable:true,
                batchSubmitDisable:true,
                select_cate: '',
                queryKey: '',
                del_list: [],
                fileTipText:"",
                downTaskItemExcelTemplateHref:'',
                is_search: false,
                cretVisible: false,
                delVisible: false,

                creatOptions: [
                ],
                phoneOptions:[],
                taskLevels:[],
                idx: -1,
                cur_page:1,
                pagination: {
                    show: true,
                    total: 0,
                    pageIndex: 1,
                    pageSize: 10
                },
                options: {
                    stripe: true, // 是否为斑马纹 table
                    loading: true, // 是否添加表格loading加载动画
                    highlightCurrentRow: true, // 是否支持当前行高亮显示
                    mutiSelect: true // 是否支持列表项选中功能
                },
                sortList:[],
                errors:{
                    filePath:''
                },

                leaderList:[],
                viewVisible: false,
                viewTableData: [],
                viewSource:'',
                viewPlaying:false,
                activeRow:'',
                taskItemResultRecognition:[],
            }
        },
        props:{
        },
        components:{
            wVideo,
        },
        created() {
            this.userInfo = JSON.parse(localStorage.getItem('USER_INFO'));
            this.queryTaskCheckList();
            let clintHeight = document.documentElement.clientHeight;
            if (this.userInfo.role.indexOf(1) !== -1 || this.userInfo.role.indexOf(2) !== -1){
                let startDate = dateTime.sevenday('7');
                let endDate = dateTime.today();
                this.queryTaskCheckStatistics({startDate:startDate,endDate:endDate});
                this.height = clintHeight - 390;
            }else {
                this.height = clintHeight - 300;
            };
            bus.$emit('contentTop', true);
        },
        computed: {
        },
        methods: {
            /**
             * 处理编号
             * @param row
             * @param index
             * @returns {*}
             */
            handleIndex(index){
                return index + 1 + (this.cur_page - 1) * this.pagination.pageSize
            },
            /**
             * 处理复选框可选状态
             * @param row
             * @param index
             * @returns {boolean}
             */
            handleSelectable(row, index){
                let bReturn = false;
                if (this.userInfo.role.indexOf(2) !== -1 && row.checkStatus === 1){
                    bReturn = true;
                } else if(this.userInfo.role.indexOf(1) === -1 && this.userInfo.role.indexOf(2) === -1){
                    if(this.checkerActiveName === 'first'  && row.checkStatus === 2){
                        bReturn = true;
                    }
                    else if (this.checkerActiveName === 'second'  && row.checkItemStatus === 0){
                        bReturn = true;
                    } ;
                };
                return bReturn;

            },
            /**
             * 处理复选
             * @param val
             */
            handleSelectionChange(val) {
                if (this.userInfo.role.indexOf(2) !== -1){
                    this.multipleSelectionRelease = val;
                } else if (this.userInfo.role.indexOf(2) == -1 && this.userInfo.role.indexOf(1) == -1) {
                    if (this.checkerActiveName === 'first') {
                        this.multipleSelectionGet = val;
                    } else if(this.checkerMyActiveName !== 'third'){
                        this.multipleSelectionSubmit = val;
                    };
                };

                this.batchReleaseDisable = this.multipleSelectionRelease.length > 0 ? false : true;
                this.batchGetDisable = this.multipleSelectionGet.length > 0 ? false : true;
                this.batchSubmitDisable = this.multipleSelectionSubmit.length > 0 ? false : true;
            },
            /**
             * 处理统计
             * @param command
             */
            handleCommandType(command) {
                let startDate = dateTime.sevenday(command);
                let endDate = dateTime.today();
                this.queryTaskCheckStatistics({
                    startDate: startDate,
                    endDate: endDate
                });
                this.dropdownTextType=command;
            },
            /**
             * 处理主账号、组长一级Tab切换
             */
            handleTabClick(){
                this.$refs.multipleTable.clearSelection();
                this.$refs.multipleTable.clearFilter();
                this.operatorList = [];
                switch (this.activeName) {
                    case 'first':
                        this.checkStatusList=[];
                        this.checkStatusFilters = [{text: '未领取', value: '1'},{text: '待领取', value: '2'},{text: '质检中', value: '3'},{text: '已完成', value: '4'}];
                        break;
                    case 'second':
                        this.checkStatusList=[2,3];
                        this.checkStatusFilters=[{text: '待领取', value: '2'},{text: '质检中', value: '3'}];
                        break;
                    case 'third':
                        this.checkStatusList=[4];
                        this.checkStatusFilters = [{text: '已完成', value: '4'}];
                        break;
                }
                this.queryTaskCheckList();
            },
            /**
             * 处理质检员一级Tab切换
             */
            handleCheckerTabClick(){
                this.$refs.multipleTable.clearSelection();
                this.$refs.multipleTable.clearFilter();
                this.operatorList = [];
                if (this.checkerActiveName === 'first') {
                    this.checkStatusList = [2];
                    this.queryTaskCheckList();
                } else if(this.checkerActiveName === 'second'){
                    this.checkItemStatus=0;
                    this.queryTaskCheckItemList();
                };


            },
            /**
             * 处理质检员二级Tab切换
             */
            handleCheckerMyTabClick(){
                switch (this.checkerMyActiveName) {
                    case 'first':
                        this.checkItemStatus=null;
                        break;
                    case 'second':
                        this.checkItemStatus=0;
                        break;
                    case 'third':
                        this.checkItemStatus=1;
                        break;
                }
                this.queryTaskCheckItemList();
            },
            handleCreat(){
                /*if(!this.userInfo.authenticationFlag==1){
                    this.cerVisible = true;
                    return false;
                }
                this.cretVisible = true;
                this.querySpeechcraftList();
                this.querySystemConfig();
                this.queryTaskLevels();*/
            },
            /**
             * 处理分页导航
             * @param val
             */
            handleCurrentChange(val) {
                this.cur_page = val;
                if (this.userInfo.role.indexOf(1) !== -1 || this.userInfo.role.indexOf(2) !== -1) {
                    if (this.activeName === 'first'){
                        this.checkStatusList = [];
                    } else if (this.activeName === 'second') {
                        this.checkStatusList = [2,3];
                    }else if (this.activeName === 'third') {
                        this.checkStatusList = [4];
                    };

                    this.queryTaskCheckList();
                } else {
                    if (this.checkerActiveName === 'first') {
                        this.checkStatusList = [2];
                        this.queryTaskCheckList();
                    } else if(this.checkerActiveName === 'second'){
                        if (this.checkerMyActiveName === 'first'){
                            this.checkItemStatus = null;
                        } else if (this.checkerMyActiveName === 'second') {
                            this.checkItemStatus=0;
                        }else if (this.checkerMyActiveName === 'third') {
                            this.checkItemStatus=1;
                        };
                        this.queryTaskCheckItemList();
                    }
                };


            },
            /**
             * 每页显示条数改变
             * @param val
             */
            handleSizeChange(val) {
                this.pagination.pageSize = val;
                if (this.userInfo.role.indexOf(1) !== -1 || this.userInfo.role.indexOf(2) !== -1) {
                    if (this.activeName === 'first'){
                        this.checkStatusList = [];
                    } else if (this.activeName === 'second') {
                        this.checkStatusList = [2,3];
                    }else if (this.activeName === 'third') {
                        this.checkStatusList = [4];
                    };
                    this.queryTaskCheckList();
                } else {
                    if (this.checkerActiveName === 'first') {
                        this.checkStatusList = [2];
                        this.queryTaskCheckList();
                    } else if(this.checkerActiveName === 'second'){
                        if (this.checkerMyActiveName === 'first'){
                            this.checkItemStatus=null;
                        } else if (this.checkerMyActiveName === 'second') {
                            this.checkItemStatus=0;
                        }else if (this.checkerMyActiveName === 'third') {
                            this.checkItemStatus=1;
                        };
                        this.queryTaskCheckItemList();
                    }
                };
            },
            /**
             * 查询任务质检列表
             * @param opt
             */
            queryTaskCheckList(opt) {
                let data = $.extend({},{
                    currentPage:this.cur_page-1,
                    pageSize:this.pagination.pageSize
                },opt)
                if(this.checkStatusList){
                    data.checkStatusList = this.checkStatusList;
                }
                if (this.userInfo){
                    /*主账号*/
                    if (this.userInfo.role.indexOf(1) !== -1) {
                        data.enterpriseCode = this.userInfo.enterpriseCode;
                    }
                    /*组长*/
                    else if (this.userInfo.role.indexOf(2) !== -1) {
                        data.memberId = this.userInfo.id;
                    }
                    /*其他角色*/
                    else{
                        data.memberId = this.userInfo.checkLeaderId;
                        data.checkStatusList = [2];
                    }
                } ;
                if(this.queryKey){
                    data.queryKey=this.queryKey
                }
                if(this.sortList){
                    data.sortList =this.sortList;
                }
                if(this.operatorList){
                    data.operatorList =this.operatorList;
                }
                $.post(this.$baseUrl+'taskCheck/queryTaskCheckList.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        let list = res.returnObject.recordList;
                        if(list.length){
                            list.forEach((item,index)=>{
                                if(item.taskStatus==1){
                                    item.scale = 0;
                                    item.status = ''
                                }else{
                                    item.scale = item.calledPhoneNumber/item.phoneNumber*100||0;
                                    item.status =item.taskStatus==3?'exception': item.taskStatus==5?'success':''
                                }
                            })
                        }else{
                            list = [];
                        }
                        this.pagination.total = res.returnObject.totalNumber;
                        this.taskTableData = list;
                        if (this.userInfo.role.indexOf(1) !== -1 || this.userInfo.role.indexOf(2) !== -1) {
                            this.queryCheckerList();
                            let startDate = dateTime.sevenday(this.dropdownTextType);
                            let endDate = dateTime.today();
                            this.queryTaskCheckStatistics({
                                startDate: startDate,
                                endDate: endDate
                            });
                        }
                        ;

                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            /**
             * 查询任务质检详情列表
             * @param opt
             */
            queryTaskCheckItemList(opt) {
                let data = $.extend({},{
                    currentPage:this.cur_page-1,
                    pageSize:this.pagination.pageSize
                },opt)
                if (this.userInfo) {
                    data.checkCheckerId = this.userInfo.id;
                };
                if (this.checkItemStatus != null) {
                    data.checkItemStatus = this.checkItemStatus;
                };
                if(this.queryKey){
                    data.queryKey=this.queryKey
                }
                // 通话结果列表
                if(this.connectedResultTypeList.length){
                    data.connectedResultTypeList = this.connectedResultTypeList;
                }
                // 意向结果列表
                if(this.intentionLevelList.length){
                    data.intentionLevelList = this.intentionLevelList;
                }
                if(this.sortList){
                    data.sortList =this.sortList;
                }

                $.post(this.$baseUrl+'taskCheck/queryTaskItemList.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.taskDescTableData = res.returnObject.recordList;
                        this.pagination.total = res.returnObject.totalNumber;
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            /**
             * 任务质检详情
             * @param index
             * @param row
             */
            handleTaskCheckDesc(index,row){
                this.$router.push(`/task/${row.id}?isCheck=true`);
            },
            /**
             * 释放任务
             * @param index
             * @param row
             */
            handleReleaseTask(index,row){
                if (this.userInfo.role.indexOf(1) !== -1) {
                    this.releaseTitle = '指派组长';
                    this.queryLeaderList();
                } else {
                    this.releaseTitle = '释放任务';
                    this.queryCheckerList();
                };
                if (this.multipleSelectionRelease.length === 0) {
                    this.taskId = row.id;
                };
                this.releaseVisible = true;
            },
            /**
             *  确认释放
             */
            handleConfirmReleaseTask(formName){
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        let taskIds = [this.taskId];
                        if (this.multipleSelectionRelease.length > 0) {
                            taskIds = [];
                            this.multipleSelectionRelease.forEach(item=>{
                                taskIds.push(item.id);
                            })
                        };
                        let data = {
                            isAdmin: this.userInfo.role.indexOf(1) !== -1 ? true : false,
                            checkLeaderId: this.releaseForm.checkLeaderId,
                            taskIds:taskIds,
                            releasePath: this.userInfo.role.indexOf(1) !== -1 ? null : this.releaseForm.releasePath,
                            checkCheckerId:this.releaseForm.checkCheckerId,
                        };
                        $.post(this.$baseUrl + 'taskCheck/releaseTaskCheck.json', JSON.stringify(data)).then((res) => {
                            if (res.resultMessageEnum == '0000') {
                                this.releaseVisible = false;
                                this.queryTaskCheckList();
                                this.$message.success(this.releaseTitle + '成功！');
                            } else {
                                this.$message.error(res.errorInfoList[0].errorMessage);
                            }
                        });
                    } else {
                        return false;
                    }
                });
            },
            /**
             * 收回任务
             * @param index
             * @param row
             */
            handleTakeBackTask(index,row){
                if (this.userInfo.role.indexOf(1) !== -1) {
                    this.takeBackTaskText = '该任务已经指派给组长' + row.checkLeaderName + '，您确定要收回重新进行指派吗？';
                } else{
                    this.takeBackTaskText = '您确定要收回重新进行释放吗？';
                }
                this.taskId = row.id;
                this.takeBackTaskVisible = true;
            },
            /**
             * 确认收回任务
             */
            handleConfirmTakeBackTask(){
                let data = {
                    isAdmin: this.userInfo.role.indexOf(1) !== -1 ? true : false,
                    taskIds:[this.taskId],
                };
                $.post(this.$baseUrl + 'taskCheck/takeBackTaskCheck.json', JSON.stringify(data)).then((res) => {
                    if (res.resultMessageEnum == '0000') {
                        this.takeBackTaskVisible = false;
                        this.queryTaskCheckList();
                        this.$message.success('收回成功！');
                    } else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            /**
             * 领取任务
             * @param index
             * @param row
             */
            handleGetTaskCheck(index,row){
                let taskIds = [];
                if (this.multipleSelectionGet.length === 0) {
                    taskIds = [row.id];
                } else if(this.multipleSelectionGet.length > 0) {
                    taskIds = [];
                    this.multipleSelectionGet.forEach(item=>{
                        taskIds.push(item.id);
                    })
                };
                let data = {
                    taskIds:taskIds
                }
                $.post(this.$baseUrl+'taskCheck/getTaskCheck.json', JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.$message.success('领取成功！');
                        this.queryTaskCheckList();
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            /**
             * 刷新
             */
            handleRefresh(){
                this.queryTaskCheckList();
            },
            /**
             * 搜索
             * @returns {boolean}
             */
            search() {
                if(!this.queryKey){
                    this.$message.error("请输入关键字！");
                    return false;
                }
                this.cur_page=1;
                if (this.userInfo.role.indexOf(1) !== -1 || this.userInfo.role.indexOf(2) !== -1) {
                    // this.checkStatusList = [1,2,3];
                    this.queryTaskCheckList();
                } else {
                    if (this.checkerActiveName === 'first') {
                        // this.checkStatusList = [2];
                        this.queryTaskCheckList();
                    } else if(this.checkerActiveName === 'second'){
                        // this.checkItemStatus=0;
                        this.queryTaskCheckItemList();
                    }
                };
            },
            /**
             * 搜索内容变化
             * @param val
             */
            searchChange(val){
                if(!val){
                    if (this.userInfo.role.indexOf(1) !== -1 || this.userInfo.role.indexOf(2) !== -1) {
                        // this.checkStatusList = [1,2,3];
                        this.queryTaskCheckList();
                    } else {
                        if (this.checkerActiveName === 'first') {
                            // this.checkStatusList = [2];
                            this.queryTaskCheckList();
                        } else if(this.checkerActiveName === 'second'){
                            // this.checkItemStatus=0;
                            this.queryTaskCheckItemList();
                        }
                    };
                }
            },
            /**
             * 创建任务明细Excel下载文件
             * @returns {boolean}
             */
            createExportTaskItemExcelFile(){
                let list = [];
                if(this.multipleSelection.length){
                    this.multipleSelection.forEach(el=>{
                        list.push(el.id);
                    })
                }else{
                    this.$message.error('请选择要导出报表任务！');
                    return false;
                }
                let data={
                    taskIdList:list
                }
                $.post(this.$baseUrl+'file/createExportTaskItemExcelFile.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.multipleSelection = [];
                        window.location.href = this.$baseUrl+'file/downloadFile.html?filePath='+res.returnObject.filePath;
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            /**
             * 排序
             * @param column
             */
            sortChange(column){
                let flag = true;
                if(column.order=='ascending'){
                    flag = true;
                }else{
                    flag = false;
                }
                this.sortList =[{
                    propertyName:column.prop,
                    ascendingFlag:flag
                }]
                this.queryTaskCheckList();
            },
            /**
             * 处理任务质检状态
             * @param row
             * @param column
             * @returns {*|string}
             */
            handleCheckStatus(row, column){
                return common.taskCheckStatus(row.checkStatus);
            },
            /**
             * 处理过滤器改变
             * @param filters
             */
            handleFilterChange(filters){
                let name = Object.keys(filters)[0];
                if(name === 'checkStatusList'){
                    if (filters.checkStatusList.length === 0){
                        if (this.activeName === 'first') {
                            this.checkStatusList = [];
                        } else if (this.activeName === 'second') {
                            this.checkStatusList = [2,3];
                        } else if (this.activeName === 'third') {
                            this.checkStatusList = [4];
                        } ;
                    } else {
                        this.checkStatusList = filters.checkStatusList;
                    }
                } else if(name === 'operatorList'){
                    this.operatorList = filters.operatorList;
                }
                /*else if(name == 'intentionLevelList'){
                    this.intentionLevelList = filters.intentionLevelList;
                }*/
                this.queryTaskCheckList();
            },
            connectedResultType(row, column){
                return common.connectedResultType(row.connectedResultType);
            },
            intentionLevel(row, column){
                return common.intentionLevel(row.intentionLevel);
            },
            /**
             * 查询组长列表
             */
            queryLeaderList() {
                $.get(this.$baseUrl + 'member/queryLeaderList.json').then((res) => {
                    if (res.resultMessageEnum == '0000') {
                        if (res.returnObject) {
                            this.leaderList = res.returnObject;
                        }
                    } else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            /**
             * 查询质检员列表
             */
            queryCheckerList() {
                $.get(this.$baseUrl + 'member/queryCheckerList.json').then((res) => {
                    if (res.resultMessageEnum == '0000') {
                        if (res.returnObject) {
                            this.checkerList = res.returnObject;
                            if (res.returnObject) {
                                this.operatorFilters = [];
                                // this.operatorList = [];
                                res.returnObject.forEach(item => {
                                    this.operatorFilters.push({text: item.contactName, value: item.id});
                                    // this.operatorList.push(item.id);
                                })
                            } ;
                        }
                    } else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            /**
             * 查询通话结果详情
             * @param index
             * @param row
             */
            queryTaskResultDesc(index,row){
                this.taskId = row.taskId;
                this.taskItemResultRecognition = [];
                this.taskCheckResult = [];
                this.checkForm.taskItemId = row.id;
                let data={
                    taskItemId:row.id
                }
                $.get(this.$baseUrl+'taskCheck/queryTaskResultDesc.json',$.param(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        if(res.returnObject){
                            this.viewVisible = true;
                            this.taskItemResultRecognition = res.returnObject;
                            setTimeout(()=>{
                                this.viewSource = res.returnObject.soundPath;
                            },200)

                            if(res.returnObject.recognitionContent){
                                this.viewTableData = JSON.parse(res.returnObject.recognitionContent);
                            }
                            if(res.returnObject.taskCheckResult){
                                this.taskCheckResult = res.returnObject.taskCheckResult;
                            }
                        }
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            /**
             * 提交质检结果
             * @param formName
             */
            handleSubmitCheckResult(formName){
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        /*let taskIds = [row.id];
                        if (this.multipleSelectionSubmit.length > 0) {
                            taskIds = [];
                            taskIds.push(item.id);
                        };*/
                        let  data = {
                            isChecker: this.userInfo.role.indexOf(1) === -1 && this.userInfo.role.indexOf(2) === -1 ? true : false,
                            checkCheckerId:this.userInfo.id,
                            taskItemId:this.checkForm.taskItemId,
                            checkResult:this.checkForm.checkResult,
                            taskIds:[this.taskId],
                        };
                        $.post(this.$baseUrl+'taskCheck/submitCheckResult.json',JSON.stringify(data)).then((res)=>{
                            if (res.resultMessageEnum == '0000') {
                                this.viewVisible = false;
                                this.queryTaskCheckItemList();
                                this.$message.success('提交成功！');
                            } else {
                                this.$message.error(res.errorInfoList[0].errorMessage);
                            }
                        });
                    } else {
                        return false;
                    }
                });
            },
            /**
             * 查询任务质检统计信息
             * @param opt
             */
            queryTaskCheckStatistics(opt){
                let data = $.extend({},opt);
                if (this.userInfo){
                    /*主账号*/
                    if (this.userInfo.role.indexOf(1) !== -1) {
                        data.enterpriseCode = this.userInfo.enterpriseCode;
                    }
                    /*组长*/
                    else if (this.userInfo.role.indexOf(2) !== -1) {
                        data.memberId = this.userInfo.id;
                    }
                } ;

                $.post(this.$baseUrl+'taskCheck/queryTaskCheckStatistics.json',JSON.stringify(data)).then((res)=>{
                    if (res.resultMessageEnum == '0000') {
                        this.statisticsData = res.returnObject;
                    } else {
                        return false;
                    }
                });
            },
            /**
             * 格式化创建时间
             * @param row
             * @param column
             * @param cellValue
             * @param index
             * @returns {string}
             */
            formatCheckReleaseTime(row, column, cellValue, index){
                let checkReleaseTime = '-';
                if (row.checkReleaseTime) {
                    checkReleaseTime = row.checkReleaseTime;
                } else {
                    checkReleaseTime = '-'
                };
                return checkReleaseTime;
            },
            /**
             * 格式化操作人
             * @param row
             * @param column
             * @param cellValue
             * @param index
             * @returns {string}
             */
            formatCheckCheckerName(row, column, cellValue, index){
                let checkCheckerName = '-';
                if (row.checkCheckerName) {
                    checkCheckerName = row.checkCheckerName;
                } else {
                    checkCheckerName = '-'
                };
                return checkCheckerName;
            },
            /**
             * 格式化质检进度
             * @param row
             * @param column
             * @param cellValue
             * @param index
             * @returns {string}
             */
            formatCheckProgress(row, column, cellValue, index){
                let checkProgress = '-';
                if (row.checkProgress === 0) {
                    checkProgress = '-';
                } else {
                    checkProgress = row.checkProgress + '%'
                };
                return checkProgress;
            },
            rowStyle({ row, rowIndex}) {
                if(this.activeRow == row){
                    return { "background-color": "#f6faff" };
                }
            },
        },
        destroyed(){
            bus.$emit('contentTop', false);
        },
        watch:{
            viewVisible(curVal){
                if(!curVal){
                    bus.$emit('viewPlaying',true);
                }
            }
        },
    }

</script>

<style scoped lang="less">
    .dashboard-box {
        .el-col-4{
            width: 20%;
        }
        .el-col-14{
            width: 60%;
        }
        .el-col-10{
            width:40%;
        }
        .grid-con-icon {
            font-size:18px;
            width:36px;
            height:36px;
            border-radius: 10px;
            margin-left: 20px;
            text-align: center;
            line-height:36px;
            color: #fff;
        }
        .grid-con-1 .grid-con-icon {
            background:#E0F3FF;
            color: #29A0F6;
        }
        .grid-con-2 .grid-con-icon {
            background:#E5EAFE;
            color: #6758EB;
        }
        .grid-con-3 .grid-con-icon {
            background:#F4E8FF;
            color: #9C43F7;
        }
        .grid-con-4 .grid-con-icon {
            background:#FFEFD7;
            color: #FDB000;
        }
        .grid-con-5 .grid-con-icon {
            background:#D6FAF2;
            color: #2ED9BB;
        }
    }
    .grid-content {
        display: flex;
        align-items: center;
        height: 100px;
    }
    .grid-cont-right {
        flex: 1;
        text-align: center;
        font-size: 14px;
        color: #919FA9;
        text-align: center;
        padding:0;
        .grid-cont-right-tex{
            font-size: 12px;
            font-weight:500;
        }
        .grid-num {
            color: #4E5F6F;
            margin-right: 2px;
            font-size: 30px;
            font-weight: bold;
        }
    }
    .el-dropdown {
        cursor: pointer;
        color: #fcaf2d;
        width: inherit;
        text-align: right;
        padding-bottom: 10px;
    }
    .task-table-cantainer{
        background: #fff;
        color: #303133;
        border-radius: 5px;
    }
    .handle-input {
        width:240px;
        display: inline-block;
    }
    .creatDialog{
        .el-input{
            width: 380px;
        }
        .file-btn{
            .el-input{
                width:88px;
            }
        }
        .el-icon-question{
            font-size: 16px;
            color: #919FA9;
        }
        .data-btn-box{

            .el-button{
                width: 88px;
                margin-left: 0;
                margin-bottom: 10px;
            }
        }
    }
    .tip-content{
        width:164px;
        padding:5px;
        line-height: 18px;
    }
    .handle-box {
        margin-bottom: 20px;
    }
    .el-table .cell{
        position: relative;
    }


    .handle-select {
        width: 120px;
    }
    .del-dialog-cnt{
        font-size: 16px;
        text-align: center
    }
    .table{
        width: 100%;
        font-size: 14px;
    }
    #file{
        position:absolute;
        width: 100%;
        height: 100%;
        left:0;
        top:0;
        opacity: 0;
    }
    .red{
        color: #ff0000;
    }
    .blue{
        color: #fea200;
    }
    .el-button+.el-button{
        margin-left: 0;
    }
</style>