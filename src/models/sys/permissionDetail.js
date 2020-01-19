import { message } from 'antd';
import { list, save } from '@/services/sys/permissionDetail';

export default {
  namespace: 'permissionDetail',

  state: {
    changedRecord: [],
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *list({ payload }, { call, put }) {
      const response = yield call(list, payload);
      yield put({
        type: 'queryList',
        payload: {
          data: response.data,
        },
      });
    },

    *save({ payload }, { call }) {
      yield call(save, payload);
      message.success('保存成功！');
    },
  },

  reducers: {
    queryList(state, { payload }) {
      return {
        ...state,
        data: payload.data,
      };
    },
  },
};
