<template>
    <div class="container-admin">
        <div class="admin-page">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>管理中心</el-breadcrumb-item>
                <el-breadcrumb-item>热词管理</el-breadcrumb-item>
                <el-breadcrumb-item>用户词典</el-breadcrumb-item>
                <el-breadcrumb-item>查看词典</el-breadcrumb-item>
                <el-breadcrumb-item>查看</el-breadcrumb-item>
            </el-breadcrumb>
            <el-button class="back-btn" @click="handleBack">返回</el-button>
        </div>
        <div class="admin-body">
            <div class="speech-tab-pane">
                <!--查询按钮-->
                <el-row>
                    <el-form ref="searchForm" :model="searchForm" :inline="true">
                        <el-form-item label="关键词:" prop="queryKey">
                            <el-input clearable v-model="searchForm.queryKey" @change="handleSearchChange"
                                      @keyup.native.13="handleSearch"
                                      placeholder="词典名称/词典ID"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="handleSearch">搜索</el-button>
                        </el-form-item>
                    </el-form>
                </el-row>

                <!--操作按钮-->
                <el-row style="padding-bottom:20px;" >
                    <el-col>
                        <el-button type="primary" :disabled="disabled" @click="handleDownload">下载词库</el-button>
                    </el-col>
                </el-row>

                <!--数据列表-->
                <el-row>
                    <el-table
                            @sort-change="handleSortChange"
                            :data="tableData"
                            :height="height"
                            @selection-change="handleSelectionChange"
                            style="width: 100%;border-left:1px solid #ebeef5;">
                        <el-table-column type="selection" width="55" align="center"></el-table-column>
                        <el-table-column sortable prop="asrId" width="240" label="词典ID"></el-table-column>
                        <el-table-column sortable prop="dictionaryName" label="词典名称"></el-table-column>
                        <el-table-column sortable prop="asrId" width="180" label="App Key" ></el-table-column>
                        <el-table-column sortable prop="editTime" width="180" label="更新时间"></el-table-column>
                        <el-table-column width="120" label="操作">
                            <template slot-scope="scope">
                    <span class="operation-box">
                        <el-button type="text" @click="handleView(scope.$index,scope.row)">查看</el-button>
                        <span class="line">|</span>
                        <el-button type="text" @click="handleCopy(scope.$index, scope.row)">复制</el-button>
                    </span>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-row>

                <!--分页导航-->
                <div class="pagination" >
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
        </div>
        <!-- 复制词典 -->
        <el-dialog title="复制词典到行业词典"  :visible.sync="copyVisible" width="460px">
            <div class="addIntent-box">
                <el-form ref="copyForm" :model="copyForm" :rules="copyFormRules" label-width="100px">
                    <el-form-item label="词典名称：" prop="dictionaryName">
                        <el-input v-model="copyForm.dictionaryName" placeholder="请输入词典名称"></el-input>
                    </el-form-item>
                    <el-form-item label="行业领域：" prop="industryScope">
                        <el-select clearable v-model="copyForm.industryScope" placeholder="请选择行业领域">
                            <el-option
                                    v-for="item in validIndustryListData"
                                    :key="item.id"
                                    :label="item.industryName"
                                    :value="item.id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="copyVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleConfirmCopy('copyForm')">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import bus from '../common/bus';
    import common from '../common/common';
    export default {
        name: 'hotwordYhView',
        components: {
        },
        data() {
            return {
                memberId:'',
                /*搜索相关*/
                searchForm: {
                    queryKey: '',
                },
                /*对话框显示相关*/
                disabled:true,
                /*复选相关*/
                multipleSelection: [],
                /*排序相关*/
                sortList: [],
                /*分页导航相关*/
                cur_page: 1,
                pagination: {
                    show: true,
                    total: 0,
                    pageIndex: 1,
                    pageSize: 10
                },
                /*杂项*/
                tableData:[],

                fullScreenLoading:null,

                validIndustryListData:[],
                copyVisible:false,
                copyForm:{
                    dictionaryId:'',
                    dictionaryName:'',
                    industryScope:''
                },
                copyFormRules:{
                    dictionaryName:[
                        { required: true, message: '词典名称不能为空！'},
                    ],
                    industryScope:[
                        { required: true, message: '行业领域不能为空！'},
                    ],
                },

                height:0,

            }
        },
        created() {
            this.memberId = this.$route.params.id;
            let clintHeight = document.documentElement.clientHeight;
            this.height = clintHeight - 310;
            this.handleQueryDictionaryList();
        },
        computed: {},
        methods: {
            /**
             * 处理返回
             */
            handleBack(){
                this.$router.push('/hotword?type=2&active=2');
            },
            /**
             * 处理搜索
             * @returns {boolean}
             */
            handleSearch(){
                if(!this.searchForm.queryKey){
                    this.$message.error("请输入关键字！");
                    return false;
                }
                this.handleQueryDictionaryList();

            },
            /**
             * 处理搜索条件改变
             * @param val
             */
            handleSearchChange(val){
                if(!val){
                    this.handleQueryDictionaryList();
                }
            },
            /**
             * 处理排序
             * @param column
             */
            handleSortChange(column){
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
             * 处理复选
             * @param val
             */
            handleSelectionChange(val){
                this.multipleSelection=[];
                this.multipleSelection = val;
                if(this.multipleSelection.length){
                    this.disabled = false;
                }else{
                    this.disabled = true;
                }
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
             * 查询词典列表
             * @param opt
             */
            handleQueryDictionaryList(opt) {
                let data = $.extend({},{
                    dictionaryStatuses:[2,4],
                    dictionaryType:2,
                    currentPage:this.cur_page-1,
                    pageSize:this.pagination.pageSize
                },opt)

                if(this.searchForm.queryKey){
                    data.queryKey=this.searchForm.queryKey
                }
                if(this.sortList){
                    data.sortList =this.sortList;
                }
                if (this.memberId){
                    data.memberIds = [this.memberId];
                }
                $.post(this.$baseUrl+'services/hotWord/queryDictionaryList.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum === '0000'){
                        this.tableData = res.returnObject.recordList;
                        this.pagination.total = res.returnObject.totalNumber;
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            /**
             * 处理查看词条
             * @param index
             * @param row
             */
            handleView(index, row) {
                this.$router.push(`/hotwordYhView/${row.id}/${this.memberId}`);
            },
            /**
             * 处理复制词典
             * @param index
             * @param row
             */
            handleCopy(index, row) {
                this.copyForm.dictionaryId = row.id;
                this.copyForm.dictionaryName = row.dictionaryName;
                this.copyForm.industryScope = row.industryScope;
                this.queryValidIndustryList();
                this.copyVisible = true;
            },
            /**
             * 处理确认复制
             */
            handleConfirmCopy(formName){
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        let data = {
                            id: this.copyForm.dictionaryId,
                            dictionaryName: this.copyForm.dictionaryName,
                            industryScope: this.copyForm.industryScope
                        };
                        $.post(this.$baseUrl + 'services/hotWord/copyDictionary.json', JSON.stringify(data)).then((res) => {
                            if (res.resultMessageEnum == '0000') {
                                this.copyVisible = false;
                                this.$message.success('复制词典成功！');
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
                $.post(this.$baseUrl+'services/file/createExportHotWordTextFile.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        window.location.href = this.$baseUrl+'services/file/downloadCompressFile.html?filePath='+res.returnObject.filePath;
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            /**
             * 查询所有有效的行业列表
             */
            queryValidIndustryList(){
                $.get(this.$baseUrl+'services/intention/queryValidIndustryList.json').then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.validIndustryListData = res.returnObject;
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
        watch: {
        }
    };


</script>

<style scoped lang="less">
    .admin-page{
        padding-bottom:10px;
        position: relative;
        .back-btn{
            position: absolute;
            top:8px;
            right:40px;
        }
    }
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
    .addIntent-box{
        .el-input,
        .el-select{
            width:310px;
        }
    }
    .el-form-item__content{
        .el-checkbox{
            margin: 0 0 0 10px;
        }
    }
</style>
