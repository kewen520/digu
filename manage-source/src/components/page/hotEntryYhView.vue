<template>
    <div class="container-admin">
        <div class="admin-page">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>管理中心</el-breadcrumb-item>
                <el-breadcrumb-item>热词管理</el-breadcrumb-item>
                <el-breadcrumb-item>用户词典</el-breadcrumb-item>
                <el-breadcrumb-item>查看词典</el-breadcrumb-item>
                <el-breadcrumb-item>查看</el-breadcrumb-item>
                <el-breadcrumb-item>查看词条</el-breadcrumb-item>
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
                                      placeholder="目标词"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="handleSearch">搜索</el-button>
                        </el-form-item>
                    </el-form>
                </el-row>

                <!--操作按钮-->
                <el-row style="padding-bottom:20px;" >
                    <el-col>
                        <el-button type="primary" :disabled="disabled" @click="handleCopy">复制</el-button>
                    </el-col>
                </el-row>

                <!--数据列表-->
                <el-row>
                    <el-table
                            :data="tableData"
                            class="table"
                            :height="height"
                            :pagination="pagination"
                            @selection-change="handleSelectionChange"
                            @sort-change="handleSortChange"
                            stripe
                            highlight-current-row
                    >
                        <el-table-column type="selection" width="50" align="center"></el-table-column>
                        <el-table-column label="目标词" prop="targetWord" width="200"></el-table-column>
                        <el-table-column label="原有词" prop="sourceWord"></el-table-column>
                        <el-table-column sortable prop="editTime" label="更新时间" width="180"></el-table-column>
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
        <el-dialog title="复制词条到行业词典"  :visible.sync="copyVisible" width="460px">
            <div class="addIntent-box">
                <el-form ref="copyForm" :model="copyForm" :rules="copyFormRules" label-width="100px">
                    <el-form-item label="行业领域：" prop="industryScope">
                        <el-select clearable v-model="copyForm.industryScope" placeholder="请选择行业领域" @change="queryDictionaryList(copyForm.industryScope)">
                            <el-option
                                    v-for="item in validIndustryListData"
                                    :key="item.id"
                                    :label="item.industryName"
                                    :value="item.id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="词典名称：" prop="dictionaryId">
                        <el-select clearable v-model="copyForm.dictionaryId" placeholder="请选择词典名称">
                            <el-option
                                    v-for="item in dictionaryListData"
                                    :key="item.id"
                                    :label="item.dictionaryName"
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
                dictionaryId:'',
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
                dictionaryListData:[],
                copyVisible:false,
                copyForm:{
                    dictionaryId:'',
                    industryScope:''
                },
                copyFormRules:{
                    dictionaryId:[
                        { required: true, message: '词典名称不能为空！'},
                    ],
                    industryScope:[
                        { required: true, message: '行业领域不能为空！'},
                    ],
                },

                errorVisible:false,
                errorTitle:'',
                errorText:'',

                height:0,

            }
        },
        created() {
            this.dictionaryId = this.$route.params.id;
            this.memberId = this.$route.params.memberId;
            let clintHeight = document.documentElement.clientHeight;
            this.height = clintHeight - 310;
            this.handleQueryEntryList();
        },
        computed: {},
        methods: {
            /**
             * 处理返回
             */
            handleBack(){
                this.$router.push(`/hotwordYh/${this.memberId}`);
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
                this.handleQueryEntryList();

            },
            /**
             * 处理搜索条件改变
             * @param val
             */
            handleSearchChange(val){
                if(!val){
                    this.handleQueryEntryList();
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
                this.handleQueryEntryList();
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
             * 查询热词列表
             * @param opt
             */
            handleQueryEntryList() {
                let data = $.extend({},{
                    currentPage:this.cur_page-1,
                    pageSize:this.pagination.pageSize,
                    dictionaryId:this.dictionaryId,
                })
                if(this.searchForm.queryKey){
                    data.queryKey=this.searchForm.queryKey
                }
                if(this.sortList){
                    data.sortList =this.sortList;
                }
                $.post(this.$baseUrl+'services/hotWord/queryEntryList.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum === '0000'){
                        this.tableData = res.returnObject.recordList;
                        this.pagination.total = res.returnObject.totalNumber;
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            /**
             * 处理复制词条
             * @param index
             * @param row
             */
            handleCopy(index, row) {
                this.queryValidIndustryList();
                this.copyVisible = true;
            },
            /**
             * 处理确认复制
             */
            handleConfirmCopy(formName){
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        let entryPOs = this.multipleSelection.map((item) => {
                            return item;
                        });
                        let data = {
                            dictionaryId: this.copyForm.dictionaryId,
                            industryScope: this.copyForm.industryScope,
                            entryPOs: entryPOs,
                        };
                        $.post(this.$baseUrl + 'services/hotWord/copyEntry.json', JSON.stringify(data)).then((res) => {
                            if (res.resultMessageEnum == '0000') {
                                this.copyVisible = false;
                                this.$message.success('复制词条成功！');
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
                    } else {
                        return false;
                    }
                });
            },
            /**
             * 查询行业词典列表
             */
            queryDictionaryList(industryScope) {
                let data = {
                    dictionaryType: 1,
                    industryScope: industryScope
                };
                $.post(this.$baseUrl + 'services/hotWord/queryDictionaryListByField.json', JSON.stringify(data)).then((res) => {
                    if (res.resultMessageEnum === '0000') {
                        this.dictionaryListData = res.returnObject;
                    } else {
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
