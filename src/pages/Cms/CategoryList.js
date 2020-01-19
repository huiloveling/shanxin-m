import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Card, Row, Col, Form, Input, Button, Modal, Badge, Divider } from 'antd';
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
      title={currentItem.id ? '编辑栏目' : '新建栏目'}
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleCancel()}
    >
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="栏目名称">
        {form.getFieldDecorator('name', {
          initialValue: currentItem.name,
          rules: [{ required: true, message: '请输入栏目名称' }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="描述">
        {form.getFieldDecorator('descn', {
          initialValue: currentItem.descn,
        })(<Input placeholder="请输入" />)}
      </FormItem>
    </Modal>
  );
});

@connect(({ category, loading }) => ({
  category,
  loading: loading.models.category,
}))
@Form.create()
class CategoryList extends PureComponent {
  state = {
    formValues: {},
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'category/list',
    });
  }

  handleRefresh = () => {
    const { dispatch, category } = this.props;
    dispatch({
      type: 'category/list',
      payload: category.searchParams,
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
    }
    dispatch({
      type: 'category/list',
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
      type: 'category/list',
      payload: {},
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
        type: 'category/list',
        payload: values,
      });
    });
  };

  handleEdit = (record = {}) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'category/showModal',
      payload: record,
    });
  };

  handleUpdate = (record, payload) => {
    const that = this;
    const { dispatch } = this.props;
    confirm({
      title: `确认修改[${record.name}]这条记录吗？`,
      onOk() {
        dispatch({
          type: 'category/save',
          payload: {
            ...record,
            ...payload,
          },
        }).then(() => that.handleRefresh());
      },
    });
  };

  handleSave = values => {
    const { dispatch } = this.props;
    dispatch({
      type: 'category/save',
      payload: values,
    }).then(() => this.handleRefresh());
  };

  handleCancel = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'category/hideModal',
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
            <FormItem label="栏目名称">
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
      category: { modalVisible, currentItem, data },
      loading,
    } = this.props;

    const statusMap = ['error', 'success'];
    const status = ['无效', '有效'];
    const columns = [
      {
        title: '栏目编号',
        dataIndex: 'id',
        sorter: true,
      },
      {
        title: '栏目名称',
        dataIndex: 'name',
      },
      {
        title: '栏目描述',
        dataIndex: 'descn',
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
            </a>{' '}
            <Divider type="vertical" />
            <a
              onClick={() => {
                this.handleUpdate(record, { state: record.state === '0' ? '1' : '0' });
              }}
            >
              {record.state === '0' ? '恢复' : '禁用'}
            </a>
          </Fragment>
        ),
      },
    ];

    const parentMethods = {
      handleSave: this.handleSave,
      handleCancel: this.handleCancel,
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

export default CategoryList;
