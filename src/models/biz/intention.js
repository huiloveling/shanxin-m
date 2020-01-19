import { list, get, remove, save, updateCheckState, check } from '@/services/biz/customer';
import { message } from 'antd';

export default {
  namespace: 'intention',

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
        checkState: '0', // 意向客户总是查询未审核的数据
      };
      const response = yield call(list, params);
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
      const item = yield select(({ intention }) => intention.currentItem);
      const params = { ...item, ...payload };
      if (params.salaryPlatform === 'pingan') {
        params.pinganId = payload.thirdId;
      } else {
        params.jdjrId = payload.thirdId;
      }
      if (item.option === 'check') {
        params.checkState = '1';
        yield call(updateCheckState, payload);
      } else {
        params.checkState = '0';
        yield call(save, params);
      }
      message.success('保存成功！');
    },
    *delete({ payload }, { call }) {
      yield call(remove, payload);
    },
    *check({ payload }, { call, select }) {
      const item = yield select(({ intention }) => intention.currentItem);
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
