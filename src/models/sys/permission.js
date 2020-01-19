import { message } from 'antd';
import { list, save } from '@/services/sys/permission';
import { all as allRoles } from '@/services/sys/role';
import { tree as menuTree } from '@/services/sys/menu';

export default {
  namespace: 'permission',

  state: {
    roles: [],
    menuTree: [],
    permissions: [],
  },

  effects: {
    *roles({ payload }, { call, put }) {
      const response = yield call(allRoles, payload);
      yield put({
        type: 'queryRoles',
        payload: {
          data: response.data,
        },
      });
    },

    *menuTree({ payload }, { call, put }) {
      const response = yield call(menuTree, payload);
      yield put({
        type: 'queryMenuTree',
        payload: {
          data: response.data,
        },
      });
    },

    *list({ payload }, { call, put }) {
      const response = yield call(list, payload);
      yield put({
        type: 'queryPermissions',
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
    queryRoles(state, { payload }) {
      return {
        ...state,
        roles: payload.data,
      };
    },

    queryMenuTree(state, { payload }) {
      return {
        ...state,
        menuTree: payload.data,
      };
    },

    queryPermissions(state, { payload }) {
      return {
        ...state,
        permissions: payload.data,
      };
    },
  },
};
