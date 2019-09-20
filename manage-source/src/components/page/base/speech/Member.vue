<template>
    <div class="container-admin">
        <div class="admin-page">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>管理中心</el-breadcrumb-item>
                <el-breadcrumb-item>话术管理</el-breadcrumb-item>
                <el-breadcrumb-item>意图库管理</el-breadcrumb-item>
                <el-breadcrumb-item>用户意图</el-breadcrumb-item>
                <el-breadcrumb-item>查看用户意图</el-breadcrumb-item>
            </el-breadcrumb>
            <el-button class="back-btn" @click="handleBack">返回</el-button>
            <!-- <div>
                创建意图
            </div> -->
        </div>
        <div class="admin-body">
            <div class="speech-tab-pane">
                <div>
                    <el-row >
                        <el-form :inline="true" class="demo-form-inline">
                            <el-form-item label="关键词:" >
                                <el-input v-model="keyword" @change="searchChange" placeholder="ID/意图名称"></el-input>
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary" @click="onSearch">搜索</el-button>
                            </el-form-item>
                        </el-form>
                    </el-row>
                    <el-row style="padding-bottom:20px;">
                        <!-- <el-button type="primary" @click="addIntentVisible=true">新增</el-button> -->
                        <!-- <el-button type="primary" :disabled="disabled" @click="delIntentVisible=true">删除</el-button> -->
                        <el-button type="primary" :disabled="disabled" @click="createExportIntentionExcelFile">导出</el-button>
                        <!-- <el-button type="primary" @click="importIntentVisible=true">导入</el-button>
                        <el-button type="primary" style="float:right" :disabled="disabled" @click="releaseVisible=true">发布</el-button> -->
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
                                @sort-change="sortChange"
                                :data="intentTyData"
                                @selection-change="handleSelectionChange"
                                style="width: 100%;border-left:1px solid #ebeef5;">
                                <el-table-column 
                                    type="selection" 
                                    width="55" 
                                    align="center">
                                </el-table-column>
                                <el-table-column
                                    prop="id"
                                    width="240"
                                    label="ID">
                                </el-table-column>
                                <el-table-column
                                    prop="intentionName"
                                    label="意图名称">
                                </el-table-column>
                                <el-table-column
                                    sortable
                                    prop="createTime"
                                    width="180"
                                    label="更新时间">
                                </el-table-column>
                                <el-table-column
                                    width="100"
                                    label="操作">
                                    <template slot-scope="scope">
                                        <span class="operation-box">
                                            <el-button type="text" @click="handleView(scope.row,scope.$index)">查看</el-button>
                                        </span>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-col>
                    </el-row>
                    
                    
                    <div class="pagination" >
                        <el-pagination background @current-change="handleCurrentChange" 
                            layout="total, prev, pager, next,jumper"
                            :total="pagination.total"
                            :page-size="pagination.pageSize"
                            >
                        </el-pagination>
                    </div>
                </div>
                
            </div>
        </div>
    </div>
    
</template>

<script>
    import bus from '@/components/common/bus';
    export default {
        name: 'dashboard',
        data() {
            return {
                keyword:'',
                type:'3',
                fileName:'',
                industryId:'',
                multipleSelection:[],
                disabled:true,
                intentTyData:[],
                sortList:[],
                cur_page:1,
                validIndustryListData:[],
                activeIndex:0,
                addForm:{
                    intentionName:'',
                    industryType:''
                },
                addFormRules:{
                    intentionName:[
                        { required: true, message: '意图名称不能为空！'},
                    ],
                    industryType:[
                        { required: true, message: '请选择行业领域！'},
                    ],
                },
                selectOpt:[],
                pagination: {
                    show: true,
                    total: 0,
                    pageIndex: 1,
                    pageSize:20
                },
            }
        },

        computed: {
            
        },
        created(){
            if(this.$route.params.id){
                this.id = this.$route.params.id;
            }
           this.queryIntentionSpeechcraftManageList();
           this.queryValidIndustryList();
        },
        watch: {
            
        },
        methods: {
            handleBack(){
                this.$router.push('/speech?type=3');
            },
            onSearch(){
                this.activeIndex = 0;
                this.industryId = '';
                this.queryIntentionSpeechcraftManageList();
            },
            searchChange(val){
                if(!val){
                    this.queryIntentionSpeechcraftManageList();
                }
            },
            handleSwitchItem(item,index){
                this.activeIndex = index;
                this.industryId = item.id;

                if(this.industryId=='all'){
                    this.industryId = '';
                }

                this.queryIntentionSpeechcraftManageList();
            },
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
                this.queryIntentionSpeechcraftManageList();
            },
            handleView(row,index){
                this.$router.push(`/speech/yh/${row.id}`);
            },
            handleSelectionChange(val){
                this.multipleSelection=[];
                this.multipleSelection = val;
                if(this.multipleSelection.length){
                    this.disabled = false;
                }else{
                    this.disabled = true;
                }
            },
            // 分页导航
            handleCurrentChange(val) {
                this.cur_page = val;
                this.queryIntentionSpeechcraftManageList();
            },
            handleEdit(row,index){
                // this.$store.dispatch('setIntentData',row)
                this.$router.push(`/speech/hy/${row.id}`);
            },
            //查询用户意图列表
            queryIntentionSpeechcraftManageList(){
                let params = {
                    intentionType:this.type,
                    memberId:this.id,
                    currentPage:this.cur_page-1,
                    pageSize:this.pagination.pageSize
                };

                if(this.industryId){
                    params.industryId = this.industryId;
                }

                let keyword = this.keyword;
                if(keyword){
                    params.keyword=keyword;
                }
                if(this.sortList.length){
                    params.sortList = this.sortList;
                }
                if(this.intentionStatus){
                    params.intentionStatus = this.intentionStatus;
                }
                $.post(this.$baseUrl+'services/intention/queryIntentionSpeechcraftManageList.json',JSON.stringify(params)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.pagination.total = res.returnObject.totalNumber;
                        this.intentTyData = res.returnObject.recordList;
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            //创建意图导出Excel文件
            createExportIntentionExcelFile(){
                let ids = this.multipleSelection.map((item)=>{
                    return item.id;
                })
                let params = {
                    intentionType:this.type,
                    intentionIdList:ids
                };
                $.post(this.$baseUrl+'services/intention/createExportIntentionExcelFile.json',JSON.stringify(params)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.downloadFile(res.returnObject.filePath);
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            //下载Excel文件
            downloadFile(file){
                let params = {
                    filePath:file
                };
                window.location.href = this.$baseUrl+'services/file/downloadFile.html?filePath='+params.filePath;

            },
            // 得到所有有效的行业列表
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
        },
        destroyed(){
           
        }
    }

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
</style>
