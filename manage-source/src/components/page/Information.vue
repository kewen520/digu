<template>
    <div class="container-admin">
        <div class="admin-page">
            <el-tabs v-model="infoActiveName" @tab-click="handleTabClick">
                <el-tab-pane label="用户列表" name="first"></el-tab-pane>
                <el-tab-pane label="黑名单" name="second"></el-tab-pane>
            </el-tabs>
        </div>
        <div class="admin-body">
            <el-row class="search-box">
                <el-form :inline="true" ref="searchForm" :model="searchForm" class="demo-form-inline">
                    <el-form-item class="refresh-btn">
                        <el-button @click="onRefresh">刷新</el-button>
                    </el-form-item>
                    <el-form-item label="付费" >
                        <el-select 
                            @change="typeChange"
                            v-model="searchForm.freeFlag" 
                            placeholder="全部">
                            <el-option label="全部" value=""></el-option>
                            <el-option label="付费" value="false"></el-option>
                            <el-option label="免费" value="true"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="认证" >
                        <el-select 
                            @change="typeChange"
                            v-model="searchForm.authenticationFlag" 
                            placeholder="所有">
                            <el-option label="所有" value=""></el-option>
                            <el-option label="已认证" value="true"></el-option>
                            <el-option label="未认证" value="false"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="关键词">
                        <el-input v-model="searchForm.queryKey" placeholder="企业名称／注册手机号" @keyup.native.13="onSearch"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="onSearch">搜索</el-button>
                    </el-form-item>
                    <el-form-item class="black－btn">
                        <el-button @click="blackVisible=true" v-if="infoActiveName=='first'">加入黑名单</el-button>
                        <el-button type="primary" @click="moveVisible=true" v-else>移出黑名单</el-button>
                    </el-form-item>
                </el-form>
            </el-row>
            <div class="information-data-box">
                <el-table
                    ref="multipleTable"
                    :data="tableData"
                    style="width: 100%"
                    @selection-change="handleSelectionChange">
                    <el-table-column
                    type="selection"
                    width="55">
                    </el-table-column>
                    <el-table-column
                    label="用户名称"
                    prop="enterpriseName">
                        <template slot-scope="scope">
                            <div class="enterpriseName" v-html="scope.row.enterpriseNameHtml"></div>
                            <el-button size="mini" type="primary" v-if="scope.row.freeFlag==0">付费</el-button>
                            <el-button size="mini" class="free-btn" v-else>免费</el-button>
                            <el-button size="mini" class="type-box-1" v-if="scope.row.authenticationFlag==1">已认证</el-button>
                            <el-button size="mini" class="type-box-0" v-else>未认证</el-button>
                        </template>
                    </el-table-column>
                    <el-table-column
                    prop="accountName"
                    label="注册手机号"
                    width="340">
                    </el-table-column>
                    <el-table-column
                    width="320"
                    label="操作">
                        <template slot-scope="scope">
                            <span>
                                <el-button type="text" @click="gotoUser(scope.$index, scope.row,1)">基本信息</el-button>
                                <el-button type="text" @click="gotoUser(scope.$index, scope.row,2)">充值管理</el-button>
                                <el-button type="text" @click="gotoUser(scope.$index, scope.row,3)">消费记录</el-button>
                                <el-button type="text" @click="gotoUser(scope.$index, scope.row,4)">通话统计</el-button>
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
        
        <!-- 加入黑名单 -->
        <el-dialog title="加入黑名单" :visible.sync="blackVisible" width="600px" center>
            <div class="overrule-dialog-cnt black-dialog">
                您确认要将选中的用户加入黑名单吗？加入黑名单后该用户将被禁止登录
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="blackVisible = false">取 消</el-button>
                <el-button type="primary" @click="modifyMemberBlacklistFlag(true)">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 移除黑名单 -->
        <el-dialog title="移出黑名单" :visible.sync="moveVisible" width="600px" center>
            <div class="overrule-dialog-cnt black-dialog">
                您确认要将选中的用户移出黑名单吗？移动后将恢复至用户列表
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="moveVisible = false">取 消</el-button>
                <el-button type="primary" @click="modifyMemberBlacklistFlag(false)">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import bus from '../common/bus';
    import dateSet from '../common/date';
    export default {
        name: 'dashboard',
        data() {
            return {
                infoActiveName:'first',
                blackVisible:false,
                moveVisible:false,
                searchForm:{
                    // freeFlag:'',
                    // queryKey:''
                },
                cur_page:1,
                pagination: {
                    show: true,
                    total: 0,
                    pageIndex: 1,
                    pageSize:20
                },
                multipleSelection:[],
                tableData:[],
                pagination: {
                    show: true,
                    total: 0,
                    pageIndex: 1,
                    pageSize:20
                },
            }
        },
        mounted(){
            this.queryMemberList();
        },
        methods: {
            handleCurrentChange(val) {
                this.cur_page = val;
                // this.queryMemberList(this.searchForm);
                this.queryMemberList();
            },
            handleTabClick(type){
                this.queryMemberList();
            },
            onSearch(){
                this.queryMemberList(this.searchForm);
            },
            onRefresh(){
                this.$refs['searchForm'].resetFields();
                this.searchForm.freeFlag='';
                this.searchForm.authenticationFlag='';
                this.searchForm.queryKey='';
                this.queryMemberList();
            },
            typeChange(val){

            },
            handleSelectionChange(val) {
                this.multipleSelection = val;
            },
            handleView(){

            },
            queryMemberList(opt){
                let self=this;
                let data = {
                    currentPage:this.cur_page-1,
                    pageSize:this.pagination.pageSize
                }

                if(this.searchForm.queryKey){
                    data.queryKey = this.searchForm.queryKey;
                }

                if(this.infoActiveName=='first'){
                    data.blacklistFlag=false;
                }else{
                    data.blacklistFlag=true;
                }
                if(this.dateValue && this.infoActiveName=='second'){
                    data.approveStartTime =this.searchForm.approveStartTime ;
                    data.approveEndTime =this.searchForm.approveEndTime ;
                }
                let newData = $.extend({},data,opt);
                $.post(this.$baseUrl+'services/member/queryMemberList.json',JSON.stringify(newData)).then((res)=>{

                    if(res.resultMessageEnum=='0000'){
                        let recordList = res.returnObject.recordList;
                        if(recordList.length){
                            let defaultItem = '<span class="a">未知</span>'
                            recordList.forEach((item,index)=>{
                                let str='';
                                if(item.authenticationFlag==1){
                                    if(item.remarkName){
                                        str+=`<span class="a">${item.remarkName}</span><span class="b">（${item.enterpriseName}）</span>`
                                    }else if(item.enterpriseName){
                                        str+=`<span class="a">${item.enterpriseName}</span>`
                                    }else{
                                        str+=`<span class="a">未知</span>`
                                    }
                                }else{
                                    if(item.remarkName){
                                        str+=`<span class="a">${item.remarkName}</span><span class="b">（未知）</span>`
                                    }else{
                                        str+=`<span class="a">未知</span>`
                                    }
                                }

                                item.enterpriseNameHtml = str || defaultItem;
                            });
                        }
                        this.tableData = recordList;
                        this.pagination.total = res.returnObject.totalNumber;
                    }else{
                        self.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            // 加入黑名单
            modifyMemberBlacklistFlag(flag){
                let data = [];
                if(!this.multipleSelection.length){
                    this.$message.error('请选择要加入黑名单的用户！');
                    return false;
                }
                this.multipleSelection.forEach((item)=>{
                    let list={
                        blacklistFlag:flag,
                        memberId:item.memberId
                    }
                    data.push(list);
                })
                $.post(this.$baseUrl+'services/member/modifyMemberBlacklistFlag.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.$message.success('操作成功！');
                        this.blackVisible=false;
                        this.moveVisible=false;
                        this.queryMemberList();
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            // 分页导航
            handleCurrentChange(val) {
                this.cur_page = val;
                this.queryMemberList();
            },
            handleEdit(index,row){
                this.$router.push(`/auth/${row.memberId}`);
            },
            gotoUser(index,row,type){
                let blacklistFlag=false;
                if(this.infoActiveName=='second'){
                    blacklistFlag=true;
                }
                this.$router.push(`/information/${row.memberId}?type=${type}&blacklistFlag=${blacklistFlag}`);
            }
        }
    }

</script>


<style scoped lang="less">
    .el-tabs__nav-wrap{
        padding: 0;
    }
    .search-box{
        .el-select{
            width: 100px;
        }
        .refresh-btn{
            // margin-left: 20px;
            margin-right: 40px;
        }
        .black－btn{
            float:right;
        }
    }
    .black-dialog{
        height: 120px;
        padding-top:30px;
    }
    .enterpriseName{
        margin-bottom:5px;
        .b{
            color: #c0c4cc;
        }
    }
    .information-data-box{
        .el-button{
            &:hover{
                background:none;
            }
        }
        .type-box-1,.type-box-1:hover{
            color: #ad7f48;
            border-color: #cbad8b;
            background-color: #fae2c9;
        }
        .type-box-0,.type-box-0:hover{
            color: #fff;
            background-color: #c9cbd2;
            border-color: #c9cbd2;
        }
        .free-btn,.free-btn:hover{
            color: #ad7f48;
            border-color: #cbad8b;
        }
        
    }
</style>
