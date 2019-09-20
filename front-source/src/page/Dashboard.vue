<template>
    <div class="main-box">
        <!-- <div class="content-box-top">
            <a @click="changeTab('dashboard')" :class="{'active':activeTab=='dashboard'}">数据统计</a>
            <a @click="changeTab('controlPanel')" :class="{'active':activeTab=='controlPanel'}">控制面板</a>
            <a @click="changeTab('novice')" :class="{'active':activeTab=='novice'}">新手指引</a>
        </div> -->
        <!-- 数据统计 -->
        <div class="dashboard-box" v-show="activeTab=='dashboard'">
            <el-row :gutter="20" class="mgb20">
                <el-col :span="4">
                    <el-card shadow="hover" :body-style="{padding: '0px'}">
                        <div class="grid-content grid-con-1">
                            <i class="iconfont icon-ico_ringer grid-con-icon"></i>
                            <div class="grid-cont-right">
                                <div><span class="grid-num">{{taskInfo.calledNumber||0}}</span>次</div>
                                <div class="grid-cont-right-tex">呼出总次数</div>
                            </div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="4">
                    <el-card shadow="hover" :body-style="{padding: '0px'}">
                        <div class="grid-content grid-con-2">
                            <i class="iconfont icon-ico_chat grid-con-icon"></i>
                            <div class="grid-cont-right">
                                <div><span class="grid-num">{{taskInfo.connectedNumber||0}}</span>次</div>
                                <div class="grid-cont-right-tex">通话次数</div>
                            </div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="4">
                    <el-card shadow="hover" :body-style="{padding: '0px'}">
                        <div class="grid-content grid-con-3">
                            <i class="iconfont icon-ico_percentage grid-con-icon"></i>
                            <div class="grid-cont-right">
                                <div><span class="grid-num">{{taskInfo.connectedRate||'--'}}</span>%</div>
                                <div class="grid-cont-right-tex">接通率</div>
                            </div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="4">
                    <el-card shadow="hover" :body-style="{padding: '0px'}">
                        <div class="grid-content grid-con-4">
                            <i class="iconfont icon_orange_cube grid-con-icon"></i>
                            <div class="grid-cont-right">
                                <div v-html="formatterTime(taskInfo.connectedDuration)"></div>
                                <div class="grid-cont-right-tex">通话总时长</div>
                            </div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="4">
                    <el-card shadow="hover" :body-style="{padding: '0px'}">
                        <div class="grid-content grid-con-5">
                            <i class="iconfont icon-ico_time grid-con-icon"></i>
                            <div class="grid-cont-right">
                                <div v-html="formatterTime(taskInfo.averageConnectedDuration)"></div>
                                <div class="grid-cont-right-tex">平均通话时长</div>
                            </div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
            <el-row :gutter="20">
                <el-col :span="14">
                    <el-card>
                        <div slot="header" class="clearfix">
                            <span>待处理</span>
							<el-switch
							  style="margin-left:670px"
							  v-model="progressPattern"
							  active-text="N"
							  inactive-text="%"
							  active-value="number"
							  inactive-value="percent"
							  @change="switchProgressPattern">
							</el-switch>
                        </div>
                        <div class="remaining_calls">
                            <el-progress :width="76" height="76" color="#12D4A3" type="circle" :percentage="taskInfo.percentage"  ></el-progress>
                            <div class="remaining_calls_right">
                                <span id="calledNumber_num" class="remaining_calls_right_top"><span class="molecular">{{taskInfo.leaveCalledNumber||0}}</span>/<span>{{taskInfo.needCalledNumber||0}}</span></span>
								<span id="calledNumber_percent" class="remaining_calls_right_top" style="display: none;"><span class="molecular">{{taskInfo.leaveCalledNumber/taskInfo.needCalledNumber | percentFormate}}</span></span>
                                <span class="remaining_calls_right_bottom">剩余呼叫次数</span>
                            </div>
                        </div>
                        <div class="remaining_calls task">
                            <el-progress :width="76" height="76" color="#5E85FF" type="circle" :percentage="taskInfo.finishTaskRate"  ></el-progress>
                            <div class="remaining_calls_right">
                                <span id="unFinishTaskNumber_num" class="remaining_calls_right_top"><span class="molecular">{{taskInfo.unFinishTaskNumber||0}}</span>/<span>{{taskInfo.totalTaskNumber||0}}</span></span>
								<span id="unFinishTaskNumber_percent" class="remaining_calls_right_top" style="display:none"><span class="molecular">{{taskInfo.unFinishTaskNumber/taskInfo.totalTaskNumber | percentFormate}}</span></span>
                                <span class="remaining_calls_right_bottom">未完成任务数</span>
                            </div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="10">
                    <el-card>
                        <div slot="header" class="clearfix">
                            <span>系统公告</span>
                            <!-- <a href="" style="float:right;">查看更多</a> -->
                        </div>
                        <div style="height:86px;">
                            <ul class="recordList">
                                <li v-for="item in recordList" :key="item.id">{{item.title}}</li>
                            </ul>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
            <el-row :gutter="20">
                <el-col :span="14">
                    <el-card class="box-card">
                        <div slot="header" class="clearfix">
                            <span>通话量趋势</span>
                            <div style="float:right">
                                <el-dropdown @command="handleCommandType2">
                                    <span class="el-dropdown-link">
                                        近{{dropdown_text_Type2}}天<i class="el-icon-arrow-down el-icon--right"></i>
                                    </span>
                                    <el-dropdown-menu slot="dropdown">
                                        <el-dropdown-item command="7">近7天</el-dropdown-item>
                                        <el-dropdown-item command="15">近15天</el-dropdown-item>
                                        <el-dropdown-item command="30">近30天</el-dropdown-item>
                                        <el-dropdown-item command="60">近60天</el-dropdown-item>
                                    </el-dropdown-menu>
                                </el-dropdown>
                            </div>
                        </div>
                        <ve-line :data="chartData" :settings="chartSettings" ></ve-line>
                    </el-card>
                </el-col>
                <el-col :span="10">
                    <el-card class="box-card">
                        <div slot="header" class="clearfix">
                            <span>通话时长占比</span>
                            <div style="float:right">
                                <el-dropdown @command="handleCommandType1">
                                    <span class="el-dropdown-link">
                                        近{{dropdown_text_Type1}}天<i class="el-icon-arrow-down el-icon--right"></i>
                                    </span>
                                    <el-dropdown-menu slot="dropdown">
                                        <el-dropdown-item command="7">近7天</el-dropdown-item>
                                        <el-dropdown-item command="15">近15天</el-dropdown-item>
                                        <el-dropdown-item command="30">近30天</el-dropdown-item>
                                        <el-dropdown-item command="60">近60天</el-dropdown-item>
                                    </el-dropdown-menu>
                                </el-dropdown>
                            </div>
                        </div>
                        <ve-ring :data="ringChartData"></ve-ring>
                    </el-card>
                </el-col>
            </el-row>
            <el-row :gutter="20">
                <el-col :span="14">
                    <el-card class="box-card">
                        <div slot="header" class="clearfix">
                            <span>接通率趋势</span>
                            <div style="float:right">
                                <el-dropdown @command="handleCommandType3">
                                    <span class="el-dropdown-link">
                                        近{{dropdown_text_Type3}}天<i class="el-icon-arrow-down el-icon--right"></i>
                                    </span>
                                    <el-dropdown-menu slot="dropdown">
                                        <el-dropdown-item command="7">近7天</el-dropdown-item>
                                        <el-dropdown-item command="15">近15天</el-dropdown-item>
                                        <el-dropdown-item command="30">近30天</el-dropdown-item>
                                        <el-dropdown-item command="60">近60天</el-dropdown-item>
                                    </el-dropdown-menu>
                                </el-dropdown>
                            </div>
                        </div>
                        <ve-line :data="chartJTData" height="300px" :settings="chartJTDataSetting" :extend="extend"></ve-line>
                    </el-card>
                </el-col>
                <el-col :span="10">
                    <el-card class="box-card">
                        <div slot="header" class="clearfix">
                            <span>公司公告</span>
                            <!-- <a href="" style="float:right;">查看更多</a> -->
                        </div>
                        <div style="height:300px">
                            <ul class="recordList">
                                <li v-for="item in companyRecordList" :key="item.id">{{item.title}}</li>
                            </ul>
                            <!-- <p>关注微信公众号了解更多公司资讯</p> -->
                            <!-- <div style="padding:20px 0 20px;"><img src="../../../static/img/img_QR_code.png" alt=""></div> -->
                        </div>
                    </el-card>
                </el-col>
            </el-row>

            <el-row :gutter="20" class="last-el-row">
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

                            <div style="float:right">
                                <el-dropdown @command="handleCommandType4">
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
                                </el-dropdown>
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
                            <ve-line :data="chartYTFNData" :settings="chartYTFNettings"></ve-line>
                        </el-col>
                        <el-col :span="10">
                            <ve-ring :data="chartYTFNDBINGata" :settings="chartYTFNBINGettings"></ve-ring>
                        </el-col>
                    </el-card>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script>
    // import Schart from 'vue-schart';
    // import VCharts from 'v-charts'
    import bus from '../common/bus';
    import dateTime from '../common/date';
	import {numeral} from '../common/numeral.min.js';
    export default {
        name: 'dashboard',
        data() {
            this.defSetting={
                title:{
                    textStyle:{
                        color: "#fff"
                    }
                }
            }
            this.afterConfig={
                
                title:{

                    textStyle:{
                        color: "#ff0000"
                    }
                },
            }
            this.chartSettings = {
                stack: { '用户': ['访问用户', '下单用户'] },
                area: true,
                height:300,
                title:{
                    subtext:"作者:前端林三哥",
                    textStyle:{
                        color: "#ff0000"
                    }
                },
            }
            this.chartJTDataSetting={
                area: true
            }
            this.chartYTFNettings = {
                labelMap: {
                },
                legendName:{

                }
            },
            this.chartYTFNBINGettings = {

            },
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
                        color:'#303133',
                    }
                }
            }
            return {
                dropdown_text_Type1:'7',
                dropdown_text_Type2:'7',
                dropdown_text_Type3:'7',
                dropdown_text_Type4:'',
                dropdown_text_Type5:'7',
                dropdown_text_Type4_List:[],
                intertionLevel:{},
                defaultName4:"",
                countA:0,
                countB:0,
                countC:0,
                countD:0,
                countE:0,
                countF:0,
                speechcraftId:"",
                activeTab:'dashboard',
                recordList:[],
                companyRecordList:[],
                taskInfo:{
                    needCalledNumber:1,
                    leaveCalledNumber:1,
                    finishTaskRate:1,
                },
                name: localStorage.getItem('ms_username'),
                chartData: {
                    columns: ['key', '通话量'],
                    rows: []
                },
                chartJTData: {
                    columns: ['key', '接通率'],
                    rows: []
                },
                ringChartData:{
                    columns: ['key', '通话时长'],
                    rows: []
                },
                chartYTFNData:{
                    columns:["日期","A","B","C","D","E","F"],
                    rows:[

                    ]
                },
                chartYTFNDBINGata:{
                    columns:["意图级别","数量"],
                    rows:[

                    ]
                },
                todoList: [
                ],
                data: [
                ],
                collapse: false,
				progressPattern:'number',

                intertionLevelDesc:[],
            }
        },
        components: {
            // VCharts
        },
        computed: {
            // role() {
            //     return this.name === 'admin' ? '超级管理员' : '普通用户';
            // }
        },
		progressPattern: 'number',
		filters: {
		  percentFormate: function (value) {
			// return numeral(value).format('0,00%');
			var percent = (value * 100).toFixed(2);
			return percent + "%";
		  }
		},
        created(){
            //  是否显示tab

            bus.$on('collapse', msg => {
                this.collapse = msg;
            });
            // 调用renderChart方法对图表进行重新渲染
            // window.addEventListener('resize', ()=>{
            //     this.$refs.bar.renderChart();
            //     this.$refs.line.renderChart();
            // })
            // this.changeDate();

            this.queryTaskInfo();


            let startDate = dateTime.sevenday('7');
            let endDate = dateTime.today();
            // 通话量
            this.queryKpiList({
                kpiType:2,
                startDate:startDate,
                endDate:endDate
            });
            // 通话时长占比
            this.queryKpiList({
                kpiType:1,
                startDate:startDate,
                endDate:endDate
            });
            // 接通率
            this.queryKpiList({
                kpiType:3,
                startDate:startDate,
                endDate:endDate
            });

            // 公告
            this.queryNoticeList();
            this.queryNoticeListCompany();
            //话术
            this.querySpeechcraftList();
            //
//            this.queryTaskIntentionByTaskId()
        },
        watch: {
            collapse(){
                setTimeout(() => {
                    // this.$refs.bar.renderChart();
                    // this.$refs.line.renderChart();
                }, 300);
            }
        },
        methods: {
            // 时间
            formatterTime(time){
                if(time){
                    var h = Math.floor(time/3600);
                    var m = Math.floor(time%3600/60);
                    var s = time;
                    if(s < 60){
                    	return time =`<span class="grid-num">${s}</span>秒`;
                    }
                    if (h < 1) {
                        return time =`<span class="grid-num">${m}</span>分`;
                    } else {
                        return time =`<span class="grid-num">${h}</span>时<span class="grid-num">${m}</span>分`;
                    }
                }else{
                    return time =`<span class="grid-num">0</span>分`;
                }
                
            },
            // 任务信息统计
            queryTaskInfo(){
                $.get(this.$baseUrl+'statistics/queryTaskInfo.json').then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        res.returnObject.percentage = (res.returnObject.leaveCalledNumber/res.returnObject.needCalledNumber)*100||0;
                        this.taskInfo = res.returnObject;
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            // 查询指标列表
            queryKpiList(opt){
                var data={
                    kpiType:opt.kpiType,
                    startDate:opt.startDate,
                    endDate:opt.endDate
                }
                $.post(this.$baseUrl+'statistics/queryKpiList.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){

                        let data = res.returnObject.data;
                        let dataRows = [];
                        let val = '';
                        if(res.returnObject.kpiType==1){
                            val = '通话时长';
                        }else if(res.returnObject.kpiType==2){
                            val = '通话量';
                        }else{
                            val = '接通率';
                        }
                        for(var item in data){
                            let items = {};
                            items['key'] = item;
                            items[val] = data[item]
                            dataRows.push(items)
                        }
                        switch(res.returnObject.kpiType){
                            case 1:
                                this.ringChartData.rows = dataRows;
                            break;
                            case 2:
                                this.chartData.rows = dataRows;
                            break;
                            case 3:
                                this.chartJTData.rows = dataRows;
                            break;
                        }
                        

                    }else{
                        // dtd.resolve();
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                    
                });
                // return dtd;
            },
            handleCommandType1(command) {
                let startDate = dateTime.sevenday(command);
                let endDate = dateTime.today();
                // 通话量
                this.queryKpiList({
                    kpiType:1,
                    startDate:startDate,
                    endDate:endDate
                });
                this.dropdown_text_Type1=command;
            },
            handleCommandType2(command) {
                let startDate = dateTime.sevenday(command);
                let endDate = dateTime.today();
                // 通话量
                this.queryKpiList({
                    kpiType:2,
                    startDate:startDate,
                    endDate:endDate
                });
                this.queryTaskCheckStatistics()
                this.dropdown_text_Type2=command;
            },
            handleCommandType3(command) {
                let startDate = dateTime.sevenday(command);
                let endDate = dateTime.today();
                // 通话量
                this.queryKpiList({
                    kpiType:3,
                    startDate:startDate,
                    endDate:endDate
                });
                this.dropdown_text_Type3=command;
            },
            handleCommandType4(command){

                for (let i in this.dropdown_text_Type4_List){
                    if (this.dropdown_text_Type4_List[i]['id'] == command){
                        this.defaultName4 = this.dropdown_text_Type4_List[i]['speechcraftName']
                        this.speechcraftId = command
                    }
                }

                this.queryTaskIntentionByTaskId()
            },
            handleCommandType5(command){
                this.dropdown_text_Type5 = command
                this.queryTaskIntentionByTaskId()
            },
            //查询系统公告列表
            queryNoticeList(){
                var data={
                    noticeType:1
                }
                $.post(this.$baseUrl+'notice/queryNoticeList.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.recordList = res.returnObject.recordList;
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
             //查询公司公告列表
            queryNoticeListCompany(){
                var data={
                    noticeType:2
                }
                $.post(this.$baseUrl+'notice/queryNoticeList.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.companyRecordList = res.returnObject.recordList;
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            // changeDate(){
            //     const now = new Date().getTime();
            //     this.data.forEach((item, index) => {
            //         const date = new Date(now - (6 - index) * 86400000);
            //         item.name = `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`
            //     })
            // },
            changeTab(type){
                switch(type){
                    case 'dashboard':
                    this.activeTab='dashboard';
                    break;
                    case 'controlPanel':
                    this.activeTab='controlPanel';
                    break;
                    case 'novice':
                    this.activeTab='novice';
                    break;
                }
            },
            querySpeechcraftList(){
                let data = {
                    templateType: 2,
                    speechcraftStatusList: ['5'],
                    pageSize: 10000
                }
                $.post(this.$baseUrl + 'speechcraft/querySpeechcraftList.json', JSON.stringify(data)).then((res) => {
                    if (res.resultMessageEnum == '0000') {
                        this.dropdown_text_Type4_List = res.returnObject.recordList;
                        this.defaultName4 = res.returnObject.recordList[0].speechcraftName;
                        this.speechcraftId = res.returnObject.recordList[0].id
                        var recordList = res.returnObject.recordList;
                        var intertionLevelResult = []
                        if (recordList.length > 0){
                            let labelMap = {}
                            let legendName = {}
                            let result = {}
                            let sid = ""
                            for (var i in recordList){
                                if (recordList[i].intentionLevelDescription != undefined && recordList[i].intentionLevelDescription!=""){
                                    var intertionLevel = JSON.parse(recordList[i].intentionLevelDescription);
                                    var  At = "A "+(intertionLevel.A.memberDescription!=undefined ? intertionLevel.A.memberDescription:"");
                                    var  Bt = "B "+(intertionLevel.B.memberDescription!=undefined ? intertionLevel.B.memberDescription:"");
                                    var  Ct = "C "+(intertionLevel.C.memberDescription!=undefined ? intertionLevel.C.memberDescription:"");
                                    var  Dt = "D "+(intertionLevel.D.memberDescription!=undefined ? intertionLevel.D.memberDescription:"");
                                    var  Et = "E "+(intertionLevel.E.memberDescription!=undefined ? intertionLevel.E.memberDescription:"");
                                    var  Ft = "F "+(intertionLevel.F.memberDescription!=undefined ? intertionLevel.F.memberDescription:"");
                                }else {
                                    var  At = "A "
                                    var  Bt = "B "
                                    var  Ct = "C "
                                    var  Dt = "D "
                                    var  Et = "E "
                                    var  Ft = "F "
                                }
                                labelMap = {
                                    "A":At,
                                    "B":Bt,
                                    "C":Ct,
                                    "D":Dt,
                                    "E":Et,
                                    "F":Ft,
                                }
                                legendName = {
                                    [At]:"A",
                                    [Bt]:"B",
                                    [Ct]:"C",
                                    [Dt]:"D",
                                    [Et]:"E",
                                    [Ft]:"F"
                                }
                                sid = recordList[i].id
                                result = {
                                    "id" : sid,
                                    "labelMap":labelMap,
                                    "legendName":legendName
                                }
                                intertionLevelResult.push(result)
                            }
                        }
                        this.intertionLevelDesc = intertionLevelResult
                        this.queryTaskIntentionByTaskId();
                    } else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            queryTaskIntentionByTaskId(){
                let startDate = dateTime.sevenday(this.dropdown_text_Type5);
                let endDate = dateTime.today();
                $.get(this.$baseUrl + 'task/queryTaskIntentionByTaskId.json?speechcraftId=' + this.speechcraftId
                    + "&startDate="+ startDate + "&endDate=" + endDate
                ).then((res) => {
                    if (res.resultMessageEnum == '0000') {
                        let returnObject = res.returnObject;
                        let dataList = []
                        var ra =  {};
                        var rb =  {};
                        var rc =  {};
                        var rd =  {};
                        var re =  {};
                        var rf =  {};
                        var counta = 0;
                        var countb = 0;
                        var countc = 0;
                        var countd = 0;
                        var counte = 0;
                        var countf = 0;
                        for (let i=0;i < this.dropdown_text_Type5;i++){
                            let d = dateTime.sevenday(i)
                            ra[d] = 0
                            rb[d] = 0
                            rc[d] = 0
                            rd[d] = 0
                            re[d] = 0
                            rf[d] = 0
                            dataList.push(d)
                        }

                        for (let i in returnObject){
                            for (let j in returnObject[i]){
                                let currentDate = returnObject[i][j]['callTime'].split(" ")[0];
                                if (i == "a"){
                                    ra[currentDate] = ra[currentDate]+1;
                                    counta += 1;
                                }else if (i == "b"){
                                    rb[currentDate] = rb[currentDate]+1;
                                    countb += 1;
                                }else if (i == "c"){
                                    rc[currentDate] = rc[currentDate]+1;
                                    countc += 1;
                                }else if (i == "d"){
                                    rd[currentDate] = rd[currentDate]+1;
                                    countd += 1;
                                }else if (i == "e"){
                                    counte += 1;
                                    re[currentDate] = re[currentDate]+1;
                                }else if (i == "f"){
                                    countf += 1;
                                    rf[currentDate] = rf[currentDate]+1;
                                }
                            }
                        }

                        var countRows = [];
                        countRows = [
                            {"意图级别":"A","数量":counta},
                            {"意图级别":"B","数量":countb},
                            {"意图级别":"C","数量":countc},
                            {"意图级别":"D","数量":countd},
                            {"意图级别":"E","数量":counte},
                            {"意图级别":"F","数量":countf},
                        ];
                        var rows = [];
                        for (var i in dataList){
                            let item = {
                                "日期":dataList[i],
                                "A":ra[dataList[i]],
                                "B":rb[dataList[i]],
                                "C":rc[dataList[i]],
                                "D":rd[dataList[i]],
                                "E":re[dataList[i]],
                                "F":rf[dataList[i]],
                            }
                            rows.push(item)
                        }
                        this.chartYTFNDBINGata["rows"] = countRows
                        this.chartYTFNData["rows"] = rows
                        this.countA = counta
                        this.countB = countb
                        this.countC = countc
                        this.countD = countd
                        this.countE = counte
                        this.countF = countf

                        for (var i in this.intertionLevelDesc){
                            if (this.intertionLevelDesc[i].id == this.speechcraftId){
                                this.chartYTFNettings.labelMap = this.intertionLevelDesc[i].labelMap
                                this.chartYTFNettings.legendName = this.intertionLevelDesc[i].legendName
                            }
                        }

                    } else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
			switchProgressPattern(pattern){
				if(pattern == 'percent'){
					/* var leaveCalledNumber = parseInt($("#leaveCalledNumber").text());
					var needCalledNumber = parseInt($("#needCalledNumber").text());
					var percent = numeral(leaveCalledNumber/needCalledNumber).format('0,00%');
					$("#leaveCalledNumber").text(percent);
					$("#needCalledNumber").hide();
					$("#slash1").hide();
					$("#leaveCalledNumber").attr("leaveCalledNumber", leaveCalledNumber);
					$("#needCalledNumber").attr("needCalledNumber", needCalledNumber); */
					$("#calledNumber_num").hide();
					$("#calledNumber_percent").show();
					$("#unFinishTaskNumber_num").hide();
					$("#unFinishTaskNumber_percent").show();
				}else if(pattern == 'number'){
					$("#calledNumber_percent").hide();
					$("#calledNumber_num").show();
					$("#unFinishTaskNumber_percent").hide();
					$("#unFinishTaskNumber_num").show();
				}
			}
            
        },

        destroyed(){
            bus.$emit('contentTop', false);
        }
    }
</script>
<style  lang="less">
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
            // background:#FFEFD7;
            color: #FDB000;
        }
        .grid-con-5 .grid-con-icon {
            background:#D6FAF2;
            color: #2ED9BB;
        }
    }

    .el-row {
        margin-bottom: 20px;
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
        color:#303133;
        text-align: left;
        padding-left:20px;
        .grid-cont-right-tex{
            font-size: 12px;
            font-weight:500;
        }
        .grid-num {
            color: #303133;
            margin-right: 2px;
            font-size: 30px;
            font-weight: bold;
        }
    }
    .recordList li{
        list-style: none;
    }
    .el-dropdown{
        cursor: pointer;
    }
    .last-el-row{
        margin-bottom: 0;
    }
</style>
