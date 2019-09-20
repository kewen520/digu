import Vue from 'vue';
import axios from 'axios';
import ElementUI from 'element-ui';
import VCharts from 'v-charts';
import 'element-ui/lib/theme-chalk/index.css';    // 默认主题
import '../static/fonts/iconfont.css';
import "babel-polyfill";
import store from './store';
import  "../static/css/main-blue.less";
import "../static/css/override-element-ui-blue.less";

Vue.use(ElementUI, { size: 'small' });
Vue.use(VCharts);
import App from './App';
import router from './router';
Vue.prototype.$axios = axios;
Vue.prototype.$baseHost = baseHost;
Vue.prototype.$baseUrl = baseUrl;
axios.defaults.withCredentials = true;
//使用钩子函数对路由进行权限跳转
router.beforeEach((to, from, next) => {
    const user = localStorage.getItem('ms_username');
    if(!user){
        if(to.path !== '/login' && to.path !== '/registered' && to.path !== '/forgetpassword'){
            !!user ? next() : next('/login');
        }else{
            next();
        }
    }else{
        let userRole = localStorage.getItem('USER_ROLE');
        if (userRole){
            if ((from.path === '/login' || from.path === '/') && to.path !== '/registered' && to.path !== '/forgetpassword'){
                // 组长
                if (userRole.indexOf(2) !== -1 && to.path !== '/task' && to.path !== '/taskCheck') {
                    next('/task');
                }
                // 质检员
                else if (userRole.indexOf(1) === -1 && to.path !== '/task' && to.path !== '/taskCheck') {
                    next('/taskCheck');
                }
            }
        }
        next();
    }
    $.ajaxSetup({
        complete:function(xhr,status){
            const json = xhr.responseJSON;
            let num = json && json.errorInfoList && json.errorInfoList[0].errorMessageEnum;
            if(json && (num === '000103'|| num === '000104')){
                localStorage.removeItem('ms_pass');
                next('/login');
            }
        }
    });
});

$.ajaxSetup({
    xhrFields:{
        withCredentials: true
    },
    headers: {'Content-Type': 'application/json'}
});
new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app');

// 管理员用户菜单
Vue.prototype.$menuAdmin = (hasTask = true, hasDialogue = true) => {
    return [
        {
            isShow: true,
            icon: 'iconfont icon-ico_home',
            index: 'dashboard',
            title: '系统首页'
        },
        {
            icon: 'iconfont icon-ico_conversation',
            title: '话术',
            index: '2',
            subs: [
                {
                    index: 'speech',
                    title: '话术模版库'
                },
                {
                    index: 'repository',
                    title: '知识库'
                },
                {
                    index: 'hotword',
                    title: '热词词典'
                },
                {
                    index: 'sound',
                    title: '音频库'
                },
                {
                    index:"sensitive",
                    title:"敏感词库"

                }
            ]
        },
        {
            icon: 'iconfont icon-ico_tasks',
            index: '5',
            title: '任务',
            subs: (() => {
                const res = [{
                    index: 'taskCheck',
                    title: '任务质检'
                }];
                if (hasDialogue) {
                    res.unshift({
                        index: 'dialogue',
                        title: '会话列表'
                    })
                }

                if (hasTask) {
                    res.unshift({
                        index: 'task',
                        title: '外呼任务'
                    })
                }

                return res;
            })()
        },
        {
            icon: 'iconfont icon-ico-menu',
            index: '6',
            title: '策略',
            subs: [
                {
                    index: 'taskConfig',
                    title: '外呼设置'
                },
                {
                    index: 'invalidNumber',
                    title: '无效号码'
                },
                {
                    index: 'antiHarassmentNumber',
                    title: '有效号码'
                },
            ]
        },
        {
            icon: 'iconfont icon-ico_wallet',
            index: '3',
            title: '付费',
            subs: [
                {
                    index: 'recharge',
                    title: '充值支付'
                },
                {
                    index: 'record',
                    title: '交易记录'
                }
            ]
        },
        {
            icon: 'iconfont icon-ico_account',
            index: '4',
            title: '账号',
            subs: [
                {
                    index: 'account',
                    title: '账号设置'
                },
                {
                    index: 'team',
                    title: '团队管理'
                }
            ]
        }
    ]
};

// 质检组长菜单
Vue.prototype.$menuLeader = [
    {
        icon: 'iconfont icon-ico_tasks',
        index: '5',
        title: '任务',
        subs: [
            {
                index: 'task',
                title: '外呼任务'
            },
            {
                index: 'taskCheck',
                title: '任务质检'
            }

        ]
    },
    {
        icon: 'iconfont icon-ico_account',
        index: '4',
        title: '账号',
        subs: [
            {
                index: 'account',
                title: '账号设置'
            }
        ]
    }
];
// 质检员菜单
Vue.prototype.$menuChecker = [
    {
        icon: 'iconfont icon-ico_tasks',
        index: '5',
        title: '任务',
        subs: [
            {
                index: 'taskCheck',
                title: '任务质检'
            }

        ]
    },
    {
        icon: 'iconfont icon-ico_account',
        index: '4',
        title: '账号',
        subs: [
            {
                index: 'account',
                title: '账号设置'
            }
        ]
    }
];