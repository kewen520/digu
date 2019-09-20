<template>
    <div class="login-wrap log-form">
        <div class="login-left">
            <template>
            <el-carousel  height="100%">
                <el-carousel-item v-for="(item,index) in banners" :key="index">
                    <img :src="item.src" alt="" class="banner">
                </el-carousel-item>
            </el-carousel>
            <div class="logo-text">
                <span class="a">Welcome !</span>
                <span class="b">UNISOUND SAMANTHA V Beta 1.0</span>
            </div>
            </template>
        </div>
        <div class="login-right">
            <div class="login-right-body" style="margin-top:-260px;">
                <h3 class="login-top-text">Log in</h3>
                <div class="login-top-logo">
                    <svg version="1.1"
                        preserveAspectRatio="xMinYMin meet"
                        width="300" height="42"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink">
                        <image xlink:href="../assets/logo_beta_1.0.9.svg" width="300" height="42"/>
                    </svg>
                    <!-- <img src="../../assets/logo-samantha.png" alt=""> -->
                </div>
                <el-form :model="forgetForm" :rules="rules" ref="forgetForm"  label-width="0px" class="ms-content">
                    <div v-if="errors.errorMsg" class="login_error el-form-item__error">该手机号尚未注册，<a href="#/registered">点击注册</a>。</div>
                    <!-- <el-form-item prop="company_username">
                        <el-input
                            placeholder="企业全称"
                            prefix-icon="el-icon-lx-text"
                            v-model="forgetForm.company_username">
                        </el-input>
                    </el-form-item>

                    <el-form-item prop="company_email">
                        <el-input
                            placeholder="企业邮箱"
                            prefix-icon="el-icon-message"
                            v-model="forgetForm.company_email">
                        </el-input>
                    </el-form-item>

                    <el-form-item prop="contact_name">
                        <el-input
                            placeholder="联系人姓名"
                            prefix-icon="el-icon-lx-people"
                            v-model="forgetForm.contact_name">
                        </el-input>
                    </el-form-item> -->

                    <el-form-item prop="phone">
                        <el-input
                            placeholder="11位手机号"
                            v-model="forgetForm.phone">
                            <i slot="prefix" class="w_ico_phone" ></i>
                        </el-input>
                    </el-form-item>
                    <el-form-item prop="code" :error="errors.code">
                        <el-input
                            placeholder="4位验证码"
                            v-model="forgetForm.code">
                            <i slot="prefix" class="w_ico_id-verified" ></i>
                        </el-input>
                        <el-button type="primary" @click="sendSmsCode" :disabled="disabled" class="send-code-btn">{{code_text}}</el-button>
                    </el-form-item>
                    <el-form-item prop="password">
                        <el-input
                            placeholder="输入8-20位字母数据结合密码"
                            :type="passwordType"
                            v-model="forgetForm.password">
                            <i slot="prefix" class="w_ico_password"></i>
                            <i slot="suffix" class="el-input__icon el-icon-lx-attentionfill" :class="passwordClass" @click="showPassword('password')"></i>
                        </el-input>
                    </el-form-item>

                    <el-form-item prop="check_pass">
                        <el-input
                            placeholder="确认新密码"
                            :type="checkPassType"
                            @keyup.enter.native="submitForm('forgetForm')"
                            v-model="forgetForm.check_pass">
                            <i slot="prefix" class="w_ico_password"></i>
                            <i slot="suffix" class="el-input__icon el-icon-lx-attentionfill" :class="checkPasswordClass" @click="showPassword('check_pass')"></i>
                        </el-input>
                    </el-form-item>
                    
                    <div class="login-btn">
                        <el-form-item>
                            <div class="login-btn-left"><a href="#/login">返回登录</a><span class="line">|</span><a href="#/registered">注册</a></div>
                            <el-button type="primary" @click="submitForm('forgetForm')">提交</el-button>
                        </el-form-item>
                    </div>
                </el-form>
            </div>
            <div class="reserved">
                © 2018 Unisound.com. All rights reserved 
            </div>
        </div>
    </div>
</template>

