import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { List, Card, Form, Input, Button, Modal } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import DescriptionList from '@/components/DescriptionList';

import styles from './IntentionContact.less';

const FormItem = Form.Item;
const { confirm } = Modal;
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
      title={currentItem.id ? '编辑跟进记录' : '新建跟进记录'}
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleCancel()}
      width={720}
    >
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="跟进记录">
        {form.getFieldDecorator('content', {
          initialValue: currentItem.content,
          rules: [{ required: true, message: '请输入内容' }],
        })(<Input.TextArea rows={4} />)}
      </FormItem>
    </Modal>
  );
});

@connect(({ customer, contact, loading }) => ({
  customer,
  contact,
  submitting: loading.effects['contact/save'],
}))
@Form.create()
class IntentionContact extends PureComponent {
  componentDidMount() {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'customer/get',
      payload: {
        id: match.params.customerId,
      },
    });

    dispatch({
      type: 'contact/list',
      payload: match.params,
    });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contact/loadItem',
      payload: {},
    });
  }

  handleRefresh = () => {
    const { dispatch, contact } = this.props;
    dispatch({
      type: 'contact/list',
      payload: contact.searchParams,
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
      type: 'contact/list',
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
      type: 'contact/list',
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
        type: 'contact/list',
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
      type: 'contact/showModal',
      payload: record,
    });
  };

  handleDelete = record => {
    const that = this;
    const { dispatch } = this.props;
    confirm({
      title: `确认删除该记录吗？`,
      onOk() {
        dispatch({
          type: 'contact/delete',
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
      type: 'contact/save',
      payload: {
        ...values,
        customerId: customer.currentItem.id,
      },
    }).then(() => this.handleRefresh());
  };

  handleCancel = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'contact/hideModal',
    });
  };

  render() {
    const {
      customer: { currentItem: currentCustomer },
      contact: { modalVisible, currentItem, data },
      loading,
    } = this.props;
    const contactStatus = ['未联系', '已联系'];
    const status = ['无效', '有效'];

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
        <Description term="创建时间">{moment(currentCustomer.createTime).format('YYYY-MM-DD HH:mm:ss')}</Description>
      </DescriptionList>
    );

    const paginationProps = {
      showSizeChanger: true,
      total: data.total,
      current: data.current,
      pageSize: data.size,
    };

    return (
      <PageHeaderWrapper title={`企业名称：${currentCustomer.companyName}`} content={description}>
        <div className={styles.standardList}>
          <Card
            className={styles.listCard}
            bordered={false}
            title="跟进记录"
            style={{ marginTop: 24 }}
            bodyStyle={{ padding: '0 32px 40px 32px' }}
          >
            <Button
              type="dashed"
              style={{ width: '100%', marginBottom: 8 }}
              icon="plus"
              onClick={() => this.handleEdit()}
            >
              添加
            </Button>
            <List
              size="large"
              rowKey="id"
              loading={loading}
              pagination={paginationProps}
              dataSource={data.records}
              renderItem={item => (
                <List.Item
                  actions={[
                    <a
                      onClick={() => {
                        this.handleEdit(item);
                      }}
                    >
                      编辑
                    </a>,
                    <a
                      onClick={() => {
                        this.handleDelete(item);
                      }}
                    >
                      删除
                    </a>,
                  ]}
                >
                  <List.Item.Meta title="沟通记录" description={item.content} />
                  <List.Item.Meta title="添加人" description={item.createUser ? item.createUser.name : ''} />
                  <List.Item.Meta
                    title="添加时间"
                    description={moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')}
                  />
                </List.Item>
              )}
            />
            <CreateForm {...parentMethods} modalVisible={modalVisible} currentItem={currentItem} />
          </Card>
        </div>
      </PageHeaderWrapper>
    );
  }
}

export default IntentionContact;
