<template>
    <div class="table">
        <div class="content-box-top">
            <el-row>
                <el-col>
                    <el-button @click="goBack">返回</el-button>
                </el-col>
            </el-row>
        </div>
        <div class="w-container" style="padding-top: 50px">
            <el-card class="box-card repository-card">
                <div slot="header" class="clearfix">
                    <span>查看回答对</span>
                </div>
                <div class="repository-edit-box">
                    <el-form :model="editForm" :rules="editRules" ref="editForm" label-width="100px" class="demo-ruleForm">
                        <div class="form-head">
                            主问题：
                            <!-- <span class="questionBox" v-show="editHeadShow">{{editForm.questionContent}}<i class="iconfont icon-ico_edit-content" @click="handleShowEdit('edit')"></i></span> -->
                            <el-input v-model="editForm.questionContent" placeholder="主问题" :readonly="readonly"></el-input>
                            <!-- <span class="repository-icon-box edit-box" v-show="!editHeadShow">
                                <i class="el-icon-check" @click="handleShowEdit('confirm')"></i>
                                <i class="el-icon-close" @click="handleShowEdit('cancel')"></i>
                            </span> -->
                        </div>
                        <el-row>
                            <el-col :span="12">
                                <div class="w__header">
                                    <span class="left w_rell">相似问题<i v-if="!readonly" class="iconfont icon-ico_add" @click="addQustion"></i></span>
                                    <span class="right w_rell">操作</span>
                                </div>
                                <div class="w__body left">
                                    <div class="w__body_item" :class="{row_striped:index%2==0,'fixed':item.fixed}" v-for="(item,index) in questionContentOther" :key="index">

                                        <!-- <span class="w_rell" v-show="!item.show" >
                                            {{item.name}}
                                        </span>
                                        <span class="right w_rell" v-show="!item.show">
                                            <i class="iconfont icon-ico_edit-content" @click="questionEdit('edit',index)"></i>
                                            <i class="iconfont icon-ico_delete" @click="questionEdit('del',index)"></i>
                                        </span> -->

                                        <span class="w_rell">
                                            <el-input v-model="item.name" placeholder="输入相似问题" :readonly="readonly"></el-input>
                                        </span>
                                        <span class="right w_rell">
                                            <i  v-if="!readonly" class="iconfont icon-ico_delete" @click="questionEdit('del',index)"></i>
                                        </span>
                                        <!-- <span v-show="item.show" class="right w_rell">
                                            <i class="el-icon-check" @click="questionEdit('confirm',index)"></i>
                                            <i class="el-icon-close" @click="questionEdit('cancel',index)"></i>
                                        </span> -->
                                    </div>
                                </div>
                            </el-col>
                            <el-col :span="12">
                                <div class="repository-edit-tab">
                                    <el-tabs v-model="editableTabsValue" :editable="!readonly" @edit="handleTabsEdit" @tab-click="handleTabsClick">
                                        <el-tab-pane
                                                :key="index"
                                                v-for="(item,index) in editableTabs"
                                                :label="item.title"
                                                :name="item.name"
                                        >
                                            <div class="rep-edit-top">
                                                <i v-if="!readonly">您可以<span class="link" @click="handleUseAudio">使用音频</span>（使用后将自动填充对应文本）或
                                                    <span class="link">上传音频<input type="file" multiple="multiple" class="importFile"  @change="uploadAnnexFileOfInfo(item,index)" ></span></i>
                                                <div class="canel-box">
                                                    <div v-show="item.soundPath" >
                                                        <i class="iconfont icon-icon_play" @click="handleVideo(item)"></i>
                                                        <span @click="handleCancelPlay(item,index)"  v-if="!readonly">取消</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <textarea :readonly="readonly" v-model="item.answerContent" class="w_textarea"></textarea>
                                        </el-tab-pane>
                                    </el-tabs>
                                </div>
                                <!-- <div class="w__header">
                                    <span class="left w_rell">回答</span>
                                    <span class="right w_rell">操作</span>

                                </div>
                                <div class="w__body">
                                    <div class="w__body_item">
                                        <span>
                                            <textarea v-model="editForm.answerContent" class="w_textarea"></textarea>
                                        </span>
                                        <span class="right" v-show="textareaDisabled" style="vertical-align: top;">
                                            <i class="iconfont icon-ico_edit-content"  @click="answerEdit('edit')"></i>
                                        </span>
                                        <span class="right" v-show="!textareaDisabled" style="vertical-align: top;">
                                            <i class="el-icon-check" @click="answerEdit('confirm')"></i>
                                            <i class="el-icon-close" @click="answerEdit('cancel')"></i>
                                        </span>
                                    </div>
                                </div> -->
                            </el-col>
                        </el-row>
                    </el-form>
                    <div slot="footer" class="repository-edit-footer" v-if="!readonly">
                        <el-button @click="handleCancel">取 消</el-button>
                        <el-button type="primary" @click="modifyKnowledgeItem('editForm')">保 存</el-button>
                    </div>
                </div>
            </el-card>
        </div>
        <!-- 返回提醒-->
        <el-dialog title="保存提示" :visible.sync="returnVisible" width="400px">
            <div >您尚未保存编辑！</div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="returnVisible = false">取 消</el-button>
                <el-button type="primary" @click="modifyKnowledgeItem">保 存</el-button>
            </span>
        </el-dialog>
        <!-- 试听 -->
        <el-dialog title="音频" :visible.sync="videoVisible" width="600px">
            <w-video :source="viewSource" :playing="viewPlaying"/>
        </el-dialog>
        <div class="sound-content" v-show="visibleSound">
            <w-sound :from="pageFrom"/>
        </div>
    </div>
