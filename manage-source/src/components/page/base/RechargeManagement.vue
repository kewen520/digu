<template>
    <div class="">
        <div class="recharg-panel">
            <!-- <p class="title">{{enterpriseName}}<span></span></p> -->
            <p class="title" >
                <span v-show="!results.enterpriseName && !results.remarkName">未知</span>
                <span v-show="results.remarkName">{{results.remarkName}}</span>
                <span class="sub" >（{{results.enterpriseName?results.enterpriseName:'未知'}}）</span>
            </p>

            <el-row :gutter="20">
                <el-col :span="5">
                    <p class="row-tit">当前余额：</p>
                    <p><span class="num">{{byMember.changeMoney}}</span>/{{byMember.totalChangeMoney}}<span  class="yuan">元</span></p>
                </el-col>
                <el-col :span="5">
                    <p class="row-tit">累计充值：</p>
                    <p><span class="num">{{byMember.totalRechargeMoney}}</span><span  class="yuan">元</span></p>
                </el-col>
                <el-col :span="5">
                    <p class="row-tit">累计打款：</p>
                    <p><span class="num">{{byMember.totalManualMoney}}</span><span  class="yuan">元</span></p>
                </el-col>
            </el-row>
        </div>
        <div class="recharg-panel-two">
            <div class="recharg-search-box" >
                <el-form :inline="true" ref="searchForm" :model="rechargSearchForm" class="demo-form-inline">
                    <el-form-item label="充值方式" v-show="activeName=='first'">
                        <el-select v-model="rechargSearchForm.paymentType" placeholder="全部" @change="changeValue">
                            <el-option label="全部" value="all"></el-option>
                            <el-option label="微信" value="1"></el-option>
                            <el-option label="支付宝" value="2"></el-option>
                            <el-option label="银联" value="3"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item v-show="activeName=='first'|| activeName=='third'">
                        <el-date-picker
                            v-model="rechargSearchForm.date"
                            type="datetimerange"
                            @change="handleChangeDate"
                            :picker-options="pickerOptions2"
                            range-separator="-"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"
                            align="right">
                        </el-date-picker>
                    </el-form-item>
                </el-form>
            </div>
            <el-tabs v-model="activeName" @tab-click="rechargHandleClick">
                <el-tab-pane label="充值记录" name="first">
                    <el-table
                        :data="recordTableData"
                        @sort-change="sortChange"
                        stripe
                        style="width: 100%">
                        <el-table-column
                        prop="orderNo"
                        label="订单号"
                        width="180">
                        </el-table-column>
                        <el-table-column
                        sortable
                        prop="transferDate"
                        label="充值时间"
                        width="180">
                        </el-table-column>
                        <el-table-column
                        prop="paymentType"
                        :formatter="paymentTypeEnum"
                        label="充值方式">
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
                        prop="creator"
                        label="充值人">
                        </el-table-column>
                        <el-table-column
                        prop="orderStatus"
                        :formatter="orderStatus"
                        label="状态">
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <el-tab-pane label="手动打款" name="second">
                    <div class="manual-box">
                        <el-form ref="manualForm" :rules="manualFormRules" :model="manualForm" label-width="120px">
                            <el-form-item label="打款金额：" prop="transferMoney">
                                <el-input v-model.number="manualForm.transferMoney" placeholder="打款金额"></el-input>
                            </el-form-item>
                            <el-form-item label="费用说明：" prop="moneyDescription">
                                <el-input type="textarea" v-model="manualForm.moneyDescription" placeholder="费用说明"></el-input>
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary" @click="onSubmitManual">充值</el-button>
                            </el-form-item>
                        </el-form>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="打款记录" name="third">
                    <el-table
                        :data="recordTableData"
                        @sort-change="sortChange"
                        stripe
                        style="width: 100%">
                        <el-table-column
                        sortable
                        prop="transferDate"
                        label="打款时间"
                        width="450">
                        </el-table-column>
                        <el-table-column
                        prop="transferMoney"
                        label="打款金额"
                        width="180">
                        </el-table-column>
                        <el-table-column
                        prop="creator"
                        label="打款人">
                        </el-table-column>
                        <el-table-column
                        prop="moneyDescription"
                        label="费用说明">
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
            <div class="pagination" >
                <el-pagination background @current-change="handleCurrentChange" 
                    layout="total, prev, pager, next,jumper"
                    :total="pagination.total"
                    :page-size="pagination.pageSize"
                    >
                </el-pagination>
            </div>
        </div>
        <!-- 打款确认 -->
        <el-dialog title="确认打款信息" :visible.sync="paymentVisible" width="600px" center>
            <div class="overrule-dialog-cnt payment-dialog">
                <p class="tit">请确认您仔细核对打款信息</p>
                <el-form label-width="100px">
                    <el-form-item label="打款对象：">
                        云知声<span class="tip">（云知声（上海）智能科技有限公司）</span>
                    </el-form-item>
                    <el-form-item label="打款金额：">
                        {{manualForm.transferMoney}}元
                    </el-form-item>
                    <el-form-item label="费用说明：">
                        免费适用转付费
                    </el-form-item>
                </el-form>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="paymentVisible = false">取 消</el-button>
                <el-button type="primary" @click="paymentManualCashOrder">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import common from '../../common/common';
