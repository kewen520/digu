<template>
    <div class="speech-tab-pane">
        <!-- <el-breadcrumb separator="/">
            <el-breadcrumb-item>用户中心</el-breadcrumb-item>
            <el-breadcrumb-item>认证管理</el-breadcrumb-item>
            <el-breadcrumb-item>{{cerStatusTxt}}</el-breadcrumb-item>
        </el-breadcrumb> -->
        <el-tabs v-model="cerActiveName" @tab-click="handleTabClick">
            <el-tab-pane label="待处理" name="first"></el-tab-pane>
            <el-tab-pane label="已处理" name="second"></el-tab-pane>
        </el-tabs>
        <div>
            <el-row >
                <el-col :span="2"><el-button @click="onRefresh">刷新</el-button></el-col>
                <el-col :offset="2" :span="20" style="text-align:right;">
                    <el-form :inline="true" :model="searchForm" class="demo-form-inline">
                        <el-form-item label="审核状态" v-show="cerActiveName=='待处理'">
                            <el-select 
                            @change="typeChange"
                            v-model="searchForm.speechcraftStatusList" 
                            placeholder="审核状态">
                            <el-option label="全部" value=""></el-option>
                            <el-option label="待审核" value="2"></el-option>
                            <el-option label="待重审" value="7"></el-option>
                            <el-option label="已驳回" value="6"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="关键词" >
                            <el-input v-model="searchForm.queryKey" placeholder="话术名称"  @keyup.native.13="onSearch"></el-input>
                        </el-form-item>
                        <!-- <el-form-item label="审核状态" v-show="cerActiveName=='second'">
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
                        </el-form-item> -->
                        <!-- <el-form-item label="关键词">
                            <el-input v-model="searchForm.queryKey" placeholder="企业名称／审核人"></el-input>
                        </el-form-item> -->
                        <el-form-item>
                            <el-button type="primary" @click="onSearch">搜索</el-button>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
            <el-table
                :data="certiFicationTableData"
                @sort-change="sortChange"
                style="width: 100%">
                <el-table-column
                    prop="speechcraftName"
                    label="话术名称">
                </el-table-column>
                <el-table-column
                    prop="speechcraftStatus"
                    label="审核状态"
                    :formatter="formatterSpeechcraftStatus"
                    width="180">
                </el-table-column>
                <el-table-column
                    prop="latestApproveEndTime"
                    label="截止时间"
                    sortable
                    v-show="cerActiveName=='first'"
                    width="180">
                    <template slot-scope="scope">
                        <span :class="scope.row.timeOverType==2?'warning':scope.row.timeOverType==3?'danger':'default'">
                            {{scope.row.latestApproveEndTime}}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column
                    v-show="cerActiveName=='second'"
                    prop="latestApproveTime"
                    label="审核时间"
                    sortable
                    width="180">
                    
                </el-table-column>
                <el-table-column
                    width="180"
                    label="操作">
                    <template slot-scope="scope">
                        <span>
                            <el-button type="text" v-if="scope.row.speechcraftStatus==2" @click="handleView(scope.$index, scope.row)">审核</el-button>
                            <el-button type="text" v-else-if="scope.row.speechcraftStatus==7" @click="handleView(scope.$index, scope.row)">重审</el-button>
                            <el-button type="text" v-else @click="handleView(scope.$index, scope.row)">查看</el-button>
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
    import bus from '@/components/common/bus';
    import dateSet from '@/components/common/date';
    import common from '@/components/common/common';
    export default {
        name: 'dashboard',
        data() {
            return {
                cerActiveName:'first',
                // cerStatusTxt:'待处理',
                searchForm:{
                    speechcraftStatusList:'',
                    queryKey:'',
                },
                speechcraftStatusList:['2','4','6','7'],
                certiFicationTableData: [],
                // certiFicationTableDataed:[],
                sortList:[],
                cur_page:1,
                pagination: {
                    show: true,
                    total: 0,
                    pageIndex: 1,
                    pageSize:20
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
            this.querySpeechcraftList();
        },
        watch: {
            
        },
        methods: {
            handleTabClick(type){
                if(this.cerActiveName=='first'){
                    // this.cerStatusTxt = '待处理';
                    this.speechcraftStatusList=['2','4','6','7'];
                }else{
                    // this.cerStatusTxt = '已处理';
                    this.speechcraftStatusList=['5'];
                }
                this.sortList= [];
                this.querySpeechcraftList();
            },
            onSearch(){
                this.querySpeechcraftList();
            },
            onRefresh(){
                this.searchForm.speechcraftStatusList='';
                this.searchForm.queryKey='';
                this.dateValue='';
                this.sortList= [];
                if(this.cerActiveName=='first'){
                    this.speechcraftStatusList=['2','4','6','7'];
                }else{
                    this.speechcraftStatusList=['5'];
                }
                this.querySpeechcraftList();
            },
            typeChange(val){
                // let arry=[];
                // arry.push(val);
                // this.speechcraftStatusList=arry;
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
                this.querySpeechcraftList();
            },
            // 查询话术列表
            querySpeechcraftList(){
                let self=this;
                let data = {
                    templateType:'2',
                    speechcraftStatusList:this.speechcraftStatusList,
                    currentPage:this.cur_page-1,
                    pageSize:this.pagination.pageSize
                }
                if(this.searchForm.queryKey){
                    data.queryKey = this.searchForm.queryKey;
                }
                if(this.searchForm.speechcraftStatusList){
                    let arry=[];
                    arry[0] = this.searchForm.speechcraftStatusList;
                    // arry.push(this.searchForm.speechcraftStatusList);
                    data.speechcraftStatusList = arry;
                }
                if(this.sortList.length){
                    data.sortList =this.sortList;
                }
                $.post(this.$baseUrl+'services/speechcraft/querySpeechcraftList.json',JSON.stringify(data)).then((res)=>{

                    if(res.resultMessageEnum=='0000'){

                        let recordList = res.returnObject.recordList||[];

                        this.certiFicationTableData = recordList;

                        this.pagination.total = res.returnObject.totalNumber;

                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            // 分页导航
            handleCurrentChange(val) {
                this.cur_page = val;
                this.querySpeechcraftList();
            },
            //状态    
            formatterSpeechcraftStatus(row, column){
                return common.formatterSpeechcraftStatus(row.speechcraftStatus);
            },
            handleView(index,row){
                let query = `?phase=1`;

                if(this.cerActiveName=='second'){
                    query = `?phase=2`;
                }
                let url = `/speech/${row.speechcraftId}${query}`;

                this.$router.push(url);
            }
        },
        destroyed(){
           
        }
    }

</script>


<style scoped lang="less">
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
