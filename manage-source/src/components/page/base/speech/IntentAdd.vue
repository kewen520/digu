<template>
    <div class="">
        <div class="admin-page">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>管理中心</el-breadcrumb-item>
                <el-breadcrumb-item>话术管理</el-breadcrumb-item>
                <el-breadcrumb-item>意图库管理</el-breadcrumb-item>
                <el-breadcrumb-item>通用意图</el-breadcrumb-item>
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
                                <input :value="filePath" type="file" id="importInput" @change="getIntentionSentenceByFile">
                                批量上传
                            </el-button>
                            
                            <span class="add-tip">注：批量新增语料请先下载txt模版，填写后上传，每条语料必须换行填写</span>
                        </el-form-item>
                        <el-form-item label="意图语料：" prop="intentionSentence">
                            <el-input type="textarea" placeholder="如有多个答案请以“|“隔开" v-model="addForm.intentionSentence" class="add-textarea"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <span v-if="id">
                                <el-button type="primary" @click="onSave">更新</el-button>
                            </span>
                            <span v-else>
                                <el-button>取消</el-button>
                                <el-button type="primary" @click="onSave">保存</el-button>
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
                filePath:'',
                id:'',
                addForm:{
                    intentionName:'',
                    intentionSentence:''
                },
                addFormRules:{
                    intentionName:[
                        { required: true, message: '意图名称不能为空！'},
                    ],
                    intentionSentence:[
                        { required: true, message: '意图语料不能为空！'},
                    ],
                }
            }
        },
        computed: {
            
        },
        created(){
            if(this.$route.params.id){
                this.id = this.$route.params.id;
                this.queryIntentionDetail().then((res)=>{
                    this.addForm.intentionName = res.intentionName;
                    this.addForm.intentionSentence = res.intentionSentence;
                });
            }
        },
        watch: {
            
        },
        methods: {
            onSave(){
                this.$refs['addForm'].validate((valid) => {
                    if (valid) {
                        if(this.id){
                            this.modifyIntentionSpeechcraft();
                        }else{
                            this.addIntentionSpeechcraft();
                        }
                    }
                });
            },
            handleBack(){
                this.$router.push('/speech?type=3');
            },
            //新增通用意图
            addIntentionSpeechcraft(){
                let params = {
                    intentionType:'1',
                    intentionName:this.addForm.intentionName,
                    intentionSentence:this.addForm.intentionSentence
                };
                $.post(this.$baseUrl+'services/intention/addIntentionSpeechcraft.json',JSON.stringify(params)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.$message.success('保存成功！');
                        this.handleBack();
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            //修改通用意图
            modifyIntentionSpeechcraft(){
                let params = {
                    id:this.id,
                    intentionName:this.addForm.intentionName,
                    intentionSentence:this.addForm.intentionSentence
                };
                $.post(this.$baseUrl+'services/intention/modifyIntentionSpeechcraft.json',JSON.stringify(params)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.$message.success('修改成功！');
                        this.handleBack();
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
                        console.log(res)
                    }else{
                        self.errorMsg = res.errorInfoList[0].errorMessage;
                    }
                });
            },
            //查询意图详情
            queryIntentionDetail(){
                return new Promise((resolve)=>{
                    let params = {
                        intentionSpeechcraftId:this.id,
                        intentionType:'1'
                    };
                    $.get(this.$baseUrl+'services/intention/queryIntentionDetail.json',$.param(params)).then((res)=>{
                        if(res.resultMessageEnum=='0000'){
                            resolve(res.returnObject);
                        }else{
                            this.$message.error(res.errorInfoList[0].errorMessage);
                        }
                    });
                })
            }
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
    
    .add-tip{
        color: #9397A1;
        margin-left: 10px;
        font-size: 12px;
    }

</style>
