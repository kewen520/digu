<template>
    <div class="table table-main">
        <div class="content-box-top">
            <el-input v-model="select_word" clearable placeholder="输入姓名/号码" @change="searchChange"  class="handle-input mr10" @keyup.native.13="search"></el-input>
            <el-button type="primary" icon="search" @click="search">搜索</el-button>
            <div class="content-box-top-right">
                <el-button type="primary" icon="iconfont icon-ico_name-list" @click="createExportTaskItemPhoneExcelFile">导出名单</el-button>
                <el-button type="primary" icon="iconfont icon-ico_folder" @click="createExportTaskItemExcelFile">导出报表</el-button>
            </div>
            <div class="context-box-top-middle">
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
                        @change="searchChange"
                >
                </el-date-picker>
                <el-input class="time-input" v-model="select_call_duration_min" clearable placeholder="通话时长(s)" maxlength="10" @change="searchChange" @keyup.native.13="search"></el-input>
                <span class="time-input-separator">-</span>
                <el-input class="time-input" v-model="select_call_duration_max" clearable placeholder="通话时长(s)" maxlength="10" @change="searchChange" @keyup.native.13="search"></el-input>
                <el-button type="primary" @click="filter" class="filter-btn">筛选</el-button>
            </div>
        </div>
        <div class="">
            <div class="crumbs">
            <el-breadcrumb separator="/">
                <a v-if="isCheck" href="#/taskCheck" class="link"><i class="el-icon-arrow-left"></i>返回任务质检列表</a>
                <a v-else href="#/task" class="link"><i class="el-icon-arrow-left"></i>返回任务列表</a>
            </el-breadcrumb>
        </div>
            <div class="dashboard-box">
                <el-row :gutter="20" class="mgb20">
                    <el-col :span="4">
                        <el-card shadow="hover" :body-style="{padding: '0px'}">
                            <div class="grid-content grid-con-1">
                                <i class="iconfont icon-ico_phone-call grid-con-icon"></i>
                                <div class="grid-cont-right">
                                    <div><span class="grid-num">{{needCalledNumber}}</span>个</div>
                                    <div class="grid-cont-right-tex">号码数</div>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :span="4">
                        <el-card shadow="hover" :body-style="{padding: '0px'}">
                            <div class="grid-content grid-con-2">
                                <i class="iconfont icon-ico_ringer grid-con-icon"></i>
                                <div class="grid-cont-right">
                                    <div><span class="grid-num">{{calledNumber}}</span>次</div>
                                    <div class="grid-cont-right-tex">外呼次数</div>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :span="4">
                        <el-card shadow="hover" :body-style="{padding: '0px'}">
                            <div class="grid-content grid-con-3">
                                <i class="iconfont icon-ico_phone-call grid-con-icon"></i>
                                <div class="grid-cont-right">
                                    <div><span class="grid-num">{{needCalledNumber-leaveCalledNumber}}</span>个</div>
                                    <div class="grid-cont-right-tex">已外呼号码量</div>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :span="4">
                        <el-card shadow="hover" :body-style="{padding: '0px'}">
                            <div class="grid-content grid-con-4">
                                <i class="iconfont icon-ico_chat grid-con-icon"></i>
                                <div class="grid-cont-right">
                                    <div><span class="grid-num">{{connectedNumber}}</span>个</div>
                                    <div class="grid-cont-right-tex">接通数</div>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :span="4">
                        <el-card shadow="hover" :body-style="{padding: '0px'}">
                            <div class="grid-content grid-con-5">
                                <i class="iconfont icon-ico_percentage grid-con-icon"></i>
                                <div class="grid-cont-right">
                                    <div><span class="grid-num">{{connectedRate||'--'}}</span>％</div>
                                    <div class="grid-cont-right-tex">接通率</div>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </div>

            <div class="dashboard-box">
                <el-row :gutter="20">
                    <el-col>
                        <el-card class="box-card">
                            <div slot="header" class="clearfix">
                                <span>意图分类级别</span>
                                <el-popover
                                        ref="popover4"
                                        placement="right"
                                        width="400"
                                        trigger="hover">
                                    <el-row >
                                        <el-col :span="12">
                                       <span style='font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;line-height:1.5'>
                                           意图分类级别在“意图分类”中配置，可以帮助您对话术模板中的每个意图进行自动标记并归类，便于二次人工跟进，和高质量用户画像管理。
                                       </span>
                                        </el-col>
                                        <el-col :span="12">
                                            <img style="width: 200px;height: 100px" src="/common-static/img/intention_level.png">
                                        </el-col>
                                    </el-row>
                                </el-popover>
                                <span class="el-icon-question" v-popover:popover4></span>
                                <div style="float:right;display: none">
                                    <!-- <el-dropdown @command="handleCommandType4">
                                     <span class="el-dropdown-link">
                                         {{defaultName4}}<i class="el-icon-arrow-down el-icon--right"></i>
                                     </span>
                                         <el-dropdown-menu slot="dropdown">
                                         <span v-for="(item,key) in dropdown_text_Type4_List">
                                             <el-dropdown-item :command="item.id">{{item.speechcraftName}}</el-dropdown-item>
                                         </span>
                                         </el-dropdown-menu>
                                     </el-dropdown>
                                     <el-dropdown @command="handleCommandType5">
                                     <span class="el-dropdown-link">
                                         近{{dropdown_text_Type5}}天<i class="el-icon-arrow-down el-icon--right"></i>
                                     </span>
                                         <el-dropdown-menu slot="dropdown">
                                             <el-dropdown-item command="7">近7天</el-dropdown-item>
                                             <el-dropdown-item command="15">近15天</el-dropdown-item>
                                             <el-dropdown-item command="30">近30天</el-dropdown-item>
                                             <el-dropdown-item command="60">近60天</el-dropdown-item>
                                         </el-dropdown-menu>
                                     </el-dropdown> -->
                                 </div>
                             </div>
                             <el-col>
                                 <el-col :span="3">
                                     <i class="button el-button"  style="border-radius:100%;background-color:#18d4ae;padding: 9px;color: white;font-family: inherit;font-style:normal;">A</i>
                                     <i>&nbsp;</i>
                                     <i  style="font-style: normal;font-size:x-large;">{{countA}}</i>
                                     <i style="font-style: normal;font-size: xx-small;">通</i>
                                 </el-col>
                                 <el-col :span="3">
                                     <i class="button el-button"  style="border-radius:100%;background-color:#5ab1f0;padding: 9px;color: white;font-family: inherit;font-style:normal;">B</i>
                                     <i>&nbsp;</i>
                                     <i  style="font-style: normal;font-size:x-large;">{{countB}}</i>
                                     <i style="font-style: normal;font-size: xx-small;">通</i>
                                 </el-col>
                                 <el-col :span="3">
                                     <i class="button el-button"  style="border-radius:100%;background-color:#fa6f86;padding: 9px;color: white;font-family: inherit;font-style:normal;">C</i>
                                     <i>&nbsp;</i>
                                     <i  style="font-style: normal;font-size:x-large;">{{countC}}</i>
                                     <i style="font-style: normal;font-size: xx-small;">通</i>
                                 </el-col>
                                 <el-col :span="3">
                                     <i class="button el-button"  style="border-radius:100%;background-color:#ffba80;padding: 9px;color: white;font-family: inherit;font-style:normal;">D</i>
                                     <i>&nbsp;</i>
                                     <i  style="font-style: normal;font-size:x-large;">{{countD}}</i>
                                     <i style="font-style: normal;font-size: xx-small;">通</i>
                                 </el-col>
                                 <el-col :span="3">
                                     <i class="button el-button"  style="border-radius:100%;background-color:#0167a6;padding: 9px;color: white;font-family: inherit;font-style:normal;">E</i>
                                     <i>&nbsp;</i>
                                     <i  style="font-style: normal;font-size:x-large;">{{countE}}</i>
                                     <i style="font-style: normal;font-size: xx-small;">通</i>
                                 </el-col>
                                 <el-col :span="5">
                                     <i class="button el-button"  style="border-radius:100%;background-color:#c4b4e5;padding: 9px;color: white;font-family: inherit;font-style:normal;">F</i>
                                     <i>&nbsp;</i>
                                     <i  style="font-style: normal;font-size:x-large;">{{countF}}</i>
                                     <i style="font-style: normal;font-size: xx-small;">通</i>
                                 </el-col>
                             </el-col>
                             <el-col>
                                 <i></i>
                             </el-col>
                             <el-col :span="14">
                                 <ve-line :data="chartYTFNData"  :settings="chartYTFNettings"></ve-line>
                             </el-col>
                             <el-col :span="10">
                                 <ve-ring :data="chartYTFNDBINGata"></ve-ring>
                             </el-col>
                         </el-card>
                     </el-col>
                 </el-row>
             </div>

             <el-card class="box-card task-card" v-if="isCer">
                 <div slot="header">
                     <span>{{title}}</span>
                     <!-- <div class="task-card-top-btn-box">
                         <el-button type="primary" @click="search">导出录音</el-button>
                     </div> -->
                </div>
                <div>
                    <el-table :data="tableData" stripe class="table"
                        :options="options"
                        :pagination="pagination"
                        @sort-change="sortChange"
                        @filter-change="filterChange"
                        ref="multipleTable"
                    >
                        <!-- <el-table-column type="selection" width="55" align="center"></el-table-column> -->
                        <el-table-column prop="phone" label="外呼号码" width="150">
                        </el-table-column>
                        <el-table-column prop="customerName" label="用户姓名" width="150">
                        </el-table-column>
                        <el-table-column
                        prop="callTime"
                        label="外呼时间"
                        sortable
                        width="180"
                        >
                        </el-table-column>

                        <el-table-column width="140" prop="ringDuration" sortable label="振铃时长">
                        </el-table-column>
                        <el-table-column width="140" prop="connectedDuration" sortable label="通话时长">
                        </el-table-column>

                        <el-table-column
                            prop="connectedResultType"
                            label="通话结果"
                            column-key="connectedResultTypeList"
                            :formatter="connectedResultType"
                            :filters="[{text: '接听', value: '1'},{text: '关机', value: '2'},{text: '通话中', value: '3'},{text: '无应答', value: '4'},{text: '拒接', value: '5'},{text: '空号', value: '6'},{text: '呼叫转移', value: '7'},{text: '呼叫失败', value: '8'},{text: '队列中', value: '9'},{text: '限制骚扰', value: '10'},{text: '限制呼叫', value: '11'}]"
                            >
                        </el-table-column>
                        <el-table-column
                            prop="intentionLevel"
                            label="意向级别"
                            :formatter="intentionLevel"
                            column-key="intentionLevelList"
                            :filters="[{text: 'A', value: '1'},{text: 'B', value: '2'},{text: 'C', value: '3'},{text: 'D', value: '4'},{text: 'E', value: '5'},{text: 'F', value: '6'}]"
                        >
                        </el-table-column>
						<el-table-column
						    prop="interactTimes"
						    label="交互次数"
						    column-key="interactTimes"
							sortable
						>
						</el-table-column>
                        <el-table-column label="识别详情" width="100" align="center">
                            <template slot-scope="scope">
                                <el-button :disabled="scope.row.connectedResultType!=1" type="text" @click="queryTaskResultRecognition(scope.$index, scope.row)">查看</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <div class="pagination">
                        <el-pagination background @current-change="handleCurrentChange"
                            layout="total, prev, pager, next,jumper"
                            :total="pagination.total"
                            :page-size="pagination.pageSize"
                            >
                        </el-pagination>
                    </div>
                </div>
            </el-card>
        </div>

        <!-- 查看弹出框 -->
        <el-dialog title="识别详情" class="video-box" :visible.sync="viewVisible" width="600px">
            <div class="video-contant-box">
                <w-video :source="viewSource" :playing="viewPlaying"/>
            </div>
             <el-table
                :data="viewTableData"
                :row-style="rowStyle"
                stripe
                style="width: 100%">
                <el-table-column
                    prop="nodeName"
                    label="节点名称"
                    width="180">
                    <template slot-scope="scope">
                        <a class="viewItemText">{{scope.row.nodeName}}</a>
                        <!-- <span class="viewItemPlay"><i class="w_icon_play w_icon_pause"></i></span> -->
                    </template>
                </el-table-column>
                <el-table-column
                    prop="nodeContent"
                    label="识别内容">
                </el-table-column>
            </el-table>
			<div>
				<el-tag size="medium" v-if="transferFlag == 1"><i class="el-icon-service"></i> 后续通话转人工客服接待</el-tag>
			</div>
			<br />
			<!--<div>-->
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
            <el-form ref="checkForm" :inline="true" :rules="checkRules" :model="checkForm" label-width="80px" style="padding-top: 20px;">
                <el-form-item prop="checkResult" label="备注：">
                    <el-input type="textarea" v-model="checkForm.checkResult" placeholder="请输入备注内容" maxlength="200" rows="2"
                              style="width: 500px"
                              show-word-limit
                    ></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submitCheckResult('checkForm')">保存并提交</el-button>
            </span>
			<!--</div>-->
        </el-dialog>
        <!-- 删除提示框 -->
    </div>
