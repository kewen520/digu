import Vue from 'vue';
import Router from 'vue-router';

import $ from 'jquery';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            redirect: '/dashboard'
        },
        {
            path: '/flow',
            meta: { title: '话术编辑器' },
            component: resolve => require(['../ng-flow/main.js'], resolve),
        },
        {
            path: '/',
            component: resolve => require(['../common/Home.vue'], resolve),
            meta: { title: '自述文件' },
            children:[
                {
                    path: '/dashboard',
                    component: resolve => require(['../page/Dashboard.vue'], resolve),
                    meta: { title: '主页' },
                    props:{isActive:true}
                },
                {
                    path: '/speech',
                    component: resolve => require(['../page/Speech/Speech.vue'], resolve),
                    meta: { title: '话术库' }
                },
                {
                    path:'/sound',
                    component: resolve => require(['../page/Sound.vue'], resolve),
                    meta: { title: '音频库' }
                },
                {
                    path: '/repository',
                    
                    component: resolve => require(['../page/Repository.vue'], resolve),
                    meta: { title: '知识库' },
                    redirect:'/repository/set/unclassified',
                    children:[
                        
                        {
                            path: 'set/:id',
                            component: resolve => require(['../page/base/RepositoryList.vue'], resolve),
                            meta: { title: '知识库编辑' }
                        },
                        {
                            path: 'sub/:id',
                            component: resolve => require(['../page/base/KnowledgeConfig.vue'], resolve),
                            meta: { title: '知识库编辑' }
                        },
                    ]
                },
                {
                    path: '/repository/edit/:id',
                    component: resolve => require(['../page/RepositoryEdit.vue'], resolve),
                    meta: { title: '话术库' }
                },
                {
                    path: '/repository/viewknoledgegroup/:id',
                    component: resolve => require(['../page/viewKnoledgeGroup.vue'], resolve),
                    meta: { title: '知识库列表展示' }
                },
                {
                    path: '/repository/viewknoledgeitem/:id',
                    component: resolve => require(['../page/viewKnoledgeItem.vue'], resolve),
                    meta: { title: '知识库详情展示' }
                },
                {                
                    path: '/task',
                    component: resolve => require(['../page/Task/Task.vue'], resolve),
                    meta: { title: '任务' }
                },
				{                
				    path: '/antiHarassmentNumber',
				    component: resolve => require(['../page/antiHarassmentNumber.vue'], resolve),
				    meta: { title: '有效号码' }
				},
				{                
				    path: '/invalidNumber',
				    component: resolve => require(['../page/invalidNumber.vue'], resolve),
				    meta: { title: '无效号码' }
				},
				{
				    path: '/taskConfig',
				    component: resolve => require(['../page/Task/TaskConfig.vue'], resolve),
				    meta: { title: '外呼设置' }
				},
                {
				    path: '/taskCheck',
				    component: resolve => require(['../page/Task/TaskCheck.vue'], resolve),
				    meta: { title: '任务质检' }
				},
                {
                    path: '/task/:id',
                    component: resolve => require(['../page/Task/TaskDesc.vue'], resolve),
                    meta: { title: '详情' }
                },
				{
					path: '/dialogue',
					component: resolve => require(['../page/Dialogue/Dialogue.vue'], resolve),
					meta: { title: '会话列表' }
				},
                {
					path: '/dialogue/:id',
					component: resolve => require(['../page/Dialogue/DialogueDesc.vue'], resolve),
					meta: { title: '会话列表-详情' }
                },
                {
                    path: 'recharge',
                    component: resolve => require(['../page/Recharge.vue'], resolve),
                    meta: { title: '管理员' },
                },
                {
                    path: '/pay/:id',
                    component: resolve => require(['../page/Pay.vue'], resolve),
                    meta: { title: '支付' }
                },
                {
                    path: 'record',
                    component: resolve => require(['../page/Record.vue'], resolve),
                    meta: { title: '企业账号' },
                },
                {
                    path: 'admin',
                    component: resolve => require(['../page/Admin.vue'], resolve),
                    meta: { title: '管理员' },
                },
                {
                    path: 'account',
                    component: resolve => require(['../page/Account.vue'], resolve),
                    meta: { title: '账号设置' },
                },
                {
                    path: 'team',
                    component: resolve => require(['../page/TeamManage.vue'], resolve),
                    meta: { title: '团队管理' },
                },
                {
                    path: 'help',
                    component: resolve => require(['../page/Help.vue'], resolve),
                    meta: { title: '帮助' },
                },
                {
                    path: 'protocol',
                    component: resolve => require(['../page/Protocol.vue'], resolve),
                    meta: { title: '协议' },
                },
                {
                    path: '/404',
                    component: resolve => require(['../page/404.vue'], resolve),
                    meta: { title: '404' }
                },
                {
                    path: '/hotword',
                    component: resolve => require(['../page/hotword.vue'], resolve),
                    meta: { title: '热词词典' }
                },
                {
                    path: '/hotword/:id',
                    component: resolve => require(['../page/hotEntry.vue'], resolve),
                    meta: { title: '热词词条' }
                },
                {
                    path: '/generalknowledge',
                    component: resolve => require(['../page/KnowledgeGeneral.vue'], resolve),
                    meta: { title: '通用任务' }
                },
                {
                    path:"/sensitive",
                    component: resolve => require(['../page/SensitiveWord.vue'], resolve),
                    meta: { title: '敏感词库' }
                },
                {
                    path:"/sensitive/:id/:libraryname",
                    component: resolve => require(['../page/SensitiveDetail.vue'], resolve),
                    meta: { title: '敏感词列表' }
                },
            ]
        },
        {
            path: '/login',
            component: resolve => require(['../page/Login.vue'], resolve)
        },
        {
            path: '/registered',
            component: resolve => require(['../page/Registered.vue'], resolve)
        },
        {
            path: '/forgetpassword',
            component: resolve => require(['../page/ForgetPassword.vue'], resolve)
        },
        {
            path: '*',
            redirect: '/404'
        }
    ]
})
