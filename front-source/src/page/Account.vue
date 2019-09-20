<template>
    <div class="accont-body">
        <div class="w-container">
            <el-card class="box-card">
                <div slot="header" class="clearfix">
                    <span>企业认证</span>
                </div>
                <div>
                    <span class="blue" v-if="authenticationFlag==1 || (authenticationFlag==0&&authenticationPhase==3)">{{authenticationFlag==1?'企业认证成功！可以开始创建话术任务啦！':'已认证'}}</span>
                    <span class="blue" v-else-if="authenticationFlag==2">已暂缓认证，可以开始创建话术任务啦！</span>
                    <v-cer v-else :status="authenticationFlag" :num='authenticationPhase' v-on:cerPop="cerPop"></v-cer>
                </div>
            </el-card>
        </div>
        <div class="w-container">
            <el-card class="box-card">
                <div slot="header" class="clearfix">
                    <span>基本信息</span>
                </div>
                <div>
                    <el-form ref="userForm" :model="userForm" :rules="userRules" label-width="80px">
                        <el-form-item class="user-avatar-item" label="头像">
                            <el-radio v-model="userForm.avatar" label="1" class="female" @change="avatarChange">

                            </el-radio>
                            <el-radio v-model="userForm.avatar" label="2" class="male" @change="avatarChange"></el-radio>
                            <el-radio label="3" class="custom" :style="{backgroundImage:'url('+avatar_custom_img+')' }">
                                <span class="custom-btn-box">
                                    自定义
                                </span>
                                <el-input type="file" id="file" @change="uploadAvatar"></el-input>
                            </el-radio>
                            <span class="custom-tip">您可以选择jpg,gif,png,jpeg格式的图片，最大3MB</span>
                        </el-form-item>
                        <el-form-item label="角色" v-if="userForm.role.indexOf(1) == -1">
                            <el-input v-model="userForm.roleName" :disabled="true">
                            </el-input>
                        </el-form-item>
                        <el-form-item label="组名" v-if="userForm.role.indexOf(2) !== -1">
                            <el-input v-model="userForm.groupName" :disabled="true">
                            </el-input>
                        </el-form-item>
                        <el-form-item
                            label="用户名"
                            prop="name">
                            <el-input
                                placeholder="输入用户名"
                                v-model="userForm.contactName">
                            </el-input>
                        </el-form-item>
                        <el-form-item
                                label="手机号"
                                prop="phone">
                            <el-input
                                    placeholder="输入电话号码"
                                    v-model="userForm.contactMobile" :disabled="true">
                            </el-input>
                        </el-form-item>
                        <el-form-item 
                            label="邮箱"
                            prop="mail">
                            <el-input
                                placeholder="输入邮箱地址"
                                v-model="userForm.enterpriseEmail">
                            </el-input>
                        </el-form-item>
                        <el-form-item label="说明">
                            <el-input type="textarea" v-model="userForm.description"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" class="saveBtn" @click="modifyBase">保存编辑</el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </el-card>
        </div>
        <div class="w-container">
            <el-card class="box-card">
                <div slot="header" class="clearfix">
                    <span>修改密码</span>
                </div>
                <div class="account-change-pass">
                    <el-form ref="passForm" :model="passForm" :rules="passRules" label-width="80px">
                        <el-form-item prop="password" label="原密码">
                            <el-input
                                placeholder="密码"
                                :type="passwordType"
                                v-model="passForm.password">
                                <i slot="suffix" class="el-input__icon el-icon-lx-attentionfill" :class="passwordClass" @click="showPassword('password')"></i>
                            </el-input>
                        </el-form-item>
                        <el-form-item prop="newPassword" label="新密码">
                            <el-input
                                placeholder="密码"
                                :type="newPasswordType"
                                v-model="passForm.newPassword">
                                <i slot="suffix" class="el-input__icon el-icon-lx-attentionfill" :class="newPasswordClass" @click="showPassword('newPassword')"></i>
                            </el-input>
                        </el-form-item>
                        <el-form-item prop="checkPass" label="确认密码">
                            <el-input
                                placeholder="密码"
                                :type="checkPassType"
                                v-model="passForm.checkPass">
                                <i slot="suffix" class="el-input__icon el-icon-lx-attentionfill" :class="checkPassClass" @click="showPassword('checkPass')"></i>
                            </el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="saveChangePassBtn('passForm')" class="saveBtn">保 存</el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </el-card>
        </div>
        <!-- <div class="w-container">
            <el-card class="box-card">
                <div slot="header" class="clearfix">
                    <span>企业认证</span>
                </div>
                <div>
                    <el-button type="primary" @click="authenticationVisible=true" class="">立即认证</el-button>
                </div>
            </el-card>
        </div> -->
        <el-dialog title="企业认证申请" class="authenticationDialog" :visible.sync="authenticationVisible" width="800px">
            <el-form ref="authenticationForm" :rules="authenticationRules" :model="authenticationForm" label-width="160px"  >
                <el-form-item 
                    label="企业中文全称"
                    prop="enterpriseName">
                    <el-input
                        placeholder="输入企业中文全称"
                        v-model="authenticationForm.enterpriseName">
                    </el-input>
                </el-form-item>
                <el-form-item 
                    label="法人代表姓名"
                    prop="legalRepresentative">
                    <el-input
                        placeholder="输入企业法人代表中文姓名"
                        v-model="authenticationForm.legalRepresentative">
                    </el-input>
                </el-form-item>
                <el-form-item 
                    label="法人身份证号"
                    prop="legalRepresentativeCardNumber">
                    <el-input
                        placeholder="请输入法人的18位身份证号"
                        v-model="authenticationForm.legalRepresentativeCardNumber">
                    </el-input>
                </el-form-item>
                <el-form-item 
                    label="法人身份证正面照"
                    prop="identityCardFrontPath">
                        <el-upload
                            action=''
                            :show-file-list="false"
                            :http-request="HttpCardFront">
                            <img v-if="cardFrontImageUrl" :src="cardFrontImageUrl" class="upload_img">

                            <i v-else class="el-icon-plus uploader-icon"></i>

                            <!-- <el-button v-else size="small" type="primary">点击上传</el-button> -->
                            <div slot="tip" class="el-upload__tip">图片需清晰，支持最大5M的jpg,png,jpeg格式图片</div>
                        </el-upload>
                </el-form-item>
                <el-form-item 
                    label="法人身份证反面照"
                    prop="identityCardBackPath">
                        <el-upload
                            action=''
                            :show-file-list="false"
                            :http-request="HttpCardBack">
                            <img v-if="cardBackImageUrl" :src="cardBackImageUrl" class="upload_img">
                            <i v-else class="el-icon-plus uploader-icon"></i>
                            <div slot="tip" class="el-upload__tip">图片需清晰，支持最大5M的jpg,png,jpeg格式图片</div>
                        </el-upload>
                </el-form-item>
                <el-form-item 
                    label="企业营业执照"
                    prop="name">
                        <el-upload
                            action=''
                            :show-file-list="false"
                            :http-request="HttpBusiness">
                            <img v-if="businessImageUrl" :src="businessImageUrl" class="upload_img">
                            <i v-else class="el-icon-plus uploader-icon"></i>
                            <div slot="tip" class="el-upload__tip">图片需清晰，支持最大5M的jpg,png,jpeg格式图片</div>
                        </el-upload>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="authenticationVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleAuthentication('authenticationForm')">提 交</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    
    import bus from '../common/bus';
    import vCer from './base/Certificate.vue';
    import crypto from 'crypto';
    
    export default {
        name: 'baseform',
        data: function(){
            
            var validatePass = (rule, value, callback) => {
                if (value !== this.passForm.newPassword) {
                    callback(new Error('两次输入密码不一致!'));
                } else {
                    callback();
                }
            };
            return {
                upload_img_url: this.$baseUrl+`common/showPictureFile.html?pictureFileName=`,
                passwordType:'password',
                passwordClass:'el-icon-lx-attention',
                newPasswordType:'password',
                newPasswordClass:'el-icon-lx-attention',
                checkPassType:'password',
                checkPassClass:'el-icon-lx-attention',
                authenticationVisible:false,
                authenticationFlag:0,
                authenticationPhase:0,
                fileList:[],
                avatar_custom_img:'',
                cardFrontImageUrl:'',
                cardBackImageUrl:'',
                businessImageUrl:'',
                userForm:{
                    avatar:'2',
                    id:'',
                    avatarPath:'',
                    contactName:'',
                    contactMobile:'',
                    enterpriseEmail:'',
                    desc:'',
                    groupName:'',
                    roleName:'',
                    role:[],
                },
                userRules:{
                    contactName:[
                        { required: true, message: '用户名不能为空！'},
                    ],
                    enterpriseEmail:[
                        { required: true, message: '邮箱地址不能为空！'},
                    ],
                    contactMobile:[
                        { required: true, message: '电话号码不能为空！'},
                    ]
                },
                passForm:{
                    password:'',
                    newPassword:''
                },
                passRules:{
                    password:[
                        { required: true, message: '密码不能为空！'},
                    ],
                    newPassword:[
                        { required: true, message: '请新输入密码', trigger: 'blur' },
                        {validator:function(rule,value,callback){
                            if(/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,20}$/.test(value) == false){
                                callback(new Error("输入8-20位字母数据结合密码"));
                            }else{
                                callback();
                            }
                        }, trigger: 'change'}
                    ],
                    checkPass:[
                        { required: true, message: '请再次输入密码', trigger: 'blur' },
                        { validator: validatePass, trigger: 'change' }
                    ]
                },
                authenticationForm:{
                    enterpriseName:'',
                    legalRepresentative:'',
                    legalRepresentativeCardNumber:'',
                    identityCardFrontPath:'',
                    identityCardBackPath:'',
                    businessLicensePath:''
                },
                authenticationRules:{
                    enterpriseName:[
                        { required: true, message: '企业中文全称不能为空！'},
                    ],
                    legalRepresentative:[
                        { required: true, message: '法人代表姓名不能为空！'},
                    ],
                    legalRepresentativeCardNumber:[
                        { required: true, message: '请正确输入18位身份证号！'},
                    ],
                    identityCardFrontPath:[
                        { required: true, message: '请上传身份证正面！'},
                    ],
                    identityCardBackPath:[
                        { required: true, message: '请上传身份证反面！'},
                    ],
                    businessLicensePath:[
                        { required: true, message: '请上传营业执照！'},
                    ],
                },
            }
        },
        created(){
            // this.userInfo = this.$store.getters.getUserInfo;
            // this.userForm.id = this.userInfo.id;
            this.queryMemberDetail();
        },
        methods: {
            showPassword(type){
                if(type == 'password'){
                    if(this.passwordType==='text'){
                        this.passwordType ='password';
                        this.passwordClass='';
                    }else{
                        this.passwordType ='text';
                        this.passwordClass='active';
                    }
                }else if(type == 'newPassword'){
                    if(this.newPasswordType==='text'){
                        this.newPasswordType ='password';
                        this.newPasswordClass='';
                    }else{
                        this.newPasswordType ='text';
                        this.newPasswordClass='active';
                    }
                }else{
                    if(this.checkPassType==='text'){
                        this.checkPassType ='password';
                        this.checkPassClass='';
                    }else{
                        this.checkPassType ='text';
                        this.checkPassClass='active';
                    }
                }
                
            },
            avatarChange(val){
                this.userForm.avatar = val;
            },
            saveChangePassBtn(formName){
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.modifyMemberPassword();
                    } else {
                        return false;
                    }
                });
            },
            onSubmit() {
                this.$message.success('提交成功！');
            },
            handleRemove(file, fileList) {
                console.log(file, fileList);
            },
            handlePreview(file) {
                console.log(file);
            },
            handleExceed(files, fileList) {
                this.$message.warning(`当前限制选择 1 个文件`);
            },
            beforeRemove(file, fileList) {
                return this.$confirm(`确定移除 ${ file.name }？`);
            },
            // 2.3.1.查询会员信息
            queryMemberDetail(){
                $.get(this.$baseUrl+'member/queryMemberDetail.json').then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        let data = res.returnObject;
                        if(data.avatarPath && data.avatarPath.indexOf('female')>-1){
                            data.avatar = '1';
                        }else if(data.avatarPath && data.avatarPath.indexOf('male')>-1){
                            data.avatar = '2';
                        }else{
                            this.avatar_custom_img=this.upload_img_url+data.avatarPath;
                        }
                        this.userForm = $.extend({},data);
                        this.authenticationForm = data;

                        this.userForm.id = data.id;
                        
                        this.cardFrontImageUrl = this.upload_img_url+data.identityCardFrontPath;
                        this.cardBackImageUrl = this.upload_img_url+data.identityCardBackPath;
                        this.businessImageUrl = this.upload_img_url+data.businessLicensePath;
                        
                        this.authenticationFlag = data.authenticationFlag||0;
                        this.authenticationPhase = data.authenticationPhase||0;

                        this.userForm.groupName = data.groupName;
                        this.userForm.roleName = data.roleName;
                        this.userForm.role = data.role;

                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            // 头像
            uploadAvatar(){
                this.uploadAnnexFile($('#file')[0].files[0]).then((res)=>{
                    if(res){
                        this.userForm.avatar='';
                        let img_url = this.upload_img_url+res.returnObject;
                        this.userForm.avatarPath = res.returnObject;
                        this.avatar_custom_img = img_url;
                    }
                })
            },
            // 2.1.5.图片上传文件
            uploadAnnexFile(res){
                let dtd = $.Deferred();
                let self = this;
                var oMyForm = new FormData();
                oMyForm.append("sourceType", 101);

                oMyForm.append("file", res);
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
                        dtd.resolve(res);
                        
                    }else{
                        self.$message.error('上传失败！');
                        // self.creatForm.excelPathTip = '';
                    }
                }).fail(function(res) {
                    
                });
                return dtd;
            },
            //  修改基本信息
            modifyBase(){
                if(this.userForm.avatar=='1'){
                    this.userForm.avatarPath='common-static/static/img/ico_female.png'
                }else if(this.userForm.avatar=='2'){
                    this.userForm.avatarPath='common-static/static/img/ico_male.png'
                }
                let data={
                    id:this.userForm.id,
                    contactName:this.userForm.contactName,
                    description:this.userForm.description,
                    enterpriseEmail:this.userForm.enterpriseEmail,
                    accountEmail:this.userForm.enterpriseEmail,
                    contactMobile:this.userForm.contactMobile,
                    contactPhone:this.userForm.contactMobile,
                    avatarPath:this.userForm.avatarPath
                }
                this.modifyMember(data);
            },
            // 2.3.2.修改会员信息
            modifyMember(data){
                let dtd = $.Deferred();
                $.post(this.$baseUrl+'member/modifyMember.json',JSON.stringify(data)).then((res)=>{

                    if(res.resultMessageEnum=='0000'){
                        this.queryMemberDetail();
                        dtd.resolve(res);

                        let msg = {
                            // username : msg.username;
                            head :this.userForm.avatarPath
                        }
                        bus.$emit('updateUser', msg)


                        this.$message.success('修改成功！');
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
                return dtd;
            },
            // 提交认证申请
            newAuth(data){
                let dtd = $.Deferred();
                // let result = this.authenticationForm;
                // let data={
                //     id:result.id,
                //     enterpriseName:result.enterpriseName,
                //     enterpriseEmail:result.enterpriseEmail,
                //     legalRepresentative:result.legalRepresentative,
                //     contactName:result.contactName,
                //     contactMobile:result.contactMobile,
                //     description:result.description,
                //     avatarPath:result.avatarPath,
                //     identityCardBackPath:result.identityCardBackPath,
                //     businessLicensePath:result.businessLicensePath
                // }
                $.post(this.$baseUrl+'member/newAuth.json',JSON.stringify(data)).then((res)=>{

                    if(res.resultMessageEnum=='0000'){
                        
                        dtd.resolve(res);
                        this.$message.success('申请成功！');
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
                return dtd;
            },
            // 2.3.3.修改会员密码
            modifyMemberPassword(){

                var md5 = crypto.createHash("md5");
                    md5.update(this.passForm.password);
                var oldPassword = md5.digest('hex');
                var md52 = crypto.createHash("md5");
                    md52.update(this.passForm.newPassword);
                var newPassword = md52.digest('hex');

                let data={
                    memberId:this.userForm.id,
                    oldPassword:oldPassword,
                    newPassword:newPassword
                }
                $.post(this.$baseUrl+'member/modifyMemberPassword.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.$message.success('修改密码成功！');
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },
            // 身份证正面上传
            HttpCardFront(res){
                this.uploadAnnexFile(res.file).then((res)=>{
                    this.authenticationForm.identityCardFrontPath = res.returnObject;
                    this.cardFrontImageUrl =this.upload_img_url+res.returnObject
                });
            },
            // 身份证反面
            HttpCardBack(res){
                this.uploadAnnexFile(res.file).then((res)=>{
                    this.authenticationForm.identityCardBackPath = res.returnObject;
                    this.cardBackImageUrl =this.upload_img_url+res.returnObject
                });
            },
            // 营业执照
            HttpBusiness(res){
                this.uploadAnnexFile(res.file).then((res)=>{
                    this.authenticationForm.businessLicensePath = res.returnObject;
                    this.businessImageUrl =this.upload_img_url+res.returnObject
                });
            },
            // 认证
            handleAuthentication(formName){
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        let data = this.authenticationForm;
                        data.id=this.userForm.id;

                        this.newAuth(data).then((res)=>{
                            this.authenticationVisible = false;
                            this.queryMemberDetail();
                        });
                        
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            },
            cerPop(res){
                if(res){
                    this.authenticationVisible = true;
                }
            }
        },
        components:{
            vCer
        },
    }
</script>
<style scoped lang="less">
    
    .saveBtn{
        float:right;
        margin:40px 40px 0 0;
    }
    .w-container{
        margin-bottom: 20px;
    }
    .upload-avatar{
        float: left;
        margin-left: 20px;
    }
    .custom-tip{
        float: left;
        margin:7px 0 0 80px;
        font-size: 12px;
        color: #919FA9;
    }
   
    .custom-btn-box{
        position: absolute;;
        top:15px;
        left:50px;
        color: #fea200;
    }
    .blue{
        color: #fea200;
    }
</style>