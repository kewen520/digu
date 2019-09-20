<template>
    <div class="container-admin">
        <div class="admin-page">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>管理中心</el-breadcrumb-item>
                <el-breadcrumb-item>敏感词库管理</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="admin-body">
            <el-row class="first-row">
                    <el-col>
                    <el-form :inline="true" class="w-form-inline">
                        <el-form-item label="关键词：">
                            <el-input clearable v-model="searchForm.queryKey"
                                      placeholder="敏感词库名称"  @keyup.native.13="onSearch">

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
                    <el-button :disabled="!multipleSelection.length" type="primary" @click="delVisible = true" >删除</el-button>
                    <el-button type="primary" @click="addNewLibary=true">新建感库</el-button>
                    <!--<el-button @click="">新增词库</el-button>-->
                    <!--<el-button @click="">新增词库</el-button>-->
                </el-col>
                <el-col>
                    <el-table
                    :data="dataList"
                    @selection-change="handleSelectionChange"
                    @cell-click="enterModify"
                    >
                        <el-table-column
                        type="selection"
                        width="55">
                        </el-table-column>
                        <el-table-column
                        label="词库名称"
                        >
                        <template slot-scope="{row,$index}">
                        <span :id="row.id+ext">{{row.libraryName}}</span>

                        <span :id="row.id" style="display: none">
                        <el-input @keyup.native.13="confirmChangeLibraryName(row)" v-model="currentModifyOldLibraryName" style="width: 200px"></el-input>
                        <span >
                        <el-button type="text" size="small"  @mouseout.native="cancelChangeLibraryNameOut"   @mouseover.native="cancelChangeLibraryNameOver" @click="cancelChangeLibraryName">取消</el-button>
                        <el-button type="text" size="small" @mouseout.native="confirmChangeLibraryNameOut" @mouseover.native="confirmChangeLibraryNameOver" @click="confirmChangeLibraryName(row)">确定</el-button>
                        </span>
                        </span>
                        </template>
                        </el-table-column>
                        <el-table-column
                        sortable
                        prop="editTime"
                        label="更新时间"
                        >
                        </el-table-column>
                        <el-table-column
                        prop="creator"
                        label="操作人"
                        >
                        </el-table-column>
                        <el-table-column label="操作" width="200" align="center">
                        <template slot-scope="scope">
                        <el-button type="text" @click="handleEditor(scope.row)">编辑</el-button>
                        <span v-if="scope.row.libraryStatus == 1">
                        <el-button type="text" @click="updateLibraryStatus(scope.row,2)">发布</el-button>
                        </span>
                        <span v-if="scope.row.libraryStatus == 2">
                        <el-button type="text" disabled>发布</el-button>
                        </span>
                        <span v-if="scope.row.libraryStatus == 3">
                        <el-button type="text" @click="updateLibraryStatus(scope.row,4)">更新</el-button>
                        </span>
                        <span v-if="scope.row.libraryStatus == 4">
                        <el-button type="text" disabled>更新</el-button>
                        </span>
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

                    <el-dialog
                        title="新增敏感词库"
                        :visible.sync="addNewLibary"
                        width="30%"
                        >
                        <el-form ref="form" :model="form" label-width="110px" :rules="rules">
                        <el-form-item label="敏感词库名称" prop="name">
                        <el-input v-model="form.name"></el-input>
                        </el-form-item>
                        </el-form>
                        <span slot="footer" class="dialog-footer">
                        <el-button @click="addNewLibary = false" >取 消</el-button>
                        <el-button type="primary" @click="creatLibary('form')">确 定</el-button>
                        </span>
                    </el-dialog>

                    <el-dialog
                        title="删除敏感词库"
                        :visible.sync="delVisible"
                        width="30%"
                        >
                        <span>您确定已选中的敏感词库吗？如果删除该词库，该词库下所有敏感词均被删除且无法恢复</span>
                        <span slot="footer" class="dialog-footer">
                        <el-button @click="delVisible = false" >取 消</el-button>
                        <el-button type="primary" @click="removeWordLibrary">确 定</el-button>
                        </span>
                    </el-dialog>
                </el-col>
            </el-row>

        </div>
    </div>
