<template>
    <div class="table">
        <div class="content-box-top">
            <el-input v-model="select_word" clearable placeholder="输入敏感词库名称"  class="handle-input mr10" @keyup.native.13="search"></el-input>
            <el-button type="primary" class="search-btn" icon="search" @click="search" >搜索</el-button>
            <div class="content-box-top-right">
                <el-button type="primary" icon="iconfont icon-ico_new-task" @click="addNewLibary=true">新建</el-button>
            </div>
        </div>
        <div style="padding-top: 75px;"></div>
        <div class="w-container">
            <el-card class="box-card repository-card">
                <div slot="header" class="clearfix">
                    <span>敏感词库列表</span>
                    <div style="float: right">
                        <!--<el-button :disabled="!multipleSelection.length" type="primary">导出</el-button>-->
                        <el-button :disabled="!multipleSelection.length" type="primary" @click="delVisible = true" >删除</el-button>
                    </div>
                </div>
                <div class="repository-box">
                    <div>
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
                    </div>
                </div>
                <div class="pagination">
                    <el-pagination background @current-change="handleCurrentChange"
                                   layout="total, prev, pager, next,jumper"
                                   :total="pagination.total"
                                   :page-size="pagination.pageSize"
                    >
                    </el-pagination>
                </div>
            </el-card>

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
                delVisible:false
                
            }
        },
        created() {
            this.queryWordLibraryList()

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
                $.post(this.$baseUrl+'sensitive/addWordLibrary.json',JSON.stringify(data)).then((res)=>{
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
                if(this.select_word!=""){
                    data.libraryName = this.select_word;
                }

                $.post(this.$baseUrl+'sensitive/queryWordLibraryList.json',JSON.stringify(data)).then((res)=>{
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
                $.post(this.$baseUrl+'sensitive/modifyWordLibrary.json',JSON.stringify(data)).then((res)=>{
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
                $.post(this.$baseUrl+'sensitive/removeWordLibrary.json',JSON.stringify(data)).then((res)=>{
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
                $.post(this.$baseUrl+'sensitive/modifyWordLibrary.json',JSON.stringify(data)).then((res)=>{
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