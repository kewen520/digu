<template>
    <div class="container-admin">
        <div class="admin-page">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>用户中心</el-breadcrumb-item>
                <el-breadcrumb-item>认证管理</el-breadcrumb-item>
                <el-breadcrumb-item>{{cerStatusTxt}}</el-breadcrumb-item>
            </el-breadcrumb>
            <el-tabs v-model="cerActiveName" @tab-click="handleTabClick">
                <el-tab-pane label="待处理" name="first"></el-tab-pane>
                <el-tab-pane label="已处理" name="second"></el-tab-pane>
            </el-tabs>
        </div>
        <!-- <div class="container-right-top">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>用户中心</el-breadcrumb-item>
                <el-breadcrumb-item>认证管理</el-breadcrumb-item>
                <el-breadcrumb-item>{{cerStatusTxt}}</el-breadcrumb-item>
            </el-breadcrumb>
            <el-tabs v-model="cerActiveName" @tab-click="handleTabClick">
                <el-tab-pane label="待处理" name="first"></el-tab-pane>
                <el-tab-pane label="已处理" name="second"></el-tab-pane>
            </el-tabs>
        </div> -->
        
        <div class="admin-body">
            <el-row >
                <el-col :span="2"><el-button @click="onRefresh">刷新</el-button></el-col>
                <el-col :offset="2" :span="20" style="text-align:right;">
                    <el-form :inline="true" :model="searchForm" class="demo-form-inline">
                        <el-form-item label="审核状态" v-show="cerActiveName=='first'">
                            <el-select 
                            @change="typeChange"
                            v-model="searchForm.authenticationPhaseList" 
                            placeholder="审核状态">
                            <el-option label="全部" value=""></el-option>
                            <!-- <el-option label="待认证" value="0"></el-option> -->
                            <el-option label="待审核" value="1"></el-option>
                            <el-option label="待重申" value="5"></el-option>
                            <!-- <el-option label="审核中" value="2"></el-option> -->
                            <!-- <el-option label="审核通过" value="3"></el-option> -->
                            <el-option label="已驳回" value="4"></el-option>
                            
                            </el-select>
                        </el-form-item>
                        <el-form-item label="关键词" v-show="cerActiveName=='first'">
                            <el-input v-model="searchForm.queryKey" placeholder="企业名称"></el-input>
                        </el-form-item>
                        <el-form-item label="审核时间" v-show="cerActiveName=='second'">
                            <el-date-picker
                                v-model="dateValue"
                                format="yyyy-MM-dd"
                                @change="handleChangeDate"
                                type="daterange"
                                align="right"
                                unlink-panels
                                range-separator="至"
                                start-placeholder="开始日期"
                                end-placeholder="结束日期"
                                :picker-options="pickerOptions">
                            </el-date-picker>
                        </el-form-item>
                        <el-form-item label="关键词" v-show="cerActiveName=='second'">
                            <el-input v-model="searchForm.queryKey" placeholder="企业名称／审核人"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="onSearch">搜索</el-button>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
            <el-table
            v-show="cerActiveName=='first'"
            :data="certiFicationTableData"
            @sort-change="sortChange"
            style="width: 100%">
                <el-table-column
                    prop="enterpriseName"
                    label="企业名称">
                </el-table-column>
                <el-table-column
                    prop="authenticationPhase"
                    label="审核状态"
                    :formatter="formatterPhase"
                    width="180">
                </el-table-column>
                <el-table-column
                    prop="latestApproveEndTime"
                    label="截止时间"
                    sortable
                    width="180">
                    <template slot-scope="scope">
                        <span :class="scope.row.timeOverType==2?'warning':scope.row.timeOverType==3?'danger':'default'">
                            {{scope.row.latestApproveEndTime}}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column
                    width="180"
                    label="操作">
                    <template slot-scope="scope">
                        <span>
                            <el-button type="text" v-if="scope.row.authenticationPhase==1" @click="handleView(scope.$index, scope.row)">审核</el-button>
                            <el-button type="text" v-else-if="scope.row.authenticationPhase==5" @click="handleView(scope.$index, scope.row)">重审</el-button>
                            <el-button type="text" v-else @click="handleView(scope.$index, scope.row)">查看</el-button>
                        </span>
                    </template>
                </el-table-column>
            </el-table>
            <el-table
            v-show="cerActiveName=='second'"
            :data="certiFicationTableDataed"
            @sort-change="sortChange"
            style="width: 100%">
                <el-table-column
                    prop="enterpriseName"
                    label="企业名称">
                </el-table-column>
                <el-table-column
                    prop="latestApproveTime"
                    label="审核时间"
                    sortable
                    width="180">
                </el-table-column>
                <el-table-column
                    prop="latestApproveManagerName"
                    label="审核人"
                    width="180">
                </el-table-column>
                <el-table-column
                    width="180"
                    label="操作">
                    <template slot-scope="scope">
                        <span>
                            <el-button type="text" @click="handleView(scope.$index, scope.row)">查看</el-button>
                        </span>
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
        </div>
    </div>
