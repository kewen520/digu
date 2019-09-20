<template>
    <div class="header">
        <!-- 折叠按钮 -->
        <div class="collapse-btn" @click="collapseChage">
            <i class="iconfont icon-ico-menu w-icon-menu"></i>
        </div>
        <span class="main__tip" v-show="showTip">您尚未进行企业认证，认证后才可进行外呼，<a href="#/account">去认证</a></span>
        <!-- <div class="logo">Samantha管理系统</div> -->
        <div class="header-right">
            <div class="header-user-con">
                <!-- 全屏显示 -->
                <!-- <div class="btn-fullscreen" @click="handleFullScreen">
                    <el-tooltip effect="dark" :content="fullscreen?`取消全屏`:`全屏`" placement="bottom">
                        <i class="iconfont icon-ico_setting"></i>
                    </el-tooltip>
                </div> -->
                <!-- 消息中心 -->
                <!-- <div class="btn-bell">
                    <el-tooltip effect="dark" :content="message?`有${message}条未读消息`:`消息中心`" placement="bottom">
                        <router-link to="/tabs">
                            <i class="iconfont icon-ico_message"></i>
                        </router-link>
                    </el-tooltip>
                    <span class="btn-bell-badge" v-if="message"></span>
                </div> -->
                <div class="user-name" @click="dialogVisible = true">
                    <el-tooltip effect="dark" content="退出登录" placement="bottom">
                        <i class="iconfont icon-ico_log-out"></i>
                    </el-tooltip>
                </div>

                <!-- <el-dropdown class="user-name" trigger="click">
                    <span class="el-dropdown-link">
                        <i class="iconfont icon-ico_log-out"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                        <a @click="dialogVisible = true">
                            <el-dropdown-item>退出登录</el-dropdown-item> 
                        </a>
                    </el-dropdown-menu>
                </el-dropdown>  -->

                <!-- 用户头像 -->
                <!-- <div class="user-avator"><img src="static/img/img.jpg"></div> -->
                <!-- 用户名下拉菜单 -->
                <!-- <el-dropdown class="user-name" trigger="click" @command="handleCommand">
                    <span class="el-dropdown-link">
                        {{username}} <i class="el-icon-caret-bottom"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                        <a href="http://blog.gdfengshuo.com/about/" target="_blank">
                            <el-dropdown-item>关于作者</el-dropdown-item>
                        </a>
                        <a href="https://github.com/lin-xin/vue-manage-system" target="_blank">
                            <el-dropdown-item>项目仓库</el-dropdown-item>
                        </a>
                        <el-dropdown-item divided  command="loginout">退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown> -->
            </div>
        </div>
        <el-dialog
            title="退出登录"
            :visible.sync="dialogVisible"
            width="30%">
            <span>您确定要退出当前账号登录状态吗？</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleEnter">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    
    import bus from '../common/bus';
    export default {
        data() {
            return {
                collapse: false,
                fullscreen: false,
                dialogVisible:false,
                showTip:false,
                name: '',
                message: 2
            }
        },
        computed:{
            username(){
                let username = localStorage.getItem('ms_username');
                return username ? username : this.name;
            }
        },
        created(){
            this.queryMemberDetail();
        },
        methods:{
            // 侧边栏折叠
            collapseChage(){
                this.collapse = !this.collapse;
                bus.$emit('collapse', this.collapse);
            },
            // 全屏事件
            handleFullScreen(){
                let element = document.documentElement;
                if (this.fullscreen) {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.webkitCancelFullScreen) {
                        document.webkitCancelFullScreen();
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    } else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    }
                } else {
                    if (element.requestFullscreen) {
                        element.requestFullscreen();
                    } else if (element.webkitRequestFullScreen) {
                        element.webkitRequestFullScreen();
                    } else if (element.mozRequestFullScreen) {
                        element.mozRequestFullScreen();
                    } else if (element.msRequestFullscreen) {
                        // IE11
                        element.msRequestFullscreen();
                    }
                }
                this.fullscreen = !this.fullscreen;
            },
            handleEnter(){
                $.post(this.$baseUrl+'member/logout.json').then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        this.dialogVisible = false;
                        // localStorage.removeItem('ms_username');
                        localStorage.removeItem('ms_pass');
                        localStorage.removeItem('checked');
                        localStorage.removeItem('GLOBAL_NAME');
                        localStorage.removeItem('GLOBAL_HEAD');
                        localStorage.removeItem('USER_ROLE');
                        localStorage.removeItem('USER_INFO');
                        localStorage.removeItem('ms_username');
                        // localStorage.removeItem('loginName');
                        this.$router.push('/login');
                    }
                    else{
                        this.$message.error(res.resultMessage);
                    }
                    
                })
                this.dialogVisible = false;
            },
            // 查询会员信息
            queryMemberDetail(){
                let path = this.$route.path
                $.get(this.$baseUrl+'member/queryMemberDetail.json').then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        let data = res.returnObject;
                        if(data.authenticationFlag!=1 && path.indexOf('account')<0){
                            this.showTip = true;
                        }
                    }else{
                        
                    }
                })
            },
        },
        mounted(){
            // $.ajaxSetup({
            //     complete:function(xhr,status){
            //         var json = xhr.responseJSON;
            //         alert(8)
            //         console.log(json,8888)
            //         if(json && json.errorInfoList[0].errorMessageEnum=='000103'){
            //             this.$router.push('/login');
            //         }
            //     }
            // });
            // if(document.body.clientWidth < 1500){
            //     this.collapseChage();
            // }
        }
    }
</script>
<style scoped lang="less">
    .header {
        position: relative;
        box-sizing: border-box;
        width: 100%;
        height:40px;
        font-size: 22px;
        color: #000;
    }
    .collapse-btn{
        float: left;
        padding: 0 21px;
        cursor: pointer;
        line-height: 38px;
    }
    .header .logo{
        float: left;
        width:250px;
        line-height:40px;
    }
    .header-right{
        float: right;
        padding-right: 50px;
    }
    .header-user-con{
        display: flex;
        height:40px;
        align-items: center;
        i{
            font-size:22px;
            color: #333;
        }
    }
    .btn-fullscreen{
        transform: rotate(45deg);
        margin-right: 5px;
        font-size: 24px;
    }
    .btn-bell, .btn-fullscreen{
        position: relative;
        width: 30px;
        height: 30px;
        text-align: center;
        border-radius: 15px;
        cursor: pointer;
    }
    .btn-bell-badge{
        position: absolute;
        right: 0;
        top: -2px;
        width: 8px;
        height: 8px;
        border-radius: 4px;
        background: #f56c6c;
    }

    .user-name{
        margin-left: 10px;
        cursor: pointer;
    }
    .user-name.el-dropdown{
        font-size: 24px;
    }
    .user-avator{
        margin-left: 20px;
    }
    .user-avator img{
        display: block;
        width:40px;
        height:40px;
        border-radius: 50%;
    }
    .el-dropdown-link{
        /* color: #fff; */
        cursor: pointer;
    }
    .el-dropdown-menu__item{
        text-align: center;
    }
    .main__tip{
        font-size: 12px;
        left: 50%;
        display: inline-block;
        position: absolute;
        margin-left: -222px;
        padding:5px 15px;
        background-color: #fdf4e9;
        color: #ffc12b;
        top:6px;
        a{
            text-decoration: underline;
            color: #fea200;
        }
    }
</style>
