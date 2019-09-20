<template>
    <div class="table">
        <div class="content-box-top">
            <el-input v-model="queryKey" clearable placeholder="输入目标词" @change="searchChange" class="handle-input mr10"></el-input>
            <el-button type="primary" icon="search" @click="search">搜索</el-button>
        </div>
        <div>
            <div class="crumbs">
                <el-breadcrumb separator="/">
                    <a href="#/hotword" class="link"><i class="el-icon-arrow-left"></i>返回词典列表</a>
                </el-breadcrumb>
            </div>
        </div>
        <el-card class="box-card repository-card">
            <div slot="header">
                <div style="display: inline">
                    <span>{{dictionaryName}}热词列表</span>
                </div>
                <div style="display: inline; float: right;">
                    <el-button type="primary" @click="handleBatchUpload">批量上传</el-button>
                    <el-button type="primary" @click="handleCreateEntry">新增热词</el-button>
                    <el-button type="primary" @click="handleUpdate">更新热词</el-button>
                    <el-button :disabled="deleteDisable" type="primary" @click="deleteVisible = true">删除热词</el-button>
                    <!--<el-button type="primary" @click="handleQueryEntryList">刷新</el-button>-->
                </div>
            </div>

            <!--数据展示列表-->
            <div class="repository-box">
                <el-form ref="createForm" :inline="true" :rules="createForm.createRules" :model="createForm">
                <el-table
                        :data="createForm.tableData"
                        class="table"
                        :height="height"
                        :pagination="pagination"
                        @selection-change="handleSelectionChange"
                        stripe
                        highlight-current-row
                >
                    <el-table-column type="selection" width="50" align="center" :selectable="handleSelectable"></el-table-column>
                    <el-table-column label="目标词" prop="targetWord" width="200">
                        <template slot-scope="scope">
                                <el-form-item :prop="'tableData.' + scope.$index + '.targetWord'" :rules="createForm.createRules.targetWord">
                                    <el-input v-if="scope.row.isEdit || scope.row.isAdd" type="textarea" :rows="4"
                                              class="tb-edit-input-with-border" v-model="scope.row.targetWord" placeholder="输入目标词">
                                    </el-input>
                                    <el-input v-else type="textarea" :rows="1" class="tb-edit-input" readonly v-model="scope.row.targetWord"></el-input>
                                </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column label="原有词" prop="sourceWord">
                        <template slot-scope="scope">
                            <el-input style="margin-bottom: 18px;" v-if="scope.row.isEdit || scope.row.isAdd" type="textarea" :rows="4"
                                      class="tb-edit-input-with-border" v-model="scope.row.sourceWord" placeholder="输入原有词，多个以“|”分隔">
                            </el-input>
                            <el-input v-else type="textarea" :rows="1" class="tb-edit-input" readonly v-model="scope.row.sourceWord"></el-input>
                            <div v-if="scope.row.isEdit || scope.row.isAdd" style="display: inline; float: right;">
                                <i style="color: #F04A61; font-style: normal; cursor: pointer;" @click="handleCancelEdit(scope.$index, scope.row)">取消</i>
                                <i style="color: #0FD9AC; font-style: normal; cursor: pointer;" @click="handleConfirmEdit(scope.$index, scope.row)">确定</i>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="发布状态" prop="entryStatus" :formatter="handleEntryStatus" width="80"></el-table-column>
                    <el-table-column label="操作" width="80" align="center" fixed="right">
                        <template slot-scope="scope">
                            <el-button type="text" @click="handleEdit(scope.$index, scope.row)" :disabled="scope.row.isAdd">编辑</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                </el-form>
                <!--分页导航-->
                <div class="pagination">
                    <el-pagination background
                                   @size-change="handleSizeChange"
                                   @current-change="handleCurrentChange"
                                   layout="total, sizes, prev, pager, next, jumper"
                                   :total="pagination.total"
                                   :page-size="pagination.pageSize"
                                   :page-sizes="[10, 50, 100, 200]"
                    >
                    </el-pagination>
                </div>
            </div>
        </el-card>
        <!-- 错误弹出框 -->
        <el-dialog class="creatDialog" :visible.sync="errorVisible" width="460px">
            <span slot="title">
                <i class="el-icon-warning"></i>{{errorTitle}}
            </span>
            {{errorText}}
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="errorVisible = false">确 定</el-button>
            </span>
        </el-dialog>
        <!--批量上传-->
        <el-dialog title="批量上传热词"  :visible.sync="batchUploadVisible" width="460px">
            <div>
                <el-row>
                    <el-col :span="3" class="import-pop-file"><i class="el-icon-folder-opened"></i></el-col>
                    <el-col :span="20" class="fileCol">
                        <span class="import-tip top">{{errorText}}</span>
                        <el-input type="text" v-model="fileName" placeholder="选择本地文件"></el-input>
                        <input type="file" id="importInput" class="fileInput" @change="handleFileChange">
                        <span class="import-tip">注：请先<a
                                href="#" @click="handleDownloadTemplate">下载模板</a>，填写完后，再进行上传，文件大小不能超过5M。</span>
                    </el-col>
                </el-row>


            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="batchUploadVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleConfirmBatchUpload">确 定</el-button>
            </span>
        </el-dialog>
        <el-dialog class="creatDialog" :visible.sync="deleteVisible" width="460px">
            <span slot="title">
                <i class="el-icon-question"></i>删除热词
            </span>
            您确定要删除已选的{{multipleSelection.length}}个热词吗？如果删除将无法恢复。
            <span slot="footer" class="dialog-footer">
                <el-button @click="deleteVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleConfirmDelete">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import bus from '../common/bus';
    import common from '../common/common';
    export default {
        name: 'hotEntry',
        data() {
            return {
                cur_page:1,
                pagination: {
                    show: true,
                    total: 0,
                    pageIndex: 1,
                    pageSize: 10
                },
                dictionaryId:'',
                dictionaryName:'',
                queryKey: '',

                multipleSelection: [],
                deleteDisable:true,
                deleteVisible:false,
                createVisible:false,
                batchUploadVisible:false,
                createForm: {
                    tableData: [],
                    createRules: {
                        targetWord: [
                            { required: true, message: '目标词不能为空！', trigger: 'blur' }
                        ],
                    },
                },


                oldTargetWord:'',
                oldSourceWord:'',

                errorVisible:false,
                errorTitle:'',
                errorText:'',

                fileName:'',
                importFilePath:'',

                fullScreenLoading:null,
            }
        },
        props:{
        },
        components:{
        },
        created() {
            this.dictionaryName = this.$route.query.name;
            this.dictionaryId = this.$route.params.id;
            this.userInfo = JSON.parse(localStorage.getItem('USER_INFO'));
            let clintHeight = document.documentElement.clientHeight;
            this.height = clintHeight - 270;
            bus.$emit('contentTop', true);
            this.handleQueryEntryList();
        },
        computed: {
        },
        methods: {
            show(val){
                console.log(val);
            },
            /**
             * 查询热词列表
             * @param opt
             */
            handleQueryEntryList() {
                let data = $.extend({},{
                    currentPage:this.cur_page-1,
                    pageSize:this.pagination.pageSize,
                    dictionaryId:this.dictionaryId,
                })
                if(this.queryKey){
                    data.queryKey=this.queryKey
                }
                if(this.sortList){
                    data.sortList =this.sortList;
                }
                $.post(this.$baseUrl+'hotWord/queryEntryList.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum === '0000'){
                        this.createForm.tableData = res.returnObject.recordList;
                        this.pagination.total = res.returnObject.totalNumber;
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            /**
             * 处理添加热词
             */
            handleCreateEntry(){
                for (let i = 0; i < this.createForm.tableData.length; i++) {
                    let data = this.createForm.tableData[i];
                    if (data.isEdit || data.isAdd) {
                        this.errorVisible = true;
                        this.errorTitle = '提醒';
                        this.errorText = '请先保存正在编辑/新增的热词！';
                        return;
                    }
                    ;
                }
                ;
                let newData = {
                    sourceWord: '',
                    targetWord: '',
                    isAdd:true,
                };
                //添加新的行数
                this.createForm.tableData.unshift(newData);
            },

            /**
             * 处理复选
             * @param val
             */
            handleSelectionChange(val) {
                this.multipleSelection = val;
                this.deleteDisable = this.multipleSelection.length > 0 ? false : true;
            },
            /**
             * 处理复选框可选状态
             * @param row
             * @param index
             * @returns {boolean}
             */
            handleSelectable(row, index){
                let bReturn = false;
                bReturn = row.isAdd ? false : true;
                return bReturn;

            },
            /**
             * 处理更新
             */
            handleUpdate(){
                $.post(this.$baseUrl+`hotWord/updateEntry.json?dictionaryId=${this.dictionaryId}`).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.handleQueryEntryList();
                        this.$message.success('更新成功，词典生效时间请等待2分钟左右！');
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                })
            },
            /**
             * 下载热词热词模版
             */
            handleDownloadTemplate(){
                window.location.href = this.$baseUrl+'hotWord/downloadTemplate.html'
            },
            /**
             * 选择文件
             * @param res
             */
            handleFileChange(event){
                this.fileName = $('#importInput')[0].files[0].name;
            },
            /**
             * 处理批量上传
             */
            handleBatchUpload(){
                this.batchUploadVisible = true;
                $('#importInput').val('');
                this.fileName = '';
                this.errorText = '';
            },
            /**
             * 处理确认批量上传
             * @param index
             * @param row
             */
            handleConfirmBatchUpload(){
                let self = this;
                let oMyForm = new FormData();
                oMyForm.append("dictionaryId",this.dictionaryId);
                oMyForm.append("dictionaryType",2);
                oMyForm.append("file", $('#importInput')[0].files[0]);

                this.openFullScreenLoading('热词上传中');
                $.ajax({
                    url: this.$baseUrl+'hotWord/uploadEntryFile.json',
                    type: 'POST',
                    cache: false,
                    data:oMyForm,
                    dataType: "json",
                    headers : {'Content-Type':'multipart/form-data'},
                    processData: false,
                    contentType: false,
                    async: true,
                }).done(function(res) {
                    self.fullScreenLoading.close();
                    if(res.resultMessageEnum=='0000'){
                        self.batchUploadVisible = false;
                        self.$message.success('上传成功！');
                        self.handleQueryEntryList();
                    }else{
                        let errorMessageEnum = res.errorInfoList[0].errorMessageEnum;
                        if (errorMessageEnum == '090001' || errorMessageEnum == '090002' || errorMessageEnum == '090003'){
                            self.errorText = res.resultMessage;
                        }else{
                            self.errorText = res.errorInfoList[0].errorMessage;
                        }

                    }
                });
            },

            /**
             * 处理确认删除
             */
            handleConfirmDelete(){
                let data = [];
                if (this.multipleSelection.length > 0) {
                    this.multipleSelection.forEach(item=>{
                        data.push(item.id);
                    })
                };
                $.post(this.$baseUrl + 'hotWord/removeEntry.json', JSON.stringify(data)).then((res) => {
                    if (res.resultMessageEnum == '0000') {
                        this.deleteVisible = false;
                        this.handleQueryEntryList();
                        this.$message.success('删除热词成功！');
                    } else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },

            /**
             * 处理编辑
             * @param index
             * @param row
             */
            handleEdit(index,row){
                for (let i = 0; i < this.createForm.tableData.length; i++) {
                    let data = this.createForm.tableData[i];
                    if (data.isEdit || data.isAdd) {
                        this.errorVisible = true;
                        this.errorTitle = '提醒';
                        this.errorText = '请先保存正在编辑/新增的热词！';
                        return;
                    }
                    ;
                }
                ;
                this.oldTargetWord = row.targetWord;
                this.oldSourceWord = row.sourceWord;
                row.isEdit = true;
                this.$set(this.createForm.tableData,index,row);
            },
            /**
             * 处理取消编辑
             * @param index
             * @param row
             */
            handleCancelEdit(index,row){
                if (row.isAdd){
                    this.createForm.tableData.splice(index,1);
                } else {
                    row.targetWord = this.oldTargetWord;
                    row.sourceWord = this.oldSourceWord;
                    this.oldTargetWord = '';
                    this.oldSourceWord = '';
                    row.isEdit = false;
                    this.$set(this.createForm.tableData,index,row);
                };

            },
            /**
             * 处理确认编辑
             * @param index
             * @param row
             */
            handleConfirmEdit(index,row){
                this.$refs['createForm'].validate((valid) => {
                    if (valid) {
                        let  data = {
                            dictionaryId: this.dictionaryId,
                            dictionaryName: this.dictionaryName,
                            targetWord: row.targetWord,
                            sourceWord: row.sourceWord,
                        };
                        /*新增*/
                        if (row.isAdd){
                            $.post(this.$baseUrl + 'hotWord/addEntry.json', JSON.stringify(data)).then((res) => {
                                if (res.resultMessageEnum == '0000') {
                                    this.createVisible = false;
                                    this.handleQueryEntryList();
                                    this.$message.success('新增热词成功！');
                                } else {
                                    if (res.errorInfoList[0].errorMessageEnum == '090001'){
                                        this.errorVisible = true;
                                        this.errorTitle = '原有词冲突';
                                    } else if (res.errorInfoList[0].errorMessageEnum == '090002'){
                                        this.errorVisible = true;
                                        this.errorTitle = '原有词冲突';
                                    } else if (res.errorInfoList[0].errorMessageEnum == '090003'){
                                        this.errorVisible = true;
                                        this.errorTitle = '目标词冲突';
                                    }
                                    else {
                                        this.$message.error(res.errorInfoList[0].errorMessage);
                                    };
                                    this.errorText = res.resultMessage;
                                }
                            });
                        }
                        /*修改*/
                        else {
                            data = $.extend(data, {
                                id: row.id,
                                asrId: row.asrId,
                                asrEntryId: row.asrEntryId,
                            });
                            $.post(this.$baseUrl + 'hotWord/modifyEntry.json', JSON.stringify(data)).then((res) => {
                                if (res.resultMessageEnum == '0000') {
                                    this.handleCancelEdit(index,row);
                                    this.handleQueryEntryList();
                                    this.$message.success('修改成功！');
                                } else {
                                    if (res.errorInfoList[0].errorMessageEnum == '090001'){
                                        this.errorVisible = true;
                                        this.errorTitle = '原有词冲突';
                                    } else if (res.errorInfoList[0].errorMessageEnum == '090002'){
                                        this.errorVisible = true;
                                        this.errorTitle = '原有词冲突';
                                    } else if (res.errorInfoList[0].errorMessageEnum == '090003'){
                                        this.errorVisible = true;
                                        this.errorTitle = '目标词冲突';
                                    }
                                    else {
                                        this.$message.error(res.errorInfoList[0].errorMessage);
                                    };
                                    this.errorText = res.resultMessage;
                                }
                            });
                        };
                    } else {
                        return false;
                    }
                });

            },

            /**
             * 处理热词发布状态状态
             * @param row
             * @param column
             * @returns {*|string}
             */
            handleEntryStatus(row, column){
                return common.entryStatus(row.entryStatus);
            },

            /**
             * 处理分页导航
             * @param val
             */
            handleCurrentChange(val) {
                this.cur_page = val;
                this.handleQueryEntryList();
            },
            /**
             * 每页显示条数改变
             * @param val
             */
            handleSizeChange(val) {
                this.pagination.pageSize = val;
                this.handleQueryEntryList();
            },
            /**
             * 搜索
             * @returns {boolean}
             */
            search() {
                if(!this.queryKey){
                    this.$message.error("请输入关键字！");
                    return false;
                }
                this.cur_page=1;
                this.handleQueryEntryList();
            },
            /**
             * 搜索内容变化
             * @param val
             */
            searchChange(val){
                if(!val){
                    this.handleQueryEntryList();
                }
            },
            /**
             * 打开加载遮罩
             * @param text
             */
            openFullScreenLoading(text) {
                this.fullScreenLoading = this.$loading({
                    lock: true,
                    text: text + '...',
                    spinner: 'el-icon-loading',
                    background: 'rgba(0, 0, 0, 0.7)'
                });
            },
        },
        destroyed(){
            bus.$emit('contentTop', false);
        },
        watch:{
            viewVisible(curVal){
                if(!curVal){
                    bus.$emit('viewPlaying',true);
                }
            },
        },
    }

</script>

<style scoped lang="less">
    .dashboard-box {
        .el-col-4{
            width: 20%;
        }
        .el-col-14{
            width: 60%;
        }
        .el-col-10{
            width:40%;
        }
        .grid-con-icon {
            font-size:18px;
            width:36px;
            height:36px;
            border-radius: 10px;
            margin-left: 20px;
            text-align: center;
            line-height:36px;
            color: #fff;
        }
        .grid-con-1 .grid-con-icon {
            background:#E0F3FF;
            color: #29A0F6;
        }
        .grid-con-2 .grid-con-icon {
            background:#E5EAFE;
            color: #6758EB;
        }
        .grid-con-3 .grid-con-icon {
            background:#F4E8FF;
            color: #9C43F7;
        }
        .grid-con-4 .grid-con-icon {
            background:#FFEFD7;
            color: #FDB000;
        }
        .grid-con-5 .grid-con-icon {
            background:#D6FAF2;
            color: #2ED9BB;
        }
    }
    .grid-content {
        display: flex;
        align-items: center;
        height: 100px;
    }
    .grid-cont-right {
        flex: 1;
        text-align: center;
        font-size: 14px;
        color: #919FA9;
        text-align: center;
        padding:0;
        .grid-cont-right-tex{
            font-size: 12px;
            font-weight:500;
        }
        .grid-num {
            color: #4E5F6F;
            margin-right: 2px;
            font-size: 30px;
            font-weight: bold;
        }
    }
    .el-dropdown {
        cursor: pointer;
        color: #fcaf2d;
        width: inherit;
        text-align: right;
        padding-bottom: 10px;
    }
    .task-table-cantainer{
        background: #fff;
        color: #303133;
        border-radius: 5px;
    }
    .handle-input {
        width:240px;
        display: inline-block;
    }
    .tip-content{
        width:164px;
        padding:5px;
        line-height: 18px;
    }
    .handle-box {
        margin-bottom: 20px;
    }
    .el-table .cell{
        position: relative;
    }


    .handle-select {
        width: 120px;
    }
    .del-dialog-cnt{
        font-size: 16px;
        text-align: center
    }
    .table{
        width: 100%;
        font-size: 14px;
    }
    #file{
        position:absolute;
        width: 100%;
        height: 100%;
        left:0;
        top:0;
        opacity: 0;
    }
    .red{
        color: #ff0000;
    }
    .blue{
        color: #fea200;
    }
    .el-button+.el-button{
        margin-left: 0;
    }
    .import-pop-file{
        color: #409EFF;
        font-size:22px;
        line-height:33px;
    }
    .import-tip{
        font-size: 12px;
        color: #FF425C;
        margin-top: 5px;
        &.top{
            display: block;
            position: absolute;
            left:0;
            top: -25px;
        }
    }
    .fileCol{
        position: relative;
        .fileInput{
            cursor: pointer;
            position: absolute;
            top:0px;
            left: 0;
            opacity: 0;
            width: 100%;
            height: 32px;
        }
    }
</style>