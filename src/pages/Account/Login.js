import React, { Component } from 'react';
import { connect } from 'dva';
import { Alert } from 'antd';
import Login from '@/components/Login';
import styles from './Login.less';

const { UserName, Password, Submit } = Login;

@connect(({ account, loading }) => ({
  account,
  submitting: loading.effects['account/login'],
}))
class LoginPage extends Component {
  state = {};

  handleSubmit = (err, values) => {
    const { dispatch } = this.props;
    if (!err) {
      dispatch({
        type: 'account/login',
        payload: {
          ...values,
        },
      });
    }
  };

  renderMessage = content => <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />;

  render() {
    const { account, submitting } = this.props;
    return (
      <div className={styles.main}>
        <Login onSubmit={this.handleSubmit}>
          {account.status === 1 && !account.submitting && this.renderMessage('账户或密码错误！')}
          <UserName name="username" placeholder="账号" />
          <Password name="password" placeholder="密码" />

          <Submit loading={submitting}>登录</Submit>
        </Login>
      </div>
    );
  }
}
export default LoginPage;
