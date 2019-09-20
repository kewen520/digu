<template>
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
                <el-button type="primary" @click="addIntentVisible=true">新增</el-button>
                <el-button type="primary" :disabled="disabled" @click="delIntentVisible=true">删除</el-button>
                <el-button type="primary" :disabled="disabled" @click="createExportIntentionExcelFile">导出</el-button>
                <el-button type="primary" @click="importIntentVisible=true">导入</el-button>
                <el-button type="primary" style="float:right" :disabled="disabled" @click="releaseVisible=true">发布</el-button>
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
                        @filter-change="filterChange"
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
                            prop="intentionStatus"
                            column-key="intentionStatus" 
                            :filter-multiple="false"
                            :filters="[{text:'已发布',value:'2'},{text:'未发布',value:'0'}]"
                            label="状态">
                            <template slot-scope="scope">
                                <span class="status-success" v-if="scope.row.intentionStatus==2">已发布</span>
                                <span class="status-info" v-else>未发布</span>
                            </template>
                        </el-table-column>
                        <el-table-column
                            sortable
                            prop="createTime"
                            width="180"
                            label="更新时间">
                        </el-table-column>
                        <el-table-column
                            prop="creator"
                            label="操作人"
                            width="180">
                        </el-table-column>
                        <el-table-column
                            width="100"
                            label="操作">
                            <template slot-scope="scope">
                                <span class="operation-box">
                                    <el-button type="text" @click="handleEdit(scope.row,scope.$index)">编辑</el-button>
                                    <span class="line">|</span>
                                    <el-button type="text" :disabled="scope.row.intentionStatus==2" @click="handleRelease(scope.row,scope.$index)">发布</el-button>
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
        <!-- 删除 -->
        <el-dialog class="addQuestion" title="删除意图"  :visible.sync="delIntentVisible" width="400px">
            <div>
                您确定要删除已选中的{{this.multipleSelection.length}}个意图吗？
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="delIntentVisible = false">取 消</el-button>
                <el-button type="primary" @click="removeIntentionSpeechcraftList">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 导入提醒 -->
        <el-dialog title="导入新增意图"  :visible.sync="importEntenVisible" width="400px">
            <div>
                本次导入将新增{{importFileLength}}个意图，确定继续导入吗？
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="importEntenVisible = false">取 消</el-button>
                <el-button type="primary" @click="importIntentionExcelFileList">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 导入 -->
        <el-dialog title="导入行业意图"  :visible.sync="importIntentVisible" width="500px">
            <div>
                <el-row class="clearfix">
                    <el-col :span="7" class="import-pop-file"><i class="el-icon-tickets"></i></el-col>
                    <el-col :span="17" class="fileCol">
                        <span class="import-tip top">{{errorMsg}}</span>
                        <el-input type="text" :value="fileName" >
                        </el-input>
                        <input type="file" id="importInput" class="fileInput" placeholder="选择本地文件" @change="fileChange">
                        <span class="import-tip">注：格式excel、txt,文件大小必须控制在5M以内</span>
                    </el-col>
                    <el-form class="clearfix" ref="importForm" :model="importForm" :rules="importFormRules" label-width="100px">
                        <el-form-item label="行业领域：" prop="industryType">
                            <el-select v-model="importForm.industryType" placeholder="请选择行业领域" @change="changeValue" style="width:326px;">
                                <el-option
                                    v-for="item in selectOpt"
                                    :key="item.id"
                                    :label="item.industryName"
                                    :value="item.id">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-form>
                </el-row>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="importIntentVisible = false">取 消</el-button>
                <el-button type="primary" @click="importIntentEnter">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 批量发布 -->
        <el-dialog title="批量发布意图"  :visible.sync="releaseVisible" width="400px">
            <div>
                您确定要发布已选中的{{this.multipleSelection.length}}个意图吗？
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="releaseVisible = false">取 消</el-button>
                <el-button type="primary" @click="publishIntentionListStatus">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 单个发布 -->
        <el-dialog title="批量发布意图"  :visible.sync="releaseOneVisible" width="400px">
            <div>
                您确定要发布"{{this.releaseRow.intentionName}}"吗？
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="releaseOneVisible = false">取 消</el-button>
                <el-button type="primary" @click="publishIntentionListStatus('one')">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 新增 -->
        <el-dialog title="新增意图"  :visible.sync="addIntentVisible" width="400px">
            <div class="addIntent-box">
                <el-form ref="addForm" :model="addForm" :rules="addFormRules" label-width="100px">
                    <el-form-item label="意图名称：" prop="intentionName">
                        <el-input v-model="addForm.intentionName" placeholder="请输入意图名称"></el-input>
                    </el-form-item>
                    <el-form-item label="行业领域：" prop="industryType">
                        <el-select v-model="addForm.industryType" placeholder="请选择行业领域" @change="changeValue">
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
                <el-button @click="addIntentVisible = false">取 消</el-button>
                <el-button type="primary" @click="addIntentionSpeechcraft">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import bus from '@/components/common/bus';
    // import dateSet from '@/components/common/date';
    // import common from '@/components/common/common';
    export default {
        name: 'dashboard',
        data() {
            return {
                keyword:'',
                type:'2',
                fileName:'',
                industryId:'',
                multipleSelection:[],
                disabled:true,
                intentTyData:[],
                sortList:[],
                cur_page:1,
                delIntentVisible:false,
                importIntentVisible:false,
                importEntenVisible:false,
                releaseVisible:false,
                releaseOneVisible:false,
                addIntentVisible:false,
                releaseRow:{},
                errorMsg:'',
                importFilePath:'',
                importFileLength:0,
                importFileErrorLength:0,
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
                importForm:{
                    intentionName:'',
                    industryType:''
                },
                importFormRules:{

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
           this.queryIntentionSpeechcraftManageList();
           this.queryValidIndustryList();
        },
        watch: {
            
        },
        methods: {
            onSearch(){
                this.activeIndex=0;
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
            filterChange(filters){
                // const curItem = this.intentTyData.filter(item => {
                //     console.log(item)
                //     // return item.value === array[0];
                // })
                this.intentionStatus = filters.intentionStatus[0];

                this.queryIntentionSpeechcraftManageList();
            },
            changeValue(){

            },
            handleAdd(){
                this.$router.push(`/speech/hy?`);
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
            importIntentEnter(){

                if(this.importFileLength*1>0){
                    this.importIntentVisible = false;
                    this.importEntenVisible = true;  
                }else{
                    this.$message.error('请重新选择导入文件！');
                }
                
            },
            handleRelease(row,index){
                this.releaseOneVisible = true;
                this.releaseRow = row;
            },
            //查询行业意图列表
            queryIntentionSpeechcraftManageList(){
                let params = {
                    intentionType:this.type,
                    currentPage:this.cur_page-1,
                    pageSize:this.pagination.pageSize
                };

                params.industryId = this.industryId;

                let keyword = this.keyword;
                if(keyword){
                    params.keyword=keyword;
                }
                if(this.sortList){
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
            //删除意图
            removeIntentionSpeechcraftList(){
                let ids = this.multipleSelection.map((item)=>{
                    return item.id;
                })
                $.post(this.$baseUrl+'services/intention/removeIntentionSpeechcraftList.json',JSON.stringify(ids)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.delIntentVisible = false;
                        this.queryIntentionSpeechcraftManageList();
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            //导入通用意图
            importIntentionExcelFileList(){
                let self = this;
                var oMyForm = new FormData();
                oMyForm.append("intentionType",this.type);
                oMyForm.append("industryId",this.importForm.industryType);
                oMyForm.append("file", $('#importInput')[0].files[0]);

                $('#importInput').val('')
                $.ajax({
                    url: self.$baseUrl+'services/intention/importIntentionExcelFileList.json',
                    type: 'POST',
                    cache: false,
                    data:oMyForm,
                    dataType: "json",
                    headers : {'Content-Type':'multipart/form-data'},
                    processData: false,
                    contentType: false,
                    async: false
                }).done(function(res) {
                    if(res.resultMessageEnum=='0000'){
                        self.importEntenVisible = false;
                        self.$message.success(`语料上传成功${self.importFileLength}条！失败${self.importFileErrorLength}条！`)
                    }else{
                        self.errorMsg = res.errorInfoList[0].errorMessage;
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
            // 上传文件
            fileChange(res){
                let self = this;
                var oMyForm = new FormData();
                oMyForm.append("sourceType", 102);
                oMyForm.append("file", $('#importInput')[0].files[0]);
                this.fileName = $('#importInput').val();
                $.ajax({
                    url: self.$baseUrl+'services/common/uploadAnnexFile.json',
                    type: 'POST',
                    cache: false,
                    data:oMyForm,
                    dataType: "json",
                    headers : {'Content-Type':'multipart/form-data'},
                    processData: false,
                    contentType: false,
                    async: false
                }).done(function(res) {
                    if(res.resultMessageEnum=='0000'){
                        self.importFilePath = res.returnObject;
                        self.checkIntentionExcelFileList();
                    }else{
                        self.$message.error('上传失败！');
                    }
                })
            },
            checkIntentionExcelFileList(){
                let self = this;
                var oMyForm = new FormData();
                oMyForm.append("intentionType",this.type);
                oMyForm.append("file", $('#importInput')[0].files[0]);

                $.ajax({
                    url: self.$baseUrl+'services/intention/checkIntentionExcelFileList.json',
                    type: 'POST',
                    cache: false,
                    data:oMyForm,
                    dataType: "json",
                    headers : {'Content-Type':'multipart/form-data'},
                    processData: false,
                    contentType: false,
                    async: false
                }).done(function(res) {
                    if(res.resultMessageEnum=='0000'){
                        self.importFileLength = res.returnObject.correctRowNumber;
                        self.errorMsg = `成功导入${self.importFileLength}条。`;
                        // this.importFileErrorLength = res.returnObject
                    }else{
                        self.errorMsg = res.errorInfoList[0].errorMessage;
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
            //批量上线行业意图
            publishIntentionListStatus(type){
                let ids=[];
                
                if(type && type=='one'){
                    ids.push(this.releaseRow.id);
                }else{
                    ids = this.multipleSelection.map((item)=>{
                        return item.id;
                    })
                }
                $.post(this.$baseUrl+'services/intention/publishIntentionListStatus.json',JSON.stringify(ids)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.releaseVisible = false;
                        this.releaseOneVisible = false;
                        this.$message.success('发布成功！');
                        this.queryIntentionSpeechcraftManageList();
                    }
                });
            },
            //新增行业意图
            addIntentionSpeechcraft(){
                let params = {
                    intentionType:'2',
                    intentionStatus:'0',
                    industryType:this.addForm.industryType,
                    intentionName:this.addForm.intentionName
                };
                this.$refs['addForm'].validate((valid) => {
                    if (valid) {
                        $.post(this.$baseUrl+'services/intention/addIntentionSpeechcraft.json',JSON.stringify(params)).then((res)=>{
                            if(res.resultMessageEnum=='0000'){
                                this.$message.success('保存成功！');
                                this.addIntentVisible = false;
                                this.$refs['addForm'].resetFields();
                                this.queryIntentionSpeechcraftManageList();
                            }else{
                                this.$message.error(res.errorInfoList[0].errorMessage);
                            }
                        });
                    }
                });
            }
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
            width:248px;
        }
    }
</style>
