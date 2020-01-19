import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Tabs, DatePicker } from 'antd';
import { Bar } from '@/components/Charts';
import { getTimeDistance } from '@/utils/utils';
import styles from './Home.less';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

@connect(({ stat, loading }) => ({
  stat,
  downloadLoading: loading.effects['stat/download'],
  customerLoading: loading.effects['stat/customer'],
  salaryLoading: loading.effects['stat/salary'],
}))
class Home extends PureComponent {
  state = {
    rangePickerValue: {
      download: getTimeDistance('year'),
      customer: getTimeDistance('year'),
      salary: getTimeDistance('year'),
    },
  };

  componentDidMount = () => {
    const { rangePickerValue } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'stat/download',
      payload: {
        startTime: rangePickerValue.download[0].format('YYYY-MM-DD HH:mm:ss'),
        endTime: rangePickerValue.download[1].format('YYYY-MM-DD HH:mm:ss'),
      },
    });
    dispatch({
      type: 'stat/customer',
      payload: {
        startTime: rangePickerValue.customer[0].format('YYYY-MM-DD HH:mm:ss'),
        endTime: rangePickerValue.customer[1].format('YYYY-MM-DD HH:mm:ss'),
      },
    });
    dispatch({
      type: 'stat/salary',
      payload: {
        type: 'month',
      },
    });
  };

  selectDate = (section, type) => {
    const { rangePickerValue } = this.state;
    const { dispatch } = this.props;
    rangePickerValue[section] = getTimeDistance(type);
    this.setState({
      rangePickerValue,
    });

    if (section === 'download') {
      dispatch({
        type: 'stat/download',
        payload: {
          startTime: rangePickerValue[section][0].format('YYYY-MM-DD HH:mm:ss'),
          endTime: rangePickerValue[section][1].format('YYYY-MM-DD HH:mm:ss'),
        },
      });
    }

    if (section === 'customer') {
      dispatch({
        type: 'stat/customer',
        payload: {
          startTime: rangePickerValue[section][0].format('YYYY-MM-DD HH:mm:ss'),
          endTime: rangePickerValue[section][1].format('YYYY-MM-DD HH:mm:ss'),
        },
      });
    }
  };

  isActive(section, type) {
    const { rangePickerValue } = this.state;
    const value = getTimeDistance(type);
    if (!rangePickerValue[section][0] || !rangePickerValue[section][1]) {
      return '';
    }
    if (rangePickerValue[section][0].isSame(value[0], 'day') && rangePickerValue[section][1].isSame(value[1], 'day')) {
      return styles.currentDate;
    }
    return '';
  }

  renderExtra(section) {
    const { rangePickerValue } = this.state;
    return (
      <div className={styles.salesExtraWrap}>
        <div className={styles.salesExtra}>
          <a className={this.isActive(section, 'today')} onClick={() => this.selectDate(section, 'today')}>
            今日
          </a>
          <a className={this.isActive(section, 'week')} onClick={() => this.selectDate(section, 'week')}>
            本周
          </a>
          <a className={this.isActive(section, 'month')} onClick={() => this.selectDate(section, 'month')}>
            本月
          </a>
          <a className={this.isActive(section, 'year')} onClick={() => this.selectDate(section, 'year')}>
            全年
          </a>
        </div>
        <RangePicker value={rangePickerValue[section]} style={{ width: 256 }} />
      </div>
    );
  }

  render() {
    const {
      stat: { downloadStatData, customerStatData, salaryStatData },
      downloadLoading,
      customerLoading,
      salaryLoading,
    } = this.props;

    return (
      <Fragment>
        <div className={styles.salesCard}>
          <Row gutter={24}>
            <Col xl={12} lg={24} md={24} sm={24} xs={24}>
              <Card loading={downloadLoading} bordered={false} title="合同下载" extra={this.renderExtra('download')}>
                <Row gutter={68}>
                  <Col sm={12} xs={24}>
                    <div className={styles.statCard}>
                      <div>合同下载次数</div>
                      <div>{downloadStatData.totalDowloads}</div>
                    </div>
                  </Col>
                  <Col sm={12} xs={24}>
                    <div className={styles.statCard}>
                      <div>合同下载人数</div>
                      <div>{downloadStatData.totalCustomers}</div>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col xl={12} lg={24} md={24} sm={24} xs={24}>
              <Card loading={customerLoading} bordered={false} title="客户数据" extra={this.renderExtra('customer')}>
                <Row gutter={68}>
                  <Col sm={12} xs={24}>
                    <div className={styles.statCard}>
                      <div>在途用户</div>
                      <div>{customerStatData.intentions}</div>
                    </div>
                  </Col>
                  <Col sm={12} xs={24}>
                    <div className={styles.statCard}>
                      <div>发薪商户</div>
                      <div>{customerStatData.customers}</div>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
          <Card loading={salaryLoading} bordered={false} bodyStyle={{ padding: 0, marginTop: 24 }}>
            <div className={styles.salesCard}>
              <Tabs size="large" tabBarStyle={{ marginBottom: 24 }}>
                <TabPane tab="发薪人数" key="emp">
                  <div className={styles.salesBar}>
                    <Bar height={295} title="发薪人数" data={salaryStatData.emps} />
                  </div>
                </TabPane>
                <TabPane tab="发薪笔数" key="count">
                  <div className={styles.salesBar}>
                    <Bar height={292} title="发薪笔数" data={salaryStatData.count} />
                  </div>
                </TabPane>
                <TabPane tab="发薪金额" key="money">
                  <div className={styles.salesBar}>
                    <Bar height={292} title="发薪金额" data={salaryStatData.salarys} />
                  </div>
                </TabPane>
                <TabPane tab="用工单位" key="company">
                  <div className={styles.salesBar}>
                    <Bar height={292} title="用工单位" data={salaryStatData.companies} />
                  </div>
                </TabPane>
              </Tabs>
            </div>
          </Card>
        </div>
      </Fragment>
    );
  }
}

export default Home;
