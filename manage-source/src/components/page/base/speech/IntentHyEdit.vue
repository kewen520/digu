<template>
    <div class="">
        <div class="admin-page">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>管理中心</el-breadcrumb-item>
                <el-breadcrumb-item>话术管理</el-breadcrumb-item>
                <el-breadcrumb-item>意图库管理</el-breadcrumb-item>
                <el-breadcrumb-item>行业意图</el-breadcrumb-item>
                <el-breadcrumb-item>{{id?'编辑意图':'新增意图'}}</el-breadcrumb-item>
            </el-breadcrumb>
            <el-button class="back-btn" @click="handleBack">返回</el-button>
        </div>
        <div class="intent-add-body">
            <el-card class="box-card" shadow="never">
                <div slot="header" class="clearfix">
                    <span>{{id?'编辑意图':'新增意图'}}</span>
                </div>
                <div>
                    <el-form ref="addForm" :model="addForm" :rules="addFormRules" label-width="100px">
                        <el-form-item label="意图名称：" prop="intentionName">
                            <el-input v-model="addForm.intentionName" placeholder="输入意图名称" class="add-input"></el-input>
                        </el-form-item>
                        <el-form-item >
                            <el-button @click="downloadIntentionSentenceFile">下载模版</el-button>
                            <el-button type="primary">
                                <input type="file" id="importInput" @change="getIntentionSentenceByFile">
                                批量上传
                            </el-button>
                            <span class="add-tip">注：批量新增语料请先下载txt模版，填写后上传，每条语料必须换行填写</span>
                            <span class="file-name">{{filePath}}</span>
                        </el-form-item>
                        <el-form-item label="意图语料：" prop="intentionSentence">
                            <el-input type="textarea" placeholder="如有多个答案请以“|“隔开" v-model="addForm.intentionSentence" class="add-textarea"></el-input>
                        </el-form-item>
                        <el-form-item >
                            <el-checkbox v-model="checked" label="关联通用意图" name="type" @change="handleCheckboxChange"></el-checkbox>
                        </el-form-item>
                        <el-form-item v-for="(list,index) in relationListData" :key="index" v-show="isAssociation">
                            <el-select v-model="list.id" placeholder="请选择活动区域">
                                <el-option
                                    v-for="item in selectOpt"
                                    :key="item.id"
                                    :label="item.intentionName"
                                    :value="item.id">
                                </el-option>
                            </el-select>
                            <i class="el-icon-remove" @click="handleDelRelation(list,index)" v-show="index>0"></i>
                        </el-form-item>
                        <el-form-item v-show="isAssociation">
                            <i class="el-icon-circle-plus" @click="handleAddRelation"></i>
                        </el-form-item>
                        <el-form-item>
                            <span v-if="id">
                                <el-button type="primary" @click="onSave('update')">更新</el-button>
                            </span>
                            <span v-else>
                                <el-button @click="onSave('publish')">保存并发布</el-button>
                                <el-button type="primary" @click="onSave('save')">保存</el-button>
                            </span>
                        </el-form-item>
                    </el-form>
                </div>
            </el-card>
        </div>
    </div>
</template>

