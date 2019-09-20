<template>
    <div class="container-admin">
        <div class="admin-page">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>管理中心</el-breadcrumb-item>
                <el-breadcrumb-item>行业管理</el-breadcrumb-item>
                <el-breadcrumb-item>{{industryStatusTxt}}</el-breadcrumb-item>
            </el-breadcrumb>
            <el-tabs v-model="industryActiveName" @tab-click="handleTabClick">
                <el-tab-pane label="已上线" name="first"></el-tab-pane>
                <el-tab-pane label="已下线" name="second"></el-tab-pane>
            </el-tabs>
        </div>
        
        <div class="admin-body">
            <el-form :inline="true" class="demo-form-inline">
                <el-form-item label="关键词:" >
                    <el-input v-model="queryKey" @change="searchChange" placeholder="企业名称" @keyup.native.13="onSearch"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="onSearch">搜索</el-button>
                </el-form-item>
            </el-form>
            <el-row class="industry-btn-box" >
                <div v-show="industryActiveName=='second'">
                    <el-button type="primary" @click="addIndustryVisible=true">新增</el-button>
                    <el-button type="primary" :disabled="delDisabled" @click="delIndustryVisible=true">删除</el-button>
                </div>
            </el-row>
            <el-table
                v-show="industryActiveName=='first'"
                highlight-current-row
                v-loading="tableLoading"
                :data="industryTableData"
                @sort-change="sortChange"
                @selection-change="handleSelectionChange"
                style="width: 100%">
                <el-table-column
                    prop="industryName"
                    label="行业名称">
                    <template slot-scope="scope">
                        <span v-show="!scope.row.isEdit">{{scope.row.industryName}}</span>
                        <el-input v-model="scope.row.industryName" v-show="industryActiveName=='second'&&scope.row.isEdit"></el-input>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="industryStatus"
                    label="行业状态"
                    width="180">
                    <template slot-scope="scope">
                        <span :class="{'status-2':scope.row.industryStatus==2,'status-3':scope.row.industryStatus==3}">
                            {{scope.row.industryStatus==2?'使用中':scope.row.industryStatus==3?'停用':''}}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="latestPublishDate"
                    label="上线时间"
                    sortable
                    width="180">
                </el-table-column>
                <el-table-column
                    prop="creator"
                    label="操作人"
                    width="180">
                </el-table-column>
                <el-table-column
                    width="180"
                    label="操作">
                    <template slot-scope="scope">
                        <el-button type="text" @click="handleOffline(scope.row)">下线</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-table
                v-show="industryActiveName=='second'"
                highlight-current-row
                v-loading="tableLoading"
                :data="industryTableData"
                @sort-change="sortChange"
                @selection-change="handleSelectionChange"
                style="width: 100%">
                <el-table-column 
                    :selectable="selectable"
                    type="selection" 
                    width="55" 
                    align="center">
                </el-table-column>
                <el-table-column
                    prop="industryName"
                    label="行业名称">
                    <template slot-scope="scope">
                        <span v-show="!scope.row.isEdit">{{scope.row.industryName}}</span>
                        <el-input v-model="scope.row.industryName" v-show="industryActiveName=='second'&&scope.row.isEdit"></el-input>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="latestOfflineDate"
                    label="下线时间"
                    sortable
                    width="180">
                </el-table-column>
                <el-table-column
                    prop="creator"
                    label="操作人"
                    width="180">
                </el-table-column>
                <el-table-column
                    width="180"
                    label="操作">
                    <template slot-scope="scope">
                        <div class="">
                            <div>
                                <span v-if="scope.row.isEdit">
                                    <el-button type="text" class="warning" @click="handleEditCancel(scope.$index,scope.row)">取消</el-button> ｜
                                    <el-button type="text" @click="modifyIndustry(scope.$index,scope.row)">确定</el-button>
                                </span>
                                <span v-show="!scope.row.isEdit">
                                    <el-button type="text" @click="handleEditName(scope.$index,scope.row)">修改名称</el-button> ｜
                                    <el-button type="text" @click="handleOnline(scope.$index,scope.row)">上线</el-button>
                                </span>
                            </div>
                        </div>
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
        <!-- 下线确认 -->
        <el-dialog title="下线行业" :visible.sync="offlineVisible" width="400px">
            <div v-if="notFinishNum>0">
                该行业下有{{notFinishNum}}个任务正在执行中，点击“确认”后，该行业将进入“停用”状态，该状态下任务将正常进行，但该行业相关话术不可再用
            </div>
            <div v-else>您确定要下线“{{currentRow.industryName}}”行业吗？下线后该行业将对前台用户不可见、不可操作</div>
            
            <span slot="footer" class="dialog-footer">
                <el-button @click="offlineVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleOfflineEnter">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 上线 -->
        <el-dialog title="上线行业" class="addQuestion" :visible.sync="onlineVisible" width="400px">
            <div>您确定要上线“{{currentRow.industryName}}”行业吗？</div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="onlineVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleOnlineEnter">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 增加 -->
        <el-dialog title="新增行业" class=""  :visible.sync="addIndustryVisible" width="600px">
            <el-form ref="addIndustryForm" :model="addIndustryForm" label-width="114px" :rules="addIndustryFormRules">
                <el-form-item label="行业名称：" prop="industryName">
                    <el-input v-model="addIndustryForm.industryName" placeholder="输入行业名称"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addIndustryVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleAddIndustry">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 修改 -->
        <el-dialog title="批量删除行业" class="addQuestion" :visible.sync="delIndustryVisible" width="400px">
            <div>
                您确定要删除已选中的{{this.multipleSelection.length}}个行业吗？
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="delIndustryVisible = false">取 消</el-button>
                <el-button type="primary" @click="removeIndustry">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>

    export default {
        name: 'dashboard',
        data() {
            return {
                industryActiveName:"first",
                industryStatusTxt:"已上线",
                tableLoading: true,
                queryKey:'',
                industryTableData:[],
                cur_page:1,
                offlineVisible:false,
                onlineVisible:false,
                addIndustryVisible:false,
                delDisabled:true,
                delIndustryVisible:false,
                multipleSelection:[],
                currentRow:{},
                addIndustryForm:{},
                addIndustryFormRules:{
                    industryName:[
                        { required: true, message: '输入行业名称'},
                    ],
                },
                pagination: {
                    show: true,
                    total: 0,
                    pageIndex: 1,
                    pageSize:20
                },
                notFinishNum:0
            }
        },
        components: {
            
        },
        computed: {
            
        },
        created(){
            this.queryIndustryList();
        },
        watch: {
            
        },
        methods: {
            onSearch(){
                this.queryIndustryList();
            },
            handleCurrentChange(){
                this.cur_page = val;
                this.queryIndustryList();
            },
            searchChange(val){
                if(!val){
                    this.queryIndustryList();
                }
            },
            handleEditName(index,row){

                this.$set(this.industryTableData[index],'isEdit',true);
                this.industryTableData[index].oldIndustryName = row.industryName;
            },
            // handleEditEnter(index,row){

            // },
            handleEditCancel(index,row){

                this.$set(this.industryTableData[index],'isEdit',false);
                if(row.industryName!=row.oldIndustryName){
                    row.industryName = row.oldIndustryName
                }

            },
            handleAddIndustry(){
                this.$refs['addIndustryForm'].validate((valid) => {
                    if (valid) {
                        this.addIndustry().then(()=>{
                            this.addIndustryVisible = false;
                            this.queryIndustryList();
                        })
                    }
                });
            },
            handleSelectionChange(val){
                this.multipleSelection=[];
                this.multipleSelection = val;
                if(this.multipleSelection.length){
                    this.delDisabled = false;
                }else{
                    this.delDisabled = true;
                }
            },
            sortChange(column){
                let flag = true;
                if(column.prop){
                    if(column.order=='ascending'){
                        flag = true;
                    }else{
                        flag = false;
                    }
                    this.sortList =[{
                        propertyName:column.prop,
                        ascendingFlag:flag
                    }];
                    
                }else{
                    this.sortList= '';
                }
                this.queryIndustryList();
            },
            handleTabClick(){
                this.cur_page = 1;
                this.queryIndustryList();
            },
            handleOffline(row){
                this.currentRow = row;
                this.offlineVisible = true;
                this.countNotFinishTaskByIndustry().then((res)=>{
                    this.notFinishNum = res;
                });
            },
            handleOfflineEnter(){
                this.modifyIndustryStatus('1').then(()=>{
                    this.offlineVisible = false;
                    this.$message.success(`“${this.currentRow.industryName}”行业下线成功！`);
                    this.queryIndustryList();
                }) 
            },
            handleOnline(index,row){
                this.currentRow = row;
                this.onlineVisible = true;
            },
            handleOnlineEnter(){
                this.modifyIndustryStatus('2').then(()=>{
                    this.onlineVisible = false;
                    this.$message.success(`“${this.currentRow.industryName}”行业上线成功！`);
                    this.queryIndustryList();
                })
            },
            selectable(row, index){
                if(row.latestOfflineDate=='-'){
                    return true;
                }else{
                    return false;
                }
            },
            //查询行业列表
            queryIndustryList(){
                this.tableLoading = true;
                let params = {
                    currentPage:this.cur_page-1,
                    pageSize:this.pagination.pageSize
                };
                params.industryStatusList = this.industryActiveName=='first'?['2','3']:['0','1'];

                let queryKey = this.queryKey;
                if(queryKey){
                    params.queryKey=queryKey;
                }
                if(this.sortList){
                    params.sortList = this.sortList;
                }
                $.post(this.$baseUrl+'services/intention/queryIndustryList.json',JSON.stringify(params)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.pagination.total = res.returnObject.totalNumber;
                        this.industryTableData = res.returnObject.recordList;
                        this.industryTableData.filter((item)=>{
                            if(!item.latestOfflineDate){
                                item.latestOfflineDate = '-';
                            }
                        })
                        
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                    this.tableLoading = false;
                });
            },
            //调整行业状态
            modifyIndustryStatus(status){
                let params = {
                    id:this.currentRow.id,
                    industryStatus:status
                }
                return new Promise((resolve,reject)=>{
                    $.post(this.$baseUrl+'services/intention/modifyIndustryStatus.json',JSON.stringify(params)).then((res)=>{
                        if(res.resultMessageEnum=='0000'){
                            resolve(res);
                            
                        }else{
                            this.$message.error(res.errorInfoList[0].errorMessage);
                        }
                    });
                })
            },
            //新增行业
            addIndustry(){
                let params = {
                    industryName:this.addIndustryForm.industryName
                }
                return new Promise((resolve,reject)=>{
                    $.post(this.$baseUrl+'services/intention/addIndustry.json',JSON.stringify(params)).then((res)=>{
                        if(res.resultMessageEnum=='0000'){
                            resolve(res);
                        }else{
                            this.$message.error(res.errorInfoList[0].errorMessage);
                        }
                    });
                })
            },
            //删除行业
            removeIndustry(){
                
                let ids = this.multipleSelection.map((item)=>{
                    return item.id;
                })
                let params = ids
                $.post(this.$baseUrl+'services/intention/removeIndustry.json',JSON.stringify(ids)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.delIndustryVisible = false;
                        this.$message.success(`删除成功！`);
                        this.queryIndustryList();
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            //修改行业
            modifyIndustry(index,row){
                let params = {
                    id:row.id,
                    industryName:row.industryName
                }
                $.post(this.$baseUrl+'services/intention/modifyIndustry.json',JSON.stringify(params)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.$message.success(`修改成功！`);
                        row.isEdit = false;
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            //根据行业Id计算未完成任务数
            countNotFinishTaskByIndustry(){
                
                let params = {
                    industryId:this.currentRow.id
                }
                return new Promise((resolve,reject)=>{
                    $.get(this.$baseUrl+'services/intention/countNotFinishTaskByIndustry.json',$.param(params)).then((res)=>{
                        if(res.resultMessageEnum=='0000'){
                            resolve(res.returnObject);
                        }else{
                            this.$message.error(res.errorInfoList[0].errorMessage);
                        }
                    });
                })
            }
        },
        watch:{
            addIndustryVisible(val){
                if(!val){
                    this.$refs['addIndustryForm'].resetFields();
                }
            }
        }
    }

</script>


<style scoped lang="less">
.industry-btn-box{
    height:62px;
    padding:10px 0 20px;
}
.industry-table-btn{
    .el-button+.el-button{
        margin-left: 0;
    }
}
</style>
