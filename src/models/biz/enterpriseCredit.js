import { list, get, remove, save, check } from '@/services/biz/enterpriseCredit';
import { message } from 'antd';

export default {
  namespace: 'enterpriseCredit',

  state: {
    searchParams: {},
    modalVisible: false,
    currentItem: {},
    data: {},
  },

  effects: {
    *list({ payload }, { call, put }) {
      const params = {
        ...payload,
        checkState: '1', // 客户总是查询已审核的数据
      };
      const response = yield call(list, params);
      console.log(response);
      yield put({
        type: 'queryList',
        payload: {
          searchParams: params,
          data: response.data,
        },
      });
    },
    *get({ payload }, { call, put }) {
      const response = yield call(get, payload);
      yield put({
        type: 'loadItem',
        payload: response.data,
      });
    },
    *save({ payload }, { select, call, put }) {
      yield put({
        type: 'hideModal',
      });
      const item = yield select(({ customer }) => customer.currentItem);
      const params = { ...item, ...payload };
      yield call(save, params);
      message.success('保存成功！');
    },
    *delete({ payload }, { call }) {
      yield call(remove, payload);
    },
    *check({ payload }, { call, select }) {
      const item = yield select(({ customer }) => customer.currentItem);
      const params = { ...payload, id: item.id };
      return yield call(check, params);
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
    loadItem(state, { payload }) {
      return {
        ...state,
        currentItem: payload,
      };
    },
  },
};
