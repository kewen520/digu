<template>
    <div class="container-admin">
        <div class="admin-page">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>管理中心</el-breadcrumb-item>
                <el-breadcrumb-item>话术管理</el-breadcrumb-item>
                <el-breadcrumb-item>话术库管理</el-breadcrumb-item>
                <el-breadcrumb-item>用户话术库</el-breadcrumb-item>
                <el-breadcrumb-item>查看用户话术</el-breadcrumb-item>
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
                                <el-input v-model="queryKey" @change="searchChange" placeholder="话术名称"></el-input>
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary" @click="onSearch">搜索</el-button>
                            </el-form-item>
                        </el-form>
                    </el-row>
                    <el-row style="padding-bottom:20px;">
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
                                    prop="speechcraftName"
                                    label="话术名称">
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
                                            <span>｜</span>
                                            <el-button type="text" @click="handleCopy(scope.row,scope.$index)">复制</el-button>
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
        <!-- 加入黑名单 -->
        <el-dialog title="复制到通用话术库" :visible.sync="copyVisible" width="400px">
            <el-form ref="copyForm" @va :rules="copyFormRules" class="copyForm" :model="copyForm" label-width="100px">
                <el-form-item label="话术名称：" prop="newSpeechcraftName" >
                    <el-input @change="handleChange" v-model="copyForm.newSpeechcraftName" placeholder="请输入话术名称"></el-input>
                </el-form-item>
                <el-form-item label="行业领域：" prop="industryType">
                    <el-select v-model="copyForm.industryType" placeholder="请选择行业">
                        <el-option
                            v-for="item in validIndustryListData"
                            :key="item.id"
                            :label="item.industryName"
                            :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-checkbox v-model="copyForm.isCopySound" class="copySpeechRead">同时复制音频</el-checkbox>
                    <el-tooltip class="item" effect="light" popper-class="speech-tip" placement="right-start">
                        <div slot="content">该话术模版关联的音频也会自<br/>动复制到【通用音频库】中的<br/>【话术音频】文件夹下</div>
                        <i class="el-icon-question"></i>
                    </el-tooltip>
                </el-form-item>
                <el-form-item prop="soundConfigGroup" v-if="copyForm.isCopySound">
                    <el-select default-first-option filterable allow-create @change="handleChange" v-model="copyForm.soundConfigGroup" value-key="id" placeholder="选择音频存储文件夹" >
                        <el-option
                                v-for="item in soundConfigGroup"
                                :key="item.id"
                                :label="item.configGroupName"
                                :value="item">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer">
                <el-button @click="copyVisible = false">取 消</el-button>
                <el-button type="primary" @click="copySpeechcraft()">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import bus from '@/components/common/bus';
    export default {
        name: 'dashboard',
        data() {
            return {
                id:'',
                queryKey:'',
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
                copyForm:{
                    newSpeechcraftName:'',
                    industryType:'',
                    isCopySound:false,
                    soundConfigGroup:null,
                },
                soundConfigGroup:[],
                copyFormRules:{
                    newSpeechcraftName:[
                        { required: true, message: '话术名称不能为空！'},
                    ],
                    industryType:[
                        { required: true, message: '请选择行业领域！'},
                    ],
                    soundConfigGroup:[
                        { required: true, message: '选择“同时复制音频”选项时，音频存储文件夹不能为空！'},
                    ],

                },
                selectOpt:[],
                pagination: {
                    show: true,
                    total: 0,
                    pageIndex: 1,
                    pageSize:20
                },
                copyVisible:false,
                // 加载相关
                fullScreenLoading:null,

            }
        },

        computed: {
            
        },
        created(){
            if(this.$route.params.id){
                this.id = this.$route.params.id;
            }
           this.querySpeechcraftList();
           this.queryValidIndustryList();
        },
        watch: {
            
        },
        methods: {
            handleBack(){
                this.$router.push('/speech?type=2');
            },
            onSearch(){
                this.activeIndex = 0;
                this.industryId = '';
                this.querySpeechcraftList();
            },
            searchChange(val){
                if(!val){
                    this.querySpeechcraftList();
                }
            },
            handleSwitchItem(item,index){
                this.activeIndex = index;
                this.industryId = item.id;

                if(this.industryId=='all'){
                    this.industryId = '';
                }

                this.querySpeechcraftList();
            },
            handleChange(val){
                if (typeof val === 'string'){
                    this.soundConfigGroup.forEach((item,index) => {
                        if (item.id === 'duplicateid') {
                            item.configGroupName = val;
                        };
                    });
                    this.copyForm.soundConfigGroup = {id:'duplicateid',configGroupName:val,soundConfigGroupType:1};
                }
            },
            handleCopy(row,index){
                this.querySoundConfigGroupList();
                this.copyVisible = true;
                this.activeRow = row;
                this.copyForm.newSpeechcraftName = row.speechcraftName;
                this.copyForm.soundConfigGroup = {id:'duplicateid',configGroupName: this.copyForm.newSpeechcraftName,soundConfigGroupType: 1};
            },
            // 查询录音文件夹列表
            querySoundConfigGroupList(){
                $.get(this.$baseUrl+'services/sound/querySoundConfigGroupList.json?duplicateFlag=1&soundConfigGroupType=1').then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        if (res.returnObject) {
                            this.soundConfigGroup = res.returnObject;
                        }
                        this.soundConfigGroup.push({id:'duplicateid',configGroupName: this.copyForm.newSpeechcraftName,soundConfigGroupType: 1});
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                })
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
                this.querySpeechcraftList();
            },
            handleView(row,index){
                let url = `${baseUrl}flow/index.html?viewType=0&speechcraftId=${row.speechcraftId}&flowType=1`;
                window.open(url);
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
                this.querySpeechcraftList();
            },
            handleEdit(row,index){
                // this.$store.dispatch('setIntentData',row)
                this.$router.push(`/speech/hy/${row.id}`);
            },
            //查询话术列表
            querySpeechcraftList(){
                let params = {
                    templateType:'2',
                    memberId:this.id,
                    currentPage:this.cur_page-1,
                    pageSize:this.pagination.pageSize
                };

                if(this.industryId){
                    params.industryTypeList=[];
                    params.industryTypeList.push(this.industryId);
                }

                let queryKey = this.queryKey;
                if(queryKey){
                    params.queryKey=queryKey;
                }
                if(this.sortList.length){
                    params.sortList = this.sortList;
                }

                $.post(this.$baseUrl+'services/speechcraft/querySpeechcraftList.json',JSON.stringify(params)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.pagination.total = res.returnObject.totalNumber;
                        this.intentTyData = res.returnObject.recordList;
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
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
            copySpeechcraft(){
                let obj = {};
                obj = this.validIndustryListData.find((item)=>{
                    return item.id === this.copyForm.industryType;
                });
                
                this.$refs['copyForm'].validate((valid) => {
                    if (valid) {
                        /*this.openFullScreenLoading('复制中');*/
                        let params={
                            newTemplateType:'1',
                            industryType:obj.id,
                            industryName:obj.industryName,
                            speechcraftId:this.activeRow.speechcraftId,
                            newSpeechcraftName:this.copyForm.newSpeechcraftName,
                            copyOperationType:'2',
                            isCopySound:this.copyForm.isCopySound,
                            soundConfigGroup:this.copyForm.soundConfigGroup,
                        }

                        $.post(this.$baseUrl+'services/speechcraft/copySpeechcraft.json',JSON.stringify(params)).then((res)=>{
                            /*this.fullScreenLoading.close();*/
                            if(res.resultMessageEnum=='0000'){
                                if (this.copyForm.isCopySound){
                                    this.$message({
                                        type:'success',
                                        dangerouslyUseHTMLString: true,
                                        message: this.copyForm.soundConfigGroup.configGroupName + '音频复制成功，<a target="_blank" href="' + this.$baseHost + '/#/resource">点击查看</a>',
                                    });
                                } else {
                                    this.$message.success('复制成功！')
                                };
                                this.copyVisible = false;
                            }else{
                                this.$message.error(res.errorInfoList[0].errorMessage);
                            }
                        });
                    }
                })
            },
            /**
             * 打开加载遮罩
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
    .admin-page{
        padding-bottom:10px;
        position: relative;
        .back-btn{
            position: absolute;
            top:8px;
            right:40px;
        }
    }
    .copyForm{
        .el-select,
        .el-input{
            width: 240px;
        }
    }
</style>