</template>

<script>
    import bus from '../common/bus';
    import wVideo from './base/Video';
    import wSound from './Sound'
    export default {
        name: 'repository',
        data() {
            return {
                readonly:true,
                editHeadShow:true,
                oldQuestionContent:'',
                textareaDisabled:true,
                returnVisible:false,
                visibleSound:false,
                oldData:'',
                newData:'',
                editForm:{
                    questionContent:''
                },
                questionContentOther:[],
                // answerContent:[],
                editRules: {
                    name: [
                        { required: true, message: '请输入问题名称', trigger: 'blur' }
                    ],
                    region: [
                        { required: true, message: '请选择问题分类', trigger: 'change' }
                    ],
                    desc: [
                        { required: true, message: '输入回答', trigger: 'blur' }
                    ]
                },
                editableTabsValue:'1',
                editableTabs: [{
                    title:`回答1`,
                    name:'1',
                    answerContent:'请输入回答',
                }],
                tabIndex:1,
                tabActiveVal:0,
                videoVisible:false,
                viewPlaying:false,
                viewSource:'',
                pageFrom:''
            }
        },
        created() {
            bus.$emit('contentTop', false);
            this.queryKnowledgeItemDetail();
            bus.$on('closeSound',msg=>{
                if(msg){
                    this.visibleSound = false;
                }
            });
            bus.$on('fileName',msg=>{
                if(msg){
                    this.editableTabs[this.tabActiveVal]['soundPath'] = msg.soundPath;
                    this.editableTabs[this.tabActiveVal]['soundDuration'] = msg.soundDuration;
                    this.editableTabs[this.tabActiveVal]['soundSize'] = msg.soundSize;
                    this.editableTabs[this.tabActiveVal]['answerContent'] = msg.soundContent;
                }

            });
        },
        computed: {
            //    fileName(){
            //        return this.$store.getters.getFile
            //    }
        },
        components: {
            wVideo,
            wSound
        },
        methods: {
            handleUseAudio(){
                this.pageFrom = 'repositoryEdit';
                this.visibleSound = true;
            },
            search() {

            },
            handleTabsClick(el){
                this.tabActiveVal = el.index*1;
            },
            handleVideo(item){
                this.videoVisible=true;
                this.$nextTick(() => {
                    this.viewSource =item.soundPath;
                })
            },
            handleCancelPlay(item,index){
                this.editableTabs[index].soundPath='';
                this.editableTabs[index].soundDuration='';
                this.editableTabs[index].soundSize='';
            },
            handleTabsEdit(targetName,action) {
                if (action === 'add') {
                    let newTabName = ++this.tabIndex + '';
                    this.editableTabs.push({
                        title: '回答'+newTabName,
                        name: newTabName,
                        content: ''
                    });
                    this.editableTabsValue = newTabName;
                }
                if (action === 'remove') {
                    let tabs = this.editableTabs;
                    let activeName = this.editableTabsValue;
                    if(tabs.length<2){
                        return;
                    }
                    if (activeName === targetName) {
                        tabs.forEach((tab, index) => {
                            if (tab.name === targetName) {
                                let nextTab = tabs[index + 1] || tabs[index - 1];
                                if (nextTab) {
                                    activeName = nextTab.name;
                                }
                            }
                        });
                    }

                    this.editableTabsValue = activeName;
                    this.editableTabs = tabs.filter(tab => tab.name !== targetName);
                }
            },
            // 显示编辑主问题
            handleShowEdit(type){
                if(type=='edit'){
                    this.oldQuestionContent = this.editForm.questionContent;
                }
                if(type=='cancel'){
                    this.editForm.questionContent = this.oldQuestionContent;
                }
                this.editHeadShow = !this.editHeadShow ;
            },
            // 查询知识库明细详情
            queryKnowledgeItemDetail(){
                let data={
                    id:this.$route.params.id
                }
                $.get(this.$baseUrl+'knowledge/queryKnowledgeItemDetail.json',$.param(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){

                        let questionContentOther =JSON.parse(res.returnObject.questionContentOther);
                        let answerContent = JSON.parse(res.returnObject.answerContent);

                        if(answerContent.length){
                            this.editableTabs = answerContent.map((item,index)=>{
                                return {
                                    title:`回答${index+1}`,
                                    name:`${index+1}`,
                                    answerContent:`${item.text}`,
                                    soundPath:item.soundPath,
                                    soundDuration:item.soundDuration,
                                    soundSize:item.soundSize
                                }
                            })
                        }

                        // this.oldData = JSON.stringify({
                        //     questionContent:res.returnObject.questionContent,
                        //     questionContentOther:res.returnObject.questionContentOther,
                        //     answerContent:res.returnObject.answerContent
                        // });
                        // // res.returnObject.questionContentOther = JSON.parse(res.returnObject.questionContentOther);

                        if(this.editForm && questionContentOther.length){
                            let list = [];
                            questionContentOther.forEach((el,index) => {
                                list[index] = {};
                                // list[index]['isEdit']=false;
                                // list[index]['show']=false;
                                list[index]['name']=el;
                            });
                            this.questionContentOther = list;
                        }

                        this.editForm = res.returnObject;

                    }else{

                    }
                });
            },
            addQustion(){
                let item = {
                    isEdit:true,
                    show:true,
                    name:''
                }
                // if(this.questionContentOther.length>7){
                //     item.fixed=true;
                // }
                if(this.questionContentOther.length<1){
                    this.questionContentOther.push(item);
                }else{
                    this.questionContentOther.splice(0,0,item)
                }

                // this.questionContentOther.push(item)
            },
            textareaEdit(){
                this.textareaDisabled = false;
            },
            answerEdit(type){
                if(type=='edit'){
                    this.editForm.oldAnswerContent = this.editForm.answerContent;
                    this.textareaDisabled = false;
                }else if(type=='confirm'){
                    this.textareaDisabled = true;
                }else if(type=='cancel'){
                    this.textareaDisabled = true;
                    this.editForm.answerContent = this.editForm.oldAnswerContent;
                }
            },
            questionEdit(type,index){
                switch(type){
                    case 'edit':
                        this.questionContentOther[index].show = true;
                        this.questionContentOther[index].isEdit = true;
                        this.questionContentOther[index].oldName = this.questionContentOther[index].name;
                        break;
                    case 'del':
                        this.questionContentOther.splice(index,1);
                        break;
                    case 'confirm':
                        this.questionContentOther[index].show = false;
                        this.questionContentOther[index].fixed = false;
                        this.questionContentOther[index].isEdit = false;
                        break;
                    case 'cancel':
                        if(this.questionContentOther[index].oldName){
                            this.questionContentOther[index].show = false;
                            this.questionContentOther[index].isEdit = false;
                            this.questionContentOther[index].name = this.questionContentOther[index].oldName;
                        }else{
                            this.questionContentOther.splice(index,1);
                        }
                        break;
                }
            },
            // 2.6.11.	修改知识库明细
            modifyKnowledgeItem(){
                if(!this.editForm.questionContent){
                    this.$message.error('请添加主问题！');
                    return false;
                }
                if(!this.questionContentOther.length){
                    this.$message.error('请添加相似问题！');
                    return false;
                }
                if(!this.editForm.answerContent){
                    this.$message.error('请添加回答！');
                    return false;
                }

                let questionContentOther = [];
                this.questionContentOther.forEach(el=>{
                    questionContentOther.push(el.name);
                });

                let answerContent = this.editableTabs.map((item)=>{
                    return {
                        text:item.answerContent,
                        soundPath:item.soundPath,
                        soundDuration:item.soundDuration,
                        soundSize:item.soundSize
                    }
                })

                let data={
                    id:this.$route.params.id,
                    questionContent:this.editForm.questionContent,
                    questionContentOther:JSON.stringify(questionContentOther),
                    answerContent:JSON.stringify(answerContent)
                    // answerContent:this.editForm.answerContent
                }

                $.post(this.$baseUrl+'services/knowledge/modifyKnowledgeItem.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.$message.success('保存成功！');

                        if(this.returnVisible){
                            // this.saveTrue = true;
                            this.returnVisible = false;
                        }
                        this.goBack();
                        // setTimeout(()=>{
                        //     this.$router.push('/repository');
                        // },1000)
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            // importSoundConfigItemExcelFile
            uploadAnnexFileOfInfo(item,index){
                let self = this;

                var oMyForm = new FormData();
                oMyForm.append("sourceType", 103);
                oMyForm.append("file", $('.importFile')[index].files[0]);

                $('.importFile').eq(index).val('');

                $.ajax({
                    url: this.$baseUrl+'services/common/uploadAnnexFileOfInfo.json',
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
                        let data = res.returnObject;

                        self.editableTabs[self.tabActiveVal]['soundPath'] = data.filePath;
                        self.editableTabs[self.tabActiveVal]['soundDuration'] = data.soundDuration;
                        self.editableTabs[self.tabActiveVal]['soundSize'] = data.fileSize;

                    }else{
                        self.$message.error('上传失败！');
                    }

                }).fail(function(res) {

                });
            },
            changeExcelFile(){
                $('#importFile').val('');
            },
            // 返回时 判断是否保存
            goBack(){
                // this.$router.back(-1);
                this.$router.go(-1);
                // if(this.saveTrue){
                //     this.$router.push('/repository');
                // }
                // let questionContentOther = [];
                // this.questionContentOther.forEach(el=>{
                //     questionContentOther.push(el.name);
                // });
                // this.newData = {
                //     questionContent:this.editForm.questionContent,
                //     questionContentOther:JSON.stringify(questionContentOther),
                //     answerContent:this.editForm.answerContent
                // };
                // if(this.oldData.replace(/\s+/g,'') == JSON.stringify(this.newData).replace(/\s+/g,'')){
                //     this.$router.push('/repository');
                // }else{
                //     this.returnVisible = true;
                // }

                // this.$router.push('/repository');
            },
            handleCancel(){
                this.questionContentOther=[];
                this.queryKnowledgeItemDetail();
                // this.answerEdit('cancel');
                this.$router.go(-1);
            }
        },
        watch:{
            videoVisible(curVal){
                if(!curVal){
                    bus.$emit('viewPlaying',true);
                }
            }
        }
        // beforeRouteLeave(to, from, next){
        // },
        // destroyed(){
        //     // bus.$emit('contentTop', false);
        // }
    }

