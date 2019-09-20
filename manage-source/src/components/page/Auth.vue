<template>
    <div class="container-admin">
        <el-row class="back-btn-box">
            <router-link to="/certification"><el-button>返回</el-button></router-link>
        </el-row>
        <div class="admin-body">
            <div class="w-box-card">
                <div class="w-card__header">
                    <span>认证信息</span>
                </div>
                <div class="w-card__body">
                    <el-row :gutter="20">
                        <el-col :span="14">
                            <el-form ref="authForm" :model="authForm" label-width="120px">
                                <el-form-item label="企业中文全称：" >
                                    {{authForm.enterpriseName}}
                                </el-form-item>
                                <el-form-item label="法人代表姓名：">
                                    {{authForm.legalRepresentative}}
                                </el-form-item>
                                <el-form-item label="法人身份证号：">
                                    {{authForm.legalRepresentativeCardNumber}}
                                </el-form-item>
                                <el-form-item label="法人身份证照：">
                                    <el-row class="photo-box">
                                        <el-col :span="12">
                                            <div class="photo">
                                                <img :src="authForm.identityCardFrontPath" alt="">
                                                <span>正面</span>
                                            </div>
                                        </el-col>
                                        <el-col :span="12">
                                            <div class="photo">
                                                <img :src="authForm.identityCardBackPath" alt="">
                                                <span>反面</span>
                                            </div>
                                        </el-col>
                                    </el-row>
                                </el-form-item>
                                <el-form-item label="企业营业执照：">
                                    <div class="photo">
                                        <img :src="authForm.businessLicensePath" alt="">
                                    </div>
                                </el-form-item>
                            </el-form>
                        </el-col>
                        <el-col :span="10">
                            <el-form ref="authForm" :model="authForm" label-width="120px">
                                <el-form-item label="申请时间：">
                                    {{authForm.latestApplyTime}}
                                </el-form-item>
                                <el-form-item label="申请人：">
                                    {{authForm.latestApplyName}}
                                </el-form-item>
                                <el-form-item label="截止时间：" class="authForm-waning">
                                    {{authForm.latestApproveEndTime}}
                                    <span v-show="authForm.timeOverType==2">即将截止</span>
                                    <span v-show="authForm.timeOverType==3">已超时</span>
                                </el-form-item>
                                <el-form-item label="审核时间：">
                                    {{authForm.latestApproveTime}}
                                </el-form-item>
                                <el-form-item label="审核人：">
                                    {{authForm.latestApproveManagerName}}
                                </el-form-item>
                                <el-form-item label="审核状态：">
                                    {{authForm.authenticationPhase}}
                                </el-form-item>
                                <el-form-item label="认证结果：">
                                    {{authForm.authenticationFlag}}
                                </el-form-item>
                                <el-form-item label="失败原因：" v-show="authForm.latestApproveRejectReason">
                                    {{authForm.latestApproveRejectReason}}
                                </el-form-item>
                            </el-form>
                        </el-col>
                    </el-row>
                </div>
                <div class="w-card__footer" >
                    <el-button type="danger" v-show="phase==1||phase==5" @click="overruleVisible = true">驳回</el-button>
                    <el-button type="success" v-show="phase==1||phase==5" @click="byVisible=true">通过</el-button>
                </div>
                <!-- <div>
                    <iframe width="100%" height="1000" :src="iframeSrc" frameborder="0"></iframe>
                </div> -->
            </div>
        </div>

        <!-- 通过提示框 -->
        <el-dialog title="通过认证申请" :visible.sync="byVisible" width="600px" center>
            <div class="overrule-dialog-cnt by-dialog">
                您确认已对改企业的认证信息核查无误，要对其认证申请予以通过吗？
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="byVisible = false">取 消</el-button>
                <el-button type="primary" @click="approveAuthentificationResult(true)">确认通过</el-button>
            </span>
        </el-dialog>
        <!-- 驳回提示框 -->
        <el-dialog title="驳回认证申请" :visible.sync="overruleVisible" width="600px" center>
            <div class="overrule-dialog-cnt">
                <el-form ref="formOverruleForm" :model="formOverrule" label-width="90px">
                    <el-form-item label="驳回原因：（可多选）" prop="type" class="form-item-check">
                        <el-checkbox-group v-model="formOverrule.type" @change="changeCheckbox">
                            <el-checkbox
                            v-for="(item,index) in checkboxList"
                            :key="index"
                            :label="item"
                            name="type">
                            </el-checkbox>
                        </el-checkbox-group>
                        <!-- <span class="edit-input" v-for="(item,index) in checkboxList" :key="index" >
                            <span class="el-icon-remove"></span>
                            <el-input 
                            :value="item"
                            placeholder="请输入内容">
                            </el-input>
                        </span> -->
                        
                        <!-- <span class="el-icon-circle-plus"></span> -->

                    </el-form-item>
                    <!-- <div @click="addHandle">
                        编辑
                    </div> -->
                    <el-form-item label="其他原因：" :error="errors.formOverruleType" prop="desc">
                        <el-input type="textarea" @change="changeInput" placeholder="请补充填写驳回认证申请的原因，120字符以内" v-model="formOverrule.desc"></el-input>
                    </el-form-item>
                </el-form>
                <div></div>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="overruleVisible = false">取 消</el-button>
                <el-button type="primary" @click="approveAuthentificationResult(false)">确认驳回</el-button>
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
                authForm:{
                    enterpriseName:''
                },
                checkboxList:['身份证照与法人信息不符合','身份证照片不清晰','营业执照照片不清晰','营业执照信息与企业不符'],
                formOverrule:{
                    type:[],
                    desc:''
                },
                errors:{
                    formOverruleType:'',
                },
                iframeSrc:''
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
            
            this.queryMemberDetail();

        },
        methods: {
            resetForm(){
               
            },
            onSubmit(){
               
            },
            changeCheckbox(value){
                if(value.length){
                    this.errors.formOverruleType='';
                }
            },
            addHandle(){

                let newArry = this.checkboxList;
                newArry.push('');
                this.checkboxList = newArry
                // this.checkboxList.push('')
            },
            changeInput(value){
                this.errors.formOverruleType='';
            },
            queryMemberDetail(){
                let self=this;
                let data = {
                    memberId:this.$route.params.id
                }
                $.get(this.$baseUrl+'services/member/queryMemberDetail.json',$.param(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        let object = res.returnObject;
                        let txt='';
                        let imgBaseUrl = `${this.$baseHost}services/common/showPictureFile.html?pictureFileName=`;
                        object.identityCardFrontPath=imgBaseUrl+`${object.identityCardFrontPath}`;
                        object.identityCardBackPath=imgBaseUrl+`${object.identityCardBackPath}`;
                        object.businessLicensePath = imgBaseUrl+object.businessLicensePath;
                        object.authenticationPhase= common.formatterPhase(object.authenticationPhase);
                        object.authenticationFlag=object.authenticationFlag==0?'未认证':'已认证';

                        if(object.latestApproveRejectReason){
                            object.latestApproveRejectReason = object.latestApproveRejectReason.join(',');
                        }
                        
                        this.authForm = object;
                    }else{
                        self.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            // 2.4.3.审核认证结果
            approveAuthentificationResult(resultFlag){
                let arry = [];
                if(!resultFlag){
                    if(!this.formOverrule.type.length && !this.formOverrule.desc){
                        this.errors.formOverruleType = '请勾选驳回原因或填写其他原因！'
                        return false;
                    }
                    if(this.formOverrule.desc.length>120){
                        this.errors.formOverruleType = '超过字数限制！'
                        return false;
                    }
                }
                
                let data = {
                    id:this.$route.params.id,
                    resultFlag:resultFlag
                }
                if(!resultFlag){
                    arry = arry.concat(this.formOverrule.type)
                    this.formOverrule.desc && arry.push(this.formOverrule.desc)
                    data.rejectReason =JSON.stringify(arry);
                }

                $.post(this.$baseUrl+'services/member/approveAuthentificationResult.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.$message.success('操作成功！')
                        this.byVisible=false;
                        this.overruleVisible=false;
                        this.$router.push('/certification');
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
    .authForm-waning{
        color: #f56c6c;
    }
    
</style>
