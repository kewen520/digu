<template>
    <div class="">
        <el-tabs v-model="callActiveName" @tab-click="tabHandleClick">
            <el-tab-pane label="统计概况" name="first">
                <el-card class="box-card">
                    <div slot="header" class="clearfix">
                        <span>数据概况</span>
                        <el-date-picker
                        style="float: right; padding: 3px 0"
                        v-model="searchDate1"
                        type="daterange"
                        align="right"
                        unlink-panels
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        @change="handleChangeDate1"
                        :picker-options="pickerOptions2">
                        </el-date-picker>
                    </div>
                    <div class="call-box">
                        <el-row class="mgb20">
                            <el-col :span="4">
                                <span class="num">{{sumTaskData.totalConsumptionCalledNumber}}</span>
                                <span class="txt">呼出总次数</span>
                            </el-col>
                            <el-col :span="4">
                                <span class="num">{{sumTaskData.totalConsumptionConnectedNumber}}</span>
                                <span class="txt">通话次数</span>
                            </el-col>
                            <el-col :span="4" class="bule">
                                <span class="num">{{sumTaskData.consumptionConnectedRate}}%</span>
                                <span class="txt">接通率</span>
                            </el-col>
                            <el-col :span="4">
                                <span class="num" v-html="formatterTime(sumTaskData.totalConsumptionConnectedDuration)"></span>
                                <span class="txt">通话总时长（分钟）</span>
                            </el-col>
                            <el-col :span="4">
                                <span class="num" v-html="formatterTime(sumTaskData.averageConsumptionConnectedDuration)"></span>
                                <span class="txt">平均通话时长（分钟）</span>
                            </el-col>
                        </el-row>
                    </div>
                </el-card>
                <el-card class="box-card">
                    <div slot="header" class="clearfix">
                        <span>通话量趋势</span>
                        <el-date-picker
                        style="float: right; padding: 3px 0"
                        v-model="searchDate2"
                        type="daterange"
                        align="right"
                        unlink-panels
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        @change="handleChangeDate2"
                        :picker-options="pickerOptions2">
                        </el-date-picker>
                    </div>
                    <div class="call-box">
                        <ve-line ref="charts1" :data="chartData" :settings="chartSettings"></ve-line>
                    </div>
                </el-card>
                <el-card class="box-card">
                    <div slot="header" class="clearfix">
                        <span>通话率趋势</span>
                        <el-date-picker
                        style="float: right; padding: 3px 0"
                        v-model="searchDate3"
                        type="daterange"
                        align="right"
                        unlink-panels
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        @change="handleChangeDate3"
                        :picker-options="pickerOptions2">
                        </el-date-picker>
                    </div>
                    <div class="call-box">
                        <ve-line ref="charts2" :data="chartJTData" height="300px" :extend="extend"></ve-line>
                    </div>
                </el-card>
                <el-row>
                    <el-col :span="12">意图分类统计</el-col>
                    <el-col :span="12">
                        <el-date-picker
                        style="float: right; padding: 3px 0"
                        v-model="searchDate4"
                        type="daterange"
                        align="right"
                        unlink-panels
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        @change="handleChangeDate4"
                        :picker-options="pickerOptions2">
                        </el-date-picker>
                    </el-col>
                </el-row>
                <el-card class="box-card record-box-card">
                    <div slot="header" class="clearfix">
                        <span>意图筛选</span>
                    </div>
                    <div class="">
                        <el-row class="tj-header">
                            <el-col :span="4"><i class="a">A</i><span>{{statisData.A}}</span>通</el-col>
                            <el-col :span="4"><i class="b">B</i><span>{{statisData.B}}</span>通</el-col>
                            <el-col :span="4"><i class="c">C</i><span>{{statisData.C}}</span>通</el-col>
                            <el-col :span="4"><i class="d">D</i><span>{{statisData.D}}</span>通</el-col>
                            <el-col :span="4"><i class="e">E</i><span>{{statisData.E}}</span>通</el-col>
                            <el-col :span="4"><i class="f">F</i><span>{{statisData.F}}</span>通</el-col>
                        </el-row>
                    </div>
                </el-card>
                <el-card class="box-card">
                    <div slot="header" class="clearfix">
                        <span>通话量统计</span>
                    </div>
                    <div class="call-box">
                        <ve-pie  ref="charts3" :data="pieChartData" :settings="pieChartSettings"></ve-pie>
                    </div>
                </el-card>
            </el-tab-pane>
            <el-tab-pane label="通话明细" name="second">
                <div>
                    <el-form  :model="wFormInline" class="w-form-inline">
                        <el-form-item label="任务名称">
                            <el-autocomplete
                            v-model="wFormInline.taskName"
                            :fetch-suggestions="querySearchAsyncTask"
                            placeholder="请输入任务名称"
                            @select="handleSelectTask"
                            ></el-autocomplete>
                        </el-form-item>
                        <el-form-item label="话术名称">
                            <el-autocomplete
                            v-model="wFormInline.stateSpeed"
                            :fetch-suggestions="querySearchAsyncSpeed"
                            placeholder="请输入话术名称"
                            @select="handleSelectSpeed"
                            ></el-autocomplete>
                        </el-form-item>
                        <el-row class="el-form--inline">
                            <el-form-item label="外呼时间">
                                <el-date-picker
                                style="float: right; padding: 3px 0"
                                v-model="searchDate5"
                                type="daterange"
                                align="right"
                                unlink-panels
                                range-separator="至"
                                start-placeholder="开始日期"
                                end-placeholder="结束日期"
                                @change="handleChangeDate5"
                                :picker-options="pickerOptions2">
                                </el-date-picker>
                            </el-form-item>
                            <el-form-item label="关键词">
                                <el-input v-model="wFormInline.queryKey" placeholder="关键词" style="width:200px"></el-input>
                            </el-form-item>
                            <el-form-item >
                                <el-button type="primary" @click="onHandleSearch">搜索</el-button>
                            </el-form-item>
                        </el-row>
                        <el-row>
                        <el-form-item >
                            <el-button >导出名单</el-button>
                            <el-button type="primary" @click="createExportTaskItemExcelFile">导出报表</el-button>
                            <!-- <el-button type="primary">下载录音</el-button> -->
                        </el-form-item>
                        </el-row>
                    </el-form>
                </div>
                 <!-- :filter-method="filterHandler" -->
                <el-table
                    :data="taskItemListData"
                    @sort-change="sortChange"
                    stripe
                    ref="multipleTable" 
                    @filter-change="filterChange" 
                    @selection-change="handleSelectionChange"
                    style="width: 100%">
                    <el-table-column type="selection" width="55" align="center"></el-table-column> 
                    <el-table-column
                    prop="phone"
                    label="外呼号码"
                    width="180">
                    </el-table-column>
                    <el-table-column
                    prop="customerName"
                    label="姓名">
                    </el-table-column>
                    <el-table-column
                    prop="callTime"
                    label="外呼时间">
                    </el-table-column>
                    <el-table-column
                    prop="ringDuration"
                    label="振铃时长">
                    </el-table-column>
                    <el-table-column
                    prop="connectedDuration"
                    label="通话时长">
                    </el-table-column>
                    <el-table-column
                    prop="connectedResultType"
                    :filter-multiple="false"
                    
                    :filters="[{text:'接听',value:1},{text:'关机',value:2},{text:'通话中',value:3},{text:'无应答',value:4},{text:'拒接',value:5},{text:'空号',value:6}]"
                    label="通话结果">
                    </el-table-column>
                    <el-table-column
                    prop="intentionLevel"
                    label="意图分类级别">
                    <!-- :filter-multiple="false" -->
                    <!-- :filters="[{text:'A',value:1},{text:'B',value:2},{text:'C',value:3},{text:'D',value:4},{text:'E',value:5},{text:'F',value:6}]" -->
                    </el-table-column>
                    <el-table-column
                    label="识别详情">
                        <!-- <template slot-scope="scope">
                            <span>
                               <el-button type="text" @click="handleView(scope.$index, scope.row)">查看</el-button>
                            </span>
                        </template> -->
						<template slot-scope="scope">
						    <el-button :disabled="scope.row.connectedResultType!=1" type="text" @click="queryTaskResultRecognition(scope.$index, scope.row)">查看</el-button>
						</template>
                    </el-table-column>
                </el-table>
                <div class="pagination" >
                    <el-pagination background @current-change="handleCurrentChange" 
                        layout="total, prev, pager, next,jumper"
                        :total="pagination.total"
                        :page-size="pagination.pageSize"
                        >
                    </el-pagination>
                </div>
            </el-tab-pane>
        </el-tabs>
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
		</el-dialog>
    </div>
	
