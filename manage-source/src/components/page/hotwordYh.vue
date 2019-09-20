<template>
    <div class="speech-tab-pane">
        <!--二级导航-->
        <el-tabs v-model="ypkActiveName" @tab-click="handleYpkClick">
            <el-tab-pane label="新建词典"  name="ypkFirst"></el-tab-pane>
            <el-tab-pane label="查看词典"  name="ypkSecond"></el-tab-pane>
        </el-tabs>
        <!--查询按钮-->
        <el-row>
            <el-form ref="searchForm" :model="searchForm" :inline="true">
                <el-form-item label="关键词:" prop="queryKey">
                    <el-input clearable v-model="searchForm.queryKey" @change="handleSearchChange"
                              @keyup.native.13="handleSearch"
                              :placeholder="ypkActiveName === 'ypkFirst' ? '词典名称/词典ID' : '创建用户'"></el-input>
                </el-form-item>
                <el-form-item v-if="ypkActiveName === 'ypkFirst'" label="操作人：" prop="memberIds">
                    <el-select clearable multiple collapse-tags v-model="searchForm.memberIds"
                               :disabled="searchForm.allManager" placeholder="请选择">
                        <el-option
                                v-for="item in managerList"
                                :key="item.id"
                                :label="item.loginName"
                                :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item v-if="ypkActiveName === 'ypkFirst'"prop="allManager">
                    <el-checkbox v-model="searchForm.allManager">全部</el-checkbox>
                </el-form-item>
                <el-form-item v-if="ypkActiveName === 'ypkFirst'">
                    <el-button @click="handleReset('searchForm')">重置</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleSearch">搜索</el-button>
                </el-form-item>
            </el-form>
        </el-row>
        <!--操作按钮-->
        <el-row style="padding-bottom:20px;" v-if="ypkActiveName=='ypkFirst'">
            <el-col>
                <el-button type="primary" :disabled="disabled" @click="deleteVisible = true" >删除词典</el-button>
                <el-button type="primary"  @click="handleAdd">新建词典</el-button>
                <el-button type="primary" style="float: right" :disabled="disabled" @click="handleBatchPublish">发布</el-button>
            </el-col>
        </el-row>

        <!--新建词典-->
        <el-row v-if="ypkActiveName=='ypkFirst'">
            <el-table
                    @sort-change="handleSortChange"
                    :data="tableData"
                    @selection-change="handleSelectionChange"
                    style="width: 100%;border-left:1px solid #ebeef5;">
                <el-table-column type="selection" width="55" align="center"></el-table-column>
                <el-table-column sortable prop="asrId" width="240" label="词典ID"></el-table-column>
                <el-table-column sortable prop="dictionaryName" label="词典名称"></el-table-column>
                <el-table-column sortable prop="editTime" width="180" label="更新时间"></el-table-column>
                <el-table-column prop="editor" label="操作人" width="180"></el-table-column>
                <el-table-column width="120" label="操作">
                    <template slot-scope="scope">
                    <span class="operation-box">
                        <el-button type="text" @click="handleEdit(scope.$index,scope.row)">编辑</el-button>
                        <span class="line">|</span>
                        <el-button type="text" @click="handleSetting(scope.$index, scope.row)">设置</el-button>
                        <span class="line">|</span>
                        <el-button v-if="scope.row.dictionaryStatus === 1 || scope.row.dictionaryStatus === 2"
                                   :disabled="scope.row.dictionaryStatus === 2" type="text"
                                   @click="handlePublish(scope.$index, scope.row)">发布</el-button>
                        <el-button v-else :disabled="scope.row.dictionaryStatus === 4" type="text"
                                   @click="handleUpdate(scope.$index, scope.row)">更新</el-button>
                    </span>
                    </template>
                </el-table-column>
            </el-table>
        </el-row>

        <!--查看词典-->
        <el-row v-else>
            <el-table stripe @sort-change="handleSortChange" :data="memberData" style="width: 100%;border-left:1px solid #ebeef5;">
                <el-table-column :key="Math.random()" prop="userName" label="创建用户"></el-table-column>
                <el-table-column :key="Math.random()" sortable prop="latestApplyTime" width="140"
                                 label="更新时间"></el-table-column>
                <el-table-column width="50" label="操作">
                    <template slot-scope="scope">
                        <el-button type="text" @click="handleView(scope.$index,scope.row)">查看</el-button>
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
        <!-- 新增 -->
        <el-dialog title="新增词典"  :visible.sync="addVisible" width="460px">
            <div class="addIntent-box">
                <el-form ref="addForm" :model="addForm" :rules="addFormRules" label-width="100px">
                    <el-form-item label="词典名称：" prop="dictionaryName">
                        <el-input v-model="addForm.dictionaryName" placeholder="请输入词典名称"></el-input>
                    </el-form-item>
                    <el-form-item label="生效范围：" prop="accountScope">
                        <el-select clearable multiple collapse-tags v-model="addForm.accountScope" placeholder="请选择用户"
                                   :disabled="addForm.allAccount" @change="handleQuerySpeechcraftList(addForm.accountScope)">
                            <el-option
                                    v-for="item in allMemberData"
                                    :key="item.id"
                                    :label="item.enterpriseName || item.accountName"
                                    :value="item.id">
                            </el-option>
                        </el-select>
                        <el-checkbox v-model="addForm.allAccount">全部</el-checkbox>
                    </el-form-item>
                    <el-form-item prop="speechcraftScope">
                        <el-select clearable multiple collapse-tags v-model="addForm.speechcraftScope"
                                   placeholder="请选用户创建的话术" :disabled="addForm.allSpeechcraft">
                            <el-option
                                    v-for="item in speechcraftData"
                                    :key="item.id"
                                    :label="item.speechcraftName"
                                    :value="item.id">
                            </el-option>
                        </el-select>
                        <el-checkbox v-model="addForm.allSpeechcraft">全部</el-checkbox>
                    </el-form-item>
                </el-form>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleConfirmAdd('addForm')">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 删除 -->
        <el-dialog class="creatDialog" :visible.sync="deleteVisible" width="460px">
            <span slot="title">
                <i class="el-icon-question"></i>删除热词词典
            </span>
            您确定要删除已选热词词典？如果删除该词典，该词典下所有热词更新将被全部删除且无法恢复？
            <span slot="footer" class="dialog-footer">
                <el-button @click="deleteVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleConfirmDelete">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 设置 -->
        <el-dialog title="设置生效范围" class="creatDialog" :visible.sync="settingVisible" width="460px">
            <div class="addIntent-box">
                <el-form ref="settingForm" :model="settingForm" :rules="settingRules" label-width="100px">
                    <el-form-item label="词典名称：" prop="dictionaryName">
                        <el-input v-model="settingForm.dictionaryName" placeholder="请输入词典名称"></el-input>
                    </el-form-item>
                    <el-form-item label="生效范围：" prop="accountScope">
                        <el-select clearable multiple collapse-tags v-model="settingForm.accountScope" placeholder="请选择用户"
                                   :disabled="settingForm.allAccount" @change="handleQuerySpeechcraftList(settingForm.accountScope)">
                            <el-option
                                    v-for="item in allMemberData"
                                    :key="item.id"
                                    :label="item.enterpriseName || item.accountName"
                                    :value="item.id">
                            </el-option>
                        </el-select>
                        <el-checkbox v-model="settingForm.allAccount">全部</el-checkbox>
                    </el-form-item>
                    <el-form-item prop="speechcraftScope">
                        <el-select clearable multiple collapse-tags v-model="settingForm.speechcraftScope"
                                   placeholder="请选用户创建的话术" :disabled="settingForm.allSpeechcraft">
                            <el-option
                                    v-for="item in speechcraftData"
                                    :key="item.id"
                                    :label="item.speechcraftName"
                                    :value="item.id">
                            </el-option>
                        </el-select>
                        <el-checkbox v-model="settingForm.allSpeechcraft">全部</el-checkbox>
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
    import hyHotword from './hotwordHy';
    export default {
        name: 'hotwordYh',
        components: {
            hyHotword,
        },
        data() {
            let validateAccountScope = (rule, value, callback) => {
                if (!this.addForm.allAccount && value.length === 0) {
                    callback(new Error('生效范围不能为空！'));
                } else {
                    callback();
                }
            };
            let validateSpeechcraftScope = (rule, value, callback) => {
                if (!this.addForm.allSpeechcraft && value.length === 0) {
                    callback(new Error('生效范围不能为空！'));
                } else {
                    callback();
                }
            };
            return {
                active:1,
                /*导航相关*/
                ypkActiveName: 'ypkFirst',
                /*搜索相关*/
                searchForm: {
                    queryKey: '',
                    memberIds: [],
                    allManager:false,
                },
                /*对话框显示相关*/
                disabled:true,
                deleteVisible:false,
                addVisible:false,
                /*复选相关*/
                multipleSelection: [],
                selectable:false,
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
                memberData:[],
                allMemberData:[],
                speechcraftData:[],

                addForm:{
                    dictionaryName:'',
                    accountScope:[],
                    speechcraftScope:[],
                    allAccount:true,
                    allSpeechcraft:true,
                },
                addFormRules:{
                    dictionaryName:[
                        { required: true, message: '词典名称不能为空！'},
                    ],
                    accountScope:[
                        { validator: validateAccountScope, trigger: 'blur'},
                    ],
                    speechcraftScope:[
                        { validator: validateSpeechcraftScope, trigger: 'blur'},
                    ],
                },

                fullScreenLoading:null,
                managerList:[],
                settingVisible:false,
                settingForm: {
                    id:'',
                    dictionaryName:'',
                    accountScope:[],
                    speechcraftScope:[],
                    allAccount:false,
                    allSpeechcraft:false,
                },
                settingRules: {
                    dictionaryName:[
                        { required: true, message: '词典名称不能为空！'},
                    ],
                    accountScope:[
                        { validator: validateAccountScope, trigger: 'blur'},
                    ],
                    speechcraftScope:[
                        { validator: validateSpeechcraftScope, trigger: 'blur'},
                    ],
                },

                height:0,

            }
        },
        created() {
            let clintHeight = document.documentElement.clientHeight;
            this.height = clintHeight - 320;
            this.handleQueryAllManager();
            this.handleQueryDictionaryList();
            this.active = this.$route.query.active || '1';
            // 二级导航
            switch (this.active) {
                case '1':
                    this.ypkActiveName = 'ypkFirst';
                    this.$emit('soundTxt','新建词典');
                    break;
                case '2':
                    this.ypkActiveName = 'ypkSecond';
                    this.$emit('soundTxt','查看词典');
                    this.handleQueryMemberList();
                    break;
            }
        },
        computed: {},
        methods: {
            /*导航相关*/
            /**
             * 二级导航tab点击
             * @param type
             */
            handleYpkClick(tab) {
                this.sortList = [];
                this.pagination.pageSize = 10;
                this.handleReset('searchForm');
                switch (tab.name) {
                    case 'ypkFirst':
                        this.$emit('soundTxt','新建词典');
                        this.$router.push({query: {type: 2, active: '1'}});
                        break;
                    case 'ypkSecond':
                        this.$emit('soundTxt','查看词典');
                        this.$router.push({query: {type: 2, active: '2'}});
                        this.handleQueryMemberList();
                        break;
                }
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
                if (this.ypkActiveName=='ypkFirst') {
                    this.handleQueryDictionaryList();
                } else if(this.ypkActiveName=='ypkSecond'){
                    this.handleQueryMemberList();
                };

            },
            handleSearchChange(val){
                if(!val){
                    if (this.ypkActiveName=='ypkFirst') {
                        this.handleQueryDictionaryList();
                    } else if(this.ypkActiveName=='ypkSecond'){
                        this.handleQueryMemberList();
                    };
                }
            },
            /**
             * 处理重置
             */
            handleReset(formName) {
                this.$refs[formName].resetFields();
                this.handleQueryDictionaryList();
            },
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
             * 处理编辑
             * @param index
             * @param row
             */
            handleEdit(index,row){
                this.$router.push(`/hotword/${row.id}/2`);
            },

            /**
             * 处理设置
             * @param index
             * @param row
             */
            handleSetting(index,row){
                this.settingVisible = true;
                this.settingForm.id = row.id;
                this.settingForm.dictionaryName = row.dictionaryName;
                this.settingForm.allAccount = !row.accountScope ? true : false;
                this.settingForm.allSpeechcraft = !row.speechcraftScope ? true : false;
                this.settingForm.accountScope = row.accountScope ? row.accountScope.split(',') : [];
                this.settingForm.speechcraftScope = row.speechcraftScope ? row.speechcraftScope.split(',') : [];
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
                            dictionaryType: 3,
                            id: this.settingForm.id,
                            dictionaryName: this.settingForm.dictionaryName,
                            accountScope: !this.settingForm.allAccount && this.settingForm.accountScope ? this.settingForm.accountScope.join(',') : '',
                            speechcraftScope: !this.settingForm.allSpeechcraft && this.settingForm.speechcraftScope ? this.settingForm.speechcraftScope.join(',') : ''
                        };
                        $.post(this.$baseUrl + 'services/hotWord/modifyDictionary.json', JSON.stringify(data)).then((res) => {
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
             * 处理发布
             * @param index
             * @param row
             */
            handlePublish(index,row){
                let data = [];
                if (row){
                    data.push(row.id)
                } else {
                    data = this.multipleSelection.map((item)=>{
                        return item.id;
                    });
                };
                this.openFullScreenLoading('词典生效中');
                $.post(this.$baseUrl + 'services/hotWord/publishDictionary.json', JSON.stringify(data)).then((res) => {
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
             * 处理批量发布
             */
            handleBatchPublish(){
                let data = this.multipleSelection.map((item) => {
                    return item.id;
                });
                this.openFullScreenLoading('词典生效中');
                $.post(this.$baseUrl + 'services/hotWord/publishDictionary.json', JSON.stringify(data)).then((res) => {
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
                $.post(this.$baseUrl + 'services/hotWord/updateDictionary.json', JSON.stringify(data)).then((res) => {
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
             * 处理删除
             */
            handleConfirmDelete(){
                let data = [];
                if (this.multipleSelection.length > 0) {
                    this.multipleSelection.forEach(item=>{
                        data.push(item.id);
                    })
                };
                this.openFullScreenLoading('词典删除中');
                $.post(this.$baseUrl + 'services/hotWord/removeDictionary.json', JSON.stringify(data)).then((res) => {
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
             * 处理新增
             */
            handleAdd(){
                this.handleQueryAllMemberList();
                this.addVisible = true;
            },
            /**
             * 处理新增
             */
            handleConfirmAdd(formName){
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        let data = {
                            dictionaryType: 3,
                            dictionaryName: this.addForm.dictionaryName,
                            accountScope: !this.addForm.allAccount && this.addForm.accountScope ? this.addForm.accountScope.join(',') : '',
                            speechcraftScope: !this.addForm.allSpeechcraft && this.addForm.speechcraftScope ? this.addForm.speechcraftScope.join(',') : ''
                        };
                        $.post(this.$baseUrl + 'services/hotWord/addDictionary.json', JSON.stringify(data)).then((res) => {
                            if (res.resultMessageEnum == '0000') {
                                this.addVisible = false;
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
             * 查看用户词典
             * @param rows
             * @param index
             */
            handleView(index, row) {
                this.$router.push(`/hotwordYh/${row.memberId}`);
            },
            /**
             * 查询词典列表
             * @param opt
             */
            handleQueryDictionaryList(opt) {
                let data = $.extend({},{
                    dictionaryType:3,
                    currentPage:this.cur_page-1,
                    pageSize:this.pagination.pageSize
                },opt)

                if(this.searchForm.queryKey){
                    data.queryKey=this.searchForm.queryKey
                }
                if(this.sortList){
                    data.sortList =this.sortList;
                }
                if (!this.searchForm.allManager){
                    data.memberIds = this.searchForm.memberIds;
                } else {
                    data.memberIds = [];
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
             * 查询所有的管理员
             */
            handleQueryAllManager:function () {
                $.get(this.$baseUrl+'services/manager/getManagerList.json').then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        if(res.returnObject && res.returnObject.length){
                            this.managerList = res.returnObject;
                        }
                    } else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            /**
             *查询会员列表
             */
            handleQueryMemberList() {
                let params = {
                    currentPage: this.cur_page - 1,
                    pageSize: this.pagination.pageSize
                };

                if (this.searchForm.queryKey) {
                    params.queryKey = this.searchForm.queryKey;
                }
                if (this.sortList.length) {
                    params.sortList = this.sortList;
                }

                $.post(this.$baseUrl + 'services/member/queryMemberList.json', JSON.stringify(params)).then((res) => {
                    if (res.resultMessageEnum == '0000') {
                        this.pagination.total = res.returnObject.totalNumber;
                        this.memberData = res.returnObject.recordList;
                        this.memberData.filter((item) => {
                            item.userName = item.enterpriseName || item.accountName;
                        })
                    } else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            /**
             *查询所有会员列表
             */
            handleQueryAllMemberList() {
                $.get(this.$baseUrl + 'services/member/queryAllMemberList.json').then((res) => {
                    if (res.resultMessageEnum == '0000') {
                        this.allMemberData = res.returnObject;
                    } else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            /**
             *查询所有会员列表
             */
            handleQuerySpeechcraftList(memberIds) {
                let data = memberIds ? memberIds : [];

                $.post(this.$baseUrl + 'services/speechcraft/querySpeechcraftListByMemberIds.json', JSON.stringify(data)).then((res) => {
                    if (res.resultMessageEnum == '0000') {
                        this.speechcraftData = res.returnObject;
                    } else {
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
        watch: {
        }
    };


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
    .addIntent-box{
        .el-input,
        .el-select{
            width:248px;
        }
    }
    .el-form-item__content{
        .el-checkbox{
            margin: 0 0 0 10px;
        }
    }
</style>
