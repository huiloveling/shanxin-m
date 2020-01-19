import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import moment from 'moment';
import { Row, Col, Form, Input, Select, Button, Modal, Badge, Divider, Card } from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import styles from '@/assets/less/List.less';

const FormItem = Form.Item;
const { confirm } = Modal;
const { Option } = Select;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

@connect(({ article, loading }) => ({
  article,
  loading: loading.models.article,
}))
@Form.create()
class ArticleList extends PureComponent {
  state = {
    formValues: {},
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'article/list',
      payload: {
        descs: 'id',
      },
    });
  }

  handleRefresh = () => {
    const { dispatch, article } = this.props;
    dispatch({
      type: 'article/list',
      payload: article.searchParams,
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
    } else {
      params.descs = 'id'
    }
    dispatch({
      type: 'article/list',
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
      type: 'article/list',
      payload: {
        descs: 'id'
      },
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
        type: 'article/list',
        payload: {
          ...values,
          descs: 'id'
        },
      });
    });
  };

  handleUpdate = (record, payload) => {
    const that = this;
    const { dispatch } = this.props;

    confirm({
      title: `确认${payload.state === '1' ? '发布' : '取消发布'}[${record.title}]这篇文章吗？`,
      onOk() {
        dispatch({
          type: 'article/update',
          payload: {
            id: record.id,
            ...payload,
          },
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
            <FormItem label="文章标题">
              {getFieldDecorator('title')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={6} sm={18}>
            <FormItem label="状态">
              {getFieldDecorator('state')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">草稿</Option>
                  <Option value="1">发布</Option>
                </Select>
              )}
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
      article: { data },
      loading,
    } = this.props;

    const statusMap = ['error', 'success'];
    const status = ['草稿', '发布'];
    const columns = [
      {
        title: '文章编号',
        dataIndex: 'id',
        sorter: true,
      },
      {
        title: '标题',
        dataIndex: 'title',
      },
      {
        title: '创建人',
        dataIndex: 'createUser.name',
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        render: val => <span>{val ? moment(val).format('YYYY-MM-DD HH:mm:ss') : ''}</span>,
      },
      {
        title: '发布人',
        dataIndex: 'publishUser.name',
      },
      {
        title: '发布时间',
        dataIndex: 'publishTime',
        render: val => <span>{val ? moment(val).format('YYYY-MM-DD HH:mm:ss') : ''}</span>,
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
            <Link to={`/cms/article/edit/${record.id}`}>编辑</Link>
            <Divider type="vertical" />
            <a
              onClick={() => {
                this.handleUpdate(record, { state: record.state === '0' ? '1' : '0' });
              }}
            >
              {record.state === '0' ? '发布' : '取消发布'}
            </a>
          </Fragment>
        ),
      },
    ];

    return (
      <PageHeaderWrapper>
        <Card bordered={false} className={styles.tableList}>
          <div className={styles.tableListForm}>{this.renderForm()}</div>
          <div className={styles.tableListOperator}>
            <Link to="/cms/article/create">
              <Button icon="plus" type="primary">
                新建
              </Button>
            </Link>
          </div>
          <StandardTable
            loading={loading}
            data={data}
            columns={columns}
            onChange={this.handleStandardTableChange}
          />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ArticleList;
