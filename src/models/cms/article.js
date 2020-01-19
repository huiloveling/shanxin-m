import router from 'umi/router';
import { list, get, remove, save, update } from '@/services/cms/article';
import { all as allCategory } from '@/services/cms/category';

export default {
  namespace: 'article',

  state: {
    searchParams: {},
    currentItem: {},
    categories: [],
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
    *save({ payload }, { select, call, put }) {
      const item = yield select(({ article }) => article.currentItem);
      const params = { ...item, ...payload };
      yield call(save, params);

      yield put(router.push('/cms/article'));
    },
    *update({ payload }, { call }) {
      yield call(update, payload);
      router.push('/cms/article');
    },
    *delete({ payload }, { call }) {
      yield call(remove, payload);
    },
    *categories(_, { call, put }) {
      const response = yield call(allCategory);
      yield put({
        type: 'loadCategories',
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
    loadCategories(state, { payload }) {
      return {
        ...state,
        categories: payload,
      };
    },
  },
};