</template>

<script>
    import bus from '../../common/bus';
    import dateSet from '../../common/date';
    import common from '../../common/common';
    export default {
        name: 'dashboard',
        data() {
            return {
                cerActiveName:'first',
                cerStatusTxt:'待处理',
                collapse: false,
                dateValue:'',
                searchForm:{
                    authenticationPhaseList:'',
                    queryKey:'',
                    approveStartTime:'',
                    approveEndTime:''
                },
                authenticationPhaseList:[1,2],
                certiFicationTableData: [],
                certiFicationTableDataed:[],
                sortList:[],
                cur_page:1,
                pagination: {
                    show: true,
                    total: 0,
                    pageIndex: 1,
                    pageSize:20
                },
                pickerOptions: {
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

        computed: {
            
        },
        created(){
            //  是否显示tab
            bus.$on('collapse', msg => {
                this.collapse = msg;
            });
            this.queryMemberList();
        },
        watch: {
            
        },
        methods: {
            handleTabClick(type){
                if(this.cerActiveName=='first'){
                    this.cerStatusTxt = '待处理';
                    this.authenticationPhaseList=['1','2','4','5'];
                }else{
                    this.cerStatusTxt = '已处理';
                    this.authenticationPhaseList=['3'];
                }
                this.sortList= [];
                this.queryMemberList();
            },
            onSearch(){
                this.queryMemberList();
            },
            onRefresh(){
                this.searchForm.authenticationPhaseList='';
                this.searchForm.queryKey='';
                this.searchForm.approveStartTime='';
                this.searchForm.approveEndTime='';
                this.dateValue='';
                this.sortList= [];
                if(this.cerActiveName=='first'){
                    this.authenticationPhaseList=['1','2','4','5'];
                }else{
                    this.authenticationPhaseList=['3'];
                }
                this.queryMemberList();
            },
            typeChange(val){
                // let arry=[];
                // arry.push(val);
                // this.authenticationPhaseList=arry;
            },
            handleChangeDate(value){
                this.searchForm.approveStartTime = dateSet.format(value[0]);
                this.searchForm.approveEndTime = dateSet.format(value[1]);
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
                this.queryMemberList();
            },
            queryMemberList(){
                let self=this;
                let data = {
                    authenticationPhaseList:this.authenticationPhaseList,
                    currentPage:this.cur_page-1,
                    pageSize:this.pagination.pageSize
                }
                if(this.searchForm.queryKey){
                    data.queryKey = this.searchForm.queryKey;
                }
                if(this.searchForm.authenticationPhaseList && this.cerActiveName=='first'){
                    let arry=[];
                    arry.push(this.searchForm.authenticationPhaseList );
                    data.authenticationPhaseList=arry
                }
                if(this.dateValue && this.cerActiveName=='second'){
                    data.approveStartTime =this.searchForm.approveStartTime ;
                    data.approveEndTime =this.searchForm.approveEndTime ;
                }
                if(this.sortList.length && this.sortList[0].propertyName){
                    data.sortList =this.sortList;
                }
                $.post(this.$baseUrl+'services/member/queryMemberList.json',JSON.stringify(data)).then((res)=>{

                    if(res.resultMessageEnum=='0000'){
                        let recordList = res.returnObject.recordList;
                        if(this.cerActiveName=='first'){
                            this.certiFicationTableData = recordList;
                        }else{
                            this.certiFicationTableDataed = recordList;
                        }
                        this.pagination.total = res.returnObject.totalNumber;
                    }else{
                        self.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            // 分页导航
            handleCurrentChange(val) {
                this.cur_page = val;
                this.queryMemberList();
            },
            //状态    
            formatterPhase(row, column){
                return common.formatterPhase(row.authenticationPhase);
            },
            handleView(index,row){
                let url = `/auth/${row.memberId}`
                switch(row.authenticationPhase){
                    case 1:
                    url = `/auth/${row.memberId}?phase=1`
                    break;
                    case 5:
                    url = `/auth/${row.memberId}?phase=5`
                    break;
                }
                this.$router.push(url);
            }
            // 审核
            // 查看
            // 重审
        },
        destroyed(){
           
        }
    }

</script>


<style  lang="less">
    .danger{
        color: #f56c6c;
    }
    .warning{
        color: #e6a23c;
    }
    .default{
        // color: #606266;
    }
</style>
