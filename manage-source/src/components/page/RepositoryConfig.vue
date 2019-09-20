<template>
    <div class="container-admin">
        <div class="admin-page">
            <el-row>
                <el-col :span="20">
                    <el-breadcrumb separator="/">
                        <el-breadcrumb-item>管理中心</el-breadcrumb-item>
                        <el-breadcrumb-item>知识库管理</el-breadcrumb-item>
                        <el-breadcrumb-item>通用知识库</el-breadcrumb-item>
                        <el-breadcrumb-item>配置知识库</el-breadcrumb-item>
                    </el-breadcrumb>
               </el-col>
                <el-col :span="4">
                    <i style="padding-right: 10px;float: right;padding-bottom: 10px">
                        <el-button @click="goGengal">返回</el-button>
                    </i>
                </el-col>
            </el-row>
        </div>
        <div class="admin-body">
            <el-tabs>
                <el-tab-pane label="配置知识库"></el-tab-pane>
            </el-tabs>
            <el-row>
                <el-col>
                    <el-form :inline="true" class="w-form-inline">
                        <el-form-item label="关键词：">
                            <el-input clearable v-model="searchForm.answer"
                                      placeholder="主问题/回答"  @keyup.native.13="onSearch"></el-input>
                        </el-form-item>
                        <el-form-item label="操作人：">
                            <el-select v-model="searchForm.memberIds"  multiple  placeholder="请选择" >
                                <el-option
                                        v-for="item in managerList"
                                        :key="item.id"
                                        :label="item.loginName"
                                        :value="item.id">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item>
                            <el-checkbox v-model="searchForm.allManager">全部</el-checkbox>
                        </el-form-item>
                        <el-form-item >
                            <el-button @click="onHandleReset">重置</el-button>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="onSearch">搜索</el-button>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
            <el-row>
                <el-col>
                    <el-button :disabled="!multipleSelection.length" @click="handleDelItems">删除</el-button>
                    <el-button :disabled="!multipleSelection.length" @click="moveKnoledgeVisible=true" >移动</el-button>
                    <el-button type="primary"  @click="handleCreatFAQV">添加</el-button>

                    <el-button type="primary" @click="addItemsVisible=true">批量添加</el-button>
                    <div style="float: right">
                        <el-button type="primary" @click="matchSound" :disabled="!knowledgeData.length">匹配音频</el-button>
                        <el-button type="primary" :disabled="!multipleSelection.length" @click="publishKnowledgeGroup">发布</el-button>
                    </div>
                </el-col>
            </el-row>
            <el-row>
                <el-col>
                    <el-table
                            stripe
                            :data="knowledgeData"
                            @sort-change="sortChange"
                            @selection-change="handleSelectionChange"
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
                                <el-button type="text" @click="handleEdit(scope.row.id)">编辑</el-button>
                                <!--<el-button  type="text" @click="handleDelete(scope.$index, scope.row)">删除</el-button>-->
                                <!-- </div> -->
                            </template>
                        </el-table-column>
                    </el-table>
                    <div class="pagination">
                        <el-pagination background @current-change="handleCurrentChange"
                                       layout="total, prev, pager, next,jumper"
                                       :total="pagination.total"
                                       :page-size="pagination.pageSize"
                        >
                        </el-pagination>
                    </div>
                </el-col>
            </el-row>
        </div>

        <!--dialog-->
        <el-dialog title="新增问答" class="creat-faq-dialog" :visible.sync="creatFAQVisible" :append-to-body="true" width="800px">
            <div>
                <el-tabs v-model="activeName" >
                    <el-tab-pane label="手动输入" name="first">
                        <el-form :model="creatFAQVForm" :rules="creatFAQVRules" ref="creatFAQVForm" label-width="100px" class="demo-ruleForm">
                            <el-form-item label="主问题" prop="questionContent">
                                <el-input v-model="creatFAQVForm.questionContent" placeholder="输入主问题"></el-input>
                            </el-form-item>
                            <el-form-item
                                    v-for="(item,index) in creatFAQVForm.questionContentOther"
                                    :label="item.name"
                                    :key="`问题${index}`">
                                <el-input v-model="item.value" placeholder="输入相似问题"></el-input>
                                <el-button v-if="index==0" icon="el-icon-plus" @click.prevent="addQuestion(item)"></el-button>
                                <el-button v-if="index>0" icon="el-icon-minus" @click.prevent="removeQuestion(item)"></el-button>
                            </el-form-item>
                            <el-row>
                                <el-col :span="2" class="row-left">
                                        <span
                                                @click="tabAnswer(item,index)"
                                                :class="{'active':currentIndex==index}"
                                                v-for="(item,index) in creatFAQVForm.answerContent"
                                                :key="index">
                                            {{`回答${index+1}`}}
                                        </span>
                                </el-col>
                                <el-col :span="18" class="row-center">
                                    <el-input type="textarea" v-model="creatFAQVForm.answerContent[currentIndex].value" placeholder="输入回答内容" ></el-input>
                                    <div class="answer-bottom">
                                        您可以<span @click="handleUseAudio">使用音频</span>（使用后将自动填充对应文本）或
                                        <span class="btnUpload">上传音频<input type="file" multiple="multiple" class="importFile"  @change="uploadAnnexFileOfInfo()" ></span>
                                        <span class="play-btn" v-show="creatFAQVForm.answerContent[currentIndex].soundPath">
                                                <i class="iconfont icon-icon_play" @click="handleVideoAnswer()"></i>
                                                <span @click="handleCancelPlay()">取消</span>
                                            </span>
                                    </div>
                                </el-col>
                                <el-col :span="2">
                                    <el-button icon="el-icon-plus" @click.prevent="addAnswer()"></el-button>
                                </el-col>
                            </el-row>
                        </el-form>
                    </el-tab-pane>
                </el-tabs>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="creatFAQVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleAddItems">保 存</el-button>
            </span>
        </el-dialog>

        <el-dialog :visible.sync="visibleSound" :fullscreen="true" :show-close="false" class="sound-dialog">
            <w-sound :from="pageFrom"/>
        </el-dialog>
        <el-dialog title="音频" :visible.sync="videoVisible" width="600px">
            <w-video :source="viewSource" :playing="viewPlaying"/>
        </el-dialog>

        <!-- 删除 -->
        <el-dialog title="删除问答对" :visible.sync="delItemsVisible" width="400px">
            <div >您确定要删除选中的{{multipleSelection.length}}个问答对吗？删除后将不能恢复</div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="delItemsVisible = false">取 消</el-button>
                <el-button type="primary" @click="removeKnowledgeItemList">确 定</el-button>
            </span>
        </el-dialog>
        <!--批量添加-->
        <!--<el-dialog title="批量添加回答对" :visible.sync="addItemsVisible" width="400px">-->
            <!--<div style="margin-left: 30px;margin-right: 30px" >-->
                <!--<el-input type="file" placeholder="请选择本地文件"></el-input>-->
            <!--</div>-->
            <!--<span slot="footer" class="dialog-footer">-->
                <!--<el-button @click="delItemsVisible = false">取 消</el-button>-->
                <!--<el-button type="primary" @click="removeKnowledgeItemList">确 定</el-button>-->
            <!--</span>-->
        <!--</el-dialog>-->


        <el-dialog  title="批量添加回答对" :visible.sync="addItemsVisible">
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
            <span slot="footer" class="dialog-footer">
            <el-button @click="addItemsVisible = false">取 消</el-button>
            <el-button type="primary" @click="saveBatchKnowledgeItem('atchKnow')">确 定</el-button>
            </span>
        </el-dialog>

        <el-dialog title="移动知识库" :visible.sync="moveKnoledgeVisible" width="400px">
            <div >
                请选择：
                <el-cascader
                    :options="industryOptions"
                    @active-item-change="handleItemChange"
                    v-model="changGroupOptions"
                >
                </el-cascader>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="moveKnoledgeVisible = false">取 消</el-button>
                <el-button type="primary" @click="changGroup">确 定</el-button>
            </span>
        </el-dialog>
        <el-dialog title="匹配音频" :visible.sync="soundMatchVisible" >
            <span style="color: #409EFF">
                <i class="el-icon-search primary"></i>
            </span>已检测到音库中有<span style="color: #409EFF">{{tableSoundData.length}}条</span>音频可以匹配给相应回答</br>
            <span style="font-size: smaller">已选<span style="color:#E6A23C">{{matchSoundList.length}}条</span></span>

            <el-table
                ref="multipleMatchTable"
                :data="tableSoundData"
                style="width: 100%"
                @selection-change="handleMatchSelectionChange"
                >
                <el-table-column
                        type="selection"
                        width="55">
                </el-table-column>
                <el-table-column
                        label="音频">
                    <template slot-scope="scope">
                        <span class="w_icon_play w_icon_pause" v-show="scope.row.soundPath" @click="handleVideo(scope.row)"></span>
                        <span>{{scope.row.soundContent}}</span>
                    </template>
                </el-table-column>
                <el-table-column
                        prop="ansewrText"
                        label="回答"
                >

                </el-table-column>


            </el-table>
            <span slot="footer" class="dialog-footer">
                <el-button @click="soundMatchVisible = false">取 消</el-button>
                <el-button type="primary" :disabled="matchButtonDisabled" @click="matchSoundConfirm">匹 配</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import bus from '../common/bus';
    import wVideo from './base/Video';
    import wSound from './Sound';
    export default {
        data() {
            return {
                matchButtonDisabled:false,
                tableSoundData:[],
                soundMatchVisible:false,
                moveKnoledgeVisible:false,
                delItemsVisible:false,
                deleId:"",
                addItemsVisible:false,
                multipleSelection:[],
                knowledgeData:[],
                videoVisible:false,
                tableHeight:200,
                viewSource:"",
                viewPlaying:false,
                searchForm:{
                    answer:"",
                    memberIds:"",
                    allManager:""
                },
                managerList:[],
                listOfPageData:[],
                groupId:'',
                creatFAQVisible:false,
                activeName:'first',
                creatFAQVForm:{
                    questionContent:'',
                    questionContentOther: [{
                        name:'相似问题',
                        value: ''
                    }],
                    creatFAQOptions:[],
                    answerContent:[{
                        name:'回答',
                        value: '',
                        soundPath:'',
                        soundDuration:'',
                        soundSize:''
                    }],
                },
                creatFAQVRules: {
                    questionContent: [
                        { required: true, message: '请输入主问题', trigger: 'blur' }
                    ],
                    // answerContent: [
                    //     { required: true, message: '请输入回答内容', trigger: 'blur' }
                    // ]
                },
                currentIndex:0,
                atchKnow:{
                    excelPathTip:'',
                    errorMessage:'',
                    excelPath:'',
                    filePath:'',
                    filePathNew:'',
                    excelPathTipNew:'',
                    excelPathNew:'',
                },
                atchKnowRules:{
                    filePath:[
                        { required: true, message: '请上传知识问答Excel数据！', trigger: 'change' }
                    ]
                },
                correctArry:[],
                repositoryMenu:[],
                visibleSound:false,
                pageFrom:"",
                pagination: {
                    show: true,
                    total: 0,
                    pageIndex: 1,
                    pageSize: 10
                },
                cur_page:1,
                industryList:[],
                industryOptions:[],
                selectIndustryId:"",
                changGroupOptions:[],
                matchSoundList:[],
                matchAllKnoledgeItemList:[]
            }
        },
        created() {
            this.groupId = this.$route.params.id
            // 计算table 高度
            var clintHeight = document.documentElement.clientHeight;
            // this.height = clintHeight - 240;
            this.tableHeight =clintHeight - 290
            // 距离头部
//            bus.$emit('contentTop',true);
            bus.$on('closeSound',msg=>{
                if(msg){
                    this.visibleSound = false;
                }
            });

            bus.$on('fileName',msg=>{
                if(msg){
                    this.creatFAQVForm.answerContent[this.currentIndex]['soundPath'] = msg.soundPath;
                    this.creatFAQVForm.answerContent[this.currentIndex]['soundDuration'] = msg.soundDuration;
                    this.creatFAQVForm.answerContent[this.currentIndex]['soundSize'] = msg.soundSize;
                    this.creatFAQVForm.answerContent[this.currentIndex]['value'] = msg.soundContent;
                }
            });
            this.queryKnowledgeItemList()
            this.getAllManager()
            this.queryAllIndustryList()
        },
        components: {
            wVideo,
            wSound
        },
        methods: {
            matchSound:function () {
                this.soundMatchVisible = true
                var ledgeParams={
                    groupId:this.groupId,
                    searchType:2,
                    currentPage:0,
                    pageSize:5000
                }
                //获取到了knoledge表的数据
                var contentParams = []
                var answerList = []
                //查询当前知识库下面的所有的问题得到回到列表
                $.post(this.$baseUrl+'services/knowledge/queryKnowledgeItemList.json',JSON.stringify(ledgeParams)).then((res)=> {
                    if (res.resultMessageEnum == '0000') {
                        let knoledge = res.returnObject.recordList;
                        this.matchAllKnoledgeItemList = knoledge;
                        if (knoledge!= "" && knoledge.length>0){
                            for (var i in knoledge){
                                let answerContent;
                                try{
                                    answerContent = JSON.parse(knoledge[i].answerContent);
                                }catch(e){
                                    answerContent = item.answerContent;
                                }
                                if(Object.prototype.toString.call(answerContent)=='[object Array]' && answerContent.length){
                                    answerContent.forEach((list,num)=>{
                                        //如果list.soundPath为空需要匹配，不为空的不需要匹配
                                        if (list.text!="" && list.text!="undefined" && !list.hasOwnProperty("soundPath") || list.soundPath == ""){
                                            contentParams.push(list.text)
                                            answerList.push({
                                                ansewrText:list.text,
                                                knoledgeItemId:knoledge[i].id
                                            })
                                        }
                                    })

                                }
                            }

                            var soundShowList = [];
                            //查询音频表
                            $.post(this.$baseUrl+'services/sound/querySoundConfigItemListBySoundContent.json',JSON.stringify(contentParams)).then((soundRes)=>{
                                if (soundRes.resultMessageEnum == '0000') {
                                    var soundObject = soundRes.returnObject;
                                    soundObject.forEach((list,num)=>{
                                        answerList.forEach((alist,anum) => {
                                            if (alist.ansewrText == list.soundContent){
                                                list.ansewrText = alist.ansewrText
                                                list.knoledgeItemId = alist.knoledgeItemId
                                                soundShowList.push(list)
                                            }
                                        })

                                    })
                                    this.tableSoundData = soundShowList

                                }else {
                                    this.$message.error(res.errorInfoList[0].errorMessage);
                                }

                            });
                        }

                    }else {
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });

            },
            handleMatchSelectionChange:function (item) {
                var knoledgeLists = []
                item.forEach((item) =>{
                    if(knoledgeLists.indexOf(item.knoledgeItemId + item.ansewrText) < 0){
                        knoledgeLists.push(item.knoledgeItemId + item.ansewrText)
                    }else {
//                        this.$refs.multipleMatchTable.clearSelection()
                        this.$message.error("注意,同一回答选择了多条音频,默认取最后一条")
                    }
                })
                this.matchSoundList = item;
            },
            matchSoundConfirm:function () {
                this.matchButtonDisabled = true
                //循环匹配的音频数组
                //记录需要更新的item的Id
                var updateParamsItemId = []
                this.matchSoundList.forEach((msoundList)=>{
                    //循环匹配的答对
                    this.matchAllKnoledgeItemList.forEach((itemList,itemIndex)=>{
                        //如果音频的knoledgeItemId 等于答对的id 说明要改的数据就是这条数据
                        if (msoundList.knoledgeItemId == itemList.id){
                            let answerContent ;
                            //精确匹配到具体点问题
                            try{
                                answerContent = JSON.parse(itemList.answerContent)
                            }catch(e){
                                answerContent = itemList.answerContent;
                            }
                            if(Object.prototype.toString.call(answerContent)=='[object Array]' && answerContent.length){
                                answerContent.forEach((awerList,index)=>{
                                    if (awerList.text == msoundList.ansewrText){
                                        awerList.soundPath = msoundList.soundPath
                                        //有时候没有soundDuration 不给默认值就没有这个key
                                        awerList.soundDuration = msoundList.soundDuration
                                        awerList.soundSize = msoundList.soundSize
                                        answerContent[index] = awerList
                                    }
                                })
                                this.matchAllKnoledgeItemList[itemIndex].answerContent = JSON.stringify(answerContent)
                                if (updateParamsItemId.indexOf(itemList.id) <  0 ){
                                    updateParamsItemId.push(itemList.id)
                                }
                            }
                        }
                    })
                })

                var success = 0
                var fair = 0
                var comm = updateParamsItemId.length
                for (var i in updateParamsItemId){
                    this.matchAllKnoledgeItemList.forEach((item,index)=>{
                        if (updateParamsItemId[i] == item.id){
                            let data = {}
                            data.id = item.id
                            data.answerContent = item.answerContent
                            $.post(this.$baseUrl+'services/knowledge/modifyKnowledgeItem.json',JSON.stringify(data)).then((res)=>{
                                if(res.resultMessageEnum=='0000'){
                                    success += 1
                                    comm -= 1
                                    if(comm == 0){
                                        this.$message.success("匹配成功")
                                        this.soundMatchVisible = false
                                        this.matchButtonDisabled = false
                                        this.queryKnowledgeItemList()
                                    }
                                }else {
                                    fair +=1
                                    comm -=1
                                    this.$message.error("匹配失败"+fair+"条")
                                    this.soundMatchVisible = false
                                    this.matchButtonDisabled = false
                                    this.queryKnowledgeItemList()
                                }
                            });
                        }
                    });
                }
            },
            tableRowClassName({row,rowIndex}){
                if(row.isEdit && row.isEdit*1>0){
                    return 'row-not-edit';
                }
            },
            //重置
            onHandleReset:function () {
                this.searchForm.memberIds = []
                this.searchForm.allManager = false
                this.searchForm.answer = ""

            },
            //搜索
            onSearch:function () {
                this.cur_page=1;
                this.pagination.total = 0;
                this.queryKnowledgeItemList();
            },
            //
            sortChange:function (val) {
                console.log("sortChange",val)
            },
            //多选
            handleSelectionChange:function (val) {
                console.log("handleSelectionChange",val)
                this.multipleSelection = val;
            },
            handleUseAudio(){
                console.log("使用音频库")
                this.pageFrom = 'knowledgeConfig';
                this.visibleSound = true;
            },
            // 下载Excel模版
            downloadExcelTemplate(){
                window.location.href= this.$baseUrl+'services/common/downloadExcelTemplate.html?excelTemplateType=2';
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
            handleCreatFAQV(){
                this.creatFAQVForm = {
                    questionContent:'',
                    questionContentOther: [{
                        name:'相似问题',
                        value: ''
                    }],
                    creatFAQOptions:[],
                    answerContent:[{
                        name:'回答',
                        value: '',
                        soundPath:'',
                        soundDuration:'',
                        soundSize:''
                    }],
                };
                this.creatFAQVisible = true;
                this.creatFAQVForm.creatFAQOptions = this.repositoryMenu;
            },
            addAnswer(){
                let item = {
                    name:'回答',
                    value: '',
                    soundPath:'',
                    soundDuration:'',
                    soundSize:''
                };
                this.creatFAQVForm.answerContent.push(item);

                // if(this.creatFAQVForm.answerContent.length<2){
                //     this.creatFAQVForm.answerContent.push(item);
                // }else{
                //     this.creatFAQVForm.answerContent.splice(1,0,item)
                // }
                this.tabAnswer(item,this.currentIndex+1);

            },
            tabAnswer(item,index){
                this.currentIndex = index;
            },
            // 新增知识库明细
            addKnowledgeItem(){

                let questionContentOther = [];
                this.creatFAQVForm.questionContentOther.forEach((item)=>{
                    questionContentOther.push(item.value);
                });
                let answerContents=[];

                this.creatFAQVForm.answerContent.forEach((item)=>{
                    answerContents.push({
                        text:item.value,
                        soundPath:item.soundPath,
                        soundDuration:item.soundDuration,
                        soundSize:item.soundSize
                    })
                })
                let data={
                    questionContent:this.creatFAQVForm.questionContent,
                    groupId:this.groupId,
                    questionContentOther:JSON.stringify(questionContentOther),
                    answerContent:JSON.stringify(answerContents)
                }

                $.post(this.$baseUrl+'services/knowledge/addKnowledgeItem.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.creatFAQVisible = false;
                        this.queryKnowledgeItemList();
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            // 添加相似问答
            addQuestion(){
                let item = {
                    name:'',
                    value:''
                };
                if(this.creatFAQVForm.questionContentOther.length<2){
                    this.creatFAQVForm.questionContentOther.push(item);
                }else{
                    this.creatFAQVForm.questionContentOther.splice(1,0,item)
                }
            },
            removeQuestion(item){
                var index = this.creatFAQVForm.questionContentOther.indexOf(item)
                if (index !== -1) {
                    this.creatFAQVForm.questionContentOther.splice(index, 1)
                }
            },
            handleVideoAnswer(){
                this.videoVisible=true;
                this.$nextTick(() => {
                    this.viewSource =this.creatFAQVForm.answerContent[this.currentIndex].soundPath;
                })
            },
            queryKnowledgeItemList(){
                var params = {}
                 params={
                    groupId:this.groupId,
                    searchType:2,
                    currentPage:this.cur_page-1,
                    pageSize:this.pagination.pageSize
                }

                if (this.searchForm.answer!=""){
                    params.queryKey=this.searchForm.answer;
                }
                if (this.searchForm.allManager ==false && this.searchForm.memberIds.length > 0){
                    params.editorList = this.searchForm.memberIds;
                }

                if(this.sortList){
                    params.sortList =this.sortList;
                }

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
                            this.pagination.total = res.returnObject.totalNumber;

                    }else{
                        self.$message.error(res.errorInfoList[0].errorMessage);
                    }
                })
            },
            handleCurrentChange(val) {
                this.cur_page = val;
                this.queryKnowledgeItemList();
            },
            handleVideo(item){
                this.videoVisible=true;
                this.$nextTick(() => {
                    this.viewSource =item.soundPath;
                })
            },
            handleDelItems(){
                if(this.multipleSelection.length){
                    this.delItemsVisible = true;
                }else{
                    this.$message.error('请选择要删除的问答!');
                }
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

                $.post(this.$baseUrl+'services/knowledge/removeKnowledgeItemList.json',JSON.stringify(params)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.$message.success('已删除'+this.multipleSelection.length+"个问答对！");
                        this.delItemsVisible = false;
                        this.multipleSelection = [];
                        this.deleId = '';
                        this.queryKnowledgeItemList();
                    }else{
                        self.$message.error(res.errorInfoList[0].errorMessage);
                    }
                })
            },
            uploadAnnexFile(id){
                let self = this;
                var oMyForm = new FormData();
                oMyForm.append("sourceType", 102);
                oMyForm.append("file", $('#'+id)[0].files[0]);
                $.ajax({
                    url: this.$baseUrl+'services/common/uploadAnnexFile.json',
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

                $.post(this.$baseUrl+'services/common/checkAnnexFile.json',JSON.stringify(data)).then((res)=>{
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
                        $.post(this.$baseUrl+'services/knowledge/saveBatchKnowledgeItem.json',JSON.stringify(data)).then((res)=>{
                            if(res.resultMessageEnum=='0000'){
                                this.addItemsVisible = false;
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
            //查询所有的管理员
            getAllManager:function () {
                $.get(this.$baseUrl+'services/manager/getManagerList.json').then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        if(res.returnObject && res.returnObject.length){
                            this.managerList = res.returnObject;
                            console.log(this.managerList )
                        }
                    }
                });
            },
            //知识库发布
            publishKnowledgeGroup(e){
                $.post(this.$baseUrl+'services/knowledge/publishKnowledgeGroup.json?groupId='+this.groupId).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.publishStatus = false;
                        this.$message.success('发布成功');

                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            handleEdit(id){
                this.$router.push('/repository/edit/'+id);
            },
            handleDelete(index,row){
                this.delItemsVisible = true;
                this.deleId = row.id;
            },
            // 所有行业列表
            queryAllIndustryList:function(){
                $.get(this.$baseUrl+'services/intention/queryAllIndustryList.json').then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        if(res.returnObject && res.returnObject.length){
                            this.industryList = res.returnObject;
                            console.log(this.industryList)
                            let options = []
                            for (let i in this.industryList){
                                let op = {}
                                op.label=this.industryList[i].industryName;
                                op.value=this.industryList[i].id
                                op.children = []
                                options.push(op)
                                this.industryOptions = options
                            }
                            console.log(options)
                        }else {
                            self.$message.error(res.errorInfoList[0].errorMessage);
                        }
                    }
                });
            },
            handleItemChange:function (val) {
                this.selectIndustryId = val[0];
                this.queryKnowledgeGroupListOfPage()

            },
            queryKnowledgeGroupListOfPage:function () {
                var params = {}
                params.currentPage = 0;
                params.pageSize = 1000;
                params.templateType = 1;
                params.industryType = this.selectIndustryId
                $.post(this.$baseUrl+'services/knowledge/queryKnowledgeGroupListOfPage.json?',JSON.stringify(params)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        let listOfPageData = res.returnObject.recordList;
                        var options = []
                        for (var i in listOfPageData){
                            let op = {}
                            op.label= listOfPageData[i].groupName;
                            op.value = listOfPageData[i].id;
                            options.push(op)
                        }
                        for (var i in this.industryOptions){
                            if (this.industryOptions[i].value==this.selectIndustryId){
                                this.industryOptions[i].children=options
                            }
                        }
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            changGroup:function () {
                let list = [];
                this.multipleSelection.forEach(el=>{
                    list.push(el.id);
                })
                let data={
                    newGroupId:this.changGroupOptions[1],
                    knowledgeItemIdList:list
                }
                $.post(this.$baseUrl+'services/knowledge/moveKnowledgeItem.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.multipleSelection= [];
                        this.moveKnoledgeVisible = false;
                        this.$message.success('移动成功！');
                         this.queryKnowledgeItemList();
                    }else{

                    }
                });
            },
            goGengal:function () {
                this.$router.push("/repository/1")
            }

        },
        watch:{
            videoVisible(curVal){
                if(!curVal){
                    bus.$emit('viewPlaying',true);
                }
            },
            queryKey(val){
                this.queryKey = val;
                this.queryKnowledgeItemList();
            }
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
        color: #1890FF;
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

    &.icon-icon_rep_add,
    &.icon-icon_rep_search,
    &.icon-icon_publish{
         color: #4e8ff9;
     }
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
    .w_icon_play{
        cursor: pointer;
    }
    .creat-faq-dialog .el-input, .creat-faq-dialog .el-textarea{
        width: 500px;
    }
    .row-left{
        width:100px;
    span{
        display:block;
        padding-left:44px;
        color:#303133;
        padding-bottom: 5px;
        cursor: pointer;
    &.active{
         color: #1890FF;
     }
    }
    }
    .sound-content{
        position:fixed;
        z-index:5000;
        background-color:#fff000;
        left:0;
        width:100%;
        top:0;bottom:0
    }
    .btnUpload{
    // display: inline-block;
        position: relative;
        overflow: hidden;
    input{
        width: 52px;
        position: absolute;
        left: 0;
        opacity: 0;
    }
    }
    .answer-bottom{
        color:#BCBEC4;
        padding-left: 20px;
        font-size: 12px;
    // position: absolute;
    span{
        color: #1890FF;
        cursor: pointer;
    }
    .play-btn{
        float: right;
        margin-right: 20px;
    i{
        vertical-align:middle;
        margin-right: 5px;
    }
    }
    }
    .row-center{
        width:500px;
        margin-right:16px;
        height:240px;
        border: 1px solid #dcdfe6;
        overflow: hidden;
        position: relative;
    .el-textarea{
        .el-textarea__inner{
            border:none;
            height: 210px;
        }
    }
    .answer-bottom{
        color:#BCBEC4;
        padding-left: 20px;
        font-size: 12px;
    // position: absolute;
    span{
        color: #1890FF;
        cursor: pointer;
    }
    .play-btn{
        float: right;
        margin-right: 20px;
    i{
        vertical-align:middle;
        margin-right: 5px;
    }
    }
    }
    }
    .repository-btn-move{
        width: 20px;
        height: 20px;
        display: inline-block;
        position: relative;
        .el-button{
            position: absolute;
            top:4px;
        }
    }

</style>