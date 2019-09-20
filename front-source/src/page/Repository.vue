<template>
    <div :class="{'sub-collapse':isSubCollapse}">
        <div class="rep-box-slider">
            <div class="repository-menu-box" >
                <div class="repository-menu-top">知识库分类<i class="iconfont icon-ico_add" @click="addGroup"></i></div>
                <div class="repository-menu">
                <div class="repository-menu-item" :class="{active:'unclassified'==itemActive}" >
                    <span class="groupName" @click="queryKnowledgeGroupListOfPage('','','handleClick')">未分类</span>
                </div>
                <draggable v-model="repositoryMenu" @end="draggableEnd" @start="draggableStart">
                    <transition-group>
                        <div class="repository-menu-item " v-for="(item,index)  in repositoryMenu" 
                            :class="{active:index==itemActive,edit:item.isEdit}" 
                            :key="index">
                            <div class="repository-menu-input-box" v-show="item.show">
                                <el-input 
                                v-model="item.typeName" 
                                v-if="item.type!=1&&item.type!=2"
                                ></el-input>
                            </div>
                            
                            <span v-show="!item.show" class="groupName" @click="queryKnowledgeGroupListOfPage(item,index,'handleClick')">{{item.typeName}}</span>

                            <div class="repository-icon-box edit-box" v-show="item.show">
                                <i class="el-icon-check" @click="modifyKnowledgeType(item,index)"></i>
                                <i class="el-icon-close" @click="cancelEdit(item,index)"></i>
                            </div>
                            <div class="repository-icon-box hover-box" v-if="item.groupFlag!=1&&item.groupFlag!=0">
                                <i class="iconfont icon-ico_move-sort"></i>
                                <i class="iconfont icon-ico_edit-content" @click="editRepositoryMenu(item,index)"></i>
                                <i class="iconfont icon-ico_delete" @click="removeKnowledgeType(item,index)"></i>
                            </div>
                        </div>
                    </transition-group>
                </draggable>
                </div>
            </div>
            <span class="slider-fold" @click="isSubCollapse=!isSubCollapse"></span>
        </div>
        <div class="table" >
        
        <div class="repository-page">
            <!-- <keep-alive> -->
            <router-view></router-view>
            <!-- </keep-alive> -->
        </div>
        <!-- 增加 -->
        <el-dialog title="新增知识库" class="creat-faq-dialog"  :visible.sync="addGroupVisible" width="600px">
            <el-form ref="addGroupForm" :model="addGroupForm" label-width="114px" :rules="addGroupFormRules">
                <el-form-item label="知识库名称" prop="groupName" placeholder="输入知识库名称">
                    <el-input v-model="addGroupForm.groupName"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addGroupVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleAddGroup">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 修改 -->
        <el-dialog title="修改名称" class="creat-faq-dialog"  :visible.sync="modifyGroupVisible" width="600px">
            <el-form ref="modifyGroupForm" :model="modifyGroupForm" label-width="114px" :rules="modifyGroupFormRules">
                <el-form-item label="知识库名称" prop="groupName" placeholder="输入知识库名称">
                    <el-input v-model="modifyGroupForm.groupName"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="modifyGroupVisible = false">取 消</el-button>
                <el-button type="primary" @click="modifyKnowledgeGroup">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 删除 -->
        <el-dialog title="删除知识库" :visible.sync="delItemsVisible" width="400px">
            <div >您确定要删除已选择的知识库吗？如果知识库正在使用中，删除后将不能在已关联的话术中正常使用。</div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="delItemsVisible = false">取 消</el-button>
                <el-button type="primary" @click="removeKnowledgeGroupList">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 移动多个列表-->
        <el-dialog :title="moveItemNameTitle" :visible.sync="moveItemsVisible" width="400px">
            <div >您确定要移动此{{multipleSelection.length}}条知识库到{{moveItemName}}吗？</div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="moveItemsVisible = false">取 消</el-button>
                <el-button type="primary" @click="moveKnowledgeGroup">确 定</el-button>
            </span>
        </el-dialog>
        <!--  删除知识库分类 -->
         <el-dialog title="删除确认" :visible.sync="removeTypeVisible" width="400px">
            <div >您确定要删除知识库分类“{{removeTypeName}}”吗？<br/>相关知识库将不会被删除，继续保留在“未分类”中</div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="removeTypeVisible = false">取 消</el-button>
                <el-button type="primary" @click="removeGroupEnter">确 定</el-button>
            </span>
        </el-dialog>
    </div>
    </div>
    
