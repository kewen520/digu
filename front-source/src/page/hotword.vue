<template>
    <div class="table">
        <div class="content-box-top">
            <el-input v-model="queryKey" clearable placeholder="输入词典名称" @change="searchChange" class="handle-input mr10"></el-input>
            <el-button type="primary" icon="search" @click="search">搜索</el-button>
            <div class="content-box-top-right">
                <el-button type="primary" icon="iconfont icon-ico_new-task" @click="createVisible = true">新建</el-button>
            </div>
        </div>
        <el-card class="box-card repository-card">
            <div slot="header">
                <div style="display: inline">
                    <span>热词词典列表</span>
                </div>
                <div style="display: inline; float: right;">
                    <el-button :disabled="downloadDisable" type="primary" @click="handleDownload">下载</el-button>
                    <el-button :disabled="deleteDisable" type="primary" @click="deleteVisible = true">删除</el-button>

                </div>
            </div>

            <!--数据展示列表-->
            <div class="repository-box">
                <el-table
                          :data="tableData"
                          stripe
                          class="table"
                          ref="multipleTable"
                          :height="height"
                          :options="options"
                          :pagination="pagination"
                          @sort-change="sortChange"
                          @selection-change="handleSelectionChange"
                >
                    <el-table-column type="selection" width="50" align="center"></el-table-column>
                    <el-table-column prop="dictionaryName" label="词典名称"></el-table-column>
                    <el-table-column prop="editTime" label="更新时间" sortable width="200"></el-table-column>
                    <el-table-column prop="editor" label="操作人" sortable width="150"></el-table-column>
                    <el-table-column label="操作" width="150" align="center" fixed="right">
                        <template slot-scope="scope">
                            <el-button type="text" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                            <el-button type="text" @click="handleSetting(scope.$index, scope.row)">设置</el-button>
                            <span v-if="scope.row.dictionaryStatus === 1 || scope.row.dictionaryStatus === 2">
                                <el-button :disabled="scope.row.dictionaryStatus === 2" type="text" @click="handlePublish(scope.$index, scope.row)">发布</el-button>
                            </span>
                            <span v-else>
                                <el-button :disabled="scope.row.dictionaryStatus === 4" type="text" @click="handleUpdate(scope.$index, scope.row)">更新</el-button>
                            </span>
                        </template>
                    </el-table-column>
                </el-table>

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

        <!-- 新建弹出框 -->
        <el-dialog title="新增热词词典" class="creatDialog" :visible.sync="createVisible" width="460px">
            <div class="addIntent-box">
                <el-form ref="createForm" :inline="true" :rules="createRules" :model="createForm" label-width="100px">
                    <el-form-item prop="dictionaryName" label="词典名称" >
                        <el-input clearable v-model="createForm.dictionaryName" placeholder="请输入热词词典名称"></el-input>
                    </el-form-item>
                </el-form>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="createVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleCreateDictionary('createForm')">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 删除弹出框 -->
        <el-dialog class="creatDialog" :visible.sync="deleteVisible" width="460px">
            <span slot="title">
                <i class="el-icon-question"></i>删除热词词典
            </span>
            您确定要删除已选热词词典？如果删除该词典，该词典下所有词条更新均被删除。
            <span slot="footer" class="dialog-footer">
                <el-button @click="deleteVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleDelete">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 设置弹出框 -->
        <el-dialog title="设置热词词典" class="creatDialog" :visible.sync="settingVisible" width="460px">
            <div class="addIntent-box">
                <el-form ref="settingForm" :inline="true" :rules="settingRules" :model="settingForm" label-width="100px">
                    <el-form-item prop="dictionaryName" label="词典名称" >
                        <el-input clearable v-model="settingForm.dictionaryName" placeholder="请输入词典名称"></el-input>
                    </el-form-item>
                    <el-form-item prop="speechcraftScope" label="生效范围" >
                        <el-select clearable multiple collapse-tags v-model="settingForm.speechcraftScope" placeholder="请选择词典的生效话术范围">
                            <el-option
                                    v-for="item in speechcraftList"
                                    :key="item.id"
                                    :label="item.speechcraftName"
                                    :value="item.id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="settingVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleConfirmSetting('settingForm')">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import bus from '../common/bus';
    import common from '../common/common';
    export default {
        name: 'hot',
        data() {
            return {
                cur_page:1,
                pagination: {
                    show: true,
                    total: 0,
                    pageIndex: 1,
                    pageSize: 10
                },
                options: {
                    stripe: true, // 是否为斑马纹 table
                    loading: true, // 是否添加表格loading加载动画
                    highlightCurrentRow: true, // 是否支持当前行高亮显示
                    mutiSelect: true // 是否支持列表项选中功能
                },
                sortList:[],

                queryKey: '',

                tableData: [],

                multipleSelection: [],
                downloadDisable:true,
                deleteDisable:true,
                deleteVisible:false,
                createVisible:false,
                settingVisible:false,
                createForm: {
                    dictionaryName:'',
                },
                settingForm: {
                    id:'',
                    dictionaryName:'',
                    speechcraftScope:[],
                },
                createRules: {
                    dictionaryName: [
                        { required: true, message: '词典名称不能为空！', trigger: 'change' }
                    ],
                },
                settingRules: {
                    dictionaryName: [
                        { required: true, message: '词典名称不能为空！', trigger: 'change' }
                    ],
                    speechcraftScope: [
                        { required: true, message: '生效范围不能为空！', trigger: 'change' }
                    ],
                },
                speechcraftList:[],

                fullScreenLoading:null,
            }
        },
        props:{
        },
        components:{
        },
        created() {
            this.userInfo = JSON.parse(localStorage.getItem('USER_INFO'));
            let clintHeight = document.documentElement.clientHeight;
            this.height = clintHeight - 240;
            bus.$emit('contentTop', true);
            this.handleQueryDictionaryList();
        },
        computed: {
        },
        methods: {
            /**
             * 查询词典列表
             * @param opt
             */
            handleQueryDictionaryList(opt) {
                let data = $.extend({},{
                    currentPage:this.cur_page-1,
                    pageSize:this.pagination.pageSize
                },opt)
                if(this.queryKey){
                    data.queryKey=this.queryKey
                }
                if(this.sortList){
                    data.sortList =this.sortList;
                }
                $.post(this.$baseUrl+'hotWord/queryDictionaryList.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum === '0000'){
                        this.tableData = res.returnObject.recordList;
                        this.pagination.total = res.returnObject.totalNumber;
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            /**
             * 处理新建词典
             * @param formName
             */
            handleCreateDictionary(formName){
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        let data = {
                            dictionaryName: this.createForm.dictionaryName,
                        };
                        $.post(this.$baseUrl + 'hotWord/addDictionary.json', JSON.stringify(data)).then((res) => {
                            if (res.resultMessageEnum == '0000') {
                                this.createVisible = false;
                                this.handleQueryDictionaryList();
                                this.$message.success('新增词典成功！');
                            } else {
                                this.$message.error(res.errorInfoList[0].errorMessage);
                            }
                        });
                    } else {
                        return false;
                    }
                });
            },

            /**
             * 处理复选
             * @param val
             */
            handleSelectionChange(val) {
                this.multipleSelection = val;
                this.downloadDisable = this.multipleSelection.length > 0 ? false : true;
                this.deleteDisable = this.multipleSelection.length > 0 ? false : true;
            },

            /**
             * 处理下载
             * @param index
             * @param row
             */
            handleDownload(){
                let dictionaryIds = [];
                if(this.multipleSelection.length){
                    this.multipleSelection.forEach(item=>{
                        dictionaryIds.push(item.id);
                    })
                };
                let data={
                    dictionaryIds:dictionaryIds
                }
                $.post(this.$baseUrl+'file/createExportHotWordTextFile.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        window.location.href = this.$baseUrl+'file/downloadCompressFile.html?filePath='+res.returnObject.filePath;
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },

            /**
             * 处理删除
             * @param index
             * @param row
             */
            handleDelete(){
                let data = [];
                if (this.multipleSelection.length > 0) {
                    data = this.multipleSelection.map((item)=>{
                        return item.id;
                    });
                };
                this.openFullScreenLoading('词典删除中');
                $.post(this.$baseUrl + 'hotWord/removeDictionary.json', JSON.stringify(data)).then((res) => {
                    if (res.resultMessageEnum == '0000') {
                        this.deleteVisible = false;
                        this.handleQueryDictionaryList();
                        this.$message.success('删除词典成功！');
                    } else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                    this.fullScreenLoading.close();
                });
            },

            /**
             * 处理发布
             * @param index
             * @param row
             */
            handlePublish(index,row){
                let data = {
                    id: row.id,
                    dictionaryName: row.dictionaryName,
                };
                this.openFullScreenLoading('词典生效中');
                $.post(this.$baseUrl + 'hotWord/publishDictionary.json', JSON.stringify(data)).then((res) => {
                    if (res.resultMessageEnum == '0000') {
                        this.handleQueryDictionaryList();
                        this.$message.success('发布成功，词典生效时间请等待2分钟左右！');
                    } else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                    this.fullScreenLoading.close();
                });
            },

            /**
             * 处理更新
             * @param index
             * @param row
             */
            handleUpdate(index,row){
                let data = {
                    id: row.id,
                };
                this.openFullScreenLoading('词典生效中');
                $.post(this.$baseUrl + 'hotWord/updateDictionary.json', JSON.stringify(data)).then((res) => {
                    if (res.resultMessageEnum == '0000') {
                        this.handleQueryDictionaryList();
                        this.$message.success('更新成功，词典生效时间请等待2分钟左右！');
                    } else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                    this.fullScreenLoading.close();
                });
            },

            /**
             * 处理分页导航
             * @param val
             */
            handleCurrentChange(val) {
                this.cur_page = val;
                this.handleQueryDictionaryList();
            },
            /**
             * 每页显示条数改变
             * @param val
             */
            handleSizeChange(val) {
                this.pagination.pageSize = val;
                this.handleQueryDictionaryList();
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
                this.handleQueryDictionaryList();
            },
            /**
             * 搜索内容变化
             * @param val
             */
            searchChange(val){
                if(!val){
                    this.handleQueryDictionaryList();
                }
            },

            /**
             * 处理编辑
             * @param index
             * @param row
             */
            handleEdit(index,row){
                this.$router.push(`/hotword/${row.id}?name=${row.dictionaryName}`);
            },

            /**
             * 处理设置
             * @param index
             * @param row
             */
            handleSetting(index,row){
                this.querySpeechcraftList();
                this.settingForm.id = row.id;
                this.settingForm.dictionaryName = row.dictionaryName;
                this.settingForm.speechcraftScope = row.speechcraftScope ? row.speechcraftScope.split(',') : [];
                this.settingVisible = true;
            },

            /**
             * 处理确认设置
             * @param index
             * @param row
             */
            handleConfirmSetting(formName){
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        let data = {
                            id:this.settingForm.id,
                            dictionaryName:this.settingForm.dictionaryName,
                            speechcraftScope:this.settingForm.speechcraftScope ? this.settingForm.speechcraftScope.join(',') : '',
                        };
                        $.post(this.$baseUrl + 'hotWord/modifyDictionary.json', JSON.stringify(data)).then((res) => {
                            if (res.resultMessageEnum == '0000') {
                                this.settingVisible = false;
                                this.handleQueryDictionaryList();
                                this.$message.success('设置成功！');
                            } else {
                                this.$message.error(res.errorInfoList[0].errorMessage);
                            }
                        });
                    } else {
                        return false;
                    }
                });
            },

            /**
             * 排序
             * @param column
             */
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
                this.handleQueryDictionaryList();
            },

            /**
             *  查询话术列表
             */
            querySpeechcraftList() {
                $.get(this.$baseUrl+'hotWord/querySpeechcraftList.json?templateType=2').then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.speechcraftList = res.returnObject;
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
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
            }
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
    .addIntent-box{
        .el-input,
        .el-select{
            width:310px;
        }
    }
</style>