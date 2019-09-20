<template>
    <div class="table">
        <div class="content-box-top">
            <el-input v-model="select_word" clearable placeholder="输入敏感词"  class="handle-input mr10" @keyup.native.13="search"></el-input>
            <el-button type="primary" class="search-btn" icon="search" @click="search" >搜索</el-button>
        </div>
        <div style="padding-top: 75px;"></div>
        <div style="padding-bottom: 10px;color:#fdc83c;font-size: large">
            <router-link to="/sensitive">《返回词典列表</router-link>
        </div>

        <div class="w-container">
            <el-card class="box-card repository-card">
                <div slot="header" class="clearfix">
                    <span>{{libraryName}}词条列表</span>
                    <div style="float: right">
                        <el-button  type="primary" @click="batchUploadVisible = true">批量上传</el-button>
                        <el-button  type="primary" @click="addNewEntry = true">新增词条</el-button>
                        <el-button :disabled="!multipleSelection.length" type="primary" @click="delVisible = true" >删除词条</el-button>
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
                                    label="敏感词"
                            >
                                <template slot-scope="{row,$index}">
                                    <span :id="row.id+ext">{{row.entryName}}</span>
                                    <span :id="row.id" style="display: none">
                                        <el-input v-model="currentModifyOldLibraryName" style="width: 200px"></el-input>
                                        <span >
                                            <el-button type="text" size="small"  @mouseout.native="cancelChangeLibraryNameOut"   @mouseover.native="cancelChangeLibraryNameOver" @click="cancelChangeLibraryName">取消</el-button>
                                            <el-button type="text" size="small" @mouseout.native="confirmChangeLibraryNameOut" @mouseover.native="confirmChangeLibraryNameOver" @click="confirmChangeLibraryName(row)">确定</el-button>
                                        </span>
                                    </span>
                                </template>
                            </el-table-column>

                            <el-table-column
                                    prop="editor"
                                    label="操作人"
                            >
                            </el-table-column>
                            <el-table-column label="操作" width="200" align="center">
                            <template slot-scope="scope">
                                <!--<el-button type="text" @click="handleEditor(scope.$index, scope.row)">编辑</el-button>-->
                                <el-button type="text" disabled>编辑</el-button>
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
                    title="新增敏感词"
                    :visible.sync="addNewEntry"
                    width="30%"
                    >
                <el-form ref="form" :model="form" label-width="110px" :rules="rules">
                    <el-form-item label="敏感词" prop="name">
                        <el-input v-model="form.name"></el-input>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="addNewEntry = false" >取 消</el-button>
                    <el-button type="primary" @click="creatEntry('form')">确 定</el-button>
                 </span>
            </el-dialog>

            <el-dialog
                    title="删除敏感词"
                    :visible.sync="delVisible"
                    width="30%"
            >
                <span>您确定已选中的{{multipleSelection.length}}条敏感词吗？删除后将不能恢复</span>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="delVisible = false" >取 消</el-button>
                    <el-button type="primary" @click="removeWordEntry">确 定</el-button>
                </span>
            </el-dialog>

            <el-dialog
                    title="批量上传敏感词"
                    :visible.sync="batchUploadVisible"
                    width="30%"
            >
                <el-form ref="form1" :model="form1" label-width="110px" :rules="rules1">
                    <el-form-item label="选择本地文件" prop="name">
                        <el-input type="file" v-model="form1.file1" accept="text/plain" name="file1" id="file1"></el-input>
                    </el-form-item>
                </el-form>
                <span style="font-size: smaller;color: red;padding-left: 110px;">注:批量导入的格式为TXT文件,每行一个敏感词,文件大小不超多5M</span>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="batchUploadVisible = false" >取 消</el-button>
                    <el-button type="primary" @click="batchUploadEntry">确 定</el-button>
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
                addNewEntry:false,
                form:{
                    name:"",
                },
                form1:{
                    file1:"",
                },
                rules: {
                    name: [
                        { required: true, message: '请输入词库名称', trigger: 'blur' },
                    ],
                },
                rules1: {
                    file1: [
                        { required: true, message: '请输选择文件', trigger: 'blur' },
                    ],
                },
                multipleSelection:[],
                currentModifyOldLibraryName:"",
                canaleEvent:false,
                confirmEvent:false,
                delVisible:false,
                libraryId:"",
                libraryName:"",
                batchUploadVisible:false,
                
            }
        },
        created() {
            this.libraryId = this.$route.params.id
            this.libraryName = decodeURI(this.$route.params.libraryname)
            this.queryEntryList()
        },
        methods:{
            search:function () {
                this.cur_page = 1
                this.queryEntryList()
            },
            creatEntry:function (formName) {
                var canAdd = true
                this.$refs[formName].validate((valid) => {
                    if (!valid) {
                        console.log('error submit!!');
                        canAdd = false
                        return false;
                    }
                });

                if (!canAdd){
                    return
                }

                this.addNewEntry = false
                let data={
                    entryName:this.form.name,
                    libraryId: this.libraryId,
                    libraryName:this.libraryName
                }
                $.post(this.$baseUrl+'sensitive/addWordEntry.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.$message.success("新增成功！")
                        this.cur_page = 1;
                        this.queryEntryList()
                    }else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            handleCurrentChange:function (val) {
                this.cur_page = val
                this.queryEntryList()
            },
            handleEditor:function (row,index) {
                
            },
            queryEntryList:function () {
                let data = {}
                data.currentPage = this.cur_page -1;
                data.pageSize = this.pagination.pageSize;
                data.libraryId = this.libraryId
                if(this.select_word!=""){
                    data.entryName = this.select_word;
                }
                $.post(this.$baseUrl+'sensitive/queryWordEntryList.json',JSON.stringify(data)).then((res)=>{
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
                    this.currentModifyOldLibraryName = row.entryName;
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
                //不能为空
                if (this.currentModifyOldLibraryName == ""){
                    this.$message.error("词条名称不能为空");
                    return;
                }
                //没有改变直接返回
                if (this.currentModifyOldLibraryName == row.entryName){
                    this.resetLibrary()
                    return
                }

                let data={
                    entryName:this.currentModifyOldLibraryName,
                    id:row.id
                }
                $.post(this.$baseUrl+'sensitive/modifyWordEntry.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.$message.success("更新成功")
                        this.resetLibrary()
                        this.queryEntryList()
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
            removeWordEntry:function () {
                var data = [];
                for (var i in this.multipleSelection){
                    data.push(this.multipleSelection[i].id)
                }
                $.post(this.$baseUrl+'sensitive/removeWordEntry.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.$message.success("删除成功")
                        this.delVisible = false;
                        this.queryEntryList()
                    }else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            batchUploadEntry:function (formName) {
                let files = $('#file1')[0].files;
                let self = this;
                var oMyForm = new FormData();
                var libraryId = self.libraryId;
                let size = 5242880;
                if (files.length <= 0){
                    self.$message.error("没有选择任何文件")
                    return false;
                }
                //校验
                for(var i=0;i<files.length;i++){
                    if(files[i].size>size){
                        this.$message.error('请选择5M以内的文件！');
                        this.changeFileType();
                        return false;
                    }
                    let ext = files[i].name.substr(files[i].name.lastIndexOf(".")).toLowerCase();

                    if(ext!=".txt"){
                        self.$message.error('文件格式错误,重新选择！');
                        this.changeFileType();
                        return false;
                    }
                    oMyForm.append("file",files[i]);
                }
                oMyForm.append("libraryId",libraryId);
                $.ajax({
                    url: this.$baseUrl+'sensitive/batchUploadEntry.json',
                    type: 'POST',
                    cache: false,
                    data:oMyForm,
                    dataType: "json",
                    headers : {'Content-Type':'multipart/form-data'},
                    processData: false,
                    contentType: false,
                    async: false,
                }).done(function(res) {
                    if(res.resultMessageEnum=='0000'){
                        self.batchUploadVisible = false;
                        self.$message.success('批量上传成功');
                        self.queryEntryList()
                    }else{
                        self.$message.error('批量上传失败！');
                    }
                }).fail(function(res) {

                });


            },
            changeFileType(){
                $('#file1').val('');
            },
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