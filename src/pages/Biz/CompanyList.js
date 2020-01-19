import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Card, Row, Col, Form, Input, Select, Button, Modal, Badge } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StandardTable from '@/components/StandardTable';
import DescriptionList from '@/components/DescriptionList';

import styles from '@/assets/less/List.less';

const FormItem = Form.Item;
const { Option } = Select;
const { Description } = DescriptionList;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

const CreateForm = Form.create()(props => {
  const { modalVisible, currentItem, form, handleSave, handleCancel } = props;
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
          rules: [{ required: true, message: '请输入用户名' }],
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

@connect(({ customer, bizCompany, loading }) => ({
  customer,
  bizCompany,
  submitting: loading.effects['bizCompany/save'],
}))
@Form.create()
class CompanyList extends PureComponent {
  state = {};

  componentDidMount() {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'customer/get',
      payload: {
        id: match.params.customerId,
      },
    });

    dispatch({
      type: 'bizCompany/list',
      payload: match.params,
    });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'bizCompany/loadItem',
      payload: {},
    });
  }

  handleRefresh = () => {
    const { dispatch, bizCompany } = this.props;
    dispatch({
      type: 'bizCompany/list',
      payload: bizCompany.searchParams,
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
      type: 'bizCompany/list',
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
      type: 'bizCompany/list',
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
        type: 'bizCompany/list',
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
      type: 'bizCompany/showModal',
      payload: record,
    });
  };

  handleSave = values => {
    const { dispatch, customer } = this.props;
    dispatch({
      type: 'bizCompany/save',
      payload: {
        ...values,
        customerId: customer.currentItem.id,
      },
    }).then(() => this.handleRefresh());
  };

  handleCancel = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'bizCompany/hideModal',
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
            <FormItem label="企业名称">
              {getFieldDecorator('name')(<Input placeholder="请输入" />)}
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
      bizCompany: { modalVisible, currentItem, data },
      loading,
    } = this.props;
    const statusMap = ['error', 'success'];
    const status = ['无效', '有效'];
    const contactStatus = ['未联系', '已联系'];
    const columns = [
      {
        title: '企业编号',
        dataIndex: 'id',
        sorter: true,
      },
      {
        title: '企业名称',
        dataIndex: 'name',
      },
      {
        title: '负责人',
        dataIndex: 'manager.realName',
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
    ];

    const parentMethods = {
      handleSave: this.handleSave,
      handleCancel: this.handleCancel,
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

export default CompanyList;