</template>

<script>
    import bus from '../../common/bus';
    import wVideo from '../base/Video'
    import common from '../../common/common';
    import { inputNumber } from '../../common/watch';
    import moment from 'moment';

    export default {
        name: 'basetable',
        data() {
            this.chartYTFNettings = {
                labelMap: {
                },
                legendName:{

                }
            },
            this.chartYTFNBINGettings = {

            }
            return {
                isCer:true,
                url: './static/vuetable.json',
                viewSource:'',
                title:'',
                // viewPlayValue:0,
                viewPlaying:false,
                needCalledNumber:0,
                calledNumber:0,
                connectedNumber:0,
                connectedRate:'',
                leaveCalledNumber:0,
                intentionLevelList:[],
                connectedResultTypeList:[],
                viewTableData: [],
                tableData:[],
                cur_page: 1,
                // multipleSelection: [],
                select_cate: false,
                select_word: '',
				select_date: [],
				select_call_duration_min: '',
				select_call_duration_max: '',
                viewVisible: false,
                soundPath:'',
                pagination: {
                    total: 0,
                    pageIndex: 1,
                    pageSize: 20
                },
                options: {
                    stripe: true, // 是否为斑马纹 table
                    loading: true, // 是否添加表格loading加载动画
                    highlightCurrentRow: true, // 是否支持当前行高亮显示
                    mutiSelect: true // 是否支持列表项选中功能
                },
                activeRow:'',
                sortList:[],
                isCheck:false,
				transferFlag: null,
                taskCheckResult:[],
                taskItemResultRecognition:[],
                checkForm: {
                    checkResult:'',
                    taskItemId:'',
                },
                checkRules: {
                    checkResult: [
                        { required: true, message: '备注内容不能为空！', trigger: 'change' }
                    ],
                },
                userInfo:null,
                countA:0,
                countB:0,
                countC:0,
                countD:0,
                countE:0,
                countF:0,
                chartYTFNData:{
                    columns:["时间","A","B","C","D","E","F"],
                    rows:[

                    ]
                },
                chartYTFNDBINGata:{
                    columns:["意图级别","数量"],
                    rows:[

                    ]
                },
                taskId:""
            }
        },
        created() {
            bus.$emit('contentTop', true);
            this.userInfo = JSON.parse(localStorage.getItem('USER_INFO'));
            this.isCheck = this.$route.query.isCheck;
            this.title = common.decodeUnicode(this.$route.query.sname);
            this.queryTaskItemList({taskId: this.$route.params.id});
            this.queryTaskInfo();
            this.taskId = this.$route.params.id;
            this.queryCountTaskGroupByIntentionLevel();
            this.queryintentionLevelDescription();
        },
        components: {
            wVideo
        },
        computed: {

        },
        methods: {
            // 分页导航
            handleCurrentChange(val) {
                this.cur_page = val;
                this.queryTaskItemList({taskId:this.$route.params.id});
            },
            connectedResultType(row, column){
                return common.connectedResultType(row.connectedResultType);
            },
            intentionLevel(row, column){
                return common.intentionLevel(row.intentionLevel);
            },
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
                this.queryTaskItemList({taskId:this.$route.params.id});
            },

            queryTaskItemList(opt) {
                let data = $.extend({},{
                    currentPage:this.cur_page-1,
                    pageSize:this.pagination.pageSize
                },opt);

                if (this.select_word){
                    data.queryKey = this.select_word
                }

				// 日期
				if (this.select_date && this.select_date.length > 0) {
					const [startTime, endTime] = this.select_date;
					if (startTime) data.queryStartTime = moment(startTime).format("YYYY-MM-DD HH:mm:ss");
					if (endTime) data.queryEndTime = moment(endTime).format("YYYY-MM-DD HH:mm:ss");
				}

				// 通话时长
                if (this.select_call_duration_min !== '') {
                	data.connectedMinDuration = this.select_call_duration_min;
                }

                if (this.select_call_duration_max !== '') {
					data.connectedMaxDuration = this.select_call_duration_max;
                }

                // 通话结果列表
                if(this.connectedResultTypeList.length){
                    data.connectedResultTypeList = this.connectedResultTypeList;
                }

                // 意向结果列表
                if(this.intentionLevelList.length){
                    data.intentionLevelList = this.intentionLevelList;
                }

                if(this.sortList[0] && this.sortList[0].propertyName){
                    data.sortList =this.sortList;
                }

                $.post(this.$baseUrl+'task/queryTaskItemList.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum === '0000'){
                        this.tableData = res.returnObject.recordList;
                        this.pagination.total = res.returnObject.totalNumber;
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            // 2.5.1.任务信息统计
            queryTaskInfo(){
                let data = {
                    taskId:this.$route.params.id
                }
                $.get(this.$baseUrl+`statistics/queryTaskInfo.json?taskId=${this.$route.params.id}`).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        if(res.returnObject){
                            this.needCalledNumber = res.returnObject.needCalledNumber||0;
                            this.calledNumber = res.returnObject.calledNumber;
                            this.connectedNumber = res.returnObject.connectedNumber;
                            this.connectedRate = res.returnObject.connectedRate;
                            this.leaveCalledNumber = res.returnObject.leaveCalledNumber;
                        }
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            search() {
                if(!this.select_word){
                    this.$message.error("请输入关键字！");
                    return false;
                }
                this.cur_page=1;
                this.queryTaskItemList({taskId: this.$route.params.id});
            },

			filter() {
				if(
					this.select_call_duration_min === '' &&
					this.select_call_duration_max === '' &&
					this.select_date <= 0
				){
					this.$message.error("请输入筛选条件");
					return false;
				}
				this.cur_page=1;
				this.queryTaskItemList({taskId: this.$route.params.id});
            },

            searchChange(val){
                if(!val){
                    this.queryTaskItemList({taskId: this.$route.params.id});
                }
            },
            handleFilter(value, row, column){
                const property = column['property'];
            },
            filterChange(filters){
            	let name = Object.keys(filters)[0];
                if(name == 'connectedResultTypeList'){
                	this.connectedResultTypeList = filters.connectedResultTypeList;
                }
                else if(name == 'intentionLevelList'){
                	this.intentionLevelList = filters.intentionLevelList;
                }
                this.queryTaskItemList({taskId:this.$route.params.id});
            },
            // viewItemPlay(index,row){
            //     this.viewSource = row.soundPath;
            // },
            openactivename(row, column){
                // this.activeRow = row;
                // this.viewSource = 'http://sc1.111ttt.com/2015/1/12/31/105310629118.mp3';
                this.viewSource = this.soundPath;
                // this.viewSource = this.$baseUrl+'file/downloadFile.html?filePath=annex/2018/10/04/16/13ed232f30a4433db79ad1850ac61a01_1717040720.mp3'
            },

            rowStyle({ row, rowIndex}) {
                if(this.activeRow == row){
                    return { "background-color": "#f6faff" };
                }
            },
            // 2.11.5.创建任务明细名单Excel下载文件
            createExportTaskItemPhoneExcelFile(){
                let data={
                    taskItemCondition:{
                        taskId: this.$route.params.id
                    }
                };

				if (this.select_word){
					data.queryKey = this.select_word
				}

				// 日期
				if (this.select_date && this.select_date.length > 0) {
					const [startTime, endTime] = this.select_date;
					if (startTime) data.taskItemCondition.queryStartTime = moment(startTime).format("YYYY-MM-DD HH:mm:ss");
					if (endTime) data.taskItemCondition.queryEndTime = moment(endTime).format("YYYY-MM-DD HH:mm:ss");
				}

				// 通话时长
				if (this.select_call_duration_min !== '') {
					data.taskItemCondition.connectedMinDuration = this.select_call_duration_min;
				}

				if (this.select_call_duration_max !== '') {
					data.taskItemCondition.connectedMaxDuration = this.select_call_duration_max;
				}

                $.post(this.$baseUrl+'file/createExportTaskItemPhoneExcelFile.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.multipleSelection = [];
                        window.location.href = this.$baseUrl+'file/downloadFile.html?filePath='+res.returnObject.filePath;
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            // 2.11.4.创建任务明细Excel下载文件
            createExportTaskItemExcelFile(){
                let data={
                    taskIdList:[this.$route.params.id]
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
            // 2.8.6.查看识别详情
            queryTaskResultRecognition(index,row){
                this.taskId = row.taskId;
                this.taskItemResultRecognition = [];
                this.taskCheckResult = [];
                this.checkForm.taskItemId = row.id;
                let data={
                    taskItemId:row.id
                }
                $.get(this.$baseUrl+'task/queryTaskResultRecognition.json',$.param(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        if(res.returnObject){
                            this.viewVisible = true;
                            this.taskItemResultRecognition = res.returnObject;
							this.transferFlag = res.returnObject.transferFlag;
                            this.viewVisible = true;
                            // this.soundPath = res.returnObject.soundPath;
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
            submitCheckResult(formName){
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        let  data = {
                            isChecker: this.userInfo.role.indexOf(1) === -1 && this.userInfo.role.indexOf(2) === -1 ? true : false,
                            checkCheckerId:this.userInfo.id,
                            taskItemId:this.checkForm.taskItemId,
                            checkResult:this.checkForm.checkResult,
                            taskId:this.taskId,
                        };
                        $.post(this.$baseUrl+'task/submitCheckResult.json',JSON.stringify(data)).then((res)=>{
                            if (res.resultMessageEnum == '0000') {
                                this.viewVisible = false;
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

            queryCountTaskGroupByIntentionLevel:function () {
                let params = {
                    taskId:this.taskId
                }
                $.get(this.$baseUrl+'task/queryCountTaskGroupByIntentionLevel.json',$.param(params)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        var returnObject = res.returnObject;
                        var counta = this.countL(res.returnObject.a)
                        var countb = this.countL(res.returnObject.b)
                        var countc = this.countL(res.returnObject.c)
                        var countd = this.countL(res.returnObject.d)
                        var counte = this.countL(res.returnObject.e)
                        var countf = this.countL(res.returnObject.f)
                        this.countA = res.returnObject.a.length
                        this.countB = res.returnObject.b.length
                        this.countC = res.returnObject.c.length
                        this.countD = res.returnObject.d.length
                        this.countE = res.returnObject.e.length
                        this.countF = res.returnObject.f.length
                        this.chartYTFNDBINGata.rows = [
                            {"意图级别":"A","数量":this.countA},
                            {"意图级别":"B","数量":this.countB},
                            {"意图级别":"C","数量":this.countC},
                            {"意图级别":"D","数量":this.countD},
                            {"意图级别":"E","数量":this.countE},
                            {"意图级别":"F","数量":this.countF}
                        ]
                        var formatListIndex = {
                            "00:00":"time1",
                            "02:00":"time2",
                            "04:00":"time3",
                            "06:00":"time4",
                            "08:00":"time5",
                            "10:00":"time6",
                            "12:00":"time7",
                            "14:00":"time8",
                            "16:00":"time9",
                            "18:00":"time10",
                            "20:00":"time11",
                            "22:00":"time12",

                        }

                        var list = [];

                        for(var i in formatListIndex){
                            let item = {
                                "时间":i,
                                "A":counta[formatListIndex[i]],
                                "B":countb[formatListIndex[i]],
                                "C":countc[formatListIndex[i]],
                                "D":countd[formatListIndex[i]],
                                "E":counte[formatListIndex[i]],
                                "F":countf[formatListIndex[i]],
                            }
                            list.push(item)
                        }
                        this.chartYTFNData.rows = list
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
            });

            },

            countL:function (result) {
                var time1 = 0
                var time2 = 0,time3=0,time4=0,time5=0,time6=0,time7=0,time8=0,time9=0,time10=0,time11=0,time12 = 0;
                for (var i in result){
                    let callTime = result[i].callTime;
                    let callTimeArr = callTime.split(" ");

                    if (callTime > callTimeArr[0] + " 00:00:00" && callTime < callTimeArr[0]+ " 01:59:59"){
                        time1+=1;
                    }else if (callTime > callTimeArr[0] + " 02:00:00" && callTime < callTimeArr[0]+ " 03:59:59"){
                        time2+=1;
                    }else if (callTime > callTimeArr[0] + " 04:00:00" && callTime < callTimeArr[0]+ " 05:59:59"){
                        time3+=1;
                    }else if (callTime > callTimeArr[0] + " 06:00:00" && callTime < callTimeArr[0]+ " 07:59:59"){
                        time4+=1;
                    }else if (callTime > callTimeArr[0] + " 08:00:00" && callTime < callTimeArr[0]+ " 09:59:59"){
                        time5+=1;
                    }else if (callTime > callTimeArr[0] + " 10:00:00" && callTime < callTimeArr[0]+ " 11:59:59"){
                        time6+=1;
                    }else if (callTime > callTimeArr[0] + " 12:00:00" && callTime < callTimeArr[0]+ " 13:59:59"){
                        time7+=1;
                    }else if (callTime > callTimeArr[0] + " 14:00:00" && callTime < callTimeArr[0]+ " 15:59:59"){
                        time8+=1;
                    }else if (callTime > callTimeArr[0] + " 16:00:00" && callTime < callTimeArr[0]+ " 17:59:59"){
                        time9+=1;
                    }else if (callTime > callTimeArr[0] + " 18:00:00" && callTime < callTimeArr[0]+ " 19:59:59"){
                        time10+=1;
                    }else if (callTime > callTimeArr[0] + " 20:00:00" && callTime < callTimeArr[0]+ " 21:59:59"){
                        time11+=1;
                    }else if (callTime > callTimeArr[0] + " 22:00:00" && callTime < callTimeArr[0]+ " 23:59:59"){
                        time12+=1;
                    }
                }
                var ret = [];
                ret['time1'] = time1
                ret['time2'] = time2
                ret['time3'] = time3
                ret['time4'] = time4
                ret['time5'] = time5
                ret['time6'] = time6
                ret['time7'] = time7
                ret['time8'] = time8
                ret['time9'] = time9
                ret['time10'] = time10
                ret['time11'] = time11
                ret['time12'] = time12
                return ret
            },

            queryintentionLevelDescription:function () {
                let params = {
                    taskId:this.taskId
                }
                $.get(this.$baseUrl+'task/queryintentionLevelDescription.json',$.param(params)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        var intention =  JSON.parse(res.returnObject)
                        var  At = "A "+intention.A.memberDescription;
                        var  Bt = "B "+intention.B.memberDescription;
                        var  Ct = "C "+intention.C.memberDescription;
                        var  Dt = "D "+intention.D.memberDescription;
                        var  Et = "E "+intention.E.memberDescription;
                        var  Ft = "F "+intention.F.memberDescription;
                        var chartYTFNettingsLabelMap = {
                            "A":At,
                            "B":Bt,
                            "C":Ct,
                            "D":Dt,
                            "E":Et,
                            "F":Ft,
                        }

                        var chartYTFNettingsLegendName = {
                            [At]:"A",
                            [Bt]:"B",
                            [Ct]:"C",
                            [Dt]:"D",
                            [Et]:"E",
                            [Ft]:"F"
                        }

                        this.chartYTFNettings.labelMap = chartYTFNettingsLabelMap;
                        this.chartYTFNettings.legendName = chartYTFNettingsLegendName;
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
            });

            }
        },
        destroyed(){
            bus.$emit('contentTop', false);
        },

        watch:{
			select_call_duration_min: function (...args) {
				this.select_call_duration_min = inputNumber(...args)
			},

			select_call_duration_max: function (...args) {
				this.select_call_duration_max = inputNumber(...args)
			},

            viewVisible(curVal){
                if(!curVal){
                    bus.$emit('viewPlaying',true);
                }
            }
        }
    }

</script>

<style scoped lang="less">
    .table-main {
        padding-top: 60px;
    }

    .content-box-top {
        height: 120px;
    }

    .context-box-top-middle {
        margin-top: 15px;
        .select-date {
            margin-right: 15px;
        }

        .time-input {
            width: 160px;
            vertical-align: top;
        }
        .time-input-separator {
            margin: 0 10px;
            color: #647184;
        }
        .select-tag {
            width: 240px;
            margin-left: 27px;
        }

        .filter-btn {
            margin-left: 20px;
            vertical-align: top;
        }
    }

    .handle-input {
        width:240px;
        display: inline-block;
    }
    .handle-box {
        margin-bottom: 20px;
    }
    .el-table .cell{
        position: relative;
    }
    .video-contant-box{
        border-bottom: 1px solid #EBEDF0;
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
    .el-card__header{
        .link{
            color: #4E8FF9;
        }
    }
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
        text-align: left;
        padding-left:20px;
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
    .viewItemText{
        // cursor: pointer;
        display: inline-block;
        line-height: 23px;
        margin-right: 10px;
    }
    .viewItemPlay{
        display:inline-block;
        width: 20px;
        height: 20px;
        margin-top: 2px;
    }
    .link{
        color: #4E8FF9;
    }
</style>
