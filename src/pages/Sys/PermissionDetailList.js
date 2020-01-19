import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Row, Col, Form, Input, Select, Button } from 'antd';
import StandardTable from '@/components/StandardTable';
import styles from './PermissionList.less';

const FormItem = Form.Item;

@connect(({ permissionDetail, loading }) => ({
  permissionDetail,
  loading: loading.models.permissionDetail,
}))
@Form.create()
class PermissionDetailList extends PureComponent {
  state = {};

  componentDidMount() {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'permissionDetail/list',
      payload: {
        roleId: match.params.id,
      },
    });
  }

  handleStandardTableChange = (pagination, sorter) => {
    const { dispatch, match } = this.props;
    // 分页相关的属性
    const params = {
      roleId: match.params.id,
      current: pagination.current,
      size: pagination.pageSize,
    };
    if (sorter.field) {
      if (sorter.order === 'ascend') {
        params.ascs = sorter.field;
      } else {
        params.descs = sorter.field;
      }
    }
    dispatch({
      type: 'permissionDetail/list',
      payload: params,
    });
  };

  handleRefresh = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'permissionDetail/list',
    });
  };

  handleEdit = record => {
    const { dispatch } = this.props;
    dispatch({
      type: 'permissionDetail/listMenu',
      payload: {
        roleId: record.id,
      },
    });
  };

  handleSave = () => {
    const { dispatch } = this.props;
    // const {permissionDetail:{roleId,tree}} = this.props;
    // 数据如果存在state中这里就不用传payload了
    dispatch({
      type: 'permissionDetail/save',
      payload: {},
    }).then(() => this.handleRefresh());
  };

  handleSearch = e => {
    e.preventDefault();

    const { dispatch, match, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        roleId: match.params.id,
      };

      dispatch({
        type: 'permissionDetail/list',
        payload: values,
      });
    });
  };

  handleTableSubmit = e => {
    e.preventDefault();

    // const { match, form } = this.props;

    // form.validateFields((err, fieldsValue) => {
    //   if (err) return;
    //   const values = {
    //     ...fieldsValue,
    //     roleId: match.params.id,
    //   };

    //   // dispatch({
    //   //   type: 'permissionDetail/list',
    //   //   payload: values,
    //   // });
    // });
  };

  // 处理表格中的选择框
  selectRender = (text, record, index) => (
    <Select defaultValue={text} onChange={() => this.onChangeSelect(record, index)}>
      <Select.Option value="1">允许</Select.Option>
      <Select.Option value="0">禁止</Select.Option>
    </Select>
  );

  renderForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={6} sm={18}>
            <FormItem label="权限名称">{getFieldDecorator('queryName')(<Input placeholder="请输入" />)}</FormItem>
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

  renderTableForm = () => {
    const {
      permissionDetail: { data },
      loading,
    } = this.props;
    const {
      form: { getFieldDecorator },
    } = this.props;

    const columns = [
      {
        title: '权限编号',
        // title:test?"nullll":"ok",
        dataIndex: 'id',
        defaultSortOrder: 'ascend',
        sorter: true,
      },
      {
        title: '角色编号',
        dataIndex: 'roleId',
        defaultSortOrder: 'ascend',
        sorter: true,
      },
      {
        title: '权限名称',
        dataIndex: 'name',
      },
      {
        title: '权限编码',
        dataIndex: 'code',
      },
      {
        title: '查看权限',
        dataIndex: 'view',
        render: this.selectRender,
      },
      {
        title: '创建权限',
        dataIndex: 'create',
        render: this.selectRender,
      },
      {
        title: '编辑权限',
        dataIndex: 'edit',
        render: this.selectRender,
      },
      {
        title: '删除权限',
        dataIndex: 'delete',
        render: this.selectRender,
      },

      {
        title: '导出权限',
        dataIndex: 'export',
        render: this.selectRender,
      },
    ];
    return (
      <Form onSubmit={this.handleTableSubmit}>
        <Button type="primary" htmlType="submit">
          保存
        </Button>
        <FormItem>
          <div className={styles.tableListOperator} />
          {getFieldDecorator('tableData')(
            <StandardTable
              loading={loading}
              data={data}
              columns={columns}
              onChange={this.handleStandardTableChange}
              // onRow={this.handleOnRow}
            />
          )}
        </FormItem>
      </Form>
    );
  };

  render() {
    return (
      <Card bordered={false}>
        <div className={styles.tableList}>
          <div className={styles.tableListForm}>{this.renderForm()}</div>
          {this.renderTableForm()}
        </div>
      </Card>
    );
  }
}

export default PermissionDetailList;
