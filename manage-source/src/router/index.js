import Vue from 'vue';
import Router from 'vue-router';
import $ from 'jquery';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            redirect: '/certification'
        },
        {
            path: '/',
            component: resolve => require(['../components/common/Home.vue'], resolve),
            meta: { title: '自述文件' },
            children:[
                {
                    path: '/certification',
                    component: resolve => require(['../components/page/Certification.vue'], resolve),
                    meta: { title: '主页' }
                },
                {
                    path: '/auth/:id',
                    component: resolve => require(['../components/page/Auth.vue'], resolve),
                    meta: { title: '认证' }
                },
                {
                    path: '/changepass',
                    component: resolve => require(['../components/page/ChangePass.vue'], resolve),
                    meta: { title: '修改密码' }
                },
                {
                    path: '/information',
                    component: resolve => require(['../components/page/Information.vue'], resolve),
                    meta: { title: '用户资料' }
                },
                {
                    path: '/information/:id',
                    component: resolve => require(['../components/page/User.vue'], resolve),
                    meta: { title: '用户' }
                },
                {
                    path: '/industry',
                    component: resolve => require(['../components/page/Industry.vue'], resolve),
                    meta: { title: '行业管理' }
                },
                {
                    path: '/speech',
                    component: resolve => require(['../components/page/Speech.vue'], resolve),
                    meta: { title: '话术管理' }
                },
                {
                	path: '/resource',
                	component: resolve => require(['../components/page/Resource.vue'], resolve),
                	meta: { title: '资源管理' }
                },
				{
					path: '/robotLine',
					component: resolve => require(['../components/page/robotLine.vue'], resolve),
					meta: { title: '机器人线路管理' }
				},
                {
                    path: '/sound/yh/:id',
                    component: resolve => require(['../components/page/base/sound/soundYh.vue'], resolve),
                    meta: { title: '查看用户音频库' }
                },                
                {
                	path: '/sound/yhyp/:memberId/:groupId',
                	component: resolve => require(['../components/page/base/sound/soundYhYp.vue'], resolve),
                	meta: { title: '查看用户音频库' }
                },                
                {
                    path: '/speech/add',
                    component: resolve => require(['../components/page/base/speech/IntentAdd.vue'], resolve),
                    meta: { title: '话术管理' }
                },
                {
                    path: '/speech/add/:id',
                    component: resolve => require(['../components/page/base/speech/IntentAdd.vue'], resolve),
                    meta: { title: '话术管理' }
                },
                {
                    path: '/speech/member/:id',
                    component: resolve => require(['../components/page/base/speech/Member.vue'], resolve),
                    meta: { title: '话术管理' }
                },
                {
                    path: '/speech/hy/:id',
                    component: resolve => require(['../components/page/base/speech/IntentHyEdit.vue'], resolve),
                    meta: { title: '话术管理' }
                },
                {
                    path: '/speech/yh/:id',
                    component: resolve => require(['../components/page/base/speech/IntentYhEdit.vue'], resolve),
                    meta: { title: '话术管理' }
                },
                {
                    path: '/speech/yhhs/:id',
                    component: resolve => require(['../components/page/base/speech/speechYh.vue'], resolve),
                    meta: { title: '查看用户话术' }
                },
                {
                    path: '/speech/:id',
                    component: resolve => require(['../components/page/SpeechDetails.vue'], resolve),
                    meta: { title: '话术详情' }
                },
                {
                    path: '/record',
                    component: resolve => require(['../components/page/Record.vue'], resolve),
                    meta: { title: '意图统计' }
                },
                {
                    path:"/repository/:type",
                    component:resolve => require(['../components/page/Repository.vue'], resolve),
                    meta: { title: '知识库管理' }
                },
                {
                    path:"/repository/config/:id",
                    component:resolve => require(['../components/page/RepositoryConfig.vue'], resolve),
                    meta: { title: '知识库管理' }
                },
                {
                    path: '/repository/edit/:id',
                    component: resolve => require(['../components/page/RepositoryEdit.vue'], resolve),
                    meta: { title: '话术库' }
                },
                {
                    path: '/repository/view/:id',
                    component: resolve => require(['../components/page/RepositoryView.vue'], resolve),
                    meta: { title: '话术库' }
                },
                {
                    path: '/repositoryusergroup/:id',
                    component: resolve => require(['../components/page/RepositoryUserGroup.vue'], resolve),
                    meta: { title: '话术库' }
                },
                {
                    path: 'help',
                    component: resolve => require(['../components/page/Help.vue'], resolve),
                    meta: { title: '帮助' },
                },
                {
                    path: '/404',
                    component: resolve => require(['../components/page/404.vue'], resolve),
                    meta: { title: '404' }
                },
                {
                    path:"/sensitive",
                    component: resolve => require(['../components/page/SensitiveWord.vue'], resolve),
                    meta: { title: '敏感词库' }
                },
                {
                    path:"/sensitive/:id/:libraryname",
                    component: resolve => require(['../components/page/SensitiveDetail.vue'], resolve),
                    meta: { title: '敏感词列表' }
                },
                {
                    path: '/hotword',
                    component: resolve => require(['../components/page/hotword.vue'], resolve),
                    meta: { title: '热词管理' }
                },
                {
                    path: '/hotword/:id/:isIndustry',
                    component: resolve => require(['../components/page/hotEntry.vue'], resolve),
                    meta: { title: '热词词条' }
                },
                {
                    path: '/hotwordYh/:id',
                    component: resolve => require(['../components/page/hotwordYhView.vue'], resolve),
                    meta: { title: '查看用户词典' }
                },
                {
                    path: '/hotwordYhView/:id/:memberId',
                    component: resolve => require(['../components/page/hotEntryYhView.vue'], resolve),
                    meta: { title: '查看词条' }
                },
            ]
        },
        {
            path: '/login',
            component: resolve => require(['../components/page/Login.vue'], resolve)
        },
        {
            path: '*',
            redirect: '/404'
        }
    ]
})
