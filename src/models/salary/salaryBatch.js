import { list, get } from '@/services/salary/batch';

export default {
  namespace: 'salaryBatch',

  state: {
    searchParams: {},
    modalVisible: false,
    currentItem: {},
    data: {},
  },

  effects: {
    *list({payload}, {call, put}) {
      const response = yield call(list, payload);
      yield put({
        type: 'queryList',
        payload: {
          searchParams: payload,
          data: response.data,
        },
      });
    },
    *get({payload}, {call, put}){
      const response = yield call(get, payload);
      yield put({
        type: 'loadItem',
        payload: response.data,
      });
    },
  },

  reducers: {
    showModal(state, {payload}) {
      return {
        ...state,
        currentItem: payload,
        modalVisible: true,
      };
    },

    hideModal(state){
      return {
        ...state,
        modalVisible: false,
      };
    },
    queryList(state, {payload}) {
      return {
        ...state,
        ...payload,
      };
    },
    loadItem(state, {payload}){
      return {
        ...state,
        currentItem: payload,
      }
    }
  },
};
