<template>
    <div>
        <div slot="header" class="clearfix">
            <a @click="goBack" class="link"><i class="el-icon-arrow-left"></i>返回知识库列表</a>
        </div>
        <el-card class="box-card repository-card">
            <div slot="header" class="clearfix">
                <div slot="header" class="clearfix">
                    <span>行用卡催收</span>
                </div>
                <div class="repository-box-right-icon-box">

                    <el-tooltip content="导出" placement="top" effect="light">
                        <i class="iconfont icon-icon_download"></i>
                    </el-tooltip>
                    <el-tooltip content="移动" placement="top" effect="light">
                        <!-- <el-dropdown @command="handleCommand">
                            <span class="el-dropdown-link">
                                <i class="iconfont icon-icon_move"></i>
                            </span>
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item v-for="item in moveRepositoryMenu"
                                    :command="item.id"
                                    :key="item.id">{{item.typeName}}
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown> -->
                        <span class="repository-btn-move">
                            <i class="iconfont icon-icon_move"></i>
                            <!-- <div class="repository-sub-menu el-cascader-menus">
                                <el-menu
                                class="el-menu-vertical-demo"
                                unique-opened="true">
                                    <el-submenu :index="index" :key="index" v-for="(item,index) in knowledgeTypeListCurrent">
                                        <template slot="title">
                                        <span>导航1</span>
                                        </template>
                                        <el-menu-item index="1-1">选项1</el-menu-item>
                                        <el-menu-item index="1-2">选项2</el-menu-item>
                                    </el-submenu>
                                    <el-submenu index="2">
                                        <template slot="title">
                                        <span>导航2</span>
                                        </template>
                                        <el-menu-item index="1-1">选项1</el-menu-item>
                                        <el-menu-item index="1-2">选项2</el-menu-item>
                                    </el-submenu>
                                </el-menu>
                            </div> -->
                            <el-cascader
                            :options="moveTypeOptions"
                            @active-item-change="handleMoveItemChange"
                            @change = "moveTypeChange"
                            :props="moveTypeProps"
                            :show-all-levels="false">
                            </el-cascader>
                        </span>

                    </el-tooltip>
                    <el-tooltip content="删除" placement="top" effect="light">
                        <i class="iconfont icon-ico_delete" @click="handleDelItems"></i>
                    </el-tooltip>
                    <i class="line"></i>
                    <el-tooltip content="新增" placement="top" effect="light">
                        <i class="iconfont icon-icon_rep_add" @click="handleCreatFAQV"></i>
                    </el-tooltip>
                    <el-tooltip content="匹配音频" placement="top" effect="light">
                        <i class="iconfont icon-icon_rep_search" @click="handleDelItems"></i>
                    </el-tooltip>
                    <el-tooltip content="发布" placement="top" effect="light">
                        <i class="iconfont icon-icon_publish" :class="{'is-disabled':!publishStatus}" @click="publishKnowledgeGroup"></i>
                    </el-tooltip>
                </div>
            </div>

            <div class="repository-box">
                <el-table
                stripe
                :data="knowledgeData"
                @sort-change="sortChange"
                @selection-change="handleSelectionChange"
                :height="tableHeight">
                    <el-table-column
                    type="selection"
                    width="55">
                    </el-table-column>
                    <el-table-column
                        prop="questionContent"
                        label="主问题">
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
                        sortable
                        prop="editor"
                        label="操作人">
                    </el-table-column>
                    <el-table-column
                        width="60"
                        label="音频">
                        <template slot-scope="scope">
                            <span class="w_icon_play w_icon_pause"></span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="140" align="center">
                        <template slot-scope="scope">
                            <el-button type="text" @click="handleEdit(scope.row.id)">编辑</el-button>
                            <el-button type="text" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </el-card>
        <div class="pagination">
            <el-pagination background @current-change="handleCurrentChange"
                layout="total, prev, pager, next,jumper"
                :total="pagination.total"
                :page-size="pagination.pageSize"
                >
            </el-pagination>
        </div>
        <!-- 删除 -->
        <el-dialog title="删除问答" :visible.sync="delItemsVisible" width="400px">
            <div >您确定要删除已选择的知识库吗？如果知识库正在使用中，删除后将不能在已关联的话术中正常使用。</div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="delItemsVisible = false">取 消</el-button>
                <el-button type="primary" @click="removeKnowledgeItemList">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 移动 -->
        <el-dialog title="移动问答" :visible.sync="moveItemsVisible" width="400px">
            <div >您确定要移动已选中的{{moveItemLength}}条问答对到“{{moveItemName}}”吗？</div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="moveItemsVisible = false">取 消</el-button>
                <el-button type="primary" @click="moveKnowledgeItem">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 新建问答 -->
        <el-dialog title="新增问答" class="creat-faq-dialog" :visible.sync="creatFAQVisible" width="800px">
            <div>
                <el-tabs v-model="activeName" >
                    <el-tab-pane label="手动输入" name="first">
                        <el-form :model="creatFAQVForm" :rules="creatFAQVRules" ref="creatFAQVForm" label-width="100px" class="demo-ruleForm">
                            <el-form-item label="主问题" prop="questionContent">
                                <el-input v-model="creatFAQVForm.questionContent" placeholder="输入主问题"></el-input>
                            </el-form-item>
                            <el-form-item
                                v-for="(item, index) in creatFAQVForm.questionContentOther"
                                :label="item.name"
                                :key="index"
                            >
                                <el-input v-model="item.value" placeholder="输入相似问题"></el-input>
                                <el-button v-if="index==0" icon="el-icon-plus" @click.prevent="addQuestion(item)"></el-button>
                                <el-button v-if="index>0" icon="el-icon-minus" @click.prevent="removeQuestion(item)"></el-button>
                            </el-form-item>
                            <el-form-item label="回答" prop="answerContent">
                                <el-input type="textarea" placeholder="输入回答内容" v-model="creatFAQVForm.answerContent"></el-input>
                            </el-form-item>
                        </el-form>
                    </el-tab-pane>
                    <el-tab-pane label="批量上传" name="second">
                        <div class="faqUpload">
                            <el-form :model="atchKnow" :rules="atchKnowRules" ref="atchKnow" label-width="100px" class="demo-ruleForm">
                                <div><span class="red">*</span>第一步：请下载用于填写知识问答的Excel模版文件</div>
                                <div class="updload-list-box">
                                    <el-button  @click="downloadExcelTemplate">下载模版</el-button>
                                </div>
                                <div>
                                    <span class="red">*</span>
                                    第二步：请上传已填写完成的Excel文件（建议最多不超过1000行）
                                    <el-popover
                                        placement="bottom"
                                        width="200"
                                        trigger="hover"
                                        content="填写规范：仅支持Excel文件，多个相似问题或者回答用*|*隔开，可以省略分类，问题[TAB]相似问题[TAB]回答内容<分类>">
                                        <i class="el-icon-question" slot="reference"></i>
                                    </el-popover>
                                </div>

                                <div class="updload-list-box">
                                <el-button class="file-btn" v-show="!atchKnow.errorMessage">
                                    <el-input multiple="multiple"  v-model="atchKnow.filePath" type="file" id="file" @change="uploadAnnexFile('file')"></el-input>
                                    上传
                                </el-button>
                                <span class="blue">{{atchKnow.excelPathTip}}</span>
                                <span class="red" >{{atchKnow.errorMessage}}</span>
                                </div>

                                <div v-for="(item,index) in correctArry" :key="index" v-show="item.nextUpload">
                                    <div>上传失败的问答数据已生成新的Excel文件，<a :href="item.errorFilePath">点击下载</a>后重新上传</div>
                                    <div class="updload-list-box" >
                                        <el-button class="file-btn" v-show="!item.errorMessage">
                                        <el-input multiple="multiple" v-model="item.filePath" type="file" :id="item.id" @change="uploadAnnexFile(item.id)"></el-input>
                                            上传
                                        </el-button>
                                        <span class="blue">{{item.excelPathTip}}</span>
                                        <span class="red" >{{item.errorMessage}}</span>
                                    </div>
                                </div>

                            </el-form>
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="creatFAQVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleAddItems">保 存</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>

    import bus from '../common/bus';


    export default {
        name: 'KnowledgeConfig',
        components: {

        },
        props:['searchType','queryKey','knowledgeCurrent','knowledgeTypeListCurrent'],
        data() {
            return {
                tableHeight:200,
                // groupId:'',
                knowledgeData:[],
                cur_page:1,
                moveRepositoryMenu:[],
                multipleSelection:[],
                delItemsVisible:false,
                creatFAQVisible:false,
                activeName:'first',
                publishStatus:true,
                creatFAQVForm:{
                    questionContent:'',
                    questionContentOther: [{
                        name:'相似问题',
                        value: ''
                    }],
                    // region:'',
                    creatFAQOptions:[],
                    answerContent:'',
                },
                creatFAQVRules: {
                    questionContent: [
                        { required: true, message: '请输入主问题', trigger: 'blur' }
                    ],
                    answerContent: [
                        { required: true, message: '请输入回答内容', trigger: 'blur' }
                    ]
                },
                isNewFile:false,
                atchKnow:{
                    excelPathTip:'',
                    errorMessage:'',
                    excelPath:'',
                    filePath:'',
                    filePathNew:'',
                    excelPathTipNew:'',
                    excelPathNew:'',
                },

                upload_img_index:-1,
                correctArry:[],
                atchKnowRules:{
                    filePath:[
                        { required: true, message: '请上传知识问答Excel数据！', trigger: 'change' }
                    ]
                },
                // moveTypeOptions: [{
                //     label: '江苏',
                //     cities: []
                //     }, {
                //     label: '浙江',
                //     cities: []
                // }],
                moveTypeOptions:[],
                moveTypeProps: {
                    value: 'label',
                    children: 'children'
                },
                moveItemsVisible:false,
                moveItemLength:0,
                moveItemName:'',
                pagination: {
                    show: true,
                    total: 0,
                    pageIndex: 1,
                    pageSize: 20
                },
            }
        },
        created() {
            // 计算table 高度
            var clintHeight = document.documentElement.clientHeight;
            // this.height = clintHeight - 240;
            this.tableHeight =clintHeight - 290
            // 距离头部
            // bus.$emit('contentTop', true);


            this.groupId = this.knowledgeCurrent.id;
            this.publishStatus =this.knowledgeCurrent.itemUpdateFlag==1?true:false;

            this.queryKnowledgeItemList();

            this.formatKnowledgeMoveData();
        },
        computed: {

        },
        methods: {
            // 分页导航
            handleCurrentChange(val) {
                this.cur_page = val;
                this.queryKnowledgeItemList();
            },
            // 确定删除多个列表
            handleDelItems(){
                if(this.multipleSelection.length){
                    this.delItemsVisible = true;
                }else{
                    this.$message.error('请选择要删除的问答!');
                }
            },
            goBack(){
                bus.$emit('knowledgeSteps',1);
            },
            sortChange(){

            },
            handleCommand(){

            },
            handleSelectionChange(val){
                this.multipleSelection = val;
            },
            handleDelete(index,row){
                this.delItemsVisible = true;
                this.deleId = row.id;
            },
            handleCreatFAQV(){

                this.creatFAQVisible = true;
                this.creatFAQVForm.creatFAQOptions = this.repositoryMenu;

            },
            handleMoveItemChange(val){

                let obj = this.knowledgeTypeListCurrent.find((res)=>{
                    return val==res.typeName
                })




                // console.log(obj,333)
                this.queryKnowledgeGroupListOfPage(obj.id).then((res)=>{
                    let newRes = res.map((a,i)=>{
                        return {label:a.groupName};
                    })

                    this.knowledgeItemListData = res;
                    this.moveTypeOptions.forEach((item,index)=>{
                        if(obj.typeName == item.label){
                            item.children = newRes;
                        }
                    })
                })
            },
            moveTypeChange(val){

                if(this.multipleSelection.length){
                    let obj = this.knowledgeItemListData.find((res)=>{
                        return val[1]==res.groupName
                    });

                    this.newGroupId = obj.id;

                    this.moveItemsVisible = true;
                    this.moveItemLength = this.multipleSelection.length;
                    this.moveItemName = obj && obj.groupName;

                    let data = [];
                    this.knowledgeItemIdList = this.multipleSelection.map(el=>{
                        return el.id;
                    })

                }else{
                    this.$message.error('请选择要移动的问答!');
                }
            },
            // 添加相似问答
            addQuestion(){
                let item = {
                        name:'',
                        value:'',
                        key: Date.now()
                    };
                if(this.creatFAQVForm.questionContentOther.length<2){
                    this.creatFAQVForm.questionContentOther.push(item);
                }else{
                    this.creatFAQVForm.questionContentOther.splice(1,0,item)
                }

            },
            formatKnowledgeMoveData(){
                this.knowledgeTypeListCurrent.forEach((item,index)=>{
                    let list = {};
                    list.children=[];
                    list.label = item.typeName;
                    this.moveTypeOptions.push(list)
                });

            },
            // 新增问答
            handleAddItems(formName){
                if(this.activeName=='first'){
                    this.$refs['creatFAQVForm'].validate((valid) => {
                        if (valid) {
                            this.addKnowledgeItem();
                        } else {
                            console.log('error submit!!');
                            return false;
                        }
                    });
                }else{
                    this.saveBatchKnowledgeItem('atchKnow');
                }
            },
            handleEdit(id){
                // localStorage.setItem('repositoryListIndex',this.itemActive);
                this.$router.push('/repository/'+id);
            },
            // 移动知识库明细
            moveKnowledgeItem(){
                let params={
                    newGroupId:this.newGroupId,
                    knowledgeItemIdList:this.knowledgeItemIdList
                }
                console.log(params,444)
                $.post(this.$baseUrl+'knowledge/moveKnowledgeItem.json',JSON.stringify(params)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.moveItemsVisible = false;
                        this.queryKnowledgeItemList();
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            // 下载Excel模版
            downloadExcelTemplate(){
                window.location.href= this.$baseUrl+'common/downloadExcelTemplate.html?excelTemplateType=2';
            },
            // 新增知识库明细
            addKnowledgeItem(){
                let questionContentOther = [];
                this.creatFAQVForm.questionContentOther.forEach((item)=>{
                    questionContentOther.push(item.value);
                });

                let data={
                    questionContent:this.creatFAQVForm.questionContent,
                    groupId:this.groupId,
                    questionContentOther:JSON.stringify(questionContentOther),
                    answerContent:this.creatFAQVForm.answerContent
                }
                $.post(this.$baseUrl+'knowledge/addKnowledgeItem.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.creatFAQVisible = false;
                        this.queryKnowledgeItemList();
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            // 删除相思问答
            removeQuestion(item){
                var index = this.creatFAQVForm.questionContentOther.indexOf(item)
                if (index !== -1) {
                    this.creatFAQVForm.questionContentOther.splice(index, 1)
                }
            },
            //知识库发布
            publishKnowledgeGroup(e){
                if(e.target.className.indexOf('is-disabled')>-1){
                    return;
                }
                $.post(this.$baseUrl+'knowledge/publishKnowledgeGroup.json?groupId='+this.groupId).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.publishStatus = false;
                        this.$message.success('发布成功');

                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            queryKnowledgeGroupListOfPage(id){
                return new Promise((resolve,reject)=>{
                    let params={
                        searchType:2,
                        typeId:id
                    }
                    $.post(this.$baseUrl+'knowledge/queryKnowledgeGroupListOfPage.json',JSON.stringify(params)).then((res)=>{
                        if(res.resultMessageEnum=='0000'){
                            let data = res.returnObject && res.returnObject.recordList;
                            if(data){
                                resolve(data)
                            }
                        }else{
                            this.$message.error(res.errorInfoList[0].errorMessage);
                        }
                    })
                })
            },
            //查询知识库明细列表
            queryKnowledgeItemList(){
                let params={
                    groupId:this.groupId,
                    // searchType:this.searchType,
                    searchType:2,
                    currentPage:this.cur_page-1,
                    pageSize:this.pagination.pageSize
                }
                // this.tableLoading = true;
                // if(item && item.id){
                //     params.groupId = item.id;
                //     params.searchType = 2;
                // }else if(item=='unclassified'){
                //     this.itemActive='unclassified';
                //     params.groupId = ''
                //     params.searchType = 1;
                // }else{
                //     params.groupId = this.groupId;
                //     params.searchType = 2;
                //     if(this.groupId =='unclassified'){
                //         params.groupId = '';
                //         params.searchType = 1;
                //     }
                // }


                let queryKey = this.queryKey;
                if(queryKey){
                    params.queryKey=queryKey;
                }
                $.post(this.$baseUrl+'knowledge/queryKnowledgeItemList.json',JSON.stringify(params)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){

                        let data = res.returnObject && res.returnObject.recordList;
                        if(data){
                            // if(typeof index != 'undefined'){
                            //     this.itemActive=index;
                            // }
                            // // 记录当前分类数据
                            // if(item){
                            //     if(item =='unclassified'){
                            //         this.groupId = 'unclassified';
                            //         this.activeGroupName = '未分类';
                            //     }else{
                            //         this.groupId = item.id;
                            //         this.activeGroupName = item.typeName;
                            //     }
                            // }
                            this.knowledgeData = data;
                        }

                        this.pagination.total = res.returnObject.totalNumber;
                    }else{
                        self.$message.error(res.errorInfoList[0].errorMessage);
                    }
                })
            },
            //删除知识库明细列表
            removeKnowledgeItemList(item){

                let params = [];
                if(this.deleId){
                    params.push(this.deleId)
                }else{
                    this.multipleSelection.forEach(el=>{
                        params.push(el.id);
                    })
                }

                $.post(this.$baseUrl+'knowledge/removeKnowledgeItemList.json',JSON.stringify(params)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.$message.success('删除成功！');
                        this.delItemsVisible = false;
                        this.multipleSelection = [];
                        this.deleId = '';
                        this.queryKnowledgeItemList();
                    }else{
                        self.$message.error(res.errorInfoList[0].errorMessage);
                    }
                })
            },
             // 2.1.6.检查上传文件
            checkAnnexFile(){
                // this.atchKnow.excelPathTip = '检测中...';
                let data = {
                    excelTemplateType:2
                }
                if(this.upload_img_index>-1){
                    data.filePath=this.correctArry[this.upload_img_index].excelPath;
                }else{
                    data.filePath = this.atchKnow.excelPath;
                }

                $.post(this.$baseUrl+'common/checkAnnexFile.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        let list= {};
                        if(!res.returnObject.correctFlag){
                            let msg = `${res.returnObject.rowNumber-res.returnObject.exceptionRowNumber}条上传成功，剩余${res.returnObject.exceptionRowNumber}条上传失败！`
                            if(this.correctArry.length>0){
                                this.correctArry[this.upload_img_index].errorMessage = msg
                            }else{
                                this.atchKnow.errorMessage = msg;
                            }
                            var iTemp = (~~(Math.random()*100000)).toString();
                            list = {
                                nextUpload:true,
                                correctFilePath:res.returnObject.correctFilePath,
                                errorFilePath:this.$baseUrl+'file/downloadFile.html?filePath='+res.returnObject.errorFilePath,
                                id:`file_${iTemp}`
                            }
                        }else{
                            list = {
                                nextUpload:false,
                                correctFilePath:res.returnObject.correctFilePath,
                            }
                        }
                        this.correctArry.push(list);
                        this.upload_img_index++;
                    }else{
                        // this.atchKnow.errorMessage = res.errorInfoList[0].errorMessage;
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            uploadAnnexFile(id){
                let self = this;
                var oMyForm = new FormData();
                oMyForm.append("sourceType", 102);
                oMyForm.append("file", $('#'+id)[0].files[0]);
                $.ajax({
                    url: this.$baseUrl+'common/uploadAnnexFile.json',
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
                        if(self.upload_img_index>-1){
                            self.correctArry[self.upload_img_index].excelPathTip=self.correctArry[self.upload_img_index].filePath;
                            self.correctArry[self.upload_img_index].excelPath=res.returnObject;
                        }else{
                            self.atchKnow.excelPathTip = self.atchKnow.filePath;
                            self.atchKnow.excelPath = res.returnObject;
                        }
                        self.checkAnnexFile();
                    }else{
                        self.$message.error('上传失败！');
                    }
                }).fail(function(res) {

                });
            },
            // 2.6.14.批量保存知识库明细（上传Excel后保存）
            saveBatchKnowledgeItem(formName){
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        let data = {
                            id:this.groupId
                        }
                        if(this.correctArry.length){
                            let list = [];
                            this.correctArry.forEach((item)=>{
                                item.correctFilePath && list.push(item.correctFilePath);
                            });
                            data.correctFilePathList=list;
                        }else{
                            data.filePath = this.atchKnow.excelPath;
                        }
                        $.post(this.$baseUrl+'knowledge/saveBatchKnowledgeItem.json',JSON.stringify(data)).then((res)=>{
                            if(res.resultMessageEnum=='0000'){
                                this.creatFAQVisible = false;
                                this.queryKnowledgeItemList();
                            }else{
                                this.$message.error(res.errorInfoList[0].errorMessage);
                            }
                        });
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            },

        },
        watch:{
            creatFAQVisible(val){
                if(!val){
                    this.$refs['creatFAQVForm'].resetFields();
                    this.$refs['atchKnow'].resetFields();
                    this.upload_img_index=-1;
                    this.atchKnow.errorMessage ='';
                    this.atchKnow.excelPathTip = '';
                    this.atchKnow.excelPath = '';
                    this.atchKnow.filePath = '';
                    this.atchKnow.excelPathNew = '';
                    this.atchKnow.filePathNew = '';
                    this.atchKnow.excelPathTipNew='';
                    this.isNewFile = false;
                    this.creatFAQVForm.questionContentOther = [{
                        name:'相似问题',
                        value: ''
                    }]
                    this.correctArry=[];
                }
            },
        },
        destroyed(){
            // bus.$emit('contentTop', false);
        }
    }

</script>

<style scoped lang="less">
    .handle-input {
        width:240px;
        display: inline-block;
    }
    .faqUpload{
        padding:30px 20px;
        .el-icon-question{
            font-size: 18px;
            color: #919FA9;
        }
        .red{
            color: #ff0000;
        }
        .blue{
            color: #409EFF;
        }
        .updload-list-box{
            padding: 40px 0 30px 40px;
        }
        .el-button{
            width: 88px;
            // margin:40px 0 30px 40px;
        }
    }
    .pagination{
        padding: 20px 0 10px;
    }
    .repository-menu{
        width: 100%;
        overflow-y: auto;
        position: absolute;
        top: 46px;
        bottom:10px;
    }
    .link{
        display: inline-block;
        cursor: pointer;
        color: #4e8ff9;
        padding:0 0 15px;
    }
    .repository-box-right-icon-box{
        i{
            font-size: 18px;
            color: #4e8ff9;
            &.is-disabled{
                color: #909399;
                cursor: not-allowed;
            }
            &.line{
                display: inline-block;
                position: relative;
                top: 2px;
                width: 1px;
                height:16px;
                background-color: #909399;
            }
        }
    }
</style>
