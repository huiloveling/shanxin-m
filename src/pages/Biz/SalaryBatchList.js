import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import moment from 'moment';
import numeral from 'numeral';
import { Card, Row, Col, Form, Input, Button } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StandardTable from '@/components/StandardTable';

import styles from '@/assets/less/List.less';

const FormItem = Form.Item;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

@connect(({ salaryBatch, loading }) => ({
  salaryBatch,
  loading: loading.models.salaryBatch,
}))
@Form.create()
class SalaryBatchList extends PureComponent {
  state = {};

  componentDidMount() {
    const { dispatch } = this.props;

    dispatch({
      type: 'salaryBatch/list',
      payload: {
        descs: 'id',
      },
    });
  }

  handleRefresh = () => {
    const { dispatch, bizUser } = this.props;
    dispatch({
      type: 'salaryBatch/list',
      payload: bizUser.searchParams,
    });
  };

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      current: pagination.current,
      size: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      if (sorter.order === 'ascend') {
        params.ascs = sorter.field;
      } else {
        params.descs = sorter.field;
      }
    } else {
      params.descs = 'id';
    }
    dispatch({
      type: 'salaryBatch/list',
      payload: params,
    });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'salaryBatch/list',
      payload : {
        descs: 'id'
      }
    });
  };

  handleSearch = e => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
      };

      this.setState({
        formValues: values,
      });

      dispatch({
        type: 'salaryBatch/list',
        payload: {
          ...values,
          descs: 'id',
        },
      });
    });
  };

  renderForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={6} sm={18}>
            <FormItem label="客户名称">{getFieldDecorator('customerName')(<Input placeholder="请输入" />)}</FormItem>
          </Col>
          <Col md={6} sm={18}>
            <FormItem label="企业名称">{getFieldDecorator('companyName')(<Input placeholder="请输入" />)}</FormItem>
          </Col>
          <Col md={6} sm={18}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                重置
              </Button>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const {
      salaryBatch: { data },
      loading,
    } = this.props;
    const columns = [
      {
        title: '编号',
        dataIndex: 'id',
        sorter: true,
      },
      {
        title: '客户名称',
        dataIndex: 'customer.companyName',
      },
      {
        title: '企业名称',
        dataIndex: 'company.name',
        width: '220px',
      },
      {
        title: '发薪人数',
        dataIndex: 'totalCount',
      },
      {
        title: '发薪金额（元）',
        dataIndex: 'totalMoney',
        align: 'right',
        render: val => numeral(val).format('0,0.00'),
      },
      {
        title: '失败人数',
        dataIndex: 'failCount',
      },
      {
        title: '失败金额（元）',
        dataIndex: 'failMoney',
        align: 'right',
        render: val => numeral(val).format('0,0.00'),
      },
      {
        title: '时间',
        dataIndex: 'uploadTime',
        render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
      },
      {
        title: '操作',
        render: (text, record) => (
          <Fragment>
            <Link to={`/biz/salary/details/${record.id}`}>查看详情</Link>
          </Fragment>
        ),
      },
    ];

    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <StandardTable loading={loading} data={data} columns={columns} onChange={this.handleStandardTableChange} />
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default SalaryBatchList;
