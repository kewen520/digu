<template>
    <div class="speech-tab-pane">
        <div>
            <el-row >
                <el-form ref="searchForm" :model="searchForm" :inline="true">
                    <el-form-item label="关键词:" prop="queryKey">
                        <el-input clearable v-model="searchForm.queryKey" @change="handleSearchChange"
                                  @keyup.native.13="handleSearch" placeholder="词典名称/词典ID"></el-input>
                    </el-form-item>
                    <el-form-item label="操作人：" prop="memberIds">
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
                    <el-form-item prop="allManager">
                        <el-checkbox v-model="searchForm.allManager">全部</el-checkbox>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="handleReset('searchForm')">重置</el-button>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="handleSearch">搜索</el-button>
                    </el-form-item>
                </el-form>
            </el-row>
            <el-row style="padding-bottom:20px;">
                <el-button type="primary" :disabled="disabled" @click="deleteVisible=true">删除词典</el-button>
                <el-button type="primary" @click="addVisible=true">新增词典</el-button>
                <el-button type="primary" style="float:right" :disabled="disabled" @click="handlePublish">发布</el-button>
            </el-row>
            <el-row>
                <el-col :span="4" class="validIndustryList">
                    <span class="title">行业领域</span>
                    <ul class="validIndustryList-ul">
                        <li class="validIndustryList-li"
                            :class="{'active': activeIndex==index}"
                            v-for="(item,index) in validIndustryListData"
                            @click="handleSwitchItem(item,index)"
                            :key="item.id">
                            {{item.industryName}}
                        </li>
                    </ul>
                </el-col>
                <el-col :span="20">
                    <el-table
                            @sort-change="handleSortChange"
                            :height="height"
                            :data="tableData"
                            @selection-change="handleSelectionChange"
                            style="width: 100%;border-left:1px solid #ebeef5;">
                        <el-table-column type="selection" width="55" align="center"></el-table-column>
                        <el-table-column sortable prop="id" width="240" label="词典ID"></el-table-column>
                        <el-table-column sortable prop="dictionaryName" label="词典名称"></el-table-column>
                        <el-table-column sortable prop="editTime" width="180" label="更新时间"></el-table-column>
                        <el-table-column prop="editor" label="操作人" width="180"></el-table-column>
                        <el-table-column width="120" label="操作">
                            <template slot-scope="scope">
                                <span class="operation-box">
                                    <el-button type="text" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                                    <span class="line">|</span>
                                    <el-button type="text"
                                               @click="handleSetting(scope.$index, scope.row)">设置</el-button>
                                    <span class="line">|</span>
                                    <el-button
                                            v-if="scope.row.dictionaryStatus === 1 || scope.row.dictionaryStatus === 2"
                                            :disabled="scope.row.dictionaryStatus === 2" type="text"
                                            @click="handlePublish(scope.$index, scope.row)">发布</el-button>
                                    <el-button v-else :disabled="scope.row.dictionaryStatus === 4" type="text"
                                               @click="handleUpdate(scope.$index, scope.row)">更新</el-button>
                                </span>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-col>
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
        <!-- 新增 -->
        <el-dialog title="新增词典"  :visible.sync="addVisible" width="460px">
            <div class="addIntent-box">
                <el-form ref="addForm" :model="addForm" :rules="addFormRules" label-width="100px">
                    <el-form-item label="词典名称：" prop="dictionaryName">
                        <el-input v-model="addForm.dictionaryName" placeholder="请输入词典名称"></el-input>
                    </el-form-item>
                    <el-form-item label="行业领域：" prop="industryScope">
                        <el-select clearable v-model="addForm.industryScope" placeholder="请选择行业领域">
                            <el-option
                                v-for="item in selectOpt"
                                :key="item.id"
                                :label="item.industryName"
                                :value="item.id">
                            </el-option>
                        </el-select>
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
            您确定要删除已选的{{multipleSelection.length}}个热词吗？如果删除将无法恢复。
            您确定要删除已选热词词典？如果删除该词典，该词典下所有热词更新将被全部删除且无法恢复？
            <span slot="footer" class="dialog-footer">
                <el-button @click="deleteVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleConfirmDelete">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 设置 -->
        <el-dialog title="设置生效范围" class="creatDialog" :visible.sync="settingVisible" width="460px">
            <div class="addIntent-box">
                <el-form ref="settingForm" :inline="true" :rules="settingRules" :model="settingForm" label-width="100px">
                    <el-form-item prop="dictionaryName" label="词典名称" >
                        <el-input clearable v-model="settingForm.dictionaryName" placeholder="请输入词典名称"></el-input>
                    </el-form-item>
                    <el-form-item prop="speechcraftScope" label="行业领域" >
                        <el-select clearable v-model="settingForm.industryScope" placeholder="请选择行业领域">
                            <el-option
                                    v-for="item in selectOpt"
                                    :key="item.id"
                                    :label="item.industryName"
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
    export default {
        name: 'hotwordHy',
        data() {
            return {
                /*搜索相关*/
                searchForm: {
                    queryKey: '',
                    memberIds: [],
                    allManager:false,
                },
                keyword:'',
                type:'2',
                fileName:'',
                industryId:'',
                multipleSelection:[],
                disabled:true,
                tableData:[],
                sortList:[],
                cur_page:1,
                importIntentVisible:false,
                importEntenVisible:false,
                deleteDisable:true,
                deleteVisible:false,
                releaseOneVisible:false,
                addVisible:false,
                releaseRow:{},
                errorMsg:'',
                importFilePath:'',
                importFileLength:0,
                importFileErrorLength:0,
                validIndustryListData:[],
                activeIndex:0,
                addForm:{
                    dictionaryName:'',
                    industryScope:''
                },
                addFormRules:{
                    dictionaryName:[
                        { required: true, message: '词典名称不能为空！'},
                    ],
                    industryScope:[
                        { required: true, message: '行业领域不能为空！'},
                    ],
                },
                importForm:{
                    dictionaryName:'',
                    industryScope:''
                },
                importFormRules:{

                },
                selectOpt:[],
                managerList:[],
                pagination: {
                    show: true,
                    total: 0,
                    pageIndex: 1,
                    pageSize:10
                },

                fullScreenLoading:null,

                settingVisible:false,
                settingForm: {
                    id:'',
                    dictionaryName:'',
                    industryScope:'',
                },
                settingRules: {
                    dictionaryName: [
                        { required: true, message: '词典名称不能为空！', trigger: 'change' }
                    ],
                },

                height:0,
            }
        },

        computed: {
            
        },
        created() {
            let clintHeight = document.documentElement.clientHeight;
            this.height = clintHeight - 320;
            this.queryValidIndustryList();
            this.handleQueryAllManager();
            this.handleQueryDictionaryList();
        },
        watch: {
            
        },
        methods: {
            handleSearch(){
                if(!this.searchForm.queryKey){
                    this.$message.error("请输入关键字！");
                    return false;
                }
                this.activeIndex=0;
                this.industryId = '';
                this.handleQueryDictionaryList();
            },
            handleSearchChange(val){
                if(!val){
                    this.handleQueryDictionaryList();
                }
            },
            handleSwitchItem(item,index){
                this.activeIndex = index;
                this.industryId = item.id;

                if(this.industryId=='all'){
                    this.industryId = '';
                }

                this.handleQueryDictionaryList();

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
                this.$router.push(`/hotword/${row.id}/1`);
            },

            /**
             * 处理设置
             * @param index
             * @param row
             */
            handleSetting(index,row){
                this.settingForm.id = row.id;
                this.settingForm.dictionaryName = row.dictionaryName;
                this.settingForm.industryScope = row.industryScope ? row.industryScope: '';
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
                            dictionaryType:1,
                            id:this.settingForm.id,
                            dictionaryName: this.addForm.dictionaryName,
                            dictionaryName:this.settingForm.dictionaryName,
                            industryScope:this.settingForm.industryScope,
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
            handleConfirmAdd(formName){
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        let data = {
                            dictionaryType:1,
                            dictionaryName: this.addForm.dictionaryName,
                            industryScope : this.addForm.industryScope,
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
             * 查询所有有效的行业列表
             */
            queryValidIndustryList(){
                $.get(this.$baseUrl+'services/intention/queryValidIndustryList.json').then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        let data = JSON.parse(JSON.stringify(res.returnObject));

                        this.selectOpt = res.returnObject;
                        data.unshift({
                            id:'all',
                            industryName:'全部'
                        })

                        this.validIndustryListData = data;

                    }
                });
            },

            /**
             * 查询词典列表
             * @param opt
             */
            handleQueryDictionaryList(opt) {
                let data = $.extend({},{
                    dictionaryType:1,
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
                if (this.industryId){
                    data.industryId = this.industryId;
                } ;
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
           
        }
    }

</script>


<style scoped lang="less">
    .import-pop-file{
        width:100px;
        color: #409EFF;
        font-size:22px;
        line-height:33px;
        text-align:right;
        padding-right: 20px;
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
            position: absolute;
            top:0px;
            left: 0;
            opacity: 0;
        }
    }
    .validIndustryList{
        .title{
            height: 40px;
            line-height: 40px;
        }
        .validIndustryList-ul{
            .validIndustryList-li{
                border-bottom: none;
                &.active{
                    background-color: #E6F7FF;
                    border-right: 3px solid #1890FF;
                }
            }
        }
    }
    .operation-box{
        .line{
            color: #E8E8E8;
        }
    }
    .status-info{
        position: relative;
        padding-left: 10px;
        &:before{
            content: '';
            width: 5px;
            height: 5px;
            background-color: #909399;
            border-radius: 50%;
            position: absolute;
            left: 0;
            top:6px;
        }
    }
    .status-success{
        position: relative;
        padding-left: 10px;
        &:before{
            content: '';
            width: 5px;
            height: 5px;
            background-color: #67c23a;
            border-radius: 50%;
            position: absolute;
            left: 0;
            top:6px;
        }
    }
    .addIntent-box{
        .el-input,
        .el-select{
            width:310px;
        }
    }
</style>
