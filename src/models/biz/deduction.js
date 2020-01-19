import { list, get, remove, save, check, disCom, disPlayRec, detail } from '@/services/biz/deduction';
import { message } from 'antd';

export default {
  namespace: 'deduction',

  state: {
    searchParams: {},
    modalVisible: false,
    drawerVisible: false,
    currentItem: {},
    data: {},
  },

  effects: {
    *list({ payload }, { call, put }) {
      console.log(payload)
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
      const item = yield select(({ deduction }) => deduction.currentItem);
      const params = { ...item, ...payload};
      params.companyId = payload.companyId
      params.recCompanyId = payload.recCompanyId
      yield call(save, params);
      message.success('保存成功！');
    },
    *delete({ payload }, { call }) {
      yield call(remove, payload);
    },
    *check({ payload }, { call, select }) {
      const item = yield select(({ deduction }) => deduction.currentItem);
      const params = { ...payload, id: item.id };
      return yield call(check, params);
    },
    *disCom({ payload }, { call, put }) {
      const response = yield call(disCom, payload);
      yield put({
        type: 'disComList',
        payload: {
          disCom: response.data,
        }
      });
    },
    *disPlayRec({ payload }, { call, put }) {
      const response = yield call(disPlayRec, payload);
      yield put({
        type: 'disPlayRecList',
        payload: {
          disPlayRec: response.data,
        }
      });
    },
    *detail({ payload }, { call, put }) {
      const response = yield call(detail, payload);
      yield put({
        type: 'detailList',
        payload: {
          detail: response.data,
        }
      });
      yield put({
        type: 'showDrawer',
      });
    }
  },

  reducers: {
    showModal(state, { payload }) {
      return {
        ...state,
        currentItem: payload,
        modalVisible: true,
      };
    },
    showDrawer(state, { payload }) {
      return {
        ...state,
        drawerVisible: true,
      };
    },
    hideDrawer(state, { payload }) {
      return {
        ...state,
        drawerVisible: false,
      };
    },
    hideModal(state) {
      return {
        ...state,
        modalVisible: false,
      };
    },
    disComList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    disPlayRecList(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    detailList(state, { payload }) {
      return {
        ...state,
        ...payload,
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
