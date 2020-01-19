import router from 'umi/router';
import { message } from 'antd';
import { login, updatePassword } from '../../services/account';
import { setAuthority, getCurrentUser, setCurrentUser, setMenuData, clear } from '../../utils/authority';
import { reloadAuthorized } from '../../utils/Authorized';

export default {
  namespace: 'account',

  state: {
    status: '',
    currentUser: {},
    menuData: {},
  },

  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(login, payload);
      // Login successfully
      if (response.code === 0) {
        yield put({
          type: 'changeLoginStatus',
          payload: {
            status: 'login',
            currentUser: response.code === 0 ? response.data.user : {},
            menuData: response.data.menuData,
          },
        });
        reloadAuthorized();
        router.push('/home');
      }
    },

    *fetchCurrent(_, { put }) {
      const user = yield getCurrentUser();
      // console.log("user",user.name)
      if (user != null) {
        yield put({
          type: 'fetchCurrentUser',
          payload: user,
        });
      } else {
        yield put({
          type: 'logout',
        });
      }
    },

    *updatePassword({ payload }, { call }) {
      const user = yield getCurrentUser();
      const params = {
        ...payload,
        id: user.id,
      };
      const response = yield call(updatePassword, params);
      if (response.code === 0) {
        message.success('密码修改成功！');
        window.history.go(-1);
      } else {
        message.error('密码修改失败！');
      }
    },

    *logout(_, { put, select }) {
      try {
        // get location pathname
        const urlParams = new URL(window.location.href);
        const pathname = yield select(state => state.routing.location.pathname);
        // add the parameters in the url
        urlParams.searchParams.set('redirect', pathname);
        window.history.replaceState(null, 'login', urlParams.href);
      } finally {
        yield put({
          type: 'changeLogoutStatus',
          payload: {
            status: 'logout',
            currentAuthority: 'guest',
            currentUser: {},
          },
        });
        reloadAuthorized();
        router.push('/account/login');
      }
    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      setCurrentUser(payload.currentUser);
      setMenuData(payload.menuData);
      setAuthority(payload.currentUser.roleCode);
      return {
        ...state,
        ...payload,
      };
    },
    changeLogoutStatus(state, { payload }) {
      clear();
      return {
        ...state,
        ...payload,
      };
    },
    fetchCurrentUser(state, { payload }) {
      return {
        ...state,
        currentUser: payload,
      };
    },
  },
};
