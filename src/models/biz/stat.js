import { download, customer, salary } from '@/services/biz/stat';

export default {
  namespace: 'stat',

  state: {
    downloadStatData: {},
    customerStatData: {},
    salaryStatData: {
      emps: [],
      count: [],
      salarys: [],
      companies: []
    }
  },

  effects: {
    *download({payload}, {call, put}) {
      const response = yield call(download, payload);
      yield put({
        type: 'loadDownloadStatData',
        payload: response.data,
      })
    },
    *customer({payload}, {call, put}) {
      const response = yield call(customer, payload);
      yield put({
        type: 'loadCustomerStatData',
        payload: response.data,
      })
    },
    *salary({payload}, {call, put}) {
      const response = yield call(salary, payload);
      yield put({
        type: 'loadSalaryStatData',
        payload: response.data,
      })
    },
  },

  reducers: {
    loadDownloadStatData(state, {payload}) {
      return {
        ...state,
        downloadStatData: payload,
      };
    },
    loadCustomerStatData(state, {payload}) {
      return {
        ...state,
        customerStatData: payload,
      };
    },
    loadSalaryStatData(state, {payload}) {
      const data = {
        emps: [],
        count: [],
        salarys: [],
        companies: []
      };
      payload.forEach(item => {
        data.emps.push({
          x: item.date,
          y: item.emps
        });
        data.count.push({
          x: item.date,
          y: item.count
        });
        data.salarys.push({
          x: item.date,
          y: item.salarys
        });
        data.companies.push({
          x: item.date,
          y: item.companies
        });
      })
      return {
        ...state,
        salaryStatData: data,
      };
    },
  }
};