<script>
import crypto from 'crypto';
    export default {
        data: function(){
            var validatePass = (rule, value, callback) => {
                if (value !== this.forgetForm.password) {
                    callback(new Error('两次输入密码不一致!'));
                } else {
                    callback();
                }
            };
            return {
                passwordType:'password',
                checkPassType:'password',
                passwordClass:'',
                code_text:'获取验证码',
                rTime:60, 
                disabled:false,
                checkPasswordClass:'',
                errors:{
                    errorMsg:false,
                    code:'',
                    phone:'',
                },
                banners:[
                    //@@@todo
                    {src:'common-static/img/img1.png'},
                    {src:'common-static/img/img2.png'},
                    {src:'common-static/img/img3.png'},
                ],
                forgetForm: {
                    phone:'',
                    password: '',
                    code:'',
                    check_pass:''
                },
                rules: {
                    phone: [
                        { required: true, message: '手机号不能为空！', trigger: 'blur' },
                        {validator:function(rule,value,callback){
                            if(/^1[34578]\d{9}$/.test(value) == false){
                                callback(new Error("请输入11位手机号！"));
                            }else{
                                callback();
                            }
                        }, trigger: 'blur'}
                    ],
                    code: [
                        { required: true, message: '请输入验证码！', trigger: 'blur' },
                        { min:4, max:4, message: '请输入正确的验证码！', trigger: 'change' }
                    ],
                    password: [
                        { required: true, message: '密码不能为空！', trigger: 'blur' },
                        // { min:8, max:20, message: '密码长度必须是8-20位', trigger: 'change' },
                        {validator:function(rule,value,callback){
                            if(/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,20}$/.test(value) == false){
                                callback(new Error("请输入8-20位字母数字结合密码！"));
                            }else{
                                callback();
                            }
                        }, trigger: 'blur'}
                    ],
                    check_pass: [
                        { required: true, message: '请再次输入密码！', trigger: 'blur' },
                        { validator: validatePass, trigger: 'change' }
                    ]
                }
            }
        },
        mounted(){
            // 自适应高度
            var clintHeight = document.documentElement.clientHeight;
            var setHeight = clintHeight<600?'600':clintHeight;
            let leftWidth = setHeight*780/ 1024;
            $('.login-wrap,.login-left,.login-right').css('height',setHeight);
            $('.login-left').css('width',leftWidth);
            $('.login-right').css('marginLeft',leftWidth);
        },
        methods: {
            showPassword(val){
                if(val ==='password'){
                    if(this.passwordType==='text'){
                        this.passwordType ='password';
                        this.passwordClass='';
                    }else{
                        this.passwordType ='text';
                        this.passwordClass='active';
                    }
                }else{
                    if(this.checkPassType==='text'){
                        this.checkPassType ='password';
                        this.checkPasswordClass='';
                    }else{
                        this.checkPassType ='text';
                        this.checkPasswordClass='active';
                    }
                }
            },
            // 倒计时
            countdown(){
                var timer = setInterval(()=>{
                    if(this.rTime>0){
                        this.disabled= true;
                        this.code_text = `${this.rTime--}s`;
                    }else{
                        this.disabled= false;
                        this.rTime=60;
                        this.code_text ="重新发送";
                        clearInterval(timer);
                    }
                    
                },1000)
            },
            // 发送短信
            sendSmsCode(){
                if(!this.forgetForm.phone){
                    this.$message.error('请输入手机号！');
                    return false;
                }
                if(/^1[34578]\d{9}$/.test(this.forgetForm.phone) == false){
                    return false;
                }
                let data={
                    mobileNumber:this.forgetForm.phone
                }
                $.post(this.$baseUrl+`common/sendSmsCode.json?smsTemplateType=2&mobileNumber=${this.forgetForm.phone}`,data).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.countdown()
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                })
            },
            submitForm(formName) {
                this.$nextTick(() => {
                    this.$refs[formName].validate((valid) => {
                        if (valid) {
                            this.submitAjax();
                        } else {
                            console.log('error submit!!');
                            return false;
                        }
                    });
                });
            },
            submitAjax(){
                
                var md5 = crypto.createHash("md5");
                md5.update(this.forgetForm.password);
                var md5PassWord = md5.digest('hex');

                let data={
                    accountPassword:md5PassWord,
                    contactMobile:this.forgetForm.phone,
                    smsCode:this.forgetForm.code,
                }
                $.post(this.$baseUrl+'member/forgetPassword.json',JSON.stringify(data)).then((res)=>{
                    let num = res.resultMessageEnum;
                    if(res.resultMessageEnum=='0000'){

                        localStorage.removeItem('ms_username');
                        localStorage.removeItem('ms_pass');
                        this.$router.push('/login');
                    }
                    else if(res.resultMessageEnum=='000118'){
                        this.errors.errorMsg = true;
                    }
                    else if(num=='000309'){
                        this.errors.code = '验证码已失效！'
                    }
                    else if(num=='000307'){
                        this.errors.code = '验证码错误！'
                    }
                    else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                    
                })
            }
        }
    }
</script>

<style scoped>
    .send-code-btn{
        position:absolute;
        top: 3px;
        right: 0;
    }

</style>