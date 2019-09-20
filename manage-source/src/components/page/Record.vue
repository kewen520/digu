<template>
    <div class="container-admin">
        <p class="tit">意图分类统计</p>
        <el-form :inline="true"  class="w-form-inline">
            <el-date-picker
                v-model="formInline.dateValue"
                type="datetimerange"
                :picker-options="pickerOptions2"
                @change="handleChangeDate"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                align="right">
                </el-date-picker>
                <el-form-item >
                    <el-select v-model="formInline.select" placeholder="所有话术通用模版" @change="changeValue">
                        <el-option
                        v-for="item in selectOpt"
                        :key="item.speechcraftId"
                        :label="item.speechcraftName"
                        :value="item.speechcraftId">
                        </el-option>
                    </el-select>
                </el-form-item>
        </el-form>
        <div class="">
            <el-card class="record-box-card">
                <div slot="header" class="clearfix">
                    <span>意图筛选</span>
                </div>
                <div class="yt">
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
            <el-card class="record-box-card">
                <div slot="header" class="clearfix">
                    <span>通话量统计</span>
                </div>
                <div class="yt">
                    <ve-pie ref="charts3" :data="pieChartData" :settings="pieChartSettings"></ve-pie>
                    <!-- <el-row>
                        <el-col :span="12">
                            <ve-line :data="chartData"></ve-line>
                        </el-col>
                        <el-col :span="12">
                            
                            <ve-pie :data="pieChartData" :settings="pieChartSettings"></ve-pie>
                        </el-col>
                    </el-row> -->
                </div>
            </el-card>
        </div>
    </div>
</template>
<script>
    import bus from '../common/bus';
    import dateSet from '../common/date';
    import dateTime from '../common/date';
    export default {
        name: 'user',
        data() {
            this.pieChartSettings = {
                dimension: 'key',
                metrics: 'num'
            }
            let startDate = dateTime.sevenday('90');
            let endDate = dateTime.today();
            return {
                startDate:startDate,
                endDate:endDate,
                selectOpt:[],
                formInline:{
                    dateValue:[startDate,endDate],
                    select:''
                },
                statisData:{
                    A:0,
                    B:0,
                    C:0,
                    D:0,
                    E:0,
                    F:0,
                },
                pieChartData: {
                    columns: ['key', 'num'],
                    rows: []
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
            }
        },

        mounted(){

        },
        created(){

            this.queryTaskItemStatisticsKpiData();
            
            this.querySpeechcraftListOpt();
        },
        methods: {
            handleChangeDate(value){
                this.startDate = dateSet.format(value[0]);
                this.endDate = dateSet.format(value[1]);

                this.queryTaskItemStatisticsKpiData();
            },
            changeValue(vId){
                let obj = {};
                obj = this.selectOpt.find((item)=>{
                    return item.id === vId;
                });
                console.log(obj,44)
                // this.queryTaskItemStatisticsKpiData({
                //     memberId:vId
                // });
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
                            if(data && Object.keys(data).length){
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
            querySpeechcraftListOpt(){
                let data = {
                    templateType:1
                }
                $.post(this.$baseUrl+'services/speechcraft/querySpeechcraftList.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        let list = res.returnObject.recordList;
                        if(list && list.length){
                            // let len = list.unshift(this.defe);
                            this.selectOpt=list;
                        }
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
        }
    }

</script>


<style scoped lang="less">
    .container-admin{
        margin:0 20px;
    }
    .tit{
        margin:10px 0 20px;
        font-size: 16px;
    }
    .w-form-inline{
        text-align: right;
        padding-bottom: 20px;
    }
    .tj-header{
        .el-col{
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
</style>
