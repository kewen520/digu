import { queryKnowledgeTypeList } from '../../api/knowledge';

const knowledge = {
  state: [],
  mutations: {
    SET_KNOWLESGE: (state, list) => {
      state = list;
    },
  },
  actions: {
    queryKnowledgeType({ commit }, list) {
      return new Promise((resolve, reject) => {
        queryKnowledgeTypeList().then(res => {
          if (res.resultMessageEnum == '0000' && res.returnObject && res.returnObject.length) {
            commit('SET_KNOWLESGE', res.returnObject);
            resolve();
          } else {
            reject();
          }
        });
      });
    },
  },
};

export default knowledge;
