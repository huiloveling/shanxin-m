import { message } from 'antd';
import { list, parents, remove, save } from '@/services/sys/menu';

export default {
  namespace: 'menu',

  state: {
    searchParams: {},
    modalVisible: false,
    currentItem: {},
    parents: [],
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
    *parents({payload}, {call, put}){
      const response = yield call(parents, payload);
      yield put({
        type: 'loadParents',
        payload: response.data,
      });
    },
    *save({payload}, {select, call, put}){
      yield put({
        type: 'hideModal',
      });
      const item = yield select(({ menu }) => menu.currentItem)
      const params = { ...item, ...payload };
      yield call(save, params);
      message.success("保存成功！");
    },
    *delete({payload}, {call}){
      yield call(remove, payload);
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
    loadParents(state, {payload}){
      return {
        ...state,
        parents: payload,
      }
    }
  },
};
