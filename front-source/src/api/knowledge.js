import axios from 'axios';

export const queryKnowledgeTypeList = () => {
  return axios.get(baseUrl + 'knowledge/queryKnowledgeGroupListOfPage.json');
};

export const updateKnowledgeGroup = payload => {
  return axios.post(baseUrl + 'knowledge/modifyKnowledgeGroup.json', payload);
};
