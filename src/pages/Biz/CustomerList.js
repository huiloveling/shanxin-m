import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import moment from 'moment';
import { Card, Row, Col, Form, Input, Tabs, Button, Modal, Badge, Divider } from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from '@/assets/less/List.less';

const { TabPane } = Tabs;
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
      title={currentItem.id ? '编辑客户' : '新建客户'}
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleCancel()}
    >
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="企业名称">
        {form.getFieldDecorator('companyName', {
          initialValue: currentItem.companyName,
          rules: [
            {
              required: true,
              message: '请输入企业名称',
            },
            {
              validator: handleCheckCompanyName,
            },
          ],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="联系人">
        {form.getFieldDecorator('contact', {
          initialValue: currentItem.contact,
          rules: [{ required: true, message: '请输入联系人' }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="地址">
        {form.getFieldDecorator('address', {
          initialValue: currentItem.address,
          rules: [{ required: currentItem.id ? false : true, message: '请输入地址' }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="ip地址">
        {form.getFieldDecorator('idAddress', {
          initialValue: currentItem.idAddress,
          rules: [{ required: currentItem.id ? false : true, message: '请输入' }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="回调地址">
        {form.getFieldDecorator('notifyUrl', {
          initialValue: currentItem.notifyUrl,
          rules: [{ required: currentItem.id ? false : true, message: '请输入' }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="手机号">
        {form.getFieldDecorator('phone', {
          initialValue: currentItem.phone,
          rules: [
            {
              required: true,
              message: '请输入手机号',
            },
            {
              pattern: /^[1][0-9]{10}$/,
              message: '手机号格式输入错误',
            },
          ],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="平安账号">
        {form.getFieldDecorator('account', {
          initialValue: currentItem.account,
          rules: [{ required: true, message: '请输入平安账号' }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="银企直联编号">
        {form.getFieldDecorator('yqNo', {
          initialValue: currentItem.yqNo,
          rules: [{ required: currentItem.id ? false : true, message: '请输入银企直联编号' }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
    </Modal>
  );
});

@connect(({ customer, loading }) => ({
  customer,
  loading: loading.models.customer,
}))
@Form.create()
class CustomerList extends PureComponent {
  state = {
    formValues: {},
    tabValues: { state: '1' },
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const { tabValues } = this.state;
    dispatch({
      type: 'customer/list',
      payload: {
        ...tabValues,
        descs: 'id',
      },
    });
  }

  handleRefresh = () => {
    const { dispatch, customer } = this.props;
    dispatch({
      type: 'customer/list',
      payload: customer.searchParams,
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
      type: 'customer/list',
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
      type: 'customer/list',
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
        type: 'customer/list',
        payload: {
          ...values,
          ...tabValues,
          descs: 'id'
        },
      });
    });
  };

  handleEdit = (record = {}) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'customer/showModal',
      payload: record,
    });
  };

  handleSave = values => {
    const { dispatch } = this.props;
    dispatch({
      type: 'customer/save',
      payload: {
        ...values,
        checkState: '1',
      },
    }).then(() => this.handleRefresh());
  };

  handleCancel = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'customer/hideModal',
    });
  };

  handleUpdate = (record, payload) => {
    const that = this;
    const { dispatch } = this.props;

    confirm({
      title: `确认修改[${record.companyName}]这条记录吗？`,
      onOk() {
        dispatch({
          type: 'customer/save',
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
      type: 'customer/list',
      payload: {
        ...payload,
      },
    });
  };

  handleCheckCompanyName = (rule, value, callback) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'customer/check',
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
            <FormItem label="联系人">{getFieldDecorator('contact')(<Input placeholder="请输入" />)}</FormItem>
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
      customer: { modalVisible, currentItem, data },
      loading,
    } = this.props;

    const statusMap = ['error', 'success'];
    const status = ['无效', '有效'];
    const panes = [{ title: '正常', state: '1' }, { title: '停用', state: '0' }, { title: '全部', state: '' }];

    const columns = [
      {
        title: '客户编号',
        dataIndex: 'id',
        sorter: true,
      },
      {
        title: '企业名称',
        dataIndex: 'companyName',
        width: '220px',
      },
      {
        title: '联系人',
        dataIndex: 'contact',
      },
      {
        title: '手机号',
        dataIndex: 'phone',
      },
      {
        title: '状态',
        dataIndex: 'state',
        render(val) {
          return <Badge status={statusMap[val]} text={status[val]} />;
        },
      },
      {
        title: '平安账号',
        dataIndex: 'account',
      },
      {
        title: '创建人',
        dataIndex: 'createUser.name',
        render: val => <span>{val || '注册'}</span>,
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
            <Link to={`/biz/customer/companies/${record.id}`}>企业列表</Link> <Divider type="vertical" />
            <Link to={`/biz/customer/users/${record.id}`}>账号管理</Link> <Divider type="vertical" />
            <a
              onClick={() => {
                this.handleEdit(record);
              }}
            >
              编辑
            </a>{' '}
            <Divider type="vertical" />
            {/* <Link to={`/biz/salary/batch/${record.id}`}>发薪记录</Link> <Divider type="vertical"/> */}
            <a
              onClick={() => {
                this.handleUpdate(record, { state: record.state === '0' ? '1' : '0' });
              }}
            >
              {record.state === '0' ? '恢复' : '停用'}
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

            <Tabs onChange={this.handleTabChange} defaultActiveKey="1">
              {panes.map(pane => (
                <TabPane tab={pane.title} key={pane.state} closable={false} />
              ))}
            </Tabs>

            <StandardTable loading={loading} data={data} columns={columns} onChange={this.handleStandardTableChange} />
          </div>
          <CreateForm {...parentMethods} modalVisible={modalVisible} currentItem={currentItem} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default CustomerList;
