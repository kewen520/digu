<template>
    <div class="">
        <div class="recharg-panel">
            <p class="title" >
                <span v-show="!results.enterpriseName && !results.remarkName">未知</span>
                <span v-show="results.remarkName">{{results.remarkName}}</span>
                <span class="sub" >（{{results.enterpriseName?results.enterpriseName:'未知'}}）</span>
            </p>
            <el-row :gutter="20">
                <el-col :span="5">
                    <p class="row-tit">累积消费金额：</p>
                    <p><span class="num">{{byMember.totalConsumptionMoney}}</span><span  class="yuan">元</span></p>
                </el-col>
                <el-col :span="5">
                    <p class="row-tit">累计呼出次数：</p>
                    <p><span class="num">{{byMember.totalConsumptionCalledNumber}}</span><span class="yuan">通</span></p>
                </el-col>
                <el-col :span="5">
                    <p class="row-tit">累计通话时长：</p>
                    <p>
                        <span class="num" v-html="formatterTime(byMember.totalConsumptionConnecteDuration)"></span>/
                        <span class="den" v-html="formatterTime(byMember.totalDuration)"></span>
                    </p>
                </el-col>
                <el-col :span="5">
                    <p class="row-tit">剩余通话时长：</p>
                    <p>
                        <span class="num" v-html="formatterTime(byMember.leaveConnectedDuration)"></span>
                        <span class="den" v-html="formatterTime(byMember.totalDuration)"></span>
                    </p>
                </el-col>
                <div>
                    计费标准：{{byMember.changeFeeStandard}}元／分钟
                    <el-button size="mini" @click="feeVisible=true">更改</el-button>
                </div>
            </el-row>
        </div>
        <div class="recharg-panel-two recharg-panel">
            <div class="search-date-box">
                <el-date-picker
                v-model="searchDate"
                type="daterange"
                align="right"
                unlink-panels
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                @change="handleChangeDate"
                :picker-options="pickerOptions2">
                </el-date-picker>
            </div>
            <el-row :gutter="20">
                <el-col :span="5">
                    <p class="row-tit">消费金额：</p>
                    <p><span class="num">{{consumMember.consumptionMoney}}</span><span  class="yuan">元</span></p>
                </el-col>
                <el-col :span="5">
                    <p class="row-tit">呼出次数：</p>
                    <p><span class="num">{{consumMember.consumptionCalledNumber}}</span><span class="yuan">通</span></p>
                </el-col>
                <el-col :span="5">
                    <p class="row-tit">通话时长：</p>
                    <p><span class="num">{{consumMember.consumptionConnecteDuration}}</span></p>
                </el-col>
            </el-row>
            <div class="consumption-header">
                <span class="tit">消费报表</span>
                <el-button type="primary" @click="createExportConsumptionOrderExcelFile">导出报表</el-button>
            </div>
            <el-table
                :data="ConsumptionTableData"
                @sort-change="sortChange"
                stripe
                style="width: 100%">
                <el-table-column
                prop="taskName"
                label="任务名称"
                width="180">
                </el-table-column>
                <el-table-column
                prop="consumptionStatus"
                label="任务状态"
                :formatter="formatterConsumptionStatus"
                width="180">
                </el-table-column>
                <el-table-column
                sortable
                prop="consumptionStartTime"
                label="开始时间">
                </el-table-column>
                <el-table-column
                prop="connectedDuration"
                label="通话时长">
                </el-table-column>
                <el-table-column
                prop="calledTotalNumber"
                label="呼叫次数">
                </el-table-column>
                <el-table-column
                prop="consumptionMoney"
                label="消费金额">
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
        </div>
        <!-- 修改资费 -->
        <el-dialog title="更改计费标准" :visible.sync="feeVisible" width="600px" center>
            <div class="overrule-dialog-cnt fee-dialog">
                <el-form :inline="true" ref="feeForm" :rules="feeFormRules" :model="feeForm" label-width="100px">
                    <el-form-item label="计费标准：" prop="changeFeeStandard">
                        <el-input v-model="feeForm.changeFeeStandard"></el-input>
                        元／分钟 <span>注：当前标准为{{byMember.changeFeeStandard}}元／分钟 </span>
                    </el-form-item>
                </el-form>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="feeVisible = false">取 消</el-button>
                <el-button type="primary" @click="onHandleFee">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import common from '../../common/common';
