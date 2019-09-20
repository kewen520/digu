<template>
    <div class="container-admin">
        <div class="admin-page">
            <el-row>
                <el-col :span="20">
                    <el-breadcrumb separator="/">
                        <el-breadcrumb-item>管理中心</el-breadcrumb-item>
                        <el-breadcrumb-item>知识库管理</el-breadcrumb-item>
                        <el-breadcrumb-item>用户知识库</el-breadcrumb-item>
                        <el-breadcrumb-item>查看用户知识库</el-breadcrumb-item>
                        <el-breadcrumb-item v-if="page_show_level > 1">问答对列表</el-breadcrumb-item>
                        <el-breadcrumb-item v-if="page_show_level > 2">查看问答对</el-breadcrumb-item>
                    </el-breadcrumb>
               </el-col>
                <el-col :span="4">
                    <i style="padding-right: 10px;float: right;padding-bottom: 10px">
                        <el-button v-if="page_show_level == 1" @click="goGengal">返回</el-button>
                        <el-button v-if="page_show_level == 2" @click="ddReturn">返回</el-button>
                        <el-button v-if="page_show_level == 3">返回</el-button>
                    </i>
                </el-col>
            </el-row>
        </div>
        <div class="admin-body">
            <el-tabs>
                <!--<el-tab-pane label="配置知识库"></el-tab-pane>-->
            </el-tabs>
            <!-- 查看用户知识库 start -->
            <el-row v-if="page_show_level == 1">
                <el-col>
                    <el-form :inline="true" class="w-form-inline">
                        <el-form-item label="关键词：">
                        <el-input clearable v-model="queryKey"
                                  placeholder="知识库名称"  @keyup.native.13="onSearch"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="onSearch">搜索</el-button>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
            <el-row v-if="page_show_level == 1">
                <el-row>
                    <el-button @click="createExportKnowledgeItemExcelFileByGroupIds" :disabled="!selectGroupList.length">导出</el-button>
                </el-row>
            </el-row>
            <el-row class="success" v-if="page_show_level == 1">
                <el-col :span="5">
                    <div class="repository-menu-box" >
                        <div class="repository-menu-top">知识库分类</div>
                        <div class="repository-menu">
                            <el-menu default-active="DEL1" class="repository-menu">
                                <el-menu-item v-for="item in knowledgeTypeList" :index="item.id"  :key="item.id" @click="menuItemClick" class="repository-menu-item">
                                    <span slot="title">{{item.typeName}}</span>
                                </el-menu-item>
                            </el-menu>
                        </div>
                    </div>
                    <!--<div style="text-align:center;font-size:16px;"> 知识库分类</div>
                    <el-menu default-active="DEL1" class="repository-menu">
                        <el-menu-item v-for="item in knowledgeTypeList" :index="item.id"  :key="item.id" @click="menuItemClick" class="repository-menu-item">
                            <span slot="title">{{item.typeName}}</span>
                        </el-menu-item>
                    </el-menu>-->
                </el-col>
                <el-col :span="19">
                    <el-table
                            stripe
                            :data="listOfPageData"
                            @sort-change="sortChange"
                            @selection-change="handleSelectionChange"
                            :height="tableHeight">
                        <el-table-column
                                type="selection"
                                width="55">
                        </el-table-column>
                        <el-table-column
                                prop="groupName"
                                label="知识库名称">
                        </el-table-column>
                        <el-table-column
                                width="200"
                                sortable
                                prop="editTime"
                                label="更新时间">
                        </el-table-column>
                        <el-table-column label="操作" width="200" align="center">
                            <template slot-scope="scope">
                                <el-button type="text" @click="handleLook(scope.$index, scope.row)">查看</el-button>
                                <el-button type="text" @click="handleCopy(scope.$index, scope.row)">复制</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <div class="pagination">
                        <el-pagination background @current-change="handleKnowLedgeChange"
                                       layout="total, prev, pager, next,jumper"
                                       :total="pagination.total"
                                       :page-size="pagination.pageSize"
                        >
                        </el-pagination>
                    </div>
                </el-col>
            </el-row>
            <!-- 查看用户知识库 end -->

            <!-- 问答对列表 start -->
            <el-row v-if="page_show_level == 2">
                <el-col>
                    <el-form :inline="true" class="w-form-inline">
                        <el-form-item label="关键词：">
                            <el-input clearable v-model="ddQueryKey"
                                      placeholder="主问题/相似问题/回答"  @keyup.native.13="onDDSearch"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="onDDSearch">搜索</el-button>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
            <el-row v-if="page_show_level == 2">
                <el-row>
                    <el-button @click="createExportKnowledgeItemExcelFile" :disabled="!ddItemList.length">导出</el-button>
                </el-row>
            </el-row>
            <el-row v-if="page_show_level == 2">
                <el-col>
                    <el-table
                            stripe
                            :data="knowledgeData"
                            @sort-change="ddSortChange"
                            @selection-change="ddHandleSelectionChange"
                            :row-class-name="tableRowClassName"
                            :height="tableHeight">
                        <el-table-column
                                type="selection"
                                class="isEdit"
                                width="55">
                        </el-table-column>
                        <el-table-column
                                prop="questionContent"
                                label="主问题">
                        </el-table-column>
                        <el-table-column
                                prop="questionContentOther"
                                label="相似问题">
                        </el-table-column>
                        <el-table-column
                                prop="answerContent"
                                label="回答">
                        </el-table-column>
                        <el-table-column
                                width="140"
                                sortable
                                prop="editTime"
                                label="更新时间">
                        </el-table-column>
                        <el-table-column
                                width="100"
                                prop="editor"
                                label="操作人">
                        </el-table-column>
                        <el-table-column
                                width="60"
                                label="音频">
                            <template slot-scope="scope">
                                <span class="w_icon_play w_icon_pause" v-show="scope.row.soundPath" @click="handleVideo(scope.row)"></span>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="140" align="center">
                            <template slot-scope="scope">
                                <!-- <div v-show="!scope.row.isEdit || scope.row.isEdit=='0'">  -->
                                <el-button type="text" @click="handleLookHdd(scope.row.id)">查看</el-button>
                                <!--<el-button  type="text" @click="handleDelete(scope.$index, scope.row)">删除</el-button>-->
                                <!-- </div> -->
                            </template>
                        </el-table-column>
                    </el-table>
                    <div class="pagination">
                        <el-pagination background @current-change="handleCurrentChange"
                                       layout="total, prev, pager, next,jumper"
                                       :total="ddPagination.total"
                                       :page-size="ddPagination.pageSize"
                        >
                        </el-pagination>
                    </div>
                </el-col>

            </el-row>

            <!-- 问答对列表 end -->

            <el-dialog title="音频" :visible.sync="videoVisible" width="600px">
                <w-video :source="viewSource" :playing="viewPlaying"/>
            </el-dialog>
            <!--复制-->
            <el-dialog
                    title="复制知识库到通用知识库"
                    :visible.sync="dialogCopyVisible"
                    width="30%"
                    >
                <div>
                    <el-form ref="copyForm" :model="copyForm" label-width="18%">
                        <el-form-item label="知识库名称:">
                            <el-input v-model="copyForm.groupName" readonly></el-input>
                        </el-form-item>
                        <el-form-item
                                label="行业领域"
                                prop="indestryId"
                                :rules="[
                                  { required: true, message: '请选择行业领域'}
                                ]"
                        >
                            <el-select v-model="copyForm.indestryId" placeholder="行业领域">
                                <el-option v-for="item in industryList" :label="item.industryName" :value="item.id" :key="item.id"></el-option>
                                <!--<el-option label="区域二" value="beijing"></el-option>-->
                            </el-select>
                        </el-form-item>
                    </el-form>
                </div>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="dialogCopyVisible = false">取 消</el-button>
                    <el-button type="primary" @click="saveCopy">确 定</el-button>
              </span>
            </el-dialog>


        </div>
    </div>
