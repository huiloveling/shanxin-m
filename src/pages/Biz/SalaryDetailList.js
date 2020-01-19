import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import numeral from 'numeral';
import { Card, Row, Col, Form, Input, Button, Modal } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StandardTable from '@/components/StandardTable';
import DescriptionList from '@/components/DescriptionList';

import styles from './SalaryBatchList.less';

const FormItem = Form.Item;
const { Description } = DescriptionList;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

const ShowPayroll = props => {
  const {
    modalVisible,
    handleCancel,
    data: { salaryPayroll = {}, fields = [] },
  } = props;

  const list = (pramFields, paramSalaryPayroll) =>
    pramFields.map(field => (
      <tr key={field.id} style={{ borderBottom: '1px dotted #d0d0d0' }}>
        <td>{field.fieldName}</td>
        <td>{paramSalaryPayroll[field.fieldName]}</td>
      </tr>
    ));

  return (
    <Modal title="工资条详情" visible={modalVisible} onCancel={handleCancel} onOk={handleCancel}>
      <table>{list(fields, salaryPayroll)}</table>
    </Modal>
  );
};

@connect(({ salaryBatch, salaryDetail, loading }) => ({
  salaryBatch,
  salaryDetail,
  submitting: loading.effects['salaryDetail/save'],
}))
@Form.create()
class SalaryDetailList extends PureComponent {
  state = {};

  componentDidMount() {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'salaryBatch/get',
      payload: {
        id: match.params.batchId,
      },
    });

    dispatch({
      type: 'salaryDetail/list',
      payload: match.params,
    });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'salaryDetail/loadItem',
      payload: {},
    });
  }

  handleRefresh = () => {
    const { dispatch, salaryDetail } = this.props;
    dispatch({
      type: 'salaryDetail/list',
      payload: salaryDetail.searchParams,
    });
  };

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch, salaryBatch } = this.props;
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
    }
    dispatch({
      type: 'salaryDetail/list',
      payload: {
        ...params,
        batchId: salaryBatch.currentItem.id,
      },
    });
  };

  handleFormReset = () => {
    const { form, dispatch, salaryBatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'salaryDetail/list',
      payload: {
        batchId: salaryBatch.currentItem.id,
      },
    });
  };

  handleSearch = e => {
    e.preventDefault();

    const { dispatch, form, salaryBatch } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
      };

      this.setState({
        formValues: values,
      });

      dispatch({
        type: 'salaryDetail/list',
        payload: {
          ...values,
          batchId: salaryBatch.currentItem.id,
        },
      });
    });
  };

  handleSave = values => {
    const { dispatch, salaryBatch } = this.props;
    dispatch({
      type: 'salaryDetail/save',
      payload: {
        ...values,
        batchId: salaryBatch.currentItem.id,
      },
    }).then(() => this.handleRefresh());
  };

  handleCancel = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'salaryDetail/hideModal',
    });
  };

  payrollCancel = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'salaryDetail/hidePayrollModal',
    });
  };

  querySalaryPayroll = ({ id: salaryDetailId }) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'salaryDetail/querySalaryPayroll',
      payload: { salaryDetailId },
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
            <FormItem label="姓名">{getFieldDecorator('name')(<Input placeholder="请输入" />)}</FormItem>
          </Col>
          <Col md={6} sm={18}>
            <FormItem label="身份证号">{getFieldDecorator('idcard')(<Input placeholder="请输入" />)}</FormItem>
          </Col>
          <Col md={6} sm={18}>
            <FormItem label="手机号">{getFieldDecorator('phone')(<Input placeholder="请输入" />)}</FormItem>
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
      salaryBatch: { currentItem: currentBatch },
      salaryDetail: { data, payrollVisible, fields, salaryPayroll },
      loading,
    } = this.props;
    const status = ['待发薪', '发薪中', '发薪成功', '发薪失败'];
    const columns = [
      {
        title: '编号',
        dataIndex: 'id',
        sorter: true,
      },
      {
        title: '员工姓名',
        dataIndex: 'emp.name',
      },
      {
        title: '身份证号',
        dataIndex: 'emp.idcard',
      },
      {
        title: '手机号',
        dataIndex: 'emp.phone',
      },
      {
        title: '实发工资（元）',
        dataIndex: 'salary',
        align: 'right',
        render: val => numeral(val).format('0,0.00'),
      },
      {
        title: '发放时间',
        dataIndex: 'createTime',
        render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
      },
      {
        title: '状态',
        dataIndex: 'state',
        render(val) {
          return <span className={{ 2: styles.green, 3: styles.red }[val]}>{status[val]}</span>;
        },
      },
      {
        title: '操作',
        render: (text, record) => (
          <Fragment>
            <a
              onClick={() => {
                this.querySalaryPayroll(record);
              }}
            >
              查看工资条
            </a>
          </Fragment>
        ),
      },
    ];

    const description = (
      <DescriptionList size="large" col="4">
        <Description term="企业名称">{currentBatch.company ? currentBatch.company.name : ''}</Description>
        <Description term="发薪月份">
          {currentBatch.startDate === currentBatch.endDate
            ? currentBatch.startDate
            : `${currentBatch.startDate} ~ ${currentBatch.endDate}`}
        </Description>
      </DescriptionList>
    );

    const Info = ({ title, value, bordered }) => (
      <div className={styles.headerInfo}>
        <span>{title}</span>
        <p>{value}</p>
        {bordered && <em />}
      </div>
    );

    return (
      <PageHeaderWrapper
        // title={ title }
        content={description}
      >
        <div className={styles.standardList}>
          <Card bordered={false}>
            <Row>
              <Col sm={6} xs={24}>
                <Info title="发放人数" value={currentBatch.totalCount} bordered />
              </Col>
              <Col sm={6} xs={24}>
                <Info title="发放金额" value={`￥${numeral(currentBatch.totalMoney).format('0,0.00')}`} bordered />
              </Col>
              <Col sm={6} xs={24}>
                <Info title="失败人数" value={currentBatch.failCount} bordered />
              </Col>
              <Col sm={6} xs={24}>
                <Info title="失败金额" value={`￥${numeral(currentBatch.failMoney).format('0,0.00')}`} />
              </Col>
            </Row>
          </Card>

          <Card bordered={false} style={{ marginTop: 24 }}>
            <div className={styles.tableList}>
              <div className={styles.tableListForm}>{this.renderForm()}</div>
              <StandardTable
                loading={loading}
                data={data}
                columns={columns}
                onChange={this.handleStandardTableChange}
              />
            </div>
            <ShowPayroll
              modalVisible={payrollVisible}
              data={{ fields, salaryPayroll }}
              handleCancel={this.payrollCancel}
            />
          </Card>
        </div>
      </PageHeaderWrapper>
    );
  }
}

export default SalaryDetailList;
