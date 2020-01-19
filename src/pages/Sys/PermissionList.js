import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Card, Form, Divider, Tree, Row, Col, Button } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import StandardTable from '@/components/StandardTable';
import styles from './PermissionList.less';

const { TreeNode } = Tree;

@connect(({ permission, loading }) => ({
  permission,
  loading: loading.models.permission,
}))
@Form.create()
class PermissionList extends PureComponent {
  state = {
    currentRoleId: undefined,
    checkedKeys: [],
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'permission/roles',
    });
    dispatch({
      type: 'permission/menuTree',
    });
  }

  handleEdit = record => {
    const { dispatch } = this.props;
    this.setState({
      currentRoleId: record.id,
    });
    dispatch({
      type: 'permission/list',
      payload: {
        roleId: record.id,
      },
    }).then(() => {
      const {
        permission: { permissions },
      } = this.props;
      const checkedKeys = permissions.map(item => item.menuId);
      this.setState({
        checkedKeys,
      });
    });
  };

  handleSave = () => {
    const { dispatch } = this.props;
    const { currentRoleId, checkedKeys } = this.state;

    dispatch({
      type: 'permission/save',
      payload: {
        roleId: currentRoleId,
        menuIdList: checkedKeys.join(','),
      },
    });
  };

  onCheck = (checkedKeys, e) => {
    const { children } = e.node.props;

    let checks = checkedKeys.checked;
    if (children) {
      if (e.checked) {
        checks = Array.from(new Set([...checks, ...children.map(n => n.key)]));
        this.setState({ checkedKeys: checks });
      } else {
        const unchecks = children.map(n => n.key);
        checks = checks.filter(k => unchecks.indexOf(k) < 0);
      }
    }

    this.setState({ checkedKeys: checks });
  };

  renderTreeNodes = data =>
    data.map(item => {
      if (item.children) {
        return (
          <TreeNode title={item.title} key={item.key} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode {...item} />;
    });

  render() {
    const { currentRoleId, checkedKeys } = this.state;
    const { permission, loading } = this.props;
    const { roles, menuTree } = permission;

    const columns = [
      {
        title: '编号',
        dataIndex: 'id',
        defaultSortOrder: 'ascend',
      },
      {
        title: '角色名称',
        dataIndex: 'name',
      },
      {
        title: '角色描述',
        dataIndex: 'descn',
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
              设置权限
            </a>
          </Fragment>
        ),
      },
    ];

    return (
      <PageHeaderWrapper>
        <Row gutter={16}>
          <Col span={8}>
            <Card bordered={false} title="角色列表">
              <div className={styles.tableList}>
                <StandardTable loading={loading} data={roles} columns={columns} pagination={false} />
              </div>
            </Card>
          </Col>
          <Col span={16}>
            <Card bordered={false} title="角色权限">
              {currentRoleId && (
                <div>
                  <Tree checkable checkStrictly defaultExpandAll onCheck={this.onCheck} checkedKeys={checkedKeys}>
                    {this.renderTreeNodes(menuTree)}
                  </Tree>
                  <Divider type="horizontal" />
                  <Button type="primary" onClick={this.handleSave}>
                    保存
                  </Button>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </PageHeaderWrapper>
    );
  }
}

export default PermissionList;
