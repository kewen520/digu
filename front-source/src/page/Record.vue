<template>
    <div>
        <div class="content-box-top">
            <el-input v-model="select_word" clearable placeholder="输入关键词" class="handle-input mr10" @keyup.native.13="search"></el-input>
            <el-button type="primary" icon="search" @click="search">搜索</el-button>
            <div class="content-box-top-right">
                <el-date-picker
                v-model="date"
                format="yyyy-MM-dd"
                type="daterange"
                @change="handleChangeDate"
                :picker-options="pickerOptions2"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                align="right">
                </el-date-picker>
            </div>
        </div>
        <div class="w-container">
            <el-tabs v-model="activeName" @tab-click="handleClick">
                <el-tab-pane label="充值纪录" name="recharge_record" >
                    <el-table :data="rechargeRecordTableData" style="width: 100%" :height="height" stripe @sort-change="sortChange1">
                        <el-table-column
                            prop="orderNo"
                            label="订单号"
                            width="180">
                        </el-table-column>
                        <el-table-column
                            prop="paymentType"
                            label="充值方式"
                            width="180">
                            <template slot-scope="scope">
                                <span v-show="scope.row.paymentType==1">微信</span>
                                <span v-show="scope.row.paymentType==2">支付宝</span>
                                <span v-show="scope.row.paymentType==3">银联</span>
                                <span v-show="scope.row.paymentType==4">手动打款</span>
                            </template>
                        </el-table-column>
                        <el-table-column
                            prop="transferDate"
                            label="充值时间">
                        </el-table-column>
                        <el-table-column
                            prop="transferMoney"
                            label="充值金额">
                        </el-table-column>
                        <el-table-column
                            prop="receivedMoney"
                            label="到账金额">
                        </el-table-column>
                        <el-table-column
                            prop="orderStatus"
                            label="状态">
                             <template slot-scope="scope">
                                <span v-if="scope.row.orderStatus==1">未支付</span>
                                <span v-if="scope.row.orderStatus==2">处理中</span>
                                <span v-if="scope.row.orderStatus==3">充值成功</span>
                                <span v-if="scope.row.orderStatus==4">未支付已关单</span>
                                <span v-if="scope.row.orderStatus==5">支付错误</span>
                                <span v-if="scope.row.orderStatus==6">退款中</span>
                                <span v-if="scope.row.orderStatus==7">已退款</span>
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
                </el-tab-pane>
                <el-tab-pane label="消费纪录" name="consum_record">
                    <el-table :data="consumRecordTableData" style="width: 100%" :height="height" stripe @sort-change="sortChange2">
                        <el-table-column
                            prop="taskName"
                            label="任务名称"
                            width="180">
                        </el-table-column>
                        <el-table-column
                            prop="consumptionTime"
                            label="结算时间"
                            sortable
                            width="180">
                        </el-table-column>
                        <el-table-column
                            prop="consumptionMoney"
                            sortable
                            label="消费金额">
                        </el-table-column>
                        <el-table-column
                            prop="connectedDuration"
                            sortable
                            label="通话时长">
                        </el-table-column>
                        <el-table-column
                            prop="calledTotalNumber"
                            sortable
                            label="呼叫次数">
                        </el-table-column>
                    </el-table>
                    <div class="pagination">
                        <el-pagination background @current-change="handleCurrentChangeConsum" 
                            layout="total, prev, pager, next,jumper"
                            :total="pagination.total"
                            :page-size="pagination.pageSize"
                            >
                        </el-pagination>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </div>

    </div>
</template>