import bus from '../../common/bus';
import dateTime from '../../common/date';
export default {
    data() {
        let startTime = dateTime.sevenday('90');
        let endTime = dateTime.today();
        return{
            cur_page:1,
            feeVisible:false,
            results:{},
            byMember:{
                totalConsumptionMoney:0,
                totalConsumptionCalledNumber:0,
                totalConsumptionConnecteDuration:0,
                leaveConnectedDuration:0,
                changeFeeStandard:0,
                totalDuration:0,
            },
            consumMember:{
                consumptionMoney:0,
                consumptionCalledNumber:0,
                consumptionConnecteDuration:0
            },
            pagination: {
                show: true,
                total: 0,
                pageIndex: 1,
                pageSize:20
            },
            feeForm:{
                changeFeeStandard:''
            },
            feeFormRules:{
                changeFeeStandard:[
                    { required: true, message: '计费不能为空！', trigger: 'blur' },
                    {validator:function(rule,value,callback){
                        if(/^[0-9]+(.[0-9]{1,3})?$/.test(value) == false || value<=0){
                            callback(new Error("请输入数字！"));
                        }else{
                            callback();
                        }
                    }, trigger: 'change'}
                ]
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
            startTime:startTime,
            endTime:endTime,
            sortList:[],
            ConsumptionTableData:[],
            searchDate:[startTime,endTime],

        }
    },
    props:['tabActive','refresh','datas'],
    mounted(){
        
    },
    methods: {
        handleCurrentChange(val) {
            this.cur_page = val;
            this.queryConsumptionOrderList();
        },
        onHandleFee(){
            this.$refs['feeForm'].validate((valid) => {
                if(valid){
                    this.modifyWalletChangeFeeStandard();
                }
            });
        },
        formatterConsumptionStatus(){

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
            this.queryConsumptionOrderList();
        },
        handleChangeDate(value){
            this.startTime = dateTime.format(value[0]);
            this.endTime = dateTime.format(value[1]);
            this.queryConsumptionOrderList();
            this.sumConsumptionInfo();
        },
        // 消费信息合计
        sumConsumptionInfo(){
            let data = {
                memberId:this.$route.params.id,
                startTime:this.startTime,
                endTime:this.endTime
            }
            $.post(this.$baseUrl+'services/order/sumConsumptionInfo.json',JSON.stringify(data)).then((res)=>{
                if(res.resultMessageEnum=='0000'){
                    if(res.returnObject&&Object.keys(res.returnObject).length){
                        this.consumMember = res.returnObject;
                    }
                }else{
                    this.$message.error(res.errorInfoList[0].errorMessage);
                }
            });
        },
        // 通汇会员Id查询钱包详情
        queryWalletDetailByMemberId(){
            let data = {
                memberId:this.$route.params.id
            }
            $.get(this.$baseUrl+'services/member/queryWalletDetailByMemberId.json?'+$.param(data)).then((res)=>{
                if(res.resultMessageEnum=='0000'){
                    if(Object.keys(res.returnObject).length){
                        let object = res.returnObject;
                        this.byMember = $.extend(this.byMember,object);
                        this.byMember.totalDuration = object.totalConsumptionConnecteDuration+object.leaveConnectedDuration;
                    }
                }else{
                    this.$message.error(res.errorInfoList[0].errorMessage);
                }
            });
        },
        // 修改钱包计费标准
        modifyWalletChangeFeeStandard(){
            let data = {
                memberId:this.$route.params.id,
                changeFeeStandard:this.feeForm.changeFeeStandard
            }
            $.post(this.$baseUrl+'services/member/modifyWalletChangeFeeStandard.json?'+$.param(data)).then((res)=>{
                if(res.resultMessageEnum=='0000'){
                    this.feeVisible = false;
                    this.byMember.changeFeeStandard=this.feeForm.changeFeeStandard;
                    this.$message.success('操作成功！');
                }else{
                    this.$message.error(res.errorInfoList[0].errorMessage);
                }
            });
        },
        // 查询消费记录列表
        queryConsumptionOrderList(){
            let data = {
                memberId:this.$route.params.id,
                startTime:this.startTime,
                endTime:this.endTime,
                currentPage:this.cur_page-1,
                pageSize:this.pagination.pageSize
            }
            if(this.sortList.length){
                data.sortList =this.sortList;
            }
            $.post(this.$baseUrl+'services/order/queryConsumptionOrderList.json',JSON.stringify(data)).then((res)=>{
                if(res.resultMessageEnum=='0000'){
                    this.ConsumptionTableData=res.returnObject.recordList;
                    this.pagination.total = res.returnObject.totalNumber;
                }else{
                    this.$message.error(res.errorInfoList[0].errorMessage);
                }
            });
        },
        // 创建消费订单Excel下载文件
        createExportConsumptionOrderExcelFile(){
            let list = [];
            let data={
                memberId:this.$route.params.id,
                startTime:this.startTime,
                endTime:this.endTime
            }
            $.post(this.$baseUrl+'services/file/createExportConsumptionOrderExcelFile.json',JSON.stringify(data)).then((res)=>{
                if(res.resultMessageEnum=='0000'){
                    window.location.href = this.$baseUrl+'services/file/downloadFile.html?filePath='+res.returnObject.filePath;
                }else{
                    this.$message.error(res.errorInfoList[0].errorMessage);
                }
            });
        },
        formatterTime(time){
            // time = 42
            if(time){
                var m = (time/60).toFixed(1);
                return time =`<span class="grid-num">${m}</span>分`;
            }else{
                return time =`<span class="grid-num">0</span>分`;
            }
            // if(time){
            //     var h = Math.floor(time/3600%24);
            //     var m = Math.floor(time/60%60);
            //     if (h < 1) {
            //         return time =`<span class="grid-num">${m}</span>分`;
            //     } else {
            //         return time =`<span class="grid-num">${h}</span>时<span class="grid-num">${m}</span>分`;
            //     }
            // }else{
            //     return time =`<span class="grid-num">0</span>分`;
            // }
        },
    },
    watch:{
       tabActive(opt){
           if(opt=='third'){
               this.queryWalletDetailByMemberId();
               this.sumConsumptionInfo();
               this.queryConsumptionOrderList();
           }
       },
       refresh(opt){
           if(opt){
                this.queryWalletDetailByMemberId();
                this.sumConsumptionInfo();
                this.queryConsumptionOrderList();
                bus.$emit('setRefresh', 'false');
           }
       },
       datas(data){
           this.results = data;
       },
    }
}
</script>
<style scoped lang="less">
.recharg-panel{
    background: #fff;
    padding:40px 40px;
    .title{
        padding:0 0 30px;
        .sub{
            color: #a2a6ad;
        }
    }
    .row-tit{
        padding-bottom:12px;
    }
    .num{
        font-weight: bold;
        font-size:22px;
    }
}
.fee-dialog{
    .el-input{
        width: 90px;
    }
}
.recharg-panel-two{
    margin-top: 20px;
    background-color: #fff;
    padding:20px 0;
    .el-row{
        padding-left: 40px;
    }
}
.consumption-header{
    border-top: 1px solid #ebeef5;
    border-bottom: 1px solid #ebeef5;
    padding:8px 20px;
    font-size: 14px;
    height:50px;
    margin-top:60px;
    .tit{
        line-height: 34px;
    }
    .el-button{
        float: right;
    }
}
.recharg-panel-two{
    position: relative;
}
.search-date-box{
    position:absolute;
    right: 20px;
    top:20px;
    z-index: 3;
}
</style>
