import { message } from 'antd';
import { list, remove, save } from '@/services/cms/category';

export default {
  namespace: 'category',

  state: {
    searchParams: {},
    modalVisible: false,
    currentItem: {},
    data: {},
  },

  effects: {
    *list({ payload }, { call, put }) {
      const response = yield call(list, payload);
      yield put({
        type: 'queryList',
        payload: {
          searchParams: payload,
          data: response.data,
        },
      });
    },
    *save({ payload }, { select, call, put }) {
      yield put({
        type: 'hideModal',
      });
      const item = yield select(({ category }) => category.currentItem);
      const params = { ...item, ...payload };
      yield call(save, params);
      message.success('保存成功！');
    },
    *delete({ payload }, { call }) {
      yield call(remove, payload);
    },
  },

  reducers: {
    showModal(state, { payload }) {
      return {
        ...state,
        currentItem: payload,
        modalVisible: true,
      };
    },

    hideModal(state) {
      return {
        ...state,
        modalVisible: false,
      };
    },
    queryList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
