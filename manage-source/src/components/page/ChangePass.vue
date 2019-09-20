<template>
    <div class="container-admin">
        <div class="w-tab">修改密码</div>
        <div class="admin-content">
            <el-form ref="passForm" :model="form" :rules="rules" label-width="120px">
                <el-form-item label="原密码：" prop="oldPassword">
                    <el-input type="password"  v-model="form.oldPassword" placeholder="原密码"></el-input>
                </el-form-item>
                <el-form-item label="新密码：" prop="newPassword">
                    <el-input type="password"  v-model="form.newPassword" placeholder="新密码"></el-input>
                </el-form-item>
                <el-form-item label="确认新密码：" prop="check_pass">
                    <el-input type="password" v-model="form.check_pass" placeholder="确认新密码"></el-input>
                </el-form-item>
            </el-form>
            <div class="btn-box">
                <el-button  @click="resetForm">重新填写</el-button>
                <el-button type="primary" @click="onSubmit">更改密码</el-button>
            </div>
        </div>
    </div>
</template>

<script>
    import bus from '../common/bus';
    import crypto from 'crypto';
    export default {
        name: 'changePass',
        data() {
            var validatePass = (rule, value, callback) => {
                if (value !== this.form.newPassword) {
                    callback(new Error('两次输入密码不一致!'));
                } else {
                    callback();
                }
            };
            return {
                collapse: false,
                form:{
                    oldPassword:'',
                    newPassword:'',
                    check_pass:''
                },
                rules:{
                    oldPassword: [
                        { required: true, message: '原密码不能为空！', trigger: 'blur' }
                    ],
                    newPassword: [
                        { required: true, message: '新密码不能为空！', trigger: 'blur' }
                    ],
                    check_pass: [
                        { required: true, message: '请再次输入密码！', trigger: 'blur' },
                        { validator: validatePass, trigger: 'change' }
                    ],
                }
            }
        },
        mounted(){
            let clintHeight = document.documentElement.clientHeight;
            let height = clintHeight - 123;
            $('.admin-content').css('height',height);
        },
        created(){
            //  是否显示tab
            // bus.$on('collapse', msg => {
            //     this.collapse = msg;
            // });
            // let clintHeight = document.documentElement.clientHeight;
            // let height = clintHeight - 50;
            // console.log(height,$('.admin-content'))
            // $('.admin-content').css('height',height);
        },
        watch: {
            
        },
        methods: {
            resetForm(){
                this.$refs['passForm'].resetFields();
            },
            onSubmit(){
                this.$refs['passForm'].validate((valid) => {
                    if (valid) {
                        this.modifyManagerPassword();
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            },
            modifyManagerPassword(){
                let self=this;
                var md5 = crypto.createHash("md5");
                    md5.update(this.form.oldPassword);
                var md5OldPassWord = md5.digest('hex');
                
                var md52 = crypto.createHash("md5");
                    md52.update(this.form.newPassword);
                var md5NewPassword = md52.digest('hex');

                let data = {
                    oldPassword:md5OldPassWord,
                    newPassword:md5NewPassword
                }
                $.post(this.$baseUrl+'services/manager/modifyManagerPassword.json',JSON.stringify(data)).then((res)=>{

                    if(res.resultMessageEnum=='0000'){
                        self.$message('修改成功！');
                    }else{
                        self.$message.error(res.errorInfoList[0].errorMessage);
                    }
                });
            },

        },
        destroyed(){
           
        }
    }

</script>


<style scoped scoped lang="less">
    .w-tab{
        display: inline-block;
        padding: 10px 10px;
        color: #409EFF;
        border-bottom:3px solid #409EFF;
    }
    .el-form{
        width:400px;
        margin:100px 0 20px 60px;
    }
    .el-form-item__label{
        text-align: left;
    }
    .btn-box{
        width: 100%;
        padding-right: 40px;
        position:absolute;
        bottom:20px;
        text-align: right;
    }
    .admin-content{
        margin-top: 20px;
        padding:20px 0;
    }
</style>