</template>

<script>
import common from '../../common/common';
import dateTime from '../../common/date';
import wVideo from './Video';
export default {
    data() {
        this.chartSettings = {
            // stack: { '用户': ['访问用户', '下单用户'] },
            area: true,
            height:300
        }
        // this.chartJTDataSetting={
        //     area: true
        // }
        this.pieChartSettings = {
                dimension: 'key',
                metrics: 'num'
            }
        this.extend = {
            xAxis:{
                axisLabel:{
                    color:"#919FA9",
                },
                boundaryGap:false
            },
            yAxis:{
                axisLabel:{
                    color:"#919FA9",
                    formatter:'{value}%'
                },
                
            },
            tooltip:{
                backgroundColor:'#ffff',
                borderColor:'#DEE2E6',
                borderWidth:'1',
                // formatter:'{a0}: {c0}%',
                padding:[5,15,5,15],
                textStyle:{
                    color:'#647184',
                }
            }
        }
        let startDate = dateTime.sevenday('90');
        let endDate = dateTime.today();
        return{
			viewPlaying:false,
			taskCheckResult:[],
			taskItemResultRecognition:[],
			viewSource:'',
			viewVisible: false,
			transferFlag: null,
			viewTableData: [],
            callActiveName:'first',
            startDate:startDate,
            endDate:endDate,
            cur_page:1,
            searchDate1:[startDate,endDate],
            searchDate2:[startDate,endDate],
            searchDate3:[startDate,endDate],
            searchDate4:[startDate,endDate],
            searchDate5:[],
            sumTaskData:{
                totalConsumptionCalledNumber:0,
                totalConsumptionConnectedNumber:0,
                consumptionConnectedRate:0,
                totalConsumptionConnectedDuration:0,
                averageConsumptionConnectedDuration:0
            },
            pickerOptions2: {
                shortcuts: [{
                    text: '最近一周',
                    onClick(picker) {
                    const end = new Date();
                    const start = new Date();
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                    picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: '最近一个月',
                    onClick(picker) {
                    const end = new Date();
                    const start = new Date();
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                    picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: '最近三个月',
                    onClick(picker) {
                    const end = new Date();
                    const start = new Date();
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                    picker.$emit('pick', [start, end]);
                    }
                }]
            },
            chartData: {
                columns: ['key', '通话量'],
                rows: []
            },
            
            chartJTData: {
                columns: ['key', '接通率'],
                rows: []
            },
            pieChartData: {
                columns: ['key', 'num'],
                rows: []
            },
            statisData:{
                A:0,
                B:0,
                C:0,
                D:0,
                E:0,
                F:0,
            },
            pagination: {
                show: true,
                total: 0,
                pageIndex: 1,
                pageSize:20
            },
            taskItemListData:[

            ],
            wFormInline:{
                taskName:'',
                stateSpeed:''
            },
            connectedResultType:'',
            restaurantsTask:[],
            restaurantsSpeed:[],
            multipleSelection:[],
        }
    },
    props:{
        tabActive:{
            type:[String]
        },
    },
    mounted(){
        // this.$nextTick(() => {
        //     this.queryTaskItemStatisticsData();
        // })
    },
    created(){
        
    },
	components: {
	    wVideo
	},
	watch:{
	    viewVisible(curVal){
	        if(!curVal){
	            bus.$emit('viewPlaying',true);
	        }
	    }
	},
    methods: {
		rowStyle({ row, rowIndex}) {
		    if(this.activeRow == row){
		        return { "background-color": "#f6faff" };
		    }
		},
        handleCurrentChange(val) {
            this.cur_page = val;
            this.queryTaskItemList();
        },
        tabHandleClick(type){
            if(type.name=='second'){
                this.queryTaskItemList();
            }else{
                // this.sumTaskItemStatistics();
            }
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
            this.queryTaskItemList();
        },
        handleView(){
            
        },
		// 2.8.6.查看识别详情
		queryTaskResultRecognition(index,row){
		    this.taskId = row.taskId;
		    this.taskItemResultRecognition = [];
		    this.taskCheckResult = [];
		 //   this.checkForm.taskItemId = row.id;
		    let data={
		        taskItemId:row.id
		    }
		    $.get(this.$baseUrl+'services/task/queryTaskResultRecognition.json',$.param(data)).then((res)=>{
		        if(res.resultMessageEnum=='0000'){
		            if(res.returnObject){
		                this.viewVisible = true;
		                this.taskItemResultRecognition = res.returnObject;
						this.transferFlag = res.returnObject.transferFlag;
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
        // filterHandler(value, row, column) {
            // console.log(value, row, column)
            // const property = column['property'];
            // return row[property] === value;
            // this.connectedResultType =value;
            // this.queryTaskItemList();
        // },
        // filterHandler2(value, row, column) {
        //     const property = column['property'];
        //     // return row[property] === value;
        //     if(row[property] === value){
        //         this.connectedResultType =value;
        //         this.queryTaskItemList();
        //     }
        // },
        filterChange(filters){
            let array = '';
            for (var item in filters){
                array =  filters[item];
            }

            this.connectedResultType = array[0];
            this.queryTaskItemList();
            // switch(array[0]){
            //     case '1':
            //     text = '待发布';
            //     break;
            //     case '4':
            //     text = '审核中';
            //     break;
            //     case '5':
            //     text = '已发布';
            //     break;
            // }
            // this.speechcraftStatusText = text;
        },
        handleChangeDate1(value){
            this.startDate = dateTime.format(value[0]);
            this.endDate = dateTime.format(value[1]);
            this.sumTaskItemStatistics();
        },
        handleChangeDate2(value){
            this.startDate = dateTime.format(value[0]);
            this.endDate = dateTime.format(value[1]);
            this.queryTaskItemStatisticsData({
                kpiType:2
            });
        },
        handleChangeDate3(value){
            this.startDate = dateTime.format(value[0]);
            this.endDate = dateTime.format(value[1]);
            this.queryTaskItemStatisticsData({
                kpiType:3
            });
        },
        handleChangeDate4(value){
            this.startDate = dateTime.format(value[0]);
            this.endDate = dateTime.format(value[1]);
            this.queryTaskItemStatisticsKpiData();
        },
        handleChangeDate5(value){
            this.wFormInline.callTimeStart = dateTime.format(value[0]);
            this.wFormInline.callTimeEnd = dateTime.format(value[1]);
            // this.queryTaskItemStatisticsKpiData();
        },
        onHandleSearch(){
            this.queryTaskItemList();
        },
        // 查询任务明细
        queryTaskItemList(){
            let data = {
                memberId:this.$route.params.id,
                currentPage:this.cur_page-1,
                pageSize:this.pagination.pageSize
            }
            
            if(this.activeSpeed){
                data.copyOperationType = this.activeSpeed.copyOperationType;
            }
            if(this.wFormInline.taskName){
                data.taskName = this.wFormInline.taskName;
            }
            if(this.wFormInline.callTimeStart){
                data.callTimeStart = this.formatterTime.startDate;
                data.callTimeEnd = this.formatterTime.callTimeEnd;
            }
            if(this.wFormInline.queryKey){
                data.queryKey = this.wFormInline.queryKey;
            }
            if(this.connectedResultType){
                data.connectedResultType = this.connectedResultType;
            }
            // let newData = $.extend(data,this.wFormInline)
            $.post(this.$baseUrl+'services/task/queryTaskItemList.json',JSON.stringify(data)).then((res)=>{
                if(res.resultMessageEnum=='0000'){
                    if(Object.keys(res.returnObject).length){
                        this.taskItemListData = res.returnObject.recordList;
                    }
                    this.pagination.total = res.returnObject.totalNumber;
                }else{
                    this.$message.error(res.errorInfoList[0].errorMessage);
                }
            });
        },
        // 通话明细统计概况
        sumTaskItemStatistics(opt){
            var data={
                memberId:this.$route.params.id,
                startDate:this.startDate,
                endDate:this.endDate
            }
            $.post(this.$baseUrl+'services/statistics/sumTaskItemStatistics.json',JSON.stringify(data)).then((res)=>{
                if(res.resultMessageEnum=='0000'){
                    let data = res.returnObject;
                    if(data && Object.keys(data).length){
                        this.sumTaskData = data;
                    }else{
                        Object.keys(this.sumTaskData).forEach((item,index)=>{
                            this.sumTaskData[item]=0;
                        })
                    }
                }else{
                    this.$message.error(res.resultMessage);
                }
                
            });
        },
        // 查询任务明细统计报表数据
        queryTaskItemStatisticsData(opt){
            let data = {
                memberId:this.$route.params.id,
                // kpiType:2,
                startDate:this.startDate,
                endDate:this.endDate
            }
            let newData = $.extend(data,opt)
            $.post(this.$baseUrl+'services/statistics/queryTaskItemStatisticsData.json',JSON.stringify(newData)).then((res)=>{
                if(res.resultMessageEnum=='0000'){
                    if(Object.keys(res.returnObject).length){
                        let data = res.returnObject.data;
                        let dataRows = [];
                        let val = '通话量';
                        if(res.returnObject.kpiType=='2'){
                            val = '通话量';
                        }
                        if(res.returnObject.kpiType=='3'){
                            val = '接通率';
                        }
                        if(data){
                            Object.keys(data).forEach((item,index)=>{
                                let items = {};
                                items['key'] =item ;
                                items[val] = data[item];
                                dataRows.push(items)
                            });
                        }
                        
                        if(res.returnObject.kpiType=='2'){
                            this.chartData.rows = dataRows;
                        }
                        if(res.returnObject.kpiType=='3'){
                            this.chartJTData.rows = dataRows;
                        }
                    }
                }else{
                    this.$message.error(res.errorInfoList[0].errorMessage);
                }
            });
        },
        // 查询通话时长趋势报表和意向统计报表
        queryTaskItemStatisticsKpiData(opt){
            let data = {
                    // memberId: "27711cdf5acf421498dd39279a4527c3",
                    kpiType:4,
                    startDate:this.startDate,
                    endDate:this.endDate 
                }
                let newData = $.extend(data,opt)
                $.post(this.$baseUrl+'services/statistics/queryTaskItemStatisticsKpiData.json',JSON.stringify(newData)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        let data=res.returnObject.data;
                        let dataRows = [];
                        if(Object.keys(data).length){
                            Object.keys(data).forEach((item,index)=>{
                                let items = {};
                                items['key'] =item ;
                                items['num'] = data[item];
                                dataRows.push(items)
                            });
                            this.statisData = data;
                        }else{
                            Object.keys(this.statisData).forEach((item,index)=>{
                                this.statisData[item]=0;
                            })
                        }
                        this.pieChartData.rows =dataRows;

                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
        },
        formatterTime(time){
            if(time){
                var h = Math.floor(time/3600%24);
                var m = Math.floor(time/60%60);
                if (h < 1) {
                    return time =`<span class="grid-num">${m}</span>分`;
                } else {
                    return time =`<span class="grid-num">${h}</span>时<span class="grid-num">${m}</span>分`;
                }
            }else{
                return time =`<span class="grid-num">0</span>分`;
            }
        },

        // table
        handleSelectTask(item){

        },
        handleSelectSpeed(item){
            this.activeSpeed = item;
        },
        querySearchAsyncTask(queryString, cb){
            let data = {
                taskName:queryString,
            }
            $.post(this.$baseUrl+'services//task/queryTaskItemList.json',JSON.stringify(data)).then((res)=>{
                if(res.resultMessageEnum=='0000'){
                    let recordList= res.returnObject.recordList;
                    if(recordList.length){
                        recordList.forEach((item,index)=>{
                            item['value']=item.taskName;
                        });
                    }
                    this.restaurantsSpeed =  recordList;
                    var restaurantsSpeed = this.restaurantsSpeed;
                    var results = queryString ? restaurantsSpeed.filter(this.createStateFilter(queryString)) : restaurantsSpeed;
                    cb(results);
                }else{
                    this.$message.error(res.errorInfoList[0].errorMessage);
                }
            });
        },
        querySearchAsyncSpeed(queryString, cb){
            let data = {
                queryKey:queryString,
                templateType:2,
                currentPage:0,
                pageSize:100
            }
            $.post(this.$baseUrl+'services/speechcraft/querySpeechcraftList.json',JSON.stringify(data)).then((res)=>{
                if(res.resultMessageEnum=='0000'){
                    let recordList= res.returnObject.recordList;
                    if(recordList.length){
                        recordList.forEach((item,index)=>{
                            item['value']=item.speechcraftName;
                        });
                    }
                    this.restaurantsTask =  recordList;
                    var restaurantsTask = this.restaurantsTask;
                    var results = queryString ? restaurantsTask.filter(this.createStateFilter(queryString)) : restaurantsTask;
                    cb(results);
                }else{
                    this.$message.error(res.errorInfoList[0].errorMessage);
                }
            });
        },
        createStateFilter(queryString) {
            return (state) => {
                return (state.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
            };
        },

        handleSelectionChange(val) {
            this.multipleSelection = val;
        },
        // 2.11.4.	创建任务明细Excel下载文件
        createExportTaskItemExcelFile(){
            let list = [];
            // if(this.multipleSelection.length){
            //     this.multipleSelection.forEach(el=>{
            //         list.push(el.id);
            //     })
            // }else{
            //     this.$message.error('请选择要导出报表任务！');
            //     return false;
            // }
            let data={
                memberId:this.$route.params.id,
            }

            if(this.activeSpeed){
                data.copyOperationType = this.activeSpeed.copyOperationType;
            }
            if(this.wFormInline.taskName){
                data.taskName = this.wFormInline.taskName;
            }
            if(this.wFormInline.callTimeStart){
                data.callTimeStart = this.formatterTime.startDate;
                data.callTimeEnd = this.formatterTime.callTimeEnd;
            }
            if(this.wFormInline.queryKey){
                data.queryKey = this.wFormInline.queryKey;
            }

            $.post(this.$baseUrl+'services/file/createExportTaskItemExcelFile.json',JSON.stringify(data)).then((res)=>{
                if(res.resultMessageEnum=='0000'){
                    // this.multipleSelection = [];

                    window.location.href = this.$baseUrl+'services/file/downloadFile.html?filePath='+res.returnObject.filePath;
                }else{
                    this.$message.error(res.errorInfoList[0].errorMessage);
                }
            });
        },
    },
    watch:{
       tabActive(opt){
           if(opt=='fourth'){
                this.sumTaskItemStatistics();
                
                // 通话量
                
                this.$nextTick(() => {
                    this.$refs[`charts1`].echarts.resize();
                    this.$refs[`charts2`].echarts.resize();
                    this.$refs[`charts3`].echarts.resize();
                    this.queryTaskItemStatisticsData({
                        kpiType:2
                    });
                    this.queryTaskItemStatisticsData({
                        kpiType:3
                    });
                    this.queryTaskItemStatisticsKpiData();
                })

           }
       }
    }
}
</script>
<style scoped lang="less">
.call-box{
    .el-col-4{
        width: 20%;
    }
    .num{
        display: block;
        font-weight: bold;
        font-size: 24px;
    }
    .txt{

    }
}
.el-card{
    margin-bottom: 20px;
}


.tj-header{
    .el-col{
        text-align:center;
        border-right: 1px solid #ebeef5;
        span{
            font-size: 24px;
            margin-right: 3px;
        }
    }
    i{
        font-style: normal;
        font-size: 24px;
        font-weight: bold;
        margin-right:5px;
        &.a{
            color: #18d4ad;
        }
        &.b{
            color: #5ab1ee;
        }
        &.c{
            color: #fa6e86;
        }
        &.d{
            color: #ffb880;
        }
        &.e{
            color: #0066a6;
        }
        &.f{
            color: #c4b4e3;
        }
    }
}
.el-autocomplete{
    width:620px;
}
.call-box {
    .bule{
        .num{
            color: #409eff;
        }
    }
}
</style>