</script>

<style scoped lang="less">
    .iconfont{
        font-size: 14px;
    }
    .handle-input {
        width:240px;
        display: inline-block;
    }
    .el-card__header{
    .link{
        cursor: pointer;
        color: #4E8FF9;
    }
    }
    .questionBox{
        height: 32px;
        line-height: 32px;
    .iconfont{
        font-size: 12px;
        margin-left:10px;
        cursor: pointer;
    }
    }
    .edit-box{
    i{
        font-weight: bold;
        cursor: pointer;
    }
    .el-icon-check{
        color: #67c23a;
    }
    .el-icon-close{
        color: #f56c6c;
    }
    }
    .w__header{
        width: 100%;
        display:table;
        border-bottom: 1px solid #ebeef5;
    span.w_rell{
        display: table-cell;
        padding: 8px 0 8px 30px;
        line-height: 23px;
        font-size: 14px;
    .iconfont{
        color: #4E8FF9;
        cursor: pointer;
        margin-left: 5px;
    }
    }
    .right{
        width:95px;
        padding-left:15px;
    }
    .el-icon-circle-plus{
        color: #4E8FF9;
        margin-left: 10px;
        cursor: pointer;
    }
    }
    .w__body{
        height: 434px;
        overflow-y:auto;
        border-bottom: 1px solid #ebeef5;
        position: relative;
    &.left{
         border-right:1px solid #ebeef5;
     }
    }
    .w__body_item{
        width: 100%;
        display:table;

    &.row_striped{
         background-color:#FAFAFA;
     }
    &.fixed{
         background-color: #fff;
         position: absolute;
         top:352px;
         width: 100%;
         left: 0;
     }
    span{
        display: table-cell;
        padding: 8px 0 8px 30px;
        line-height:32px;

    }
    .right{
        width:100px;
        padding-left:10px;
    i{
        margin-left: 5px;
        font-weight: bold;
        cursor: pointer;
    &.el-icon-close{
         color: #F04A61;
     }
    &.el-icon-check{
         color: #0FD9AC;
     }
    }
    }
    }
    .w_textarea{
        box-sizing: border-box;
        width: 100%;
        height:300px;
        padding:10px;
        margin: 0 0px 52px;
        border:1px solid #DEE2E6;
        font-size: 14px;
        color:#303133;
        outline:none;
        border-radius:10px;
    // border-bottom:1px solid #ebeef5;
    }
    .link{
    // display: inline-block;
        color: #4E8FF9;
        text-decoration: underline;
        cursor: pointer;
        position: relative;
        overflow: hidden;
    a{
        color: #4E8FF9;
    }
    }
    .goto-header{
        margin-bottom: 15px;
    }
    .importFile{
        position: absolute;
        width:58px;
        left: 0;
        top: 0;
        right: 0;
        opacity: 0;
    }
    .rep-edit-top{
        padding:0px 20px 10px;
    }
    .canel-box{
        height: 22px;
        padding: 10px 0 0;
        line-height: 22px;
    .icon-icon_play{
        color: #4E8FF9;
        font-size:20px;
        float: left;
        margin-right: 10px;
        cursor: pointer;
    }
    span{
        cursor: pointer;
    }
    }
    .sound-content{
        position:fixed;
        z-index:15;
        background-color:#fff;
        left:0;
        width:100%;
        top:0;bottom:0
    }
</style>