</template>

<script>
    import bus from '../common/bus';
    import wVideo from './base/Video';
    import wSound from './Sound';
    export default {
        data() {
            return {
                page_show_level:"1", //1：显示用户知识库，2：查看对答列表，3：查看回答对
//                显示用户知识库
                pagination: {
                    show: true,
                    total: 0,
                    pageIndex: 1,
                    pageSize: 10,

                },
                cur_page:1,
                cur_type_page:1,
                memberId:"",//当前的用户ID
                knowledgeTypeId:"",//当前的TYpe
                queryKey:"", //模糊搜索
                knowledgeTypeList:[],
                listOfPageData:[],
                tableHeight:500,
                sortList:[],
                selectGroupList:[],
//                查看对答列表
                ddQueryKey:"",
                knowledgeData:[],
                ddPagination: {
                    show: true,
                    total: 0,
                    pageIndex: 1,
                    pageSize: 10,

                },
                groupId:"",
                cur_dd_page:1,
                videoVisible:false,
                viewSource:"",
                viewPlaying:false,
                dialogCopyVisible:false,
                copyForm:{
                    indestryId:"",
                    groupName:"",
                    groupId:"",
                },
                industryList:[],
                ddItemList:[]
            }
        },
        created() {
            this.memberId = this.$route.params.id
            this.queryKnowledgeTypeList()
            this.queryKnowledgeGroupListOfPage()

        },
        components: {
            wVideo,
            wSound
        },
        methods: {
            goGengal:function () {
                this.$router.push("/repository/2")
            },
            tableRowClassName({row,rowIndex}){
                if(row.isEdit && row.isEdit*1>0){
                    return 'row-not-edit';
                }
            },
            onSearch:function () {
                this.cur_type_page = 1;
                this.queryKnowledgeGroupListOfPage()
            },
            queryKnowledgeTypeList:function () {
                let data={
                    MemberId:this.memberId
                }
                $.get(this.$baseUrl+'services/knowledge/queryKnowledgeTypeList.json',$.param(data)).then((res)=>{
                        if(res.resultMessageEnum=='0000'){
                            let qb = {
                                id:"DEL1",
                                typeName:"全部"
                            }
                            let type = []
                            type.push(qb)
                            for (var i in res.returnObject){
                                type.push(res.returnObject[i])
                            }
                            this.knowledgeTypeList = type
                        }else {
                            this.$message.error(res.errorInfoList[0].errorMessage);
                        }
                });
            },
            menuItemClick:function (e) {
                this.cur_type_page = 1;
                if (e.index!="DEL1"){
                    this.knowledgeTypeId = e.index
                }else {
                    this.knowledgeTypeId = ""
                }
                this.queryKnowledgeGroupListOfPage()
            },
            sortChange:function (column) {
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
                this.queryKnowledgeGroupListOfPage();
                
            },
            handleSelectionChange:function (val) {
                this.selectGroupList=[];
                for (var i in val){
                    this.selectGroupList.push(val[i].id)
                }
            },
            queryKnowledgeGroupListOfPage:function () {
                let params={
                    currentPage:this.cur_type_page-1,
                    pageSize:this.pagination.pageSize,
                    templateType:2
                }
                if (this.knowledgeTypeId != ""){
                    params.knowledgeTypeId = this.knowledgeTypeId;
                }
                if (this.queryKey !=""){
                    params.groupName = this.queryKey;
                }
                if(this.sortList){
                    params.sortList =this.sortList;
                }
                $.post(this.$baseUrl+'services/knowledge/queryKnowledgeGroupListOfPage.json',JSON.stringify(params)).then((res)=> {
                    if (res.resultMessageEnum == '0000') {
                        console.log(res)
                        this.listOfPageData = res.returnObject.recordList
                        this.pagination.total = res.returnObject.totalNumber
                    }else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });

            },
            handleKnowLedgeChange:function (val) {
                this.cur_type_page = val
                this.queryKnowledgeGroupListOfPage()
            },
            handleLook:function (index,row) {
                this.selectGroupList=[];
                this.page_show_level = 2;
                this.groupId = row.id;
                this.queryKnowledgeItemList();

            },
            handleCopy:function (index,row) {
                this.copyForm = {}
                this.copyForm.groupName = row.groupName
                this.copyForm.groupId = row.id
                this.dialogCopyVisible = true
                this.queryAllIndustryList()
            },

            onDDSearch:function(){
                this.cur_dd_page = 1;
                this.queryKnowledgeItemList();
            },
            ddReturn:function(){
                this.page_show_level = 1;
                this.ddItemList = []
            },
            ddSortChange:function (val) {
                console.log(val)
            },
            ddHandleSelectionChange:function(val){
                this.ddItemList = []
                var params = [];
                for (var i in val){
                    this.ddItemList.push(val[i].id)
                }
                console.log(this.ddItemList)
            },
            handleCurrentChange:function(val){
                this.cur_dd_page = val
                this.queryKnowledgeItemList()

            },
            queryKnowledgeItemList(){
                let params={
                    groupId:this.groupId,
                    searchType:2,
                    currentPage:this.cur_dd_page-1,
                    pageSize:this.ddPagination.pageSize
                }

                if (this.ddQueryKey!=""){
                    params.queryKey=this.ddQueryKey;
                }

//                if(this.sortList){
//                    params.sortList =this.sortList;
//                }

                $.post(this.$baseUrl+'services/knowledge/queryKnowledgeItemList.json',JSON.stringify(params)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){

                        let data = res.returnObject && res.returnObject.recordList;
                        if(data){
                            let newData = [];
                            let newAnswerContent=[];
                            data.forEach((item,index)=>{
                                let answerContent = '';

                                try{
                                    answerContent = JSON.parse(item.answerContent);
                                }catch(e){
                                    answerContent = item.answerContent;
                                }
                                if(Object.prototype.toString.call(answerContent)=='[object Array]' && answerContent.length){
                                    answerContent.forEach((list,num)=>{
                                        let newList = {
                                            questionContent:num==0?item.questionContent:'',
                                            answerContent:list.text,
                                            editTime:num==0?item.editTime:'',
                                            editor: num==0?item.editor:'',
                                            editorId: item.editorId,
                                            id: item.id,
                                            soundPath:list.soundPath,
                                            soundDuration:list.soundDuration,
                                            soundSize:list.soundSize,
                                            isEdit:num
                                        }
                                        newAnswerContent.push(newList);
                                    })
                                }else{
                                    newAnswerContent.push(item);
                                }
                            });

                            this.knowledgeData = newAnswerContent;
                        }

                        this.ddPagination.total = res.returnObject.totalNumber;
                    }else{
                        self.$message.error(res.errorInfoList[0].errorMessage);
                    }
                })
            },
            handleVideoAnswer(){
                this.videoVisible=true;
                this.$nextTick(() => {
                    this.viewSource =this.creatFAQVForm.answerContent[this.currentIndex].soundPath;
                })
            },
            handleVideo(item){
                this.videoVisible=true;
                this.$nextTick(() => {
                    this.viewSource =item.soundPath;
                })
            },
            handleLookHdd:function (index) {
                this.$router.push('/repository/view/'+index);
            },
            // 所有行业列表
            queryAllIndustryList:function(){
                $.get(this.$baseUrl+'services/intention/queryAllIndustryList.json').then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        if(res.returnObject && res.returnObject.length){
                            this.industryList = res.returnObject;
                            console.log(this.industryList)
                        }else {
                            self.$message.error(res.errorInfoList[0].errorMessage);
                        }
                    }
                });
            },
            saveCopy:function () {
                var params = {}
                params.indestryId = this.copyForm.indestryId
                for (var i in this.industryList){
                    if (this.industryList[i].id == this.copyForm.indestryId){
                        params.indestryName = this.industryList[i].industryName
                    }
                }
                params.groupId=this.copyForm.groupId
                this.$refs['copyForm'].validate((valid) => {
                    if(!valid){
                        return false;
                    }else {
                        $.post(this.$baseUrl+'services/knowledge/copyKnoledgeFromMemberToManager.json',JSON.stringify(params)).then((res)=>{
                            if(res.resultMessageEnum=='0000') {
                                this.dialogCopyVisible=false
                                this.$message.success("复制成功")
                            }else{
                                this.$message.error(res.errorInfoList[0].errorMessage)
                            }
                        });
                    }
                });
            },
            createExportKnowledgeItemExcelFile:function () {

                $.post(this.$baseUrl+'services/knowledge/createExportKnowledgeItemExcelFile.json',JSON.stringify(this.ddItemList)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        window.location.href = this.$baseUrl + 'services/file/downloadFile.html?filePath=' + res.returnObject.filePath;
                        this.$message.success('下载成功！');

                    }else{
                        self.$message.error(res.errorInfoList[0].errorMessage);
                    }
                })
            },
            createExportKnowledgeItemExcelFileByGroupIds:function () {

                $.post(this.$baseUrl+'services/knowledge/createExportKnowledgeItemExcelFileByGroupIds.json',JSON.stringify(this.selectGroupList)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        window.location.href = this.$baseUrl + 'services/file/downloadFile.html?filePath=' + res.returnObject.filePath;
                        this.$message.success('下载成功！');

                    }else{
                        self.$message.error(res.errorInfoList[0].errorMessage);
                    }
                })
            }
        },
        watch:{

        }
    }
</script>


<style scoped lang="less">
    .repository-menu .repository-menu-item {
        height: 40px;
        line-height: 40px;
        padding-left: 20px;
        padding-right: 20px;
        padding: 0px 15px;
    }
</style>