<script>
    import bus from '../common/bus';
    import dateSet from '../common/date';
    export default {
        name: 'baseform',
        data: function(){
            return {
                select_cate: '',
                url: './static/vuetable.json',
                select_word: '',
                cur_page:1,
                cur_page_con:1,
                date:'',
                activeName:"recharge_record",
                rechargeRecordTableData:[],
                consumRecordTableData:[],
                pagination: {
                    total: 0,
                    pageIndex: 1,
                    pageSize:20
                },
                // sortList1:[],
                sortList2:[{propertyName: "consumptionTime", ascendingFlag: true}],
                pickerOptions2:{
                    shortcuts: [{
                        text: '今天',
                        onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        picker.$emit('pick', [start, end]);
                        }
                    },{
                        text: '昨天',
                        onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24);
                        picker.$emit('pick', [start, end]);
                        }
                    },{
                        text: '过去7天',
                        onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                        picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: '过去30天',
                        onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                        picker.$emit('pick', [start, end]);
                        }
                    }]
                }
            }
        },
        created() {
            var clintHeight = document.documentElement.clientHeight;
            this.height = clintHeight - 250;
            bus.$emit('contentTop', true);
            this.queryCashOrderList();
        },
        methods: {
            // 分页导航
            handleCurrentChange(val) {
                this.cur_page = val;
                this.queryCashOrderList();
            },
            handleCurrentChangeConsum(val){
                this.cur_page_con = val;
                this.queryConsumptionOrderList();
            },
            // 2.9.1.查询充值记录
            queryCashOrderList() {
                let data = {
                    currentPage:this.cur_page-1,
                    pageSize:this.pagination.pageSize
                }
                if(this.startDate &&this.endDate ){
                    data.startDate = this.startDate ;
                    data.endDate = this.endDate ;
                }
                if(this.select_word){
                    data.taskName=this.select_word
                }


                // if(this.sortList1){
                //     data.sortList =this.sortList1;
                    
                // }
                data.sortList = [{propertyName: "transferDate", ascendingFlag: true}];

                $.post(this.$baseUrl+'order/queryCashOrderList.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.rechargeRecordTableData = res.returnObject.recordList;
                        this.pagination.total = res.returnObject.totalNumber;
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            handleChangeDate(value){
                if(this.activeName=='recharge_record'){
                    this.startDate = dateSet.format(value[0]);
                    this.endDate = dateSet.format(value[1]);
                    this.cur_page = 1;
                    this.queryCashOrderList();
                }else{
                    this.startDateConsum = dateSet.format(value[0]);
                    this.endDateConsum = dateSet.format(value[1]);
                    this.cur_page_con = 1;
                    this.queryConsumptionOrderList()
                }
            },
            // 2.9.5.查询消费记录
            queryConsumptionOrderList(){
                let data = {
                    currentPage:this.cur_page_con-1,
                    pageSize:this.pagination.pageSize
                }
                if(this.startDateConsum &&this.endDateConsum ){
                    data.startDate = this.startDateConsum ;
                    data.endDate = this.endDateConsum ;
                }
                if(this.select_word){
                    data.taskName=this.select_word
                }
                if(this.sortList2){
                    data.sortList =this.sortList2;
                }
                $.post(this.$baseUrl+'order/queryConsumptionOrderList.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.consumRecordTableData = res.returnObject.recordList;
                        this.pagination.total = res.returnObject.totalNumber;
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            sortChange1(column){
                let flag = true;
                if(column.order=='ascending'){
                    flag = true;
                }else{
                    flag = false;
                }
                this.sortList1 =[{
                    propertyName:column.prop,
                    ascendingFlag:flag
                }]
                this.queryCashOrderList();
            },
            sortChange2(column){
                let flag = true;
                if(column.order=='ascending'){
                    flag = true;
                }else{
                    flag = false;
                }
                this.sortList2 =[{
                    propertyName:column.prop,
                    ascendingFlag:flag
                }]
                this.queryConsumptionOrderList();
            },
            // 搜索
            search(){
                if(!this.select_word){
                    this.$message.error("请输入关键字！");
                    return false;
                }
                this.cur_page=1;
                if(this.activeName=='recharge_record'){
                    this.queryCashOrderList();
                }else{
                    this.queryConsumptionOrderList();
                }
            },
            // tab 切换
            handleClick(val){
                if(this.activeName=='recharge_record'){
                    this.queryCashOrderList();
                }else{
                    this.queryConsumptionOrderList();
                }
            },
            // 提交
            onSubmit() {
                this.$message.success('提交成功！');
            }
        },
        destroyed(){
            bus.$emit('contentTop', false);
        }
    }
</script>
<style scoped lang="less">
    .handle-input {
        width:240px;
        display: inline-block;
    }
</style>