<script>
    import bus from '@/components/common/bus';
    export default {
        name: 'intentAdd',
        data() {
            return {
                type:'2',
                filePath:'',
                id:'',
                addForm:{
                    intentionName:'',
                    intentionSentence:'',

                },
                addFormRules:{
                    intentionName:[
                        { required: true, message: '意图名称不能为空！'},
                    ],
                    intentionSentence:[
                        { required: true, message: '意图语料不能为空！'},
                    ],
                },
                isAssociation:false,
                selectOpt:[],
                relationListData:[
                    {
                        id:''
                    }
                ],
                relationList:[],
                inputType:'file',
                checked:false
            }
        },
        computed: {
            
        },
        created(){
            if(this.$route.params.id){
                this.id = this.$route.params.id;
            }

            this.queryIntentionSpeechcraftManageList().then(()=>{
                this.queryIntentionDetail().then((res)=>{
                    this.addForm.intentionName = res.intentionName;
                    this.addForm.intentionSentence = res.intentionSentence;

                    let relationList = res.relationList;
                    if(relationList.length){
                        this.checked = true;
                        this.isAssociation = true;
                        let selectData = []
                        this.selectOpt.forEach((item,index)=>{
                            relationList.forEach((list)=>{
                                if(item.id == list.targetIntentionSpeechcraftId){
                                    selectData.push(item);
                                }
                            })
                        })
                        this.relationListData = selectData;
                    }
                });
            });

        },
        watch: {
            
        },
        methods: {
            onSave(type){

                this.$refs['addForm'].validate((valid) => {
                    if (valid) {

                        if(this.relationListData.length){
                            this.relationListData.map((item)=>{
                                if(item.id !=''){
                                    this.selectOpt.map((list)=>{
                                        if(item.id == list.id){
                                            let opt = {
                                                targetIntentionSpeechcraftId:list.id,
                                                targetIntentionName:list.intentionName
                                            }
                                            this.relationList.push(opt)
                                        }
                                    })
                                    
                                }
                            })
                        }

                        if(this.id){
                            this.modifyIntentionSpeechcraft();
                        }else{
                            this.addIntentionSpeechcraft(type);
                        }
                    }
                });
            },
            handleBack(){
                this.$router.push('/speech?type=3');
            },
            handleCheckboxChange(val){
                // if(val){
                    this.isAssociation = val
                // }
            },
            handleAddRelation(){
                this.relationListData.push({
                    id:''
                })
            },
            handleDelRelation(list,index){
                this.relationListData.splice(index,1);
            },
            //新增行业意图
            addIntentionSpeechcraft(type){
                let params = {
                    intentionType:this.type,
                    industryType:'',
                    intentionName:this.addForm.intentionName,
                    intentionSentence:this.addForm.intentionSentence
                };
                if(this.relationList.length){
                    params.relationList = this.relationList;
                }
                if(type=='save'){
                    params.intentionStatus='0';
                }else if(type=='publish'){
                    params.intentionStatus='2';
                }
                $.post(this.$baseUrl+'services/intention/addIntentionSpeechcraft.json',JSON.stringify(params)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.$message.success('保存成功！');
                        // this.handleBack();
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            //修改行业意图
            modifyIntentionSpeechcraft(){
                let params = {
                    id:this.id,
                    intentionName:this.addForm.intentionName,
                };
                if(this.addForm.intentionSentence.length){
                    params.intentionSentence = this.addForm.intentionSentence
                }
                if(this.relationList.length){
                    params.relationList = this.relationList;
                }

                $.post(this.$baseUrl+'services/intention/modifyIntentionSpeechcraft.json',JSON.stringify(params)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.$message.success('修改成功！');
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            //下载意图语料模版
            downloadIntentionSentenceFile(){
                window.location.href = this.$baseUrl+'services/intention/downloadIntentionSentenceFile.html'
            },
            //通过文件得到意图语料（批量上传）
            getIntentionSentenceByFile(){
                let self = this;
                var oMyForm = new FormData();
                oMyForm.append("file", $('#importInput')[0].files[0]);
                this.filePath = $('#importInput').val();

                $('#importInput').val('')

                $.ajax({
                    url: self.$baseUrl+'services/intention/getIntentionSentenceByFile.json',
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
                        self.addForm.intentionSentence = res.returnObject;
                    }else{
                        self.$message.error(res.errorInfoList[0].errorMessage)
                    }

                });
            },
            //查询意图详情
            queryIntentionDetail(){
                return new Promise((resolve)=>{
                    let params = {
                        intentionSpeechcraftId:this.id,
                        intentionType:this.type
                    };
                    $.get(this.$baseUrl+'services/intention/queryIntentionDetail.json',$.param(params)).then((res)=>{
                        if(res.resultMessageEnum=='0000'){
                            resolve(res.returnObject);
                        }else{
                            this.$message.error(res.errorInfoList[0].errorMessage);
                        }
                    });
                })
            },
            // 得到所有有效的行业列表
            //查询通用意图列表
            queryIntentionSpeechcraftManageList(){
                let params = {
                    intentionType:'1',
                    currentPage:0,
                    pageSize:100
                };
                return new Promise((resolve)=>{
                    $.post(this.$baseUrl+'services/intention/queryIntentionSpeechcraftManageList.json',JSON.stringify(params)).then((res)=>{
                        if(res.resultMessageEnum=='0000'){
                            this.selectOpt = res.returnObject.recordList;
                        }else{
                            this.$message.error(res.errorInfoList[0].errorMessage);
                        }
                        resolve();
                    });
                })
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
    .intent-add-body{
        margin: 20px 20px 20px;
        .el-button{
            position: relative;
            input{
                position: absolute;
                left: 0;
                top: 0;
                opacity: 0;
            }
        }
    }
    .add-input{
        width:240px;
    }
    .add-textarea{
        width: 80%;
        
        .el-textarea__inner{
            height:360px;
        }
    }
    .add-tip{
        color: #9397A1;
        margin-left: 10px;
        font-size: 12px;
    }
    .file-name{
        color:#409eff;
        margin-left: 10px;
    }
    .el-icon-circle-plus{
        color: #67c23a;
        font-size: 18px;
        cursor: pointer;
    }
    .el-icon-remove{
        color: #f56c6c;
        font-size: 18px;
        cursor: pointer;
    }
</style>
