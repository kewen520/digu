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
                <!--<span class="b">UNISOUND SAMANTHA V Beta 1.0.9</span>-->
                <span class="b"><img alt=""></span>
            </div>
            </template>
        </div>
        <div class="login-right">
            <div class="login-right-body" style="margin-top:-250px;">
                <h3 class="login-top-text">Sign in</h3>
                <div class="login-top-logo">
                    <img alt="">
                    <!--<svg version="1.1"
                        preserveAspectRatio="xMinYMin meet"
                        width="300" height="42"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink">
                        <image xlink:href="../../assets/logo_beta_1.0.9.svg" width="300" height="42"/>
                    </svg>-->
                </div>
                <el-form :model="registereForm" :rules="rules" ref="registereForm" label-width="0px" class="ms-content">
                    <div v-if="errors.errorMsg" class="login_error el-form-item__error">该手机号已注册，<a href="#/login">点击登录</a>。</div>
                    <el-form-item prop="phone" :error="errors.phone">
                        <el-input
                            placeholder="11位手机号"
                            v-model="registereForm.phone">
                            <i slot="prefix" class="w_ico_phone" ></i>
                        </el-input>
                    </el-form-item>
                    <el-form-item prop="code" :error="errors.code">
                        <el-input
                            placeholder="4位验证码"
                            v-model="registereForm.code">
                            <i slot="prefix" class="w_ico_id-verified" ></i>
                        </el-input>
                        <el-button type="primary" style="width:100px;" @click="sendSmsCode" :disabled="disabled" class="send-code-btn">{{code_text}}</el-button>
                    </el-form-item>
                    <el-form-item prop="password">
                        <el-input
                            placeholder="输入8-20位字母数字结合密码"
                            :type="passwordType"
                            auto-complete="new-password"
                            @keyup.enter.native="submitForm('registereForm')"
                            v-model="registereForm.password">
                            <i slot="prefix" class="w_ico_password"></i>
                            <i slot="suffix" class="iconfont icon-ico_invisible el-input__icon" :class="passwordClass" @click="showPassword('password')"></i>
                        </el-input>
                    </el-form-item>
                    <div class="login-btn">
                        <el-form-item>
                            <div class="login-btn-left"><a href="#/login">已有账号？登录</a></div>
                            <el-button type="primary" @click="submitForm('registereForm')">注册</el-button>
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
            return {
                passwordType:'password',
                passwordClass:'',
                code_text:'获取验证码',
                rTime:60, 
                disabled:false,
                banners:[
                    {src:'common-static/img/img1.png'},
                    {src:'common-static/img/img2.png'},
                    {src:'common-static/img/img3.png'},
                ],
                registereForm: {
                    phone:'',
                    password: '',
                    code:''
                },
                errors:{
                    phone:'',
                    code:'',
                    errorMsg:false
                },
                rules: {
                    phone: [
                        { required: true, message: '手机号不能为空！', trigger: 'blur' },
                        {validator:function(rule,value,callback){
                            if(/^1[345678]\d{9}$/.test(value) == false){
                                callback(new Error("请输入11位手机号！"));
                            }else{
                                callback();
                            }
                        }, trigger: 'change'}
                    ],
                    code: [
                        { required: true, message: '请输入验证码！', trigger: 'blur' },
                        { min:4, max:4, message: '请输入正确的验证码！', trigger: 'change' }
                    ],
                    password: [
                        { required: true, message: '密码不能为空！', trigger: 'blur' },
                        {validator:function(rule,value,callback){
                            if(/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,20}$/.test(value) == false){
                                callback(new Error("请输入8-20位字母数字结合密码！"));
                            }else{
                                callback();
                            }
                        }, trigger: 'change'}
                    ],
                }
            }
        },
        mounted(){
            // 自适应高度
            this.autoSize();
            window.onresize = this.autoSize;
        },
        methods: {
            autoSize(){
                // 自适应高度
                var clintHeight = document.documentElement.clientHeight;
                var setHeight = clintHeight<600?'600':clintHeight;
                let leftWidth = setHeight*780/ 1024;
                $('.login-wrap,.login-left,.login-right').css('height',setHeight);
                $('.login-left').css('width',leftWidth);
                $('.login-right').css('marginLeft',leftWidth);
            },
            showPassword(val){
                if(this.passwordType==='text'){
                    this.passwordType ='password';
                    this.passwordClass='';
                }else{
                    this.passwordType ='text';
                    this.passwordClass='active';
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
                if(!this.registereForm.phone){
                    this.errors.phone = '手机号不能为空！'
                    // this.$message.error('请输入手机号！');
                    return false;
                }

                if(/^1[345678]\d{9}$/.test(this.registereForm.phone) == false){
                    this.errors.phone = '请输入11位手机号！'
                    return false;
                }

                let data={
                    mobileNumber:this.registereForm.phone
                }
                $.post(this.$baseUrl+`common/sendSmsCode.json?mobileNumber=${this.registereForm.phone}`,data).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.countdown()
                    }else if(res.resultMessageEnum=='000112'){
                        this.errors.errorMsg=true;
                    }
                    else{
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
            // 注册
            submitAjax(){
                
                var md5 = crypto.createHash("md5");
                md5.update(this.registereForm.password);
                var md5PassWord = md5.digest('hex');

                let data={
                    accountPassword:md5PassWord,
                    contactMobile:this.registereForm.phone,
                    smsCode:this.registereForm.code,
                }
                $.post(this.$baseUrl+'member/register.json',JSON.stringify(data)).then((res)=>{
                    let num = res.resultMessageEnum;
                    if(num=='0000'){
                        localStorage.setItem('ms_username',this.registereForm.phone);
                        localStorage.removeItem('ms_pass');
                        // this.$router.push('/');
                        // this.$router.push('/login');
                        this.queryMemberDetail();
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
            },
            // 查询会员信息
            queryMemberDetail(){
                $.get(this.$baseUrl+'member/queryMemberDetail.json').then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        let data = res.returnObject;
                        localStorage.setItem('USER_ROLE',data.role);
                        localStorage.setItem('USER_INFO',JSON.stringify(data));
                    }else{
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                    this.$router.push('/');
                }).fail(res=>{
                    this.$router.push('/');
                });
            },
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