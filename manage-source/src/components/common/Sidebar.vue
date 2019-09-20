<template>
    <div class="sidebar" :class="collapseUser">
        <!-- <div class="sidebar-user" :class="collapseUser">
            <a href="#/changepass">
            <span class="sidebar-user-head">
                <img src="../../../static/img/user.png" alt="">
            </span>
            <p class="sidebar-user-name">{{username}}</p>
            <p class="sidebar-realName">({{realName}})</p>
            </a>
        </div> -->
        <div class="sidebar-top">
            <span><img alt=""></span>
            <!-- <span class="f">SAMANTHA</span>
            <span class="s">后台管理系统</span> -->
        </div>
        <el-menu class="sidebar-el-menu" :default-active="onRoutes" :collapse="collapse" unique-opened>
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
    </div>
</template>

<script>
    import bus from '../common/bus';
    export default {
        data() {
            return {
                collapse: false,
                username:'',
                realName:'',
                collapseUser:'',
                items: [
                    {
                        // icon: 'el-icon-lx-home',
                        icon:'el-icon-tickets',
                        title: '用户中心',
                        index:'1',
                        subs:[
                            {
                                index: 'certification',
                                title: '认证管理'
                            },
                            {
                                index: 'information',
                                title: '用户资料'
                            }
                        ]
                    },
                    {
                        icon: 'el-icon-date',
                        title: '管理中心',
                        index: '2',
                        subs:[
                            {
                                index: 'industry',
                                title: '行业管理'
                            },
                            {
                                index: 'speech',
                                title: '话术管理'
                            },
                            {
                                index: 'resource',
                                title: '资源管理'
                            },
                            {
                                index: 'repository/1',
                                title:"知识库管理"
                            },
                            {
                                index:"sensitive",
                                title:"敏感词管理"
                            },
                            {
                                index:"hotword",
                                title:"热词管理"
                            },
							{
							    index: 'robotLine',
							    title: '机器人线路配置'
							}
                        ]
                    },
                    {
                        icon: 'iconfont icon-ico_wallet',
                        index: '3',
                        title: '数据中心',
                        subs:[
                            // {
                            //     index: 'fund',
                            //     title: '资金统计'
                            // },
                            {
                                index: 'record',
                                title: '意图分类统计'
                            }
                        ]
                    }
                ]
            }
        },
        
        computed:{
            onRoutes(){
                return this.$route.path.replace('/','');
            },
            // username(){
                // let username = localStorage.getItem('ms_username');
                // return username ? username : this.name;
            // },
            
        },
        methods:{
            // // 查询管理员自身详情
            // querySelfDetail(){
            //     var data={
                    
            //     }
            //     $.get(this.$baseUrl+'services/manager/querySelfDetail.json',JSON.stringify(data)).then((res)=>{
            //         if(res.resultMessageEnum=='0000'){
            //             let object = res.returnObject;

            //             this.username = object.loginName || localStorage.getItem('ms_username');
            //             this.realName = object.realName;
            //         }else{
            //             this.$message.error(res.resultMessage);
            //         }
            //     });
            // }
        },
        created(){
            // 通过 Event Bus 进行组件间通信，来折叠侧边栏
            bus.$on('collapse', msg => {
                this.collapse = msg;
                this.collapseUser = msg?'collapse':''
            })
            

            // let GLOBAL_loginName = localStorage.getItem('loginName');
            // let GLOBAL_realName = localStorage.getItem('GLOBAL_realName');

            // this.username = GLOBAL_loginName;
            // this.realName = GLOBAL_realName;

            // this.querySelfDetail();
        }
    }
</script>

<style scoped lang="less">
    .sidebar{
        display: block;
        width: 240px;
        position: absolute;
        left: 0;
        top:0;
        bottom:0;
        overflow-y: scroll;
        z-index:11;

        transition:width 0.3s ease-in-out;
        .sidebar-el-menu{
            background:none;
        }
         &.collapse{
             width: 64px;
         }
        .sidebar-top{
            padding:40px 0 30px;
            span{
                display:block;
                width:180px;
                margin: 0 auto;
                text-align:center;
                text-align: justify;
                text-justify: distribute-all-lines;
                text-align-last: justify;
                -moz-text-align-last: justify;
                -webkit-text-align-last: justify;
                img{
                    width: 100%;
                }
            }
            .f{
                color: #fff;
                font-size: 22px;
                letter-spacing:2px;
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
        // height:100%;
        height:calc(100%-40px);
    }
    
    .sidebar-user{
        padding: 62px 5px 40px 0;
        text-align:center;
        box-sizing: border-box;
        transition:all 0.3s ease-in-out;
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
            // border-radius: 50%;
            // width: 74px;
            // height: 74px;
            // padding:8px 0 0 8px;
            box-sizing: border-box;
            transition:all 0.3s ease-in-out;
            img{
                display: block;
                width: 58px;
                height: 58px;
                border-radius: 50%;
                transition:all 0.3s ease-in-out;
            }
        }
        .sidebar-user-name{
            color: #fff;
            font-size:14px;
        }
        .sidebar-realName{
            color: #8d93a5;
            font-size: 12px;
        }
    }
</style>
