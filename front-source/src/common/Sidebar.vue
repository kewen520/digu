<template>
    <div class="sidebar" :class="collapseUser">
        <div class="sidebar-user" :class="collapseUser">
            <span class="sidebar-user-head"><img :src="head" alt=""></span>
            <p class="sidebar-user-name">{{username + (roleName ? '(' + roleName + ')' : '')}}</p>
        </div>
        <el-menu class="sidebar-el-menu" :default-active="onRoutes" :collapse="collapse"
            text-color="#d4eaff" active-text-color="#fff" unique-opened>
            <template v-for="item in items">
                <template v-if="item.subs">
                    <el-submenu :index="item.index" :key="item.index">
                        <template slot="title">
                            <i :class="item.icon"></i><span slot="title">{{ item.title }}</span>
                        </template>
                        <template v-for="subItem in item.subs">
                            <el-submenu v-if="subItem.subs" :index="subItem.index" :key="subItem.index">
                                <template slot="title">
                                    {{subItem.title }}
                                </template>
                                <el-menu-item v-for="(threeItem,i) in subItem.subs" :key="i" :index="threeItem.index">
                                    <a :href="'#/'+threeItem.index">{{ threeItem.title }}</a>
                                </el-menu-item>
                            </el-submenu>
                            <el-menu-item v-else :index="subItem.index" :key="subItem.index">
                                <a :href="'#/'+subItem.index">{{ subItem.title }}</a>
                            </el-menu-item>
                        </template>
                    </el-submenu>
                </template>
                <template v-else>
                    <el-menu-item :index="item.index" :key="item.index">
                        <a :href="'#/'+item.index"><i :class="item.icon"></i><span slot="title">{{ item.title }}</span></a>
                    </el-menu-item>
                </template>
            </template>
        </el-menu>
        <div class="sidebar_footer" :class="{position_ab:isAb}">
            <!-- <p class="a">智能外呼系统</p> -->
            <p class="a"><img  alt=""></p>
            <!-- <p class="b">智能外呼系统</p> -->
        </div>
    </div>
</template>

<script>
    import bus from '../common/bus';
    import female from 'common-static/img/ico_female.png';
    import male from 'common-static/img/ico_male.png';
    export default {
        data() {
            return {
                collapse: false,
                collapseUser:'',
                username:'',
                isAb:false,
                /*默认主题*/
                /*head:'/static/img/head_defa.png',*/
                /*蓝色主题*/
                head:'/common-static/img/ico_male.png',
                items:[],
                roleName:'',
            }
        },
        
        computed:{
            onRoutes(){
                return this.$route.path.replace('/','');
            },
        },
        methods:{
            // 查询会员信息
            queryMemberDetail(){
                let upload_img_url= this.$baseUrl+`common/showPictureFile.html?pictureFileName=`;
                let GLOBAL_NAME = '';
                let GLOBAL_HEAD = '';
                $.get(this.$baseUrl+'member/queryMemberDetail.json').then((res)=>{
                    if(res.resultMessageEnum=='0000'){
                        let data = res.returnObject;
                        localStorage.setItem('USER_ROLE',data.role);
                        GLOBAL_NAME = data.contactName || data.enterpriseName || data.accountName
                        this.roleName = data.roleName;
                        if(typeof data.avatarPath != 'undefined' && data.avatarPath.indexOf('static/img')>-1){
                            if(data.avatarPath.indexOf('female')>-1){
                                GLOBAL_HEAD = female;
                            }else{
                                GLOBAL_HEAD = male;
                            }
                        }else{
                            GLOBAL_HEAD = upload_img_url+data.avatarPath;
                        }

                    }else{
                        // return {};
                        this.$message.error(res.errorInfoList[0].errorMessage);
                    }

                    localStorage.setItem('GLOBAL_NAME',GLOBAL_NAME);
                    localStorage.setItem('GLOBAL_HEAD',GLOBAL_HEAD);

                    this.getUser();

                }).fail(res=>{
                    localStorage.setItem('GLOBAL_NAME',GLOBAL_NAME);
                    localStorage.setItem('GLOBAL_HEAD',GLOBAL_HEAD);
                });
            },
            getUser(){
                let username = localStorage.getItem('GLOBAL_NAME') || localStorage.getItem('ms_username');
                let head = localStorage.getItem('GLOBAL_HEAD');

                this.username = username;
            },
            isHandleAb(){
                var clintHeight = document.documentElement.clientHeight;
                if(clintHeight<680){
                    this.isAb = true;
                }
            },
            /**
             * 重置菜单
             * @param userRole
             */
            resetMenu(userRole){
                if (userRole != ''){
                    if (userRole.indexOf(1) !== -1) {
                        this.items = this.$menuAdmin(true, true);
                    } else if (userRole.indexOf(2) !== -1) {
                        this.items = this.$menuLeader;
                    } else if (userRole.indexOf(3) !== -1) {
                        this.items = this.$menuChecker;
                    };
                } ;
            },
        },
        mounted(){
            this.getUser();
            this.isHandleAb();
            window.onresize = this.isHandleAb;
        },
        created(){
            this.queryMemberDetail();
            this.resetMenu(localStorage.getItem('USER_ROLE'));
            // 通过 Event Bus 进行组件间通信，来折叠侧边栏
            bus.$on('collapse', msg => {
                this.collapse = msg;
                this.collapseUser = msg?'collapse':''
            })
            bus.$on('updateUser', msg => {
                this.queryMemberDetail();
            })
        }
    }
</script>

<style scoped lang="less">
    .sidebar{
        display: block;
        width: 230px;
        position: absolute;
        left: 0;
        top:0;
        bottom:0;
        right: 0;
        overflow-y: scroll;
        z-index:11;
        transition:width 0.3s ease-in-out;
        .sidebar-el-menu{
            background:none;
        }
         &.collapse{
             width: 64px;
             .sidebar-user-name{
                 display: none;
             }
             .sidebar_footer{
                width: 64px;
             }
         }
    }

    
    .sidebar::-webkit-scrollbar{
        width: 0;
    }
    .sidebar-el-menu:not(.el-menu--collapse){
        width: 240px;
    }
    .sidebar > ul {
        height:640px;
        // height:100%;
        box-sizing: border-box;
        padding-top: 200px;
        padding-bottom: 60px;
        // height:480px;
    }
    
    .sidebar-user{
        padding: 62px 5px 40px 0;
        text-align:center;
        box-sizing: border-box;
        transition:all 0.3s ease-in-out;
        position: absolute;
        left: 0;
        width: 100%;
        
        &.collapse{
            width: 64px;
            .sidebar-user-head{
                width:50px;
                height:50px;
                padding:5px 0 0 5px;
                img{
                    width:40px;
                    height:40px;
                }
            }
        }
        .sidebar-user-head{
            display: inline-block;
            // border:1px solid #fff;
            border-radius: 50%;
            width: 74px;
            height: 74px;
            // padding:7px 0 0 7px;
            box-sizing: border-box;
            transition:all 0.3s ease-in-out;
            img{
                display: block;
                width:74px;
                height:74px;
                border-radius: 50%;
                transition:all 0.3s ease-in-out;
            }
        }
        .sidebar-user-name{
            color: #fff;
            font-size: 16px;
        }
    }
    .sidebar_footer{
        position: relative;
        bottom:-100px;
        text-align: center;
        color: #fff;
        box-sizing: border-box;
        /*padding:30px 0 0px;*/
        &.position_ab{
            position: relative;
            // bottom: 20px;
            margin-top:80px;
        }
        .a{
            img{
                width:160px;
            }
            // font-size: 28px;
            // font-weight: bold;
        }
    }
</style>
