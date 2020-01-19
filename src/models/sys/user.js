import { message } from 'antd';
import router from 'umi/router';
import { list, get, remove, save, resetPassword, check } from '@/services/sys/user';
import { all as allRoles } from '@/services/sys/role';

export default {
  namespace: 'user',

  state: {
    searchParams: {},
    currentItem: {},
    roles: [],
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
    *get({ payload }, { call, put }) {
      const response = yield call(get, payload);
      yield put({
        type: 'loadItem',
        payload: response.data,
      });
    },
    *save({ payload }, { select, call }) {
      const item = yield select(({ user }) => user.currentItem);
      const params = { ...item, ...payload };
      yield call(save, params);

      router.push('/sys/user');
    },
    *delete({ payload }, { call }) {
      yield call(remove, payload);
    },
    *resetPassword({ payload }, { call }) {
      const response = yield call(resetPassword, payload);
      if (response.code === 0) {
        message.success(response.msg);
      } else {
        message.error(response.msg);
      }
    },
    *check({ payload }, { call, select }) {
      const item = yield select(({ user }) => user.currentItem);
      const params = { ...payload, id: item.id };
      return yield call(check, params);
    },
    *roles(_, { call, put }) {
      const response = yield call(allRoles);
      yield put({
        type: 'loadRoles',
        payload: response.data,
      });
    },
  },

  reducers: {
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
    loadRoles(state, { payload }) {
      return {
        ...state,
        roles: payload,
      };
    },
  },
};
