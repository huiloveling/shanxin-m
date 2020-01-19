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
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="账户名">
        {form.getFieldDecorator('accountName', {
          initialValue: currentItem.accountName,
          rules: [{ required: true, message: '请输入账户名' }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="账号">
        {form.getFieldDecorator('accountNo', {
          initialValue: currentItem.accountNo,
          rules: [{ required: true, message: '请输入账号' }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="开户行行号">
        {form.getFieldDecorator('bankNumber', {
          initialValue: currentItem.bankNumber,
          rules: [{ required: true, message: '请输入开户行行号' }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="开户行">
        {form.getFieldDecorator('oppenAccountBank', {
          initialValue: currentItem.oppenAccountBank,
          rules: [
            {
              required: true,
              message: '请输入开户行',
            },
          ],
        })(<Input placeholder="请输入" />)}
      </FormItem>
    </Modal>
  );
});

@connect(({ receivables, loading }) => ({
  receivables,
  loading: loading.models.receivables,
}))
@Form.create()
class Receivables extends PureComponent {
  state = {
    formValues: {},
    tabValues: { state: '1' },
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const { tabValues } = this.state;
    dispatch({
      type: 'receivables/list',
      payload: {
        ...tabValues,
        descs: 'id',
      },
    });
  }

  handleRefresh = () => {
    const { dispatch, receivables } = this.props;
    dispatch({
      type: 'receivables/list',
      payload: receivables.searchParams,
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
      type: 'receivables/list',
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
      type: 'receivables/list',
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
        type: 'receivables/list',
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
      type: 'receivables/showModal',
      payload: record,
    });
  };

  handleSave = values => {
    const { dispatch } = this.props;
    dispatch({
      type: 'receivables/save',
      payload: {
        ...values,
        checkState: '1',
      },
    }).then(() => this.handleRefresh());
  };

  handleCancel = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'receivables/hideModal',
    });
  };

  handleUpdate = (record, payload) => {
    const that = this;
    const { dispatch } = this.props;

    confirm({
      title: `确认修改[${record.companyName}]这条记录吗？`,
      onOk() {
        dispatch({
          type: 'receivables/save',
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
      type: 'receivables/list',
      payload: {
        ...payload,
      },
    });
  };

  handleCheckCompanyName = (rule, value, callback) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'receivables/check',
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

  handleUpdate = (record, payload) => {
    const that = this;
    const { dispatch } = this.props;

    confirm({
      title: `确认修改[${record.companyName}]这条记录吗？`,
      onOk() {
        dispatch({
          type: 'receivables/delete',
          payload: { ...record, ...payload },
        }).then(() => that.handleRefresh());
      },
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
            <FormItem label="账户名">{getFieldDecorator('accountName')(<Input placeholder="请输入" />)}</FormItem>
          </Col>
          <Col md={6} sm={18}>
            <FormItem label="账号">{getFieldDecorator('accountNumber')(<Input placeholder="请输入" />)}</FormItem>
          </Col>
          <Col md={6} sm={18}>
            <FormItem label="开户行">{getFieldDecorator('openAccountBank')(<Input placeholder="请输入" />)}</FormItem>
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
      receivables: { modalVisible, currentItem, data },
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
        title: '账户名',
        dataIndex: 'accountName',
        width: '220px',
      },
      {
        title: '账号',
        dataIndex: 'accountNo',
      },
      {
        title: '开户行行号',
        dataIndex: 'bankNumber',
      },
      {
        title: '企业名称',
        dataIndex: 'companyName',
      },
      {
        title: '开户行',
        dataIndex: 'oppenAccountBank',
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

            {/*
              <Tabs onChange={this.handleTabChange} defaultActiveKey="1">
                {panes.map(pane => (
                  <TabPane tab={pane.title} key={pane.state} closable={false} />
                ))}
              </Tabs>
            */}
            
            <StandardTable loading={loading} data={data} columns={columns} onChange={this.handleStandardTableChange} />
          </div>
          <CreateForm {...parentMethods} modalVisible={modalVisible} currentItem={currentItem} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Receivables;
