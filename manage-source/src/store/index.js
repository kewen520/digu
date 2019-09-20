import Vue from 'vue'
import vuex from 'vuex'
Vue.use(vuex);

/*
 * 
 *
 * 
 */

export default new vuex.Store({
    state:{
        intentData:'',
        userInfo:'',
        currIndex:''
    },
    getters:{
        getIntent(state){
            return state.intentData;
        },
        getUserInfo(state){
            // return state.userInfo;
            return sessionStorage.getItem('userInfo') && JSON.parse(sessionStorage.getItem('userInfo'))
        }
    },
    mutations:{
        setIntent(state,data){
            state.intentData = data
        },
        setUserInfo(state,data){
            // state.userInfo = data;
            sessionStorage.setItem('userInfo',JSON.stringify(data))
        },
        setTab(state,data){
            state.currIndex = data;
        },
    },
    actions:{
        setIntentData({commit,state},data){
            commit('setIntent',data)
        },
        setUserInfoData({commit,state},data){
            commit('setUserInfo',data)
        },
        setTabIndex({commit,state},data){
            commit('setTab',data)
        },
        
    }
})