</template>
<script>
    export default {
        data(){
            return {
                ext:"ext",
                select_word:"",
                pagination: {
                    show: true,
                    total: 0,
                    pageIndex: 1,
                    pageSize: 20
                },
                cur_page:1,
                dataList:[],
                addNewLibary:false,
                form:{
                    name:"",
                },
                rules: {
                    name: [
                        { required: true, message: '请输入词库名称', trigger: 'blur' },
                    ],
                },
                multipleSelection:[],
                currentModifyOldLibraryName:"",
                canaleEvent:false,
                confirmEvent:false,
                delVisible:false,
                /*搜索相关*/
                searchForm: {
                    queryKey: "",
                    memberIds: "",
                    insdutry:"",
                    allManager:false
                },
                managerList:[]
                
            }
        },
        created() {
            this.queryWordLibraryList()
            this.getAllManager()
        },
        methods:{
            search:function () {
                this.cur_page = 1
                if(this.select_word == ""){
                    this.$message.error("请输入词库名")
                    return false;
                }
                this.queryWordLibraryList()
            },
            creatLibary:function (formName) {
                var canAdd = true
                this.$refs[formName].validate((valid) => {
                    if (!valid) {
                        console.log('error submit!!');
                        canAdd = false
                        return false;
                    }
                });

                if(!canAdd){
                    return
                }

                this.addNewLibary = false

                let data={
                    libraryName:this.form.name
                }
                $.post(this.$baseUrl+'services/sensitive/addWordLibrary.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.$message.success("发布成功")
                        this.cur_page = 1;
                        this.queryWordLibraryList()
                    }else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            handleCurrentChange:function () {
                
            },
            handleEditor:function (row) {
                var url = "/sensitive/"+row.id+"/"+encodeURI(row.libraryName);
                this.$router.push(url)
            },
            queryWordLibraryList:function () {
                let data = {}
                data.currentPage = this.cur_page -1;
                data.pageSize = this.pagination.pageSize;
                if (this.searchForm.memberIds.length > 0 && this.searchForm.allManager == false){
                    data.memberId = this.searchForm.memberIds;
                }
                if (this.searchForm.queryKey !=""){
                    data.libraryName = this.searchForm.queryKey;
                }

                $.post(this.$baseUrl+'services/sensitive/queryWordLibraryList.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.dataList = res.returnObject.recordList;
                        this.pagination.total = res.returnObject.totalNumber
                    }else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            handleSelectionChange:function (val) {
                this.multipleSelection = val
            },
            enterModify:function (row, column, cell, event) {
                if (this.canaleEvent || this.confirmEvent){
                    return false
                }
                this.resetLibrary()
                let rowId = row.id;
                let idOld = rowId+"ext"
                if (column.id == "el-table_1_column_2"){
                    this.currentModifyOldLibraryName = row.libraryName;
                    let currentShowCell = document.getElementById(rowId)
                    document.getElementById(idOld).style.display = "none"
                    currentShowCell.style.display="block";

                }
            },
            resetLibrary:function () {
                //当前页的所有的输入编辑框影藏
                for (var i in this.dataList){
                    let id = this.dataList[i].id;
                    let idOld = this.dataList[i].id+"ext"
                    let currentCell = document.getElementById(id)
                    let currentCellOld = document.getElementById(idOld)
                    currentCell.style.display="none";
                    currentCellOld.style.display="block";
                }
            },
            cancelChangeLibraryName:function () {
                this.resetLibrary()
            },
            //确定更新词库名称
            confirmChangeLibraryName:function (row) {
                if (this.currentModifyOldLibraryName == ""){
                    this.$message.error("词库名称不能为空");
                    return;
                }
                if (this.currentModifyOldLibraryName == row.libraryName){
                    this.resetLibrary()
                    return
                }

                let data={
                    libraryName:this.currentModifyOldLibraryName,
                    id:row.id
                }
                $.post(this.$baseUrl+'services/sensitive/modifyWordLibrary.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.$message.success("更新成功")
                        this.resetLibrary()
                        this.queryWordLibraryList()
                    }else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });

            },
            cancelChangeLibraryNameOver:function () {
                this.canaleEvent = true
            },
            cancelChangeLibraryNameOut:function () {
                this.canaleEvent = false
            },
            confirmChangeLibraryNameOut:function () {
                this.confirmEvent = false
            },
            confirmChangeLibraryNameOver:function () {
                this.confirmEvent = true
            },
            removeWordLibrary:function () {
                var data = [];
                for (var i in this.multipleSelection){
                    data.push(this.multipleSelection[i].id)
                }
                $.post(this.$baseUrl+'services/sensitive/removeWordLibrary.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.$message.success("删除成功")
                        this.queryWordLibraryList()
                        this.delVisible = false;
                    }else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            updateLibraryStatus:function (row, status) {
                let data={
                    libraryStatus:status,
                    id:row.id
                }
                $.post(this.$baseUrl+'services/sensitive/modifyWordLibrary.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        if(status == 2){
                            this.$message.success("发布成功")
                        }else if (status == 4){
                            this.$message.success("更新成功")
                        }

                        this.queryWordLibraryList()
                    }else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
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
            //重置
            onHandleReset:function () {
                this.searchForm.queryKey = ""
                this.searchForm.memberIds = []
                this.searchForm.allManager = false
            },
            onSearch:function () {
                this.cur_page = 1
                this.queryWordLibraryList()
            }

        }
    }

</script>

<style scoped lang="less">
    .speech_top{
        padding:10px 0px 20px;
        position: relative;
    .speech_top_btn_del{
        position:absolute;
        right: 20px;
        top:12px;
        z-index:5;
    }
    }
    .handle-box {
        margin-bottom: 20px;
    }

    .handle-select {
        width: 120px;
    }

    .handle-input {
        width:240px;
        display: inline-block;
    }
    .del-dialog-cnt{
        font-size: 16px;
        text-align: center
    }
    .table{
        width: 100%;
        font-size: 14px;
    }
    .el-icon-question,
    .el-icon-lx-file{
        position: absolute;
        /*right:85px;*/
        top:11px;
        font-size: 18px;
        color: #919FA9;
        margin-left: 10px;
    &.tymb{
         right: auto;
         left: 120px;
     }
    }
    .import_footer_tip{
        font-size:13px;
        color: #303133;
    }
    .creatSpeechRead,
    .copySpeechRead{
        float: left;
        font-weight: normal;
        margin-top: 5px;
    }
    .creat-radio-box{

    .el-form-item__label{
        color:#f56c6c;
    }
    .el-radio.is-bordered+.el-radio.is-bordered{
        margin-left: 0;
    }
    label:nth-child(1){
        margin-right: 10px;
    }
    }

    .pop-box-speech{
    p{
        width:110px;
        padding:30px 10px 0 15px;
        float: left;
    }
    img{
        float:right;
        width:200px;
    }
    }
    .sound-content{
        position:fixed;
        z-index:15;
        background-color:#fff;
        left:0;
        width:100%;
        top:0;bottom:0
    }
    .content-box-top-right{
    .el-button{
        padding: 0 10px;
    // width: 114px;
    }
    }
    .search-btn{
        width:93px;
    }
</style>