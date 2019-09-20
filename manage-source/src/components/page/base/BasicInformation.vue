<template>
    <div class="w-box-card">
        <div class="w-card__header">
            <span>认证信息</span>
        </div>
        <div class="w-card__body">
            <el-row :gutter="20" class="basi-el-row">
                <el-col :span="8">
                    <el-form ref="authForm" :model="authForm" label-width="100px">
                        <el-form-item label="企业名称：" >
                            <p class="authFlag authFlag1" v-if="authForm.authenticationFlag==1">
                                <span v-show="authForm.enterpriseName">{{authForm.enterpriseName}}</span><i class="w_ico_certificate"></i>
                            </p>
                            <p class="authFlag authFlag0" v-else>
                                <span v-show="!authForm.enterpriseName && !authForm.remarkName">未知</span>
                                <span class="sub" v-show="authForm.enterpriseName">（{{authForm.enterpriseName}}）</span><i class="w_ico_certificate-grey"></i>
                            </p>
                        </el-form-item>
                        <el-form-item label="注册手机号：">
                            {{authForm.accountName}}
                        </el-form-item>
                        <el-form-item label="注册时间：">
                            {{authForm.latestApplyTime}}
                        </el-form-item>
                        <el-form-item label="备注：">
                            <el-input v-model="authForm.remarkName"></el-input>
                        </el-form-item>
                        <el-form-item label="描述信息：">
                            <el-input type="textarea" v-model="authForm.managerRemark"></el-input>
                        </el-form-item>
                    </el-form>
                </el-col>
                <el-col :offset="5" :span="10" class="basi-right-col">
                    <span class="basi-title">企业账号</span>
                    <div class="basi-top">
                        <img :src="authForm.avatarPath" alt="">
                        <p>{{authForm.accountName}}</p>
                    </div>
                    <el-form ref="authForm" :model="authForm" label-width="100px">
                        <el-form-item label="邮箱地址：">
                            {{authForm.enterpriseEmail}}
                        </el-form-item>
                        <el-form-item label="联系电话：">
                            {{authForm.contactMobile}}
                        </el-form-item>
                        <el-form-item label="说明：">
                            {{authForm.remark}}
                        </el-form-item>
                        <el-form-item label="登录状态：">
                            <span class="latestLoginStatus" :class="{'red':authForm.latestLoginStatus!=1}">{{authForm.latestLoginStatus==1?'允许':'禁止'}}</span>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
        </div>
        <div class="w-card__footer">
            <el-button v-if="blacklistFlag=='true'" @click="moveVisible=true">移除黑名单</el-button>
            <el-button v-else v-show="!authForm.authenticationPhase || authForm.authenticationPhase==0" @click="deferAuthentication">暂缓认证</el-button>
            <el-button type="primary" @click="modifyManager">保存</el-button>
        </div>
        <!-- 移除黑名单 -->
        <el-dialog title="移出黑名单" :visible.sync="moveVisible" width="600px" center>
            <div class="overrule-dialog-cnt black-dialog">
                您确认要将该的用户移出黑名单吗？移动后将恢复至用户列表
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="moveVisible = false">取 消</el-button>
                <el-button type="primary" @click="modifyMemberBlacklistFlag">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import bus from '../../common/bus';
export default {
    data() {
        return{
            authForm:{

            },
            results:{},
            moveVisible:false,
            blacklistFlag:false
        }
    },
    props:['tabActive','datas'],
    // props:{
    //     tabActive:{
    //         type:[String]
    //     },
    //     datas:{
    //         type:[String]
    //     }
    // },
    mounted(){
        this.blacklistFlag = this.$route.query.blacklistFlag;

    },
    methods: {
        queryMemberDetail(){

            let object = this.results;
            let txt='';
            let imgBaseUrl = `${this.$baseHost}services/common/showPictureFile.html?pictureFileName=`;
            object.identityCardFrontPath=imgBaseUrl+`${object.identityCardFrontPath}`;
            object.identityCardBackPath=imgBaseUrl+`${object.identityCardBackPath}`;
            object.businessLicensePath = imgBaseUrl+object.businessLicensePath;
            object.avatarPath = imgBaseUrl+object.avatarPath;
            // object.authenticationPhase= common.formatterPhase(object.authenticationPhase);
            this.authForm = object;
            // enterpriseName = res.returnObject.enterpriseName;
            
            // let data = {
            //     memberId:this.$route.params.id
            // }
            // let enterpriseName = null;
            // $.get(this.$baseUrl+'services/member/queryMemberDetail.json',$.param(data)).then((res)=>{

            //     if(res.resultMessageEnum=='0000'){
            //         let object = res.returnObject;
            //         let txt='';
            //         let imgBaseUrl = `${this.$baseHost}services/common/showPictureFile.html?pictureFileName=`;
            //         object.identityCardFrontPath=imgBaseUrl+`${object.identityCardFrontPath}`;
            //         object.identityCardBackPath=imgBaseUrl+`${object.identityCardBackPath}`;
            //         object.businessLicensePath = imgBaseUrl+object.businessLicensePath;
            //         object.avatarPath = imgBaseUrl+object.avatarPath;
            //         // object.authenticationPhase= common.formatterPhase(object.authenticationPhase);
            //         this.authForm = object;
            //         enterpriseName = res.returnObject.enterpriseName;

            //     }else{
            //         this.$message.error(res.errorInfoList[0].errorMessage);
            //     }
            //     localStorage.setItem('GLOBAL_enterpriseName',enterpriseName);
            // }).fail(res=>{
            //     localStorage.setItem('GLOBAL_enterpriseName',enterpriseName);
            // });
        },
        // 修改管理员自身信息
        modifyManager(){
            let data = {
                memberId:this.$route.params.id,
                remarkName:this.authForm.remarkName,
                managerRemark:this.authForm.managerRemark
            }
            $.post(this.$baseUrl+'services/member/modifyMemberPartInfo.json',JSON.stringify(data)).then((res)=>{
                if(res.resultMessageEnum=='0000'){
                    this.$message.success('保存成功！');
                }else{
                    this.$message.error(res.errorInfoList[0].errorMessage);
                }
            });
        },
        // 暂缓认证
        deferAuthentication(){
            // let data = {
            //     memberId:this.$route.params.id
            // }
            $.post(this.$baseUrl+`services/member/deferAuthentication.json?memberId=${this.$route.params.id}`).then((res)=>{
                if(res.resultMessageEnum=='0000'){
                    this.$message.success('操作成功！');
                }else{
                    this.$message.error(res.errorInfoList[0].errorMessage);
                }
            });
        },
        // 移除黑名单
        modifyMemberBlacklistFlag(){
            let data = {
                blacklistFlag:'false',
                memberId:this.$route.params.id
            }
            $.post(this.$baseUrl+'services/member/modifyMemberBlacklistFlag.json',JSON.stringify(data)).then((res)=>{
                if(res.resultMessageEnum=='0000'){
                    this.$message.success('操作成功！');
                    this.moveVisible=false;
                    this.$router.push('/information');
                }else{
                    this.$message.error(res.errorInfoList[0].errorMessage);
                }
            });
        },
    },
    watch:{
       datas(data){

           this.results = data;

           this.queryMemberDetail();

       },
    }
}
</script>
<style scoped lang="less">
.basi-right-col{
    position: relative;
}
.basi-title{
    color: #5daefc;
    position: absolute;
    left: -100px;
    top:20px;
}
.basi-top{
    margin-bottom: 20px;
}
.authFlag{
    &.authFlag1{
        color: #5daefc;
    }
    span{
        display:inline-block;
        float: left;
    }
    i{
        width:18px;
        float: left;
        margin-left: 5px;
        height:32px;
        background-position: center center;
    }
    
}
.latestLoginStatus{
    color:#5ad8c0;
    &.red{
        color:#f56c6c;
    }
}
.w-card__footer{
    text-align:right;
    padding:20px 20px 40px 0;
}
.sub{
    color:#a2a6ad;
}
</style>
