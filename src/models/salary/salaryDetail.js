import { message } from 'antd';
import { list, payroll, remove, save } from '@/services/salary/detail';

export default {
  namespace: 'salaryDetail',

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
      const item = yield select(({ salaryBatch }) => salaryBatch.currentItem);
      const params = { ...item, ...payload };
      yield call(save, params);
      message.success('保存成功！');
    },
    *delete({ payload }, { call }) {
      yield call(remove, payload);
    },
    *querySalaryPayroll({ payload }, { put, call }) {
      const {
        data: { fields, salaryPayroll },
      } = yield call(payroll, payload);
      yield put({ type: 'queryList', payload: { fields, salaryPayroll } });
      yield put({ type: 'showPayrollModal' });
      return {};
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
    showPayrollModal(state) {
      return {
        ...state,
        payrollVisible: true,
      };
    },
    hidePayrollModal(state) {
      return {
        ...state,
        payrollVisible: false,
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
