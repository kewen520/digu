<template>
    <div class="">
        <div class="admin-page">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>管理中心</el-breadcrumb-item>
                <el-breadcrumb-item>话术管理</el-breadcrumb-item>
                <el-breadcrumb-item>意图库管理</el-breadcrumb-item>
                <el-breadcrumb-item>用户意图</el-breadcrumb-item>
                <el-breadcrumb-item>查看意图</el-breadcrumb-item>
            </el-breadcrumb>
            <el-button class="back-btn" @click="handleBack">返回</el-button>
        </div>
        <div class="intent-add-body">
            <el-card class="box-card" shadow="never">
                <div slot="header" class="clearfix">
                    <span>查看意图</span>
                </div>
                <div>
                    <el-form ref="addForm" :model="addForm"  label-width="100px">
                        <el-form-item label="意图名称：">
                            <el-input v-model="addForm.intentionName" disabled placeholder="输入意图名称" class="add-input"></el-input>
                        </el-form-item>
                        <el-form-item label="意图语料：">
                            <el-input type="textarea" disabled  placeholder="如有多个答案请以“|“隔开" v-model="addForm.intentionSentence" class="add-textarea"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-button  @click="createExportIntentionExcelFile()">导出</el-button>
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
                type:'3',
                // filePath:'',
                id:'',
                addForm:{
                    intentionName:'',
                    intentionSentence:'',

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
            handleBack(){
                this.$router.go(-1);
            },
            
            //创建意图导出Excel文件
            createExportIntentionExcelFile(){
                
                let ids = [];
                ids.push(this.id);
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
            .el-input{
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