</template>

<script>

    import bus from '../common/bus';
    import draggable from 'vuedraggable'

    export default {
        name: 'basetable',
        components: {
            draggable
        },
        data() {
            return {
                tableLoading:true,
                select_word:'',
                itemActive:'unclassified',
                height:500,
                tableHeight:300,
                cur_page:1,
                repositoryData:[],
                removeTypeName:'',
                moveItemName:'',
                moveItemId:'',
                moveItemNameTitle:'',
                multipleSelection:[],
                oldRepositoryMenu:[],
                moveItemsVisible:false,
                removeTypeVisible:false,
                delVisible:false,
                activeName:'first',
                moveRepositoryMenu:[],
                addGroupIndex :1,
                pagination: {
                    show: true,
                    total: 0,
                    pageIndex: 1,
                    pageSize: 20
                },
                repositoryMenu:[],
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
                // creatFAQVRules: {
                //     questionContent: [
                //         { required: true, message: '请输入主问题', trigger: 'blur' }
                //     ],
                //     answerContent: [
                //         { required: true, message: '请输入回答内容', trigger: 'blur' }
                //     ]
                // },
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


                listOfPageData:[],
                isSubCollapse:false,
                typeListData:[],
                addGroupVisible:false,
                addGroupForm:{},
                addGroupFormRules:{
                    groupName:[
                        { required: true, message: '输入知识库名称', trigger: 'blur' }
                    ]
                },
                modifyGroupVisible:false,
                modifyGroupForm:{},
                modifyGroupFormRules:{
                    groupName:[
                        { required: true, message: '输入知识库名称', trigger: 'blur' }
                    ]
                },
                // knowledgeCurrent:'',
                knowledgeTypeListCurrent:'',
                delItemsVisible:false,
                tabItem:'a',
                groupId:'',
                searchType:'',
                queryKey:''
            }
        },
        created() {
            // 计算table 高度
            var clintHeight = document.documentElement.clientHeight;
            // this.height = clintHeight - 240;
            // if(this.$route.params.id){
            //     this.id = this.$route.params.id;
            //     let obj = this.repositoryMenu.find((item)=>{
            //         return item.id == id;
            //     })
            //     console.log(this.repositoryMenu,obj,this.id)
            // }
            this.tableHeight =clintHeight - 260
            // 距离头部
            bus.$emit('contentTop', true);

            bus.$on('knowledgeSteps',(res)=>{
                if(res && res==1){
                    this.tabItem = 'a';
                }
            });

            let repositoryListIndex = localStorage.getItem('repositoryListIndex');
            if(repositoryListIndex != null && repositoryListIndex!='unclassified'){
                this.itemActive = repositoryListIndex;
            }
            this.getrepositoryMenu();

            // this.$router.push(`/repository/set/unclassified`)

        },
        computed: {
           
        },
        methods: {
            handleConfig(index,row){
                // this.knowledgeCurrent = row;
                // this.tabItem = 'b';
                // console.log(this.itemActive)
                // localStorage.setItem('repositoryListIndex',this.itemActive);
            },
            // 分页导航
            handleCurrentChange(val) {
                // this.cur_page = val;
                // this.queryKnowledgeGroupListOfPage();
            },
            // 查询知识库分类列表
            getrepositoryMenu(){
                $.get(this.$baseUrl+'knowledge/queryKnowledgeTypeList.json').then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        if (res.returnObject && res.returnObject.length){
                            let newData = res.returnObject;
                            let id = this.$route.params.id;

                            newData.forEach((el,index) => {
                                el.isEdit = false;
                                el.show = false;

                                // if(id=='unclassified'){
                                //     this.itemActive = 'unclassified';
                                // }else{
                                //     if(el.id==this.$route.params.id){
                                //         this.itemActive = index;
                                //     }
                                // }
                            });

                            this.repositoryMenu = newData;

                            this.$store.dispatch('setRepositoryConfigData',newData)

                        }else{
                            this.$router.push(`/repository/set/unclassified`)
                            // this.queryKnowledgeGroupListOfPage('unclassified');
                            this.repositoryMenu=[];
                        }
                        

                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                })
            },  
            // 修改分类
            modifyKnowledgeType(item,index){
                // 如果为新添加的
                let self = this;
                if(item.newAdd){
                    let data={
                        typeName:item.typeName
                    }
                    $.post(this.$baseUrl+'knowledge/addKnowledgeType.json',JSON.stringify(data)).then((res)=>{

                        if(res.resultMessageEnum=='0000'){
                            // self.repositoryMenu[index] ={};
                            self.repositoryMenu[index].newAdd = false;
                            self.repositoryMenu[index].show = false;
                            self.repositoryMenu[index].isEdit = false;
                            self.repositoryMenu[index].id = res.returnObject;

                            // this.addGroupIndex--;
                        }else{
                            self.$message.error(res.errorInfoList[0].errorMessage);
                        }
                    })
                }else{
                // 否则为修改
                    let data={
                        id:item.id,
                        typeName:item.typeName
                    }
                    $.post(this.$baseUrl+'knowledge/modifyKnowledgeType.json',JSON.stringify(data)).then((res)=>{
                        if(res.resultMessageEnum=='0000'){

                            this.repositoryMenu[index].show = false;
                            this.repositoryMenu[index].isEdit = false;

                        }else{
                            this.$message.error(res.errorInfoList[0].errorMessage);
                        }
                    })
                }
            },
            // 新建分类ui
            addGroup(){
                // let index = 1;
                
                let item = {
                    newAdd:true,
                    isEdit:true,
                    show:true,
                    typeName:`新增分类${this.addGroupIndex}`
                }
                this.repositoryMenu.push(item)
                this.addGroupIndex = this.addGroupIndex+1
            },
            // 删除分类
            removeKnowledgeType(item,index){
                this.removeTypeName = item.typeName;
                this.removeTypeId = item.id;
                this.removeTypeIndex = index; 
                this.removeTypeVisible = true;
            },
            // 确定删除分类
            removeGroupEnter(){
                let data={
                    typeId:this.removeTypeId
                }
                $.post(this.$baseUrl+'knowledge/removeKnowledgeType.json?'+$.param(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.repositoryMenu.splice(this.removeTypeIndex,1);
                        // this.moveRepositoryMenu.splice(this.removeTypeIndex,1);
                        this.removeTypeVisible = false;
                        // this.queryKnowledgeGroupListOfPage();
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            draggableStart(){
                this.oldRepositoryMenu = this.repositoryMenu;
            },
            // 移动结束
            draggableEnd(param){
                let sortData = [];
                this.repositoryMenu.forEach((item)=>{
                    sortData.push(item.id);
                });
                this.sortKnowledgeType(sortData).then(res=>{

                    if(this.itemActive==param.oldIndex){
                        this.itemActive = param.newIndex;
                    }else{
                        this.queryKnowledgeGroupListOfPage(this.repositoryMenu[this.itemActive],this.itemActive);
                    }
                });
            },
            // 排序
            sortKnowledgeType(list){
                var dtd = $.Deferred();
                $.post(this.$baseUrl+'knowledge/sortKnowledgeType.json?',JSON.stringify(list)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        dtd.resolve();
                    }else{
                        this.repositoryMenu = this.oldRepositoryMenu;
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
                return dtd;
            },
            sortChange(){

            },
            handleSelectionChange(){

            },
            // 查询知识库名称(问答对分组)翻页列表
            queryKnowledgeGroupListOfPage(item,index,type){
                
                this.itemActive= (item=='' || typeof index == 'undefined')?'unclassified': index;

                localStorage.setItem('repositoryListIndex',this.itemActive);

                if(type && type=='handleClick'){
                    this.$router.push(`/repository/set/${item&&item.id||'unclassified'}`)
                }

            },
            // 
            handleAddGroup(){
                var params={
                    groupName:this.addGroupForm.groupName,
                    knowledgeTypeId:this.activeGroupId,
                    knowledgeTypeName:this.activeGroupName
                }
                this.$refs['addGroupForm'].validate((valid) => {
                    if (valid) {
                        $.post(this.$baseUrl+'knowledge/addKnowledgeGroup.json?',JSON.stringify(params)).then((res)=>{
                            if(res.resultMessageEnum=='0000'){
                                this.addGroupVisible = false;
                                // this.queryKnowledgeGroupListOfPage();
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
            // 删除知识库名称(问答对分组)
            removeKnowledgeGroup(){
                var params={
                    groupName:this.addGroupForm.groupName,
                    knowledgeTypeId:this.activeGroupId
                }
                $.post(this.$baseUrl+'knowledge/removeKnowledgeGroup.json?',JSON.stringify(params)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        // this.queryKnowledgeGroupListOfPage();
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },

            handleModifyGroup(index,row){

                this.modifyGroupForm.groupName = row.groupName;
                this.modifyGroupForm.id = row.id;
                this.modifyGroupVisible = true;
            },
            // 修改知识库名称(问答对分组)
            modifyKnowledgeGroup(){
                var params={
                    groupName:this.modifyGroupForm.groupName,
                    id:this.modifyGroupForm.id
                }

                this.$refs['modifyGroupForm'].validate((valid) => {
                    $.post(this.$baseUrl+'knowledge/modifyKnowledgeGroup.json?',JSON.stringify(params)).then((res)=>{
                        if(res.resultMessageEnum=='0000'){
                            this.modifyGroupVisible = false;
                            // this.queryKnowledgeGroupListOfPage();
                        }else{
                            this.$message.error(res.errorInfoList[0].errorMessage);
                        }
                    });
                });
            },
            search() {
                this.cur_page=1;
                this.pagination.total = 0;
                if(this.tabItem=='a'){
                    // this.queryKnowledgeGroupListOfPage();
                }else if(this.tabItem=='b'){
                    this.queryKey = this.select_word;
                }
                
            },
            // 搜索框为空时
            searchChange(val){
                if(!val){
                    if(this.tabItem=='a'){
                        // this.queryKnowledgeGroupListOfPage();
                    }else{
                        this.queryKey = '';
                    }
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
           
            // 重新设置知识库名称（问答对分组）顺序
            moveKnowledgeGroup(){
                let list = [];
                this.multipleSelection.forEach(el=>{
                    list.push(el.id);
                })
                let data={
                    newTypeId:this.moveItemId,
                    knowledgeGroupIdList:list
                }
                $.post(this.$baseUrl+'knowledge/moveKnowledgeGroup.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.multipleSelection= [];
                        // this.queryKnowledgeGroupListOfPage();
                        this.$message.success('移动成功！');
                        this.moveItemsVisible = false;
                    }else{
                        
                    }
                });
            },
            // 确认移动
            moveKnowledgeItem(){
                let list = [];
                this.multipleSelection.forEach(el=>{
                    list.push(el.id);
                })
                let data={
                    newGroupId:this.moveItemId,
                    knowledgeItemIdList:list
                }
                $.post(this.$baseUrl+'knowledge/moveKnowledgeItem.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.multipleSelection= [];
                        // this.queryKnowledgeGroupListOfPage();
                        this.$message.success('移动成功！');
                        this.moveItemsVisible = false;
                    }else{
                        
                    }
                });
            },
            // 编辑左侧分类
            editRepositoryMenu(item,index){
                
                this.repositoryMenu.forEach((item,num)=>{
                    let a = this.repositoryMenu[index];
                    let b = this.repositoryMenu[num];
                    if(num==index){
                        a.show = true;
                        a.isEdit = true;
                    }else{
                        if(b.show){
                            b.show = false;
                            b.isEdit = false;
                            b.typeName = this.oldRepositoryMenuItem.typeName
                            b.id = this.oldRepositoryMenuItem.id
                        }
                    }
                })
                this.oldRepositoryMenuItem = Object.assign({},item);

            },
            // 取消编辑
            cancelEdit(item,index){

                if(item.newAdd){
                    this.repositoryMenu.splice(index,1)
                    this.addGroupIndex--;
                }else{
                    this.repositoryMenu[index].show = false;
                    this.repositoryMenu[index].isEdit = false;
                    
                    this.repositoryMenu[index].typeName = this.oldRepositoryMenuItem.typeName
                    this.repositoryMenu[index].id = this.oldRepositoryMenuItem.id
                }
                
                // this.repositoryMenu[index].show = false;
                // this.repositoryMenu[index].isEdit = false;
            },
            handleSelectionChange(val){
                this.multipleSelection = val;
            },
            // 删除单个问答
            deletItem(item){
                this.delVisible = true;
                this.delActiveItemId = item.id;
            },
            // 确定删除多个列表
            handleDelItems(){
                if(this.multipleSelection.length){
                    this.delItemsVisible = true;
                }else{
                    this.$message.error('请选择要删除的FAQ!');
                }
            },
            removeKnowledgeGroupList(){
                let data = [];
                this.multipleSelection.forEach(el=>{
                    data.push(el.id);
                })
                $.post(this.$baseUrl+'knowledge/removeKnowledgeGroupList.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        
                        this.delItemsVisible = false;
                        this.multipleSelection = [];

                        // this.queryKnowledgeGroupListOfPage();
                        
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            //知识库发布
            publishKnowledgeGroup(index,row){
                let params={
                    groupId:row.id
                }
                $.post(this.$baseUrl+'knowledge/publishKnowledgeGroup.json?groupId='+row.id).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        // this.listOfPageData.splice(index,1)
                        this.listOfPageData[index].itemUpdateFlag=0;
                        this.$message.success('发布成功');
                        
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },


            // 2.6.12.删除知识库明细列表
            removeKnowledgeItemList(item){
                let data = [];
                if(item && item=='single'){
                    data.push(this.delActiveItemId)
                }else{
                    this.multipleSelection.forEach(el=>{
                        data.push(el.id);
                    })
                }
                
                $.post(this.$baseUrl+'knowledge/removeKnowledgeItemList.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        
                        if(item=='single'){
                            this.delVisible = false;
                            this.delActiveItemId = '';
                        }else{
                            this.delItemsVisible = false;
                            this.multipleSelection = [];
                        }
                        // this.queryKnowledgeGroupListOfPage();
                        
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            // 2.1.7.下载Excel模版
            downloadExcelTemplate(){
                window.location.href= this.$baseUrl+'common/downloadExcelTemplate.html?excelTemplateType=2';
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
                            id:this.activeGroupId
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
                                // this.creatFAQVisible = false;
                                // this.queryKnowledgeGroupListOfPage();
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
            // 2.6.6.知识库发布
            // publishKnowledgeGroup(){
            //     let data={
            //         groupId:this.activeGroupId
            //     }
            //     $.post(this.$baseUrl+`knowledge/publishKnowledgeGroup.json?groupId=${this.activeGroupId}`,JSON.stringify(data)).then((res)=>{
            //         if(res.resultMessageEnum=='0000'){
            //             this.$message.success('发布成功！');
            //         }else{
            //             this.$message.error(res.errorInfoList[0].errorMessage);
            //         }
            //     });
            // },
        },
        watch:{
            addGroupVisible(val){
                if(!val){
                    this.$refs['addGroupForm'].resetFields();
                }
            },
            modifyGroupVisible(val){
                if(!val){
                    this.$refs['modifyGroupForm'].resetFields();
                }
            }
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
            color: #fea200;
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
</style>
