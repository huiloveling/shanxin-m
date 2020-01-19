import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import moment from 'moment';
import { Card, Row, Col, Form, Input, Tabs, Button, Modal, Badge, Divider } from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from '@/assets/less/List.less';

const FormItem = Form.Item;
const { confirm } = Modal;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

const CreateForm = Form.create()(props => {
  const { modalVisible, currentItem, form, handleSave, handleCancel, handleCheckCompanyName } = props;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      handleSave(fieldsValue);
      form.resetFields();
    });
  };
  return (
    <Modal
      title={currentItem.id ? '编辑企业' : '新建企业'}
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleCancel()}
    >
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="账户名">
        {form.getFieldDecorator('companyName', {
          initialValue: currentItem.companyName,
          rules: [{required: true, message: '请输入账户名'}],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="账号">
        {form.getFieldDecorator('account', {
          initialValue: currentItem.account,
          rules: [{ required: true, message: '请输入账号'}],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="开户行">
        {form.getFieldDecorator('phone', {
          initialValue: currentItem.phone,
          rules: [{required: true,message: '请输入开户行'}],
        })(<Input placeholder="请输入" />)}
      </FormItem>
    </Modal>
  );
});

@connect(({ enterpriseCredit, loading }) => ({
  enterpriseCredit,
  loading: loading.models.enterpriseCredit,
}))
@Form.create()
class EnterpriseCredit extends PureComponent {
  state = {
    formValues: {},
    tabValues: { state: '1' },
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const { tabValues } = this.state;
    dispatch({
      type: 'enterpriseCredit/list',
      payload: {
        ...tabValues,
        descs: 'id',
      },
    });
  }

  handleRefresh = () => {
    const { dispatch, enterpriseCredit } = this.props;
    dispatch({
      type: 'enterpriseCredit/list',
      payload: enterpriseCredit.searchParams,
    });
  };

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues, tabValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      current: pagination.current,
      size: pagination.pageSize,
      ...formValues,
      ...tabValues,
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
      type: 'enterpriseCredit/list',
      payload: params,
    });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    const { tabValues } = this.state;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'enterpriseCredit/list',
      payload: {
        ...tabValues,
        descs: 'id'
      },
    });
  };

  handleSearch = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    const { tabValues } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
      };
      this.setState({
        formValues: values,
      });
      dispatch({
        type: 'enterpriseCredit/list',
        payload: {
          ...values,
          ...tabValues,
          descs: 'id'
        },
      });
    });
  };

  handleEdit = (record = {}) => {
      console.log(record);
      const { dispatch } = this.props;
      dispatch({
          type: 'enterpriseCredit/showModal',
          payload: record,
      });
  };

  handleSave = values => {
    const { dispatch } = this.props;
    dispatch({
      type: 'enterpriseCredit/save',
      payload: {
        ...values,
        checkState: '1',
      },
    }).then(() => this.handleRefresh());
  };

  handleCancel = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'enterpriseCredit/hideModal',
    });
  };

  handleUpdate = (record, payload) => {
    const that = this;
    const { dispatch } = this.props;

    confirm({
      title: `确认修改[${record.companyName}]这条记录吗？`,
      onOk() {
        dispatch({
          type: 'enterpriseCredit/save',
          payload: { ...record, ...payload },
        }).then(() => that.handleRefresh());
      },
    });
  };

  handleTabChange = activeKey => {
    const { dispatch } = this.props;
    const payload = {
      state: activeKey,
    };
    this.setState({
      tabValues: payload,
    });

    dispatch({
      type: 'enterpriseCredit/list',
      payload: {
        ...payload,
      },
    });
  };

  handleCheckCompanyName = (rule, value, callback) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'enterpriseCredit/check',
      payload: {
        companyName: value,
      },
    }).then(response => {
      if (response.code === 0) {
        callback();
      } else {
        callback(response.msg);
      }
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
            <FormItem label="企业名称">{getFieldDecorator('companyName')(<Input placeholder="请输入" />)}</FormItem>
          </Col>
          <Col md={6} sm={18}>
            <FormItem label="账号">{getFieldDecorator('account')(<Input placeholder="请输入" />)}</FormItem>
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
      enterpriseCredit: { modalVisible, currentItem, data },
      loading,
    } = this.props;
    console.log(this.props);
    const columns = [
      {
        title: '企业名称',
        dataIndex: 'companyName',
        width: '220px',
      },
      {
        title: '账户名',
        dataIndex: 'accountName',
      },
      {
        title: '账号',
        dataIndex: 'accountNo',
      },
      {
        title: '开户行',
        dataIndex: 'oppenAccountBank',
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        render: val => <span>{val ? moment(val).format('YYYY-MM-DD HH:mm:ss') : ''}</span>,
      },
      {
        title: '操作',
        render: (text, record) => (
          <Fragment>
            <a
              onClick={() => {
                this.handleEdit(record);
              }}
            >
              编辑
            </a>{' '}
            <Divider type="vertical" />
            <a
              onClick={() => {
                this.handleUpdate(record, { state: record.state === '0' ? '1' : '0' });
              }}
            >
              删除
            </a>
          </Fragment>
        ),
      },
    ];

    const parentMethods = {
      handleSave: this.handleSave,
      handleCancel: this.handleCancel,
      handleCheckCompanyName: this.handleCheckCompanyName,
    };

    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.handleEdit()}>
                新建
              </Button>
            </div>
            <StandardTable loading={loading} data={data} columns={columns} onChange={this.handleStandardTableChange} />
          </div>
          <CreateForm {...parentMethods} modalVisible={modalVisible} currentItem={currentItem} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default EnterpriseCredit;