import dateSet from '../../common/date';
import bus from '../../common/bus';
export default {
    data() {
        return{
            activeName:'first',
            cur_page:1,
            paymentVisible:false,
            paymenttType:[1,2,3],
            enterpriseName:"",
            results:{},
            byMember:{
                changeMoney:0,
                totalChangeMoney:0,
                totalRechargeMoney:0,
                totalManualMoney:0
            },
            pagination: {
                show: true,
                total: 0,
                pageIndex: 1,
                pageSize:20
            },
            recordTableData:[{

            }],
            sortList:[],
            // 手动打款
            manualForm:{

            },
            manualFormRules:{
                transferMoney:[
                    { required: true, message: '充值金额不能为空！', trigger: 'blur' },
                    {validator:function(rule,value,callback){
                        if(/^[0-9]+(.[0-9]{1,3})?$/.test(value) == false || value<=0){
                            callback(new Error("输入数字有误！"));
                        }else{
                            callback();
                        }
                    }, trigger: 'change'}
                ],
                moneyDescription:[
                    { required: true, message: '费用说明不能为空！', trigger: 'blur' },
                ],
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
            rechargSearchForm:{
                paymentType:[],
                paymentTypeList:[],
                date:'',
                startTime:'',
                endTime:''
            }
        }
    },
    props:['tabActive','refresh','datas'],
    mounted(){
        
    },
    methods: {
        handleCurrentChange(val) {
            this.cur_page = val;
            this.queryCashOrderList();
        },
        PaymentHandleCurrentChange(){

        },
        rechargHandleClick(type){
            this.cur_page = 1;
            this.$refs['searchForm'].resetFields();
            this.rechargSearchForm.date='';
            this.rechargSearchForm.startTime ='';
            this.rechargSearchForm.endTime ='';
            switch(type.name){
                case 'first':
                this.paymenttType=[1,2,3];
                this.queryCashOrderList();
                break;

                case 'third':
                this.paymenttType=[4];
                this.queryCashOrderList();
                break;
            }
        },
        paymentTypeEnum(row, column){
            return common.paymentTypeEnum(row.paymentType);
        },
        orderStatus(row, column){
            return common.orderStatus(row.orderStatus);
        },
        changeValue(vId){
            // let obj = {};
            // obj = this.creatOptions.find((item)=>{
            //     return item.id === vId;
            // });
            let list = [];
            if(vId=='all'){
                list = '';
            }else{
                list[0]=vId;
            }
            this.rechargSearchForm.paymentTypeList=list;
            this.queryCashOrderList();
        },
        handleChangeDate(value){
            this.rechargSearchForm.startTime = dateSet.format(value[0]);
            this.rechargSearchForm.endTime = dateSet.format(value[1]);
            this.cur_page = 1;
            this.queryCashOrderList();
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
            this.queryCashOrderList();
        },
        // 2.4.5.通汇会员Id查询钱包详情
        queryWalletDetailByMemberId(){
            let data = {
                memberId:this.$route.params.id
            }
            $.get(this.$baseUrl+'services/member/queryWalletDetailByMemberId.json?'+$.param(data)).then((res)=>{
                if(res.resultMessageEnum=='0000'){
                    if(res.returnObject && Object.keys(res.returnObject).length){
                        this.byMember= $.extend({},this.byMember,res.returnObject);
                    }
                }else{
                    this.$message.error(res.errorInfoList[0].errorMessage);
                }
            });
        },
        // 2.5.1.查询会员充值记录列表
        queryCashOrderList(){
            let data = {
                memberId:this.$route.params.id,
                currentPage:this.cur_page-1,
                pageSize:this.pagination.pageSize
            }

            if(this.paymenttType){
                data.paymentTypeList=this.paymenttType;
            }

            if(this.rechargSearchForm.paymentTypeList.length){
                data.paymentTypeList=this.rechargSearchForm.paymentTypeList;
            }
            if(this.rechargSearchForm.startTime && this.rechargSearchForm.endTime){
                data.startTime=this.rechargSearchForm.startTime;
                data.endTime=this.rechargSearchForm.endTime;
            }
            
            if(this.sortList.length){
                data.sortList =this.sortList;
            }
            $.post(this.$baseUrl+'services/order/queryCashOrderList.json',JSON.stringify(data)).then((res)=>{
                if(res.resultMessageEnum=='0000'){
                    this.recordTableData = res.returnObject.recordList;
                    this.pagination.total = res.returnObject.totalNumber;
                }else{
                    this.$message.error(res.errorInfoList[0].errorMessage);
                }
            });
        },
        onSubmitManual(){
            this.$refs['manualForm'].validate((valid) => {
                if(valid){
                    this.paymentVisible = true;
                }
            });
        },
        // 2.5.2.手动打款
        paymentManualCashOrder(){
            let data = {
                memberId:this.$route.params.id,
                transferMoney:this.manualForm.transferMoney,
                moneyDescription:this.manualForm.moneyDescription
            }
            $.post(this.$baseUrl+'services/order/paymentManualCashOrder.json',JSON.stringify(data)).then((res)=>{
                if(res.resultMessageEnum=='0000'){
                    this.paymentVisible=false;
                    this.$message.success('操作成功！');
                }else{
                    this.$message.error(res.errorInfoList[0].errorMessage);
                }
            });
        }
    },
    watch:{
       tabActive(opt){
           if(opt=='second'){
               this.enterpriseName = localStorage.getItem('GLOBAL_enterpriseName');
               this.queryCashOrderList();
               this.queryWalletDetailByMemberId();
           }
       },
       refresh(opt){
           if(opt){
                this.$refs['searchForm'].resetFields();
                this.rechargSearchForm.paymentType='';
                this.rechargSearchForm.paymentTypeList='';
                this.rechargSearchForm.date='';
                this.rechargSearchForm.startTime='';
                this.rechargSearchForm.endTime='';
                this.queryCashOrderList();
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
.manual-box{
    background: #fff;
    padding:40px 40px;
    .el-form{
        width:400px;
    }
}
.payment-dialog {
    .tit{
        color: #ea6169;
        padding:20px 0 20px 17px;
    }
    .tip{
        color: #abafb4;
    }
    .el-form-item--mini.el-form-item, .el-form-item--small.el-form-item{
        margin-bottom:0px;
    }
}
.recharg-panel-two{
    position: relative;
    .recharg-search-box{
        position:absolute;
        top:5px;
        right: 0;
        z-index: 2;
    }
}

</style>
