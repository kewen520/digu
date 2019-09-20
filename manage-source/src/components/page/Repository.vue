<template>
<!--知识库管理-->
    <div class="container-admin">
        <div class="admin-page">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>管理中心</el-breadcrumb-item>
                <el-breadcrumb-item>知识库管理</el-breadcrumb-item>
                <el-breadcrumb-item>{{detailName}}</el-breadcrumb-item>
            </el-breadcrumb>
            <keep-alive>
                <el-tabs v-model="resourceActiveName" @tab-click="tabHandleClick">
                    <el-tab-pane label="知识库" name="first"></el-tab-pane>
                </el-tabs>
            </keep-alive>
        </div>
        <div class="admin-body">
            <el-tabs v-model="ypkActiveName" @tab-click="ypkHandleClick">
                <el-tab-pane label="通用知识库"  name="ypkFirst"></el-tab-pane>
                <el-tab-pane label="用户知识库"  name="ypkSecond"></el-tab-pane>
            </el-tabs>
            <el-row class="first-row"  v-if="this.ypkActiveName == 'ypkFirst'">
                <el-col>
                    <el-form :inline="true" class="w-form-inline">
                        <el-form-item label="关键词：">
                            <el-input clearable v-model="searchForm.groupName"
                                      placeholder="知识库名称"  @keyup.native.13="onSearch">

                            </el-input>
                        </el-form-item>
                        <el-form-item label="操作人：">
                            <el-select v-model="searchForm.memberIds"  multiple  placeholder="请选择" >
                                <el-option
                                        v-for="item in managerList"
                                        :key="item.id"
                                        :label="item.loginName"
                                        :value="item.id">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item>
                            <el-checkbox v-model="searchForm.allManager">全部</el-checkbox>
                        </el-form-item>
                        <el-form-item>
                            <el-button @click="onHandleReset">重置</el-button>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="onSearch">搜索</el-button>
                        </el-form-item>

                    </el-form>
                </el-col>
                <el-col>

                    <el-button @click="dialogDelGroupVisible = true" :disabled="this.publicDisabled == false ">删除</el-button>
                    <el-button type="primary" @click="dialogAddKnoledgeVisible = true">新增 </el-button>
                    <div style="float: right"  >
                        <el-button type="primary"  @click="dialogPublicGroupVisible = true" :disabled="this.publicDisabled == false ">发布</el-button>
                    </div>
                </el-col>
            </el-row>
            <el-row v-if="this.ypkActiveName == 'ypkFirst'">
                <el-col :span="24" class="repository-menu-box" >
                    <el-tabs tab-position="left" @tab-click="selectLY">
                        <el-tab-pane
                                v-for="item in industryListaddQb"
                                :label="item.industryName"
                                v-bind:key="item.id"
                                >

                            <el-col>
                                <el-table
                                        stripe
                                        :data="listOfPageData"
                                        @sort-change="sortChange"
                                        @selection-change="handleSelectionChange"
                                >
                                    <el-table-column
                                            type="selection"
                                            width="55">
                                    </el-table-column>

                                    <el-table-column
                                            label="知识库名称">
                                        <template slot-scope="scope">
                                            <span style="color: #ad7f48" v-if="scope.row.itemUpdateFlag == 1">[待发布]</span>
                                            <span style="margin-left: 10px">{{ scope.row.groupName }}</span>
                                        </template>

                                    </el-table-column>

                                    <el-table-column
                                            width="250"
                                            sortable
                                            prop="editTime"
                                            label="更新时间">
                                    </el-table-column>
                                    <el-table-column

                                            prop="editor"
                                            label="操作人">
                                    </el-table-column>
                                    <el-table-column label="操作" width="200" align="center">
                                        <template slot-scope="scope">
                                            <el-button type="text" @click="handleModifyGroup(scope.$index, scope.row)">修改名称</el-button>
                                            <el-button type="text" @click="handleConfig(scope.$index, scope.row)">配置</el-button>

                                            <el-button v-if="scope.row.itemUpdateFlag==1" type="text" @click="publishKnowledgeGroup(scope.$index, scope.row)">发布</el-button>
                                            <el-button v-else type="text" disabled>发布</el-button>
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
                            </el-col>
                        </el-tab-pane>
                    </el-tabs>
                 </el-col>
             </el-row>
            <el-row v-if="this.ypkActiveName == 'ypkSecond'">
                <el-col>
                    <el-form :inline="true" class="w-form-inline">
                        <el-form-item label="关键词：">
                            <el-input clearable v-model="searchUserKeyWord"
                                      placeholder="用户名称"  @keyup.native.13="onUserSearch"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="onUserSearch">搜索</el-button>
                        </el-form-item>
                    </el-form>
                </el-col>
                <el-col>
                    <el-table
                        :data="tableMemberList"
                    >
                        <el-table-column prop="enterpriseName" label="创建用户"></el-table-column>
                        <!--<el-table-column prop="enterpriseName" label="联系电话"></el-table-column>-->
                        <el-table-column prop="editTime" sortable label="更新时间"></el-table-column>
                        <el-table-column label="操作" width="200" align="center">
                            <template slot-scope="scope">
                                <el-button type="text" @click="lookUserGroup(scope.$index, scope.row)">查看</el-button>
                            </template>
                        </el-table-column>

                    </el-table>
                    <div class="pagination">
                        <el-pagination background @current-change="handleUserCurrentChange"
                                       layout="total, prev, pager, next,jumper"
                                       :total="paginationUser.total"
                                       :page-size="paginationUser.pageSize"
                        >
                        </el-pagination>
                    </div>
                </el-col>
            </el-row>
         </div>
         <!--dialog-->

        <!--dialog-->
        <el-dialog title="新增知识库" :visible.sync="dialogAddKnoledgeVisible">
            <el-form >
                <el-form-item label="知识库名称" label-width="150px">
                    <el-input v-model="addKnoledgeform.name" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="行业领域" label-width="150px">
                    <el-select v-model="addKnoledgeform.industry" placeholder="请选择">
                        <el-option v-for="item in industryList"
                                   :label="item.industryName"
                                   :value="item.id"
                                   :key="item.id"
                        >
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogAddKnoledgeVisible = false">取 消</el-button>
                <el-button type="primary" @click="addKnoledge">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog
                title="删除知识库"
                :visible.sync="dialogDelGroupVisible"
                width="25%"
                >
            <span>您确定要删除选中的{{selectdGroupCount}}个知识库吗？删除后将不能恢复</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogDelGroupVisible = false">取 消</el-button>
                <el-button type="primary" @click="removeKnowledgeGroupList">确 定</el-button>
            </span>
        </el-dialog>

        <el-dialog title="修改名称" class="creat-faq-dialog"  :visible.sync="modifyGroupVisible" width="600px">
            <el-form ref="modifyGroupForm" :model="modifyGroupForm" label-width="114px" :rules="modifyGroupFormRules">
                <el-form-item label="知识库名称" prop="groupName">
                    <el-input v-model="modifyGroupForm.groupName"  placeholder="输入知识库名称"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                    <el-button @click="modifyGroupVisible = false">取 消</el-button>
                    <el-button type="primary" @click="modifyKnowledgeGroup">确 定</el-button>
                </span>
        </el-dialog>

        <!--发布知识库-->
        <el-dialog
                title="发布知识库"
                :visible.sync="dialogPublicGroupVisible"
                width="25%"
        >
            <span>您确定要发布所有更新的知识库吗？</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogPublicGroupVisible = false">取 消</el-button>
                <el-button type="primary" @click="publishKnowledgeGroupAll">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
    export default {
        data() {
            return {
                dialogPublicGroupVisible:false,
                /*导航相关*/
                publicKnoledgeName:"通用知识库",
                memberKnoledgeName:"用户知识库",
                resourceActiveName: 'first',
                ypkActiveName: 'ypkFirst',
                detailName:"通用知识库",
                type:1,
                /*搜索相关*/
                searchForm: {
                    groupName: "",
                    memberIds: "",
                    insdutry:"",
                    allManager:false
                },
                mangerSelectList:[],//选择的用户
                managerList:[],//所有的管理员
                industryList:[],//所有的行业
                industryListaddQb:[],//添加全部的行业
                dialogAddKnoledgeVisible:false,
                dialogDelGroupVisible:false,
                addKnoledgeform: {
                    name: '', //名称
                    industry: '',//行业领域
                },
                listOfPageData:[],//group列表
                pagination: {
                    show: true,
                    total: 0,
                    pageIndex: 1,
                    pageSize: 10
                },

                cur_page:1,
                selectdGroupList:[],
                publicDisabled:false,
                selectdGroupCount:0,
                modifyGroupVisible:false,
                modifyGroupForm:{},
                modifyGroupFormRules:{
                    groupName:[
                        { required: true, message: '输入知识库名称', trigger: 'blur' }
                    ]
                },
//                用户知识库相关的写在下面
                searchUserKeyWord:"",
                curUserPage:1,
                tableMemberList:[],
                paginationUser: {
                    show: true,
                    total: 0,
                    pageIndex: 1,
                    pageSize: 10
                }
            }
        },
        created(){
            this.queryAllIndustryList();
            this.getAllManager()
            this.queryKnowledgeGroupListOfPage()
            if (this.$route.params.type == 2){
                this.ypkActiveName = "ypkSecond"
                this.onUserSearch()
            }
        },
        methods:{
            tabHandleClick:function (type) {
                console.log(type)
            },
            //二级菜单切换
            ypkHandleClick:function (type) {
                if (type.name == "ypkFirst"){
                    this.detailName = this.publicKnoledgeName;
                }else if(type.name == "ypkSecond") {
                    this.detailName = this.memberKnoledgeName
                    this.onUserSearch()
                }
                console.log(this.ypkActiveName)
            },
            //重置
            onHandleReset:function () {
                this.searchForm.groupName = ""
                this.searchForm.memberIds = []
                this.searchForm.allManager = false
            },
            //搜索
            onSearch:function () {
                this.queryKnowledgeGroupListOfPage()
            },
            //查询所有的管理员
            getAllManager:function () {
                $.get(this.$baseUrl+'services/manager/getManagerList.json').then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        if(res.returnObject && res.returnObject.length){
                            this.managerList = res.returnObject;
                            console.log(this.managerList )
                        }
                    }
                });
            },
            // 所有行业列表
            queryAllIndustryList:function(){
                $.get(this.$baseUrl+'services/intention/queryAllIndustryList.json').then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        if(res.returnObject && res.returnObject.length){
                            this.industryList = res.returnObject;
                            this.industryListaddQb.push({
                                "id":"DEL1",
                                "industryName":"行业领域"
                            });
                            this.industryListaddQb.push({
                                "id":"DEL2",
                                "industryName":"全部"
                            });
                            for (let i in this.industryList){
                                this.industryListaddQb.push(
                                    this.industryList[i]
                                )
                            }
                        }
                    }else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            //点击领域
            selectLY:function (command) {
                //获取insdutryType
                this.searchForm.insdutry = "";
                for (var i in this.industryListaddQb){
                    if (i == command.index){
                        if (this.industryListaddQb[i].id != "DEL1" && this.industryListaddQb[i].id!="DEL2"){
                            this.searchForm.insdutry = this.industryListaddQb[i].id
                        }
                    }
                }
                this.cur_page = 1
                this.queryKnowledgeGroupListOfPage()
            },
            sortChange:function (val) {
                console.log("sortChange",val)
            },
            handleSelectionChange:function (val) {
                console.log("handleSelectionChange",val)
                this.selectdGroupList = val;
                //发布按钮的控制
                if (val.length > 0){
                    this.publicDisabled = true
                }else {
                    this.publicDisabled = false
                }
                this.selectdGroupCount = this.selectdGroupList.length
            },
            checkSelectable:function (val) {
                console.log("checkSelectable",val)
            },

            addKnoledge:function () {
                var groupName = this.addKnoledgeform.name;
                var industryType = this.addKnoledgeform.industry
                var industryName = "";
                if (groupName == ""){
                    this.$message.error("请输入知识库名称!")
                    return
                }
                if (industryType == ""){
                    this.$message.error("请选择行业领域!")
                    return
                }
                for (var i in this.industryList){
                    if (this.industryList[i].id == industryType){
                        industryName = this.industryList[i].industryName
                    }
                }

                var params = {
                    groupName:groupName,
                    industryType:industryType,
                    industryName:industryName
                }

                $.post(this.$baseUrl+'services/knowledge/addKnowledgeGroup.json?',JSON.stringify(params)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.dialogAddKnoledgeVisible = false;
                        this.addKnoledgeform.industry = "";
                        this.addKnoledgeform.name = "";
                        this.queryKnowledgeGroupListOfPage()
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },

            queryKnowledgeGroupListOfPage:function () {
                var params = {}
                params.currentPage = this.cur_page - 1;
                params.pageSize = this.pagination.pageSize;
                params.templateType = 1;
                if (this.searchForm.memberIds.length > 0 && this.searchForm.allManager == false){
                    params.memberIds = this.searchForm.memberIds;
                }
                if(this.searchForm.groupName!=""){
                    params.groupName = this.searchForm.groupName;
                }
                if(this.searchForm.insdutry!=""){
                    params.industryTypes = [this.searchForm.insdutry]
                }


                $.post(this.$baseUrl+'services/knowledge/queryKnowledgeGroupListOfPage.json?',JSON.stringify(params)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.listOfPageData = res.returnObject.recordList;
                        this.pagination.total = res.returnObject.totalNumber;
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            removeKnowledgeGroupList:function () {
                var params = []
                for (var i in this.selectdGroupList){
                    params.push(this.selectdGroupList[i]['id'])
                }
                $.post(this.$baseUrl+'services/knowledge/removeKnowledgeGroupList.json?',JSON.stringify(params)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.dialogDelGroupVisible = false
                        this.queryKnowledgeGroupListOfPage()
                        this.$message.success("已删除"+this.selectdGroupCount+"个知识库！")
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            checkSelectable(row, index){
                return this.selectable;

            },
            handleCurrentChange:function (val) {
                this.cur_page = val
                this.queryKnowledgeGroupListOfPage()
            },
            industryRowClick:function (row, column, event) {
                console.log(row, column, event)
            },
            handleModifyGroup(index,row){

                this.modifyGroupForm.groupName = row.groupName;
                this.modifyGroupForm.id = row.id;
                this.modifyGroupVisible = true;
            },
            modifyKnowledgeGroup(){
                var params={
                    groupName:this.modifyGroupForm.groupName,
                    id:this.modifyGroupForm.id
                }

                this.$refs['modifyGroupForm'].validate((valid) => {
                    $.post(this.$baseUrl+'services/knowledge/modifyKnowledgeGroup.json?',JSON.stringify(params)).then((res)=>{
                        if(res.resultMessageEnum=='0000'){
                            this.modifyGroupVisible = false;
                            this.queryKnowledgeGroupListOfPage();
                        }else{
                            this.$message.error(res.errorInfoList[0].errorMessage);
                        }
                    });
                });
            },
            handleConfig(index,row){
                console.log(index,row)
                this.$router.push('/repository/config/'+row.id)
            },
            //知识库发布
            publishKnowledgeGroup(index,row){
                let params={
                    groupId:row.id
                }
                $.post(this.$baseUrl+'services/knowledge/publishKnowledgeGroup.json?groupId='+row.id).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        // this.listOfPageData.splice(index,1)
                        this.listOfPageData[index].itemUpdateFlag=0;
                        this.$message.success('发布成功');

                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            publishKnowledgeGroupAll(){
                var params = []
                for (var i in this.selectdGroupList){
                    params.push(this.selectdGroupList[i]['id'])
                }
                $.post(this.$baseUrl+'services/knowledge/publishKnowledgeGroupBatch.json?',JSON.stringify(params)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.dialogPublicGroupVisible = false
                        this.queryKnowledgeGroupListOfPage()

                        this.$message.success("发布成功")
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            onUserSearch:function () {
                console.log(this.searchUserKeyWord)
                let data = {
                    currentPage:this.curUserPage-1,
                    pageSize:this.pagination.pageSize
                }
                if (this.searchUserKeyWord !=""){
                    data.queryKey = this.searchUserKeyWord;
                }

                $.post(this.$baseUrl+'services/member/queryMemberList.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000') {
                        this.tableMemberList  = res.returnObject.recordList;
                        this.paginationUser.total = res.returnObject.totalNumber;
                    }else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            handleUserCurrentChange:function (val) {
                this.curUserPage = val
                this.onUserSearch()
            },

            lookUserGroup:function (index, row) {
                console.log(index,row)
                this.$router.push("/repositoryusergroup/"+row.memberId);
            }
        },

    }
</script>

<style scoped lang="less">
    .admin-body{
        padding-top: 10px;
    }
    .industry{
    .el-radio--medium.is-bordered{
        margin-left: 0;
        margin-right: 10px;
        margin-bottom:10px;
    }
    .el-select{
        width: 350px;
    }
    }

    .first-row{
    .el-table{
        border-left: 1px solid #ebeef5;
    }
    }
    .sound-page{
    .el-card__body{
        padding: 0;
    }
    .sound-body{
        margin: 0 auto;
    }
    .sound-top{
        margin-bottom:20px;
    }
    }
    .handle-input {
        width:240px;
        display: inline-block;
    }
    .sound_top_btn_del{
        float:right;
    }
    .upload-btn-sound{
        position: relative;
    .el-input{
        position: absolute;
        left: 0;
        width: 100%;
        top: 0;
        height:100%;
        opacity: 0;
        filter: alpha(opacity=0);
    }
    }
    .crumbs{
        display: inline;
        float: left;
        margin-top: 0;
    .link{
        color: #4E8FF9;
    }
    }
    .sound-table {
    .icon-icon_play{
        float: left;
        cursor: pointer;
    }
    }
    #file,
    #importFile{
        position:absolute;
        width: 100%;
        height: 100%;
        left:0;
        top:0;
        opacity: 0;
    }
    .video-edit-box{
    .icon-icon_play{
    }
    .el-textarea {
        width:auto;
        margin-left:28px;
        border:none;
        vertical-align: middle;
        display: inherit;
    .el-textarea__inner{
        border:none;
    }
    }
    .video-edit-box-text{
        margin-left: 5px;
        padding-top: 5px;
    }
    }
    .menu-parent{
        height: 48px;
        line-height: 48px;
        padding: 0 0 0 30px;
    &.active{
         background-color: #F7F8FB;
         border-left: 4px solid #4E8FF9;
     }
    }
    .repository-menu-item{
        padding-left: 40px;
    }

    .text {
        font-size: 14px;
    }

    .item {
        margin-bottom: 18px;
    }

    .clearfix:before,
    .clearfix:after {
        display: table;
        content: "";
    }
    .clearfix:after {
        clear: both
    }

    .box-card {
        width: 480px;
    }
    .celselect{

    }
    .celselect:hover{
        background-color: #4E8FF9;
    }
</style>