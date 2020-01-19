import { getMenuData } from '@/utils/authority';

export default {
  namespace: 'global',

  state: {
    collapsed: false,
    menuData: [],
  },

  effects: {
    *fetchMenuData(_, { put }) {
      const menuData = yield getMenuData();
      // console.log("user",user.name)
      if (menuData != null) {
        yield put({
          type: 'loadMenuData',
          payload: menuData,
        });
      }
    },
  },

  reducers: {
    changeLayoutCollapsed(state, { payload }) {
      return {
        ...state,
        collapsed: payload,
      };
    },
    loadMenuData(state, { payload }) {
      return {
        ...state,
        menuData: payload,
      };
    },
  },

  subscriptions: {
    setup({ history }) {
      // Subscribe history(url) change, trigger `load` action if pathname is `/`
      return history.listen(({ pathname, search }) => {
        if (typeof window.ga !== 'undefined') {
          window.ga('send', 'pageview', pathname + search);
        }
      });
    },
  },
};
