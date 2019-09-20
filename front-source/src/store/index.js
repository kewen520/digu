import Vue from 'vue';
import vuex from 'vuex';
Vue.use(vuex);
import knowledge from './modules/knowledge';

export default new vuex.Store({
  state: {
    soundFile: '',
    knowledgeCurrentData: '', //知识库分类
    setknowledge: '',
  },
  getters: {
    getUserInfo(state) {
      // return state.userInfo;
      return sessionStorage.getItem('userInfo') && JSON.parse(sessionStorage.getItem('userInfo'));
    },
    getFile(state) {
      return state.soundFile;
    },
    getKnowledgeData(state) {
      return state.knowledgeCurrentData;
    },
    getknowledge(state) {
      return state.setknowledge;
    },
  },
  mutations: {
    setUserInfo(state, data) {
      // state.userInfo = data;
      sessionStorage.setItem('userInfo', JSON.stringify(data));
    },
    setFile(state, name) {
      state.soundFile = name;
    },
    setRepositoryConfig(state, data) {
      state.knowledgeCurrentData = data;
    },
    setknowledge(state, data) {
      state.setknowledge = data;
    },
  },
  actions: {
    // getUser(commit, state){
    //     $.get(this.$baseUrl+'member/queryMemberDetail.json').then((res)=>{
    //         if(res.resultMessageEnum=='0000'){
    //             let data = res.returnObject;
    //             commit('upDateUser',data);
    //         }else{
    //             this.$message.error(res.errorInfoList[0].errorMessage);
    //         }
    //     });
    // }
    setUserInfoData({ commit, state }, data) {
      commit('setUserInfo', data);
    },
    setFileName({ commit, state }, name) {
      commit('setFile', name);
    },
    //
    setRepositoryConfigData({ commit, state }, data) {
      commit('setRepositoryConfig', data);
    },
    setknowledgeList({ commit, state }, data) {
      commit('setknowledge', data);
    },
  },
  modules: {
    knowledge,
  },
});
