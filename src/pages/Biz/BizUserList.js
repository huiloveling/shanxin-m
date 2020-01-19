import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Card, Row, Col, Form, Input, Select, Button, Modal, Badge, Divider } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StandardTable from '@/components/StandardTable';
import DescriptionList from '@/components/DescriptionList';

import styles from '@/assets/less/List.less';

const FormItem = Form.Item;
const { confirm } = Modal;
const { Option } = Select;
const { Description } = DescriptionList;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

const CreateForm = Form.create()(props => {
  const {
    modalVisible,
    currentItem,
    form,
    handleSave,
    handleCancel,
    handleCheckUsername,
    handleCheckPhone,
  } = props;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      handleSave(fieldsValue);
      form.resetFields();
    });
  };
  return (
    <Modal
      title={currentItem.id ? '编辑账号' : '新建账号'}
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleCancel()}
    >
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="姓名">
        {form.getFieldDecorator('realName', {
          initialValue: currentItem.realName,
          rules: [{ required: true, message: '请输入姓名' }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="用户名">
        {form.getFieldDecorator('username', {
          initialValue: currentItem.username,
          rules: [
            {
              required: true,
              message: '请输入用户名',
            },
            {
              validator: handleCheckUsername,
            },
          ],
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
            {
              validator: handleCheckPhone,
            },
          ],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="账号类型">
        {form.getFieldDecorator('type', {
          initialValue: currentItem.type,
          rules: [{ required: true, message: '请选择账号类型' }],
        })(
          <Select placeholder="请选择">
            <Option value="1" key="1">
              管理员
            </Option>
            <Option value="2" key="2">
              子账号
            </Option>
          </Select>
        )}
      </FormItem>
    </Modal>
  );
});

@connect(({ customer, bizUser, loading }) => ({
  customer,
  bizUser,
  submitting: loading.effects['bizUser/save'],
}))
@Form.create()
class BizUserList extends PureComponent {
  state = {};

  componentDidMount() {
    const { dispatch, match } = this.props;
    // console.log("match", match)
    dispatch({
      type: 'customer/get',
      payload: {
        id: match.params.customerId,
      },
    });

    dispatch({
      type: 'bizUser/list',
      payload: match.params,
    });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'bizUser/loadItem',
      payload: {},
    });
  }

  handleRefresh = () => {
    const { dispatch, bizUser } = this.props;
    dispatch({
      type: 'bizUser/list',
      payload: bizUser.searchParams,
    });
  };

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch, customer } = this.props;
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
      type: 'bizUser/list',
      payload: {
        ...params,
        customerId: customer.currentItem.id,
      },
    });
  };

  handleFormReset = () => {
    const { form, dispatch, customer } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'bizUser/list',
      payload: {
        customerId: customer.currentItem.id,
      },
    });
  };

  handleSearch = e => {
    e.preventDefault();

    const { dispatch, form, customer } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
      };

      this.setState({
        formValues: values,
      });

      dispatch({
        type: 'bizUser/list',
        payload: {
          ...values,
          customerId: customer.currentItem.id,
        },
      });
    });
  };

  handleEdit = (record = {}) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'bizUser/showModal',
      payload: record,
    });
  };

  handleDelete = record => {
    const { dispatch } = this.props;
    const that = this;
    confirm({
      title: `确认删除[${record.username}]这条记录吗？`,
      onOk() {
        dispatch({
          type: 'bizUser/delete',
          payload: {
            id: record.id,
          },
        }).then(() => that.handleRefresh());
      },
    });
  };

  handleSave = values => {
    const { dispatch, customer } = this.props;
    dispatch({
      type: 'bizUser/save',
      payload: {
        ...values,
        customerId: customer.currentItem.id,
      },
    }).then(() => this.handleRefresh());
  };

  handleCancel = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'bizUser/hideModal',
    });
  };

  handleCheckUsername = (rule, value, callback) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'bizUser/checkUsername',
      payload: {
        username: value,
      },
    }).then(response => {
      if (response.code === 0) {
        callback();
      } else {
        callback(response.msg);
      }
    });
  };

  handleCheckPhone = (rule, value, callback) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'bizUser/checkPhone',
      payload: {
        phone: value,
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
            <FormItem label="姓名">
              {getFieldDecorator('realName')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={6} sm={18}>
            <FormItem label="用户名">
              {getFieldDecorator('username')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={6} sm={18}>
            <FormItem label="手机号">
              {getFieldDecorator('phone')(<Input placeholder="请输入" />)}
            </FormItem>
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
      customer: { currentItem: currentCustomer },
      bizUser: { modalVisible, currentItem, data },
      loading,
    } = this.props;
    const statusMap = ['error', 'success'];
    const status = ['无效', '有效'];
    const contactStatus = ['未联系', '已联系'];
    const columns = [
      {
        title: '用户编号',
        dataIndex: 'id',
        sorter: true,
      },
      {
        title: '姓名',
        dataIndex: 'realName',
      },
      {
        title: '用户名',
        dataIndex: 'username',
      },
      {
        title: '手机号',
        dataIndex: 'phone',
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
      },
      {
        title: '状态',
        dataIndex: 'state',
        filters: [
          {
            text: status[0],
            value: 0,
          },
          {
            text: status[1],
            value: 1,
          },
        ],
        render(val) {
          return <Badge status={statusMap[val]} text={status[val]} />;
        },
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
            </a>
            <Divider type="vertical" />
            <a
              onClick={() => {
                this.handleDelete(record);
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
      handleCheckUsername: this.handleCheckUsername,
      handleCheckPhone: this.handleCheckPhone,
    };

    const description = (
      <DescriptionList size="small" col="2">
        <Description term="联系人">{currentCustomer.contact}</Description>
        <Description term="联系状态">{contactStatus[currentCustomer.contactState]}</Description>
        <Description term="手机号">{currentCustomer.phone}</Description>
        <Description term="数据状态">{status[currentCustomer.contactState]}</Description>
        <Description term="创建时间">
          {moment(currentCustomer.createTime).format('YYYY-MM-DD HH:mm:ss')}
        </Description>
      </DescriptionList>
    );

    return (
      <PageHeaderWrapper title={`企业名称：${currentCustomer.companyName}`} content={description}>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.handleEdit()}>
                新建
              </Button>
            </div>
            <StandardTable
              loading={loading}
              data={data}
              columns={columns}
              onChange={this.handleStandardTableChange}
            />
          </div>
          <CreateForm {...parentMethods} modalVisible={modalVisible} currentItem={currentItem} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default BizUserList;
