import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Card, Row, Col, Form, Input, Select, Button, Modal, Divider } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StandardTable from '@/components/StandardTable';
import styles from '@/assets/less/List.less';

const FormItem = Form.Item;
const { confirm } = Modal;
const { Option } = Select;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

const CreateForm = Form.create()(props => {
  const { modalVisible, currentItem, parents, form, handleSave, handleCancel } = props;

  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      handleSave(fieldsValue);
      form.resetFields();
    });
  };
  return (
    <Modal
      title={currentItem.id ? '编辑菜单' : '新建菜单'}
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleCancel()}
    >
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="菜单名称">
        {form.getFieldDecorator('name', {
          initialValue: currentItem.name,
          rules: [{ required: true, message: '请输入菜单名称' }],
        })(<Input placeholder="请输入" />)}
      </FormItem>

      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="菜单路径">
        {form.getFieldDecorator('path', {
          initialValue: currentItem.path,
          rules: [{ required: true, message: '请输入菜单路径' }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="上级菜单">
        {form.getFieldDecorator('parentId', {
          initialValue: currentItem.parentId,
        })(
          <Select placeholder="请选择">
            {parents.map(parent => (
              <Option value={parent.id} key={parent.id}>
                {parent.name}
              </Option>
            ))}
          </Select>
        )}
      </FormItem>
    </Modal>
  );
});

@connect(({ menu, loading }) => ({
  menu,
  loading: loading.models.menu,
}))
@Form.create()
class MenuList extends PureComponent {
  state = {
    formValues: {},
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'menu/list',
    });
    dispatch({
      type: 'menu/parents',
    });
  }

  handleRefresh = () => {
    const { dispatch, menu } = this.props;
    dispatch({
      type: 'menu/list',
      payload: menu.searchParams,
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
      type: 'menu/list',
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
      type: 'menu/list',
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
        type: 'menu/list',
        payload: values,
      });
    });
  };

  handleEdit = (record = {}) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'menu/showModal',
      payload: record,
    });
  };

  handleDelete = record => {
    const that = this;
    const { dispatch } = this.props;
    confirm({
      title: `确认删除[${record.name}]这条记录吗？`,
      onOk() {
        dispatch({
          type: 'menu/delete',
          payload: {
            id: record.id,
          },
        }).then(() => that.handleRefresh());
      },
    });
  };

  handleSave = values => {
    const { dispatch } = this.props;
    dispatch({
      type: 'menu/save',
      payload: values,
    }).then(() => this.handleRefresh());
  };

  handleCancel = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'menu/hideModal',
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
            <FormItem label="菜单名称">
              {getFieldDecorator('name')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={6} sm={18}>
            <FormItem label="菜单路径">
              {getFieldDecorator('path')(<Input placeholder="请输入" />)}
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
      menu: { modalVisible, currentItem, parents, data },
      loading,
    } = this.props;

    const columns = [
      {
        title: '菜单编号',
        dataIndex: 'id',
        defaultSortOrder: 'ascend',
        sorter: (id1, id2) => id1 - id2,
      },
      {
        title: '菜单名称',
        dataIndex: 'name',
      },
      {
        title: '菜单路径',
        dataIndex: 'path',
      },
      {
        title: '上级菜单',
        dataIndex: 'parentId',
        render: val => {
          const parent = parents.find(item => item.id === val);
          return parent ? parent.name : '';
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
          <CreateForm
            {...parentMethods}
            modalVisible={modalVisible}
            currentItem={currentItem}
            parents={parents}
          />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default MenuList;
