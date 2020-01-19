import React, { Fragment } from 'react';
import Link from 'umi/link';
import { Icon } from 'antd';
import GlobalFooter from '@/components/GlobalFooter';
import styles from './AccountLayout.less';
import logo from '../assets/favicon.png';

const copyright = (
  <Fragment>
    Copyright <Icon type="copyright" /> 2018 薪动
  </Fragment>
);

class AccountLayout extends React.PureComponent {
  render() {
    const { children } = this.props;
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.top}>
            <div className={styles.header}>
              <Link to="/">
                <img alt="logo" className={styles.logo} src={logo} />
                <span className={styles.title}>薪动科技后台管理系统</span>
              </Link>
            </div>
            <div className={styles.desc} />
          </div>
          {children}
        </div>
        <GlobalFooter copyright={copyright} />
      </div>
    );
  }
}

export default AccountLayout;
