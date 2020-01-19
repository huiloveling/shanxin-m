import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import moment from 'moment';
import { Card, Row, Col, Form, Input, Tabs, Button, Modal, Badge, Divider, Select } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StandardTable from '@/components/StandardTable';

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
  currentItem.thirdId = currentItem.salaryPlatform === 'pingan' ? currentItem.pinganId : currentItem.jdjrId;
  const { Option } = Select;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      handleSave(fieldsValue);
      form.resetFields();
    });
  };

  let title = '';
  if (currentItem.option === 'create') {
    title = '新建意向客户';
  } else if (currentItem.option === 'edit') {
    title = '编辑意向客户;';
  } else if (currentItem.option === 'check') {
    title = '转为客户';
  }

  return (
    <Modal title={title} visible={modalVisible} onOk={okHandle} onCancel={() => handleCancel()}>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="企业名称">
        {form.getFieldDecorator('companyName', {
          initialValue: currentItem.companyName,
          rules: [
            {
              required: true,
              message: '请输入企业名称',
            },
            {
              validator: currentItem.option === 'check' ? null : handleCheckCompanyName,
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
      {currentItem.option === 'check' ? (
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="发薪平台">
          {form.getFieldDecorator('salaryPlatform', {
            initialValue: currentItem.salaryPlatform,
            rules: [{ required: true, message: '请选择发薪平台' }],
          })(
            <Select placeholder="请选择">
              <Option value="jdjr">京东金融</Option>
              <Option value="pingan">平安银行</Option>
            </Select>
          )}
        </FormItem>
      ) : (
        ''
      )}
      {currentItem.option === 'check' ? (
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="发薪主体编号">
          {form.getFieldDecorator('thirdId', {
            initialValue: currentItem.thirdId,
            rules: [{ required: true, message: '请输入京东发薪主体编号' }],
          })(<Input placeholder="请输入" />)}
        </FormItem>
      ) : (
        ''
      )}
    </Modal>
  );
});

@connect(({ intention, loading }) => ({
  intention,
  loading: loading.models.intention,
}))
@Form.create()
class IntentionList extends PureComponent {
  state = {
    formValues: {},
    tabValues: { contactState: '0', state: '1' },
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const { tabValues } = this.state;
    dispatch({
      type: 'intention/list',
      payload: {
        ...tabValues,
        descs: 'id',
      },
    });
  }

  handleRefresh = () => {
    const { dispatch, intention } = this.props;
    dispatch({
      type: 'intention/list',
      payload: intention.searchParams,
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
      type: 'intention/list',
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
      type: 'intention/list',
      payload: {
        ...tabValues,
        descs: 'id'
      }
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
        type: 'intention/list',
        payload: {
          ...values,
          ...tabValues,
          descs: 'id'
        },
      });
    });
  };

  handleEdit = (record = {}, option = 'create') => {
    const { dispatch } = this.props;
    dispatch({
      type: 'intention/showModal',
      payload: {
        ...record,
        option,
      },
    });
  };

  handleSave = values => {
    const { dispatch } = this.props;
    dispatch({
      type: 'intention/save',
      payload: {
        ...values,
        checkState: '0',
      },
    }).then(() => this.handleRefresh());
  };

  handleCancel = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'intention/hideModal',
    });
  };

  handleUpdate = (record, payload) => {
    const that = this;
    const { dispatch } = this.props;

    confirm({
      title: `确认修改[${record.companyName}]这条记录吗？`,
      onOk() {
        dispatch({
          type: 'intention/save',
          payload: { ...record, ...payload },
        }).then(() => that.handleRefresh());
      },
    });
  };

  handleTabChange = activeKey => {
    const { dispatch } = this.props;
    let payload = {};

    if (activeKey === '0') {
      payload = { contactState: '0', state: '1' };
    } else if (activeKey === '1') {
      payload = { contactState: '1', state: '1' };
    } else if (activeKey === '2') {
      payload = { state: '0' };
    }

    this.setState({
      tabValues: payload,
    });

    dispatch({
      type: 'intention/list',
      payload: {
        ...payload,
        descs: 'id',
      },
    });
  };

  handleCheckCompanyName = (rule, value, callback) => {
    const { dispatch } = this.props;

    dispatch({
      type: 'intention/check',
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
      intention: { modalVisible, currentItem, data },
      loading,
    } = this.props;

    const statusMap = ['error', 'success'];
    const status = ['无效', '有效'];
    const contactState = ['未联系', '已联系'];
    const panes = [
      { title: '未联系', contactState: '0' },
      { title: '已联系', contactState: '1' },
      { title: '无效客户', contactState: '2' },
      { title: '全部', contactState: '' },
    ];

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
        title: '联系状态',
        dataIndex: 'contactState',
        render(val) {
          return <Badge status={statusMap[val]} text={contactState[val]} />;
        },
      },
      {
        title: '状态',
        dataIndex: 'state',
        render(val) {
          return <Badge status={statusMap[val]} text={status[val]} />;
        },
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
      },
      {
        title: '操作',
        render: (text, record) => {
          if (record.contactState === '0' && record.state === '1') {
            // 未联系
            return (
              <Fragment>
                <a
                  onClick={() => {
                    this.handleEdit(record, 'edit');
                  }}
                >
                  编辑
                </a>{' '}
                <Divider type="vertical" />
                <Link to={`/biz/intention/users/${record.id}`}>账号管理</Link> <Divider type="vertical" />
                <a
                  onClick={() => {
                    this.handleUpdate(record, { contactState: '1' });
                  }}
                >
                  已联系
                </a>{' '}
                <Divider type="vertical" />
                <a
                  onClick={() => {
                    this.handleUpdate(record, { state: record.state === '0' ? '1' : '0' });
                  }}
                >
                  {record.state === '0' ? '标为有效' : '标为无效'}
                </a>
              </Fragment>
            );
          }
          if (record.contactState === '1' && record.state === '1') {
            return (
              <Fragment>
                <a
                  onClick={() => {
                    this.handleEdit(record, 'edit');
                  }}
                >
                  编辑
                </a>{' '}
                <Divider type="vertical" />
                <Link to={`/biz/intention/users/${record.id}`}>账号管理</Link> <Divider type="vertical" />
                <Link to={`/biz/intention/contacts/${record.id}`}>跟进记录</Link> <Divider type="vertical" />
                <a
                  onClick={() => {
                    this.handleUpdate(record, { state: record.state === '0' ? '1' : '0' });
                  }}
                >
                  {record.state === '0' ? '标为有效' : '标为无效'}
                </a>{' '}
                <Divider type="vertical" />
                <a
                  onClick={() => {
                    this.handleEdit(record, 'check');
                  }}
                >
                  转客户
                </a>
              </Fragment>
            );
          }
          return (
            <Fragment>
              <a
                onClick={() => {
                  this.handleEdit(record, 'edit');
                }}
              >
                编辑
              </a>{' '}
              <Divider type="vertical" />
              <Link to={`/biz/intention/users/${record.id}`}>账号管理</Link> <Divider type="vertical" />
              <Link to={`/biz/intention/contacts/${record.id}`}>跟进记录</Link> <Divider type="vertical" />
              <a
                onClick={() => {
                  this.handleUpdate(record, { state: record.state === '0' ? '1' : '0' });
                }}
              >
                {record.state === '0' ? '标为有效' : '标为无效'}
              </a>
            </Fragment>
          );
        },
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

            <Tabs onChange={this.handleTabChange} defaultActiveKey="0">
              {panes.map(pane => (
                <TabPane tab={pane.title} key={pane.contactState} closable={false} />
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

export default IntentionList;
