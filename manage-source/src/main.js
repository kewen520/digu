import Vue from 'vue';
import App from './App';
import router from './router';
import axios from 'axios';
import ElementUI from 'element-ui';
import VCharts from 'v-charts';

import 'element-ui/lib/theme-chalk/index.css';    // 默认主题
import '../static/fonts/iconfont.css';
import "babel-polyfill";
import store from './store'
// 默认主题
/*import  "../static/css/main.less";
import "../static/css/override-element-ui.less";*/
// 蓝色主题
import  "../static/css/main-blue.less";
import "../static/css/override-element-ui-blue.less";

Vue.use(ElementUI, { size: 'small' });

Vue.use(VCharts);
Vue.prototype.$axios = axios;
Vue.prototype.$baseUrl = baseUrl;
Vue.prototype.$baseHost = baseHost;

//使用钩子函数对路由进行权限跳转
router.beforeEach((to, from, next) => {
    // const role = localStorage.getItem('ms_username');

    var user = localStorage.getItem('ms_username');
    // if(!user){
    //     if(to.path != '/login' && to.path != '/registered' && to.path != '/forgetpassword'){
    //         !!user ? next() : next('/login');
    //     }else{
    //         next();
    //     }
    // }else{
    //     next();
    // }
    next();
    $.ajaxSetup({
        complete:function(xhr,status){
            var json = xhr.responseJSON;
            let num = json && json.errorInfoList && json.errorInfoList[0].errorMessageEnum;
            if(json && (num=='000103'||num=='000104')){
                localStorage.removeItem('ms_pass');
                next('/login');
            }
        }
    });
})

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