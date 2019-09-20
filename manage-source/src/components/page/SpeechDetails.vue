<template>
    <div class="">
        <el-row class="back-btn-box">
            <router-link to="/speech"><el-button>返回</el-button></router-link>
        </el-row>
        <div class="admin-content">
            <div class="w-box-card">
                <div class="w-card__header">
                    <span>话术信息</span>
                    <div style="float:right;margin-top:-6px;" v-show="speechForm.speechcraftStatus==2||speechForm.speechcraftStatus==4||speechForm.speechcraftStatus==7">
                        <el-button type="danger" @click="overruleVisible = true">驳回</el-button>
                        <el-button type="success" @click="byVisible=true">通过</el-button>
                    </div>
                </div>
                <div class="w-card__body">
                    <el-row :gutter="20">
                        <el-col :span="8">
                            <el-form ref="speechForm" :model="speechForm" label-width="120px">
                                <el-form-item label="话术名称：" >
                                    {{speechForm.speechcraftName}}
                                </el-form-item>
                                <el-form-item label="所属行业：">
                                    {{speechForm.industryName}}
                                </el-form-item>
                                <el-form-item label="提交用户：">
                                    {{speechForm.latestApplyName}}
                                </el-form-item>
                            </el-form>
                        </el-col>
                        <el-col :span="8">
                            <el-form ref="speechForm" :model="speechForm" label-width="120px">
                                <el-form-item label="提交时间：" >
                                    {{speechForm.latestApplyTime}}
                                </el-form-item>
                                <el-form-item label="提交人：">
                                    {{speechForm.latestApplyName}}
                                </el-form-item>
                                <el-form-item label="截止时间：">
                                    {{speechForm.latestApproveEndTime}}
                                </el-form-item>
                            </el-form>
                        </el-col>
                        <el-col :span="8">
                            <el-form ref="speechForm" :model="speechForm" label-width="120px">
                                <el-form-item label="审核时间：">
                                    {{speechForm.latestApproveTime}}
                                </el-form-item>
                                <el-form-item label="审核负责人：">
                                    {{speechForm.latestApproveRoleName}}
                                </el-form-item>
                                <el-form-item label="审核人：">
                                    {{speechForm.latestApproveManagerName}}
                                </el-form-item>
                                <el-form-item label="审核状态：">
                                    {{speechForm.speechcraftStatusTxt}}
                                </el-form-item>
                                <el-form-item label="审核结果：">
                                    {{speechForm.speechcraftStatusTxt}}
                                </el-form-item>
                            </el-form>
                        </el-col>
                    </el-row>
                </div>
                
                <div>
                    <iframe width="100%" height="1000" :src="iframeSrc" frameborder="0"></iframe>
                </div>
            </div>
        </div>

        <!-- 通过提示框 -->
        <el-dialog title="通过认证申请" :visible.sync="byVisible" width="600px" center>
            <div class="overrule-dialog-cnt by-dialog">
                您确认对话术审核无误，要对其申请予以通过吗？
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="byVisible = false">取 消</el-button>
                <el-button type="primary" @click="approveSpeechcraftResult(true)">确认通过</el-button>
            </span>
        </el-dialog>
        <!-- 驳回提示框 -->
        <el-dialog title="驳回话术申请" :visible.sync="overruleVisible" width="600px" center>
            <div class="overrule-dialog-cnt">
                <el-form ref="formOverruleForm" :model="formOverrule" label-width="90px">
                    <el-form-item label="驳回原因：（可多选）" prop="type" class="form-item-check" :error="errors.formOverruleDesc">
                        <el-checkbox-group v-model="formOverrule.type" @change="changeCheckbox">
                            <el-checkbox
                            v-for="(item,index) in checkboxList"
                            :key="index"
                            :label="item"
                            name="type">
                            </el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                    <el-form-item label="详细说明：" :error="errors.formOverruleType" prop="desc">
                        <el-input type="textarea" @change="changeInput" placeholder="必填，请注明有误的节点名称及原因" v-model="formOverrule.desc"></el-input>
                    </el-form-item>
                </el-form>
                <div></div>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="overruleVisible = false">取 消</el-button>
                <el-button type="primary" @click="approveSpeechcraftResult(false)">确认驳回</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    // import bus from '../common/bus';
    import common from '../common/common';
    export default {
        name: 'auth',
        data() {
            return {
                phase:'',
                overruleVisible:false,
                byVisible:false,
                speechForm:{
                    enterpriseName:''
                },
                checkboxList:['含有敏感词汇','含有非法字符','有语病','内容和话术节点不对应'],
                formOverrule:{
                    type:[],
                    desc:''
                },
                errors:{
                    formOverruleType:'',
                    formOverruleDesc:''
                },
                iframeSrc:'',
                showDesc:false,
            }
        },
        mounted(){
            let clintHeight = document.documentElement.clientHeight;
            let height = clintHeight - 123;
            // $('.admin-content').css('height',height);
        },
        created(){
            // 1 审核 5重审
            this.phase = this.$route.query.phase;
            this.speechcraftId=this.$route.params.id;
            this.queryMemberDetail();
            this.$nextTick(() => {
                let url = `${baseUrl}flow/index.html?viewType=0&m=2&speechcraftId=${this.speechcraftId}&m=1&flowType=1`;
                this.iframeSrc =url;
            })
            
        },
        methods: {
            resetForm(){
               
            },
            onSubmit(){
               
            },
            changeCheckbox(value){
                // console.log(value)
                // if(value.length==1 && value[0]=='其他'){
                //     this.showDesc = true;
                // }else{
                //     this.showDesc = false;
                // }
                if(value.length){
                    this.errors.formOverruleDesc='';
                }
            },
            // addHandle(){
            //     let newArry = this.checkboxList;
            //     newArry.push('');
            //     this.checkboxList = newArry
            //     this.checkboxList.push('')
            // },
            changeInput(value){
                this.errors.formOverruleType='';
            },
            // 查询话术详情
            queryMemberDetail(){
                let data = {
                    speechcraftId:this.$route.params.id
                }
                $.get(this.$baseUrl+'services/speechcraft/querySpeechcraftDetail.json',$.param(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        let object = res.returnObject;


                        object.speechcraftStatusTxt= common.formatterSpeechcraftStatus(object.speechcraftStatus);
                        object.authenticationFlag=object.authenticationFlag==0?'未认证':'已认证';

                        if(object.latestApproveRejectReason){
                            object.latestApproveRejectReason = JSON.parse(object.latestApproveRejectReason).join(',');
                        }
                        this.speechForm = object;

                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            // 审核话术
            approveSpeechcraftResult(resultFlag){
                let arry = [];
                if(!resultFlag){
                    if(!this.formOverrule.type.length){
                        this.errors.formOverruleDesc = '请勾选驳回原因！'
                        return false;
                    }
                    // if(!this.formOverrule.desc){
                    //     this.errors.formOverruleType = '请注明有误的节点名称及原因！';
                    //     return false;
                    // }
                }
                
                let data = {
                    id:this.$route.params.id,
                    resultFlag:resultFlag
                }
                if(!resultFlag){
                    arry = arry.concat(this.formOverrule.type)
                    this.formOverrule.desc && arry.push(this.formOverrule.desc)
                    data.rejectReason = JSON.stringify(arry);
                }

                $.post(this.$baseUrl+'services/speechcraft/approveSpeechcraftResult.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.$message.success('操作成功！')
                        this.byVisible=false;
                        this.overruleVisible=false;
                        this.$router.push('/speech');
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            createExportTaskItemExcelFile(){
                
            },
            handleOverrule(){
                this.overruleVisible=true;
            }
        }
    }

</script>


<style scoped lang="less">

    .admin-content{
        margin-top: 20px;
    }
    .w-card__footer{
        text-align: right;
        padding:20px 20px 60px;
        .el-button{
            padding-left: 20px;
            padding-right: 20px;
        }
    }
    .overrule-dialog-cnt{
        .el-checkbox-group .el-checkbox{
            float: left;
            width: 210px;
            padding-right: 20px;
            margin: 0;
            padding-left:0px;
        }
        .edit-input{
            display:inline-block;
            height: 40px;
            margin-right: 10px;
            position: relative;
        }
        .el-input{
            width:200px;
        }
        .form-item-check{
            .el-icon-remove{
                // position:absolute;
                // left: -5px;
                // top: 10px;
            }
        }

    }
    .photo{
        width:200px;
        img{
            width: 100%;
            height:118px;
        }
        span{
            display: block;
            text-align:center;
        }
    }
    .overrule-dialog-cnt{
        min-height:140px;
    }
    .by-dialog{
        text-align:center;
        padding-top:40px;
    }
    .speechForm-waning{
        color: #f56c6c;
    }
    
</style>
