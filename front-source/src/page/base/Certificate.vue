<template>
    <div class="cer-page">
        <div class="no-cer" v-show="status==0" :class="{'gray':disabled}">
            <span><i  class="w_ico_certificate-grey"></i></span>
            <!-- <el-button type="primary" @click="handleCertificate">立即认证</el-button> -->
            <el-button type="primary" v-if="!disabled" @click="handleCertificate">立即认证</el-button>
            <el-button type="info" disabled v-else >立即认证</el-button>
            <span class="tip">{{tipTxt}}</span>
            <!-- <span class="tip">{{num==0?'待认证':''}}</span> -->
        </div>
        <div class="steps-box" v-show="status==1">
            <el-steps :active="num">
                <el-step title="企业认证申请"></el-step>
                <el-step title="24h内完成审核" ></el-step>
                <el-step title="审核完成" v-if="num==3"></el-step>
                <el-step title="认证失败" class="warning" v-else-if="num==4"></el-step>
            </el-steps>
            <a class="warning-tip" v-show="num==4" @click="handleCertificate" >重新认证</a>

        </div>
        <div class="success-box" v-show="status==1 && num==3">
            <span class="success-tip"><i class="w_ico_certificate"></i>企业认证成功！可以开始创建话术任务啦！</span>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return{
            id:'a',
            isCerSteps:false,
            tipTxt:'您还未进行企业认证，不能创建外呼任务！',
            disabled:false
        }
    },
    props:['status','num'],
    components:{
        // status,
    },
    created(){
        
        
    },
    methods: {
        handleCertificate(){
            this.$emit('cerPop',true);
        }
    },
    watch:{
        num(val){
            if(val==0){
                this.tipTxt = '您还未进行企业认证，不能创建外呼任务';
            }
            if(val==1||val==2){
                this.tipTxt = '24小时完成审核，请等待';
            }
            if(val==4){
                this.tipTxt = '已驳回';
            }
            if(val==5){
                this.tipTxt = '24小时完成审核，请等待';
            }
            if(val==1||val==2||val==3||val==5){
                this.disabled = true;
            }
        }
    }
}
</script>


<style scoped lang="less">
   .cer-page{
       background: #fff;
       padding:20px 20px;
       .no-cer{
           text-align:center;
           
           span{
               display: block;
               i{
                   display:inline-block;
               }
           }
           .el-button{
               margin:15px 0;
           }
       }
       .tip{
           color: #FF324E;
           font-size: 14px;
       }
       .gray{
           .tip{
                color: #c8c9cc;
            }
       }
       .steps-box{
           margin: 0 auto;
           width: 500px;
           position: relative;
           .el-step__icon{
               width: 40px;
               height: 40px;
           }
           .warning-tip{
               position:absolute;
               right: -100px;
               top: 12px;
               color: #4E8FF9;
               font-size: 16px;
           }
       }
       .success-box{
           font-size: 16px;
           text-align: center;
           padding:40px 20px 20px;
           color: #303133;
           .success-tip{
               display:inline-block;
               line-height: 40px;
               i{
                   margin-right: 5px;
                   float: left;
               }
           }
       }
       
   } 
</style>
