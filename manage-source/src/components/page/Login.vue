<template>
    <div class="login-wrap log-form">
        <div class="login-left">
            <template>
            <el-carousel  height="100%">
                 <el-carousel-item v-for="(item,index) in banners" :key="index">
                    <img :src="item.src" alt="" class="banner">
                </el-carousel-item>
            </el-carousel>
            </template>
        </div>
        <div class="login-right">
            <div class="login-right-body">
                <h3 class="login-top-text">Log in</h3>
                <div class="login-top-logo">
                    <img alt="">
                </div>
                <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="0px" class="ms-content" >
                    <div v-if="errors.errorMsg" class="login_error el-form-item__error">该手机号尚未注册，<a href="#/registered">点击注册</a>。</div>
                    <el-form-item prop="username">
                        <!-- <span>该手机号尚未注册，点击注册</span> -->
                        <el-input
                            placeholder="手机号"
                            v-model="ruleForm.username">
                            <i slot="prefix" class="iconfont icon-ico_account"></i>
                        </el-input>
                    </el-form-item>
                    <el-form-item prop="password">
                        <el-input
                            placeholder="密码"
                            :type="passwordType"
                            @change="handleChange"
                            @keyup.enter.native="submitForm('ruleForm')"
                            v-model="ruleForm.password">
                            <i slot="prefix" class="w_ico_password"></i>
                            <i slot="suffix" class="el-input__icon iconfont icon-ico_invisible" :class="passwordClass" @click="showPassword('password')"></i>
                        </el-input>
                    </el-form-item>
                    <el-form-item prop="img_code" v-show="codeValid">
                        <el-input
                            placeholder="图形密码"
                            v-model="ruleForm.img_code">
                            
                            <i slot="prefix" class="w_ico_security_checked"></i>
                            <i slot="suffix" class="w_img_code" @click="changeImgCode()">
                                <img :src="img_code_src" alt="">
                            </i>
                        </el-input>
                    </el-form-item>
                    <!-- <div class="login-footer">
                        <el-checkbox v-model="checked">记住密码</el-checkbox>
                        <a class="forget_password" href="#/forgetpassword">忘记密码？</a>
                    </div> -->
                    
                    <div class="login-btn">
                        <el-form-item>
                            <!-- <div class="login-btn-left"><a href="#/registered">注册新帐号</a></div> -->
                            <el-button type="primary" @click="submitForm('ruleForm')">登录</el-button>
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
    import Vue from 'vue';
    export default {
        data: function(){
            return {
                codeValid: false,
                passwordType:'password',
                passwordClass:'',
                checked:false,
                img_code_src:'',
                /*默认主题*/
                /*banners:[
                    {src:'common-static/img/img1.png'},
                    {src:'common-static/img/img2.png'},
                    {src:'common-static/img/img3.png'},
                ],*/
                /*蓝色主题*/
                banners:[
                    {src:'common-static/img/img1-blue.png'},
                    {src:'common-static/img/img2-blue.png'},
                    {src:'common-static/img/img3-blue.png'},
                ],
                ruleForm: {
                    username: '',
                    password: '',
                    img_code:''
                },
                rules: {
                    username: [
                        { required: true, message: '用户名不能为空！', trigger: 'blur' },
                        // {validator:function(rule,value,callback){
                        //     if(/^1[34578]\d{9}$/.test(value) == false){
                        //         callback(new Error("请输入11位手机号！"));
                        //     }else{
                        //         callback();
                        //     }
                        // }, trigger: 'blur'}
                    ],
                    password: [
                        { required: true, message: '密码不能为空！', trigger: 'blur' },
                        // {validator:function(rule,value,callback){
                        //     if(/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,20}$/.test(value) == false){
                        //         callback(new Error("输入8-20位字母数据结合密码"));
                        //     }else{
                        //         callback();
                        //     }
                        // }, trigger: 'change'}
                        // { required: true, message: '请输入8-20位字母数字结合密码！', trigger: 'blur' },
                    ],
                },
                errors:{
                    username:'',
                    errorMsg:false
                }
            }
        },
        mounted(){

            var aValue = localStorage.getItem('ms_pass');
            var phone = localStorage.getItem('loginName');
            if(phone){
                this.ruleForm.username = phone;
            }
            // if(aValue){
            //     this.ruleForm.password = aValue;
            // }
            let checked = localStorage.getItem('checked');
            if(checked && aValue){
                this.checked = true;
                this.submitAjax();
            }
            // 自适应高度

            var clintHeight = document.documentElement.clientHeight;
            var setHeight = clintHeight<600?'600':clintHeight;
            let leftWidth = setHeight*780/ 1024;
            $('.login-wrap,.login-left,.login-right').css('height',setHeight);
            $('.login-left').css('width',leftWidth);
            $('.login-right').css('marginLeft',leftWidth);
        },
        methods: {
            //设置cookie
            setCookie(c_name, c_pwd, exdays) {
                var exdate = new Date(); //获取时间
                exdate.setTime(exdate.getTime() + 24 * 60 * 60 * 1000 * exdays); //保存的天数
                //字符串拼接cookie
                window.document.cookie = "userName" + "=" + c_name + ";path=/;expires=" + exdate.toGMTString();
                window.document.cookie = "userPwd" + "=" + c_pwd + ";path=/;expires=" + exdate.toGMTString();
            },
            //读取cookie
            getCookie: function() {
                if (document.cookie.length > 0) {
                    var arr = document.cookie.split('; '); //这里显示的格式需要切割一下自己可输出看下
                    for (var i = 0; i < arr.length; i++) {
                        var arr2 = arr[i].split('='); //再次切割
                        //判断查找相对应的值
                        if (arr2[0] == 'userName') {
                            this.ruleForm.username = arr2[1]; //保存到保存数据的地方
                        } else if (arr2[0] == 'userPwd') {
                            this.ruleForm.password = arr2[1];
                        }
                    }
                }
            },
            //清除cookie
            clearCookie: function() {
                this.setCookie("", "", -1); //修改2值都为空，天数为负1天就好了
            },
            handleChange(){
                localStorage.removeItem('ms_pass');
            },
            showPassword(val){
                var aValue = localStorage.getItem('ms_pass');
                if(!this.checked && aValue){
                    return false;
                }
                if(this.passwordType==='text'){
                    this.passwordType ='password';
                    this.passwordClass='';
                }else{
                    this.passwordType ='text';
                    this.passwordClass='active';
                }
                
            },
            querySelfDetail(){
                $.get(this.$baseUrl+'services/manager/querySelfDetail.json').then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        let object = res.returnObject;

                        // Vue.prototype.GLOBAL_username = object.loginName || localStorage.getItem('ms_username')
                        // this.username = object.loginName;
                        this.realName = object.realName;
                    }else{
                        this.$message.error(res.resultMessage);
                    }
                });
            },
            submitForm(formName) {
                
                // if (this.checked == true) {
                //     //传入账号名，密码，和保存天数3个参数
                //     this.setCookie(this.ruleForm.username, this.ruleForm.password, 7);
                // }else {
                //     //清空Cookie
                //     this.clearCookie();
                // }
                this.$nextTick(() => {
                    this.$refs[formName].validate((valid) => {
                        if (valid) {
                            this.submitAjax();
                        } else {
                            console.log('error submit!!');
                            return false;
                        }
                    });
                })
                
            },
            // 登录
            submitAjax(){
                var md5 = crypto.createHash("md5");
                    md5.update(this.ruleForm.password);
                var md5PassWord = md5.digest('hex');
                var aValue = localStorage.getItem('ms_pass');
 
                if(aValue){
                    md5PassWord = aValue;
                }

                let data={
                    loginName:this.ruleForm.username,
                    password:md5PassWord
                }

                if(this.codeValid){
                    if(!this.ruleForm.img_code){
                        this.$message.error('请输入图片验证码！');
                        return false;
                    }
                    data.pictureCode = this.ruleForm.img_code
                }
                $.post(this.$baseUrl+'services/manager/login.json',JSON.stringify(data)).then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        if(this.checked){
                            localStorage.setItem('checked',true);
                            localStorage.setItem('ms_pass',md5PassWord);
                        }else{
                            localStorage.removeItem('ms_pass');
                            localStorage.removeItem('checked');
                        }
                        // localStorage.setItem('ms_username',res.returnObject.loginPromptName);
                        localStorage.setItem('loginName',res.returnObject.loginName);

                        this.querySelfDetail();

                        this.$router.push('/');
                        
                    }
                    else if(res.resultMessageEnum=='000118'){
                        this.errors.errorMsg = true;
                    }
                    else if(res.resultMessageEnum=='000110'){
                        this.codeValid = true;
                    }else{
                        localStorage.removeItem('ms_pass');
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }
                    
                })
            },
            // 查询管理员自身详情
            querySelfDetail(){
                let GLOBAL_loginName = '';
                let GLOBAL_realName = '';
                $.get(this.$baseUrl+'services/manager/querySelfDetail.json').then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        let data = res.returnObject;
                        GLOBAL_loginName = data.loginName;
                        GLOBAL_realName = data.realName;
                        this.$store.dispatch('setUserInfoData',data)
                    }
                    
                    localStorage.setItem('GLOBAL_realName',GLOBAL_realName);
                    this.$router.push('/');
                }).fail(res=>{

                    localStorage.setItem('GLOBAL_realName',GLOBAL_realName);
                    this.$router.push('/');
                })
            },
            // 获取图片验证码
            getPictureCodeFile(){

                this.img_code_src = this.$baseUrl+'common/getPictureCodeFile.html?pictureCheckType=102';
            }
        }
    }
</script>

<style scoped lang="less">

</style>