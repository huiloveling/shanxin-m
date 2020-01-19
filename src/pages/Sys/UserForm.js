import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input, Select, Button, Card } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

const FormItem = Form.Item;
const { Option } = Select;

@connect(({ user, loading }) => ({
  user,
  submitting: loading.effects['user/save'],
}))
@Form.create()
class UserForm extends PureComponent {
  state = {
    option: 'create',
  };

  componentDidMount() {
    const { dispatch, match } = this.props;

    dispatch({
      type: 'user/roles',
    });

    if (match.path === '/sys/user/edit/:id') {
      this.setState({
        option: 'edit',
      });
      dispatch({
        type: 'user/get',
        payload: match.params,
      });
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/loadItem',
      payload: {},
    });
  }

  handleSubmit = e => {
    const { form, dispatch } = this.props;
    e.preventDefault();
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        dispatch({
          type: 'user/save',
          payload: values,
        });
      }
    });
  };

  handleConfirmPassword = (rule, value, callback) => {
    const {
      form: { getFieldValue },
    } = this.props;
    if (value && value !== getFieldValue('password')) {
      callback('两次密码输入不一致！');
    }
    callback();
  };

  handleCheckUsername = (rule, value, callback) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/check',
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

  render() {
    const {
      submitting,
      form: { getFieldDecorator },
      user: { currentItem, roles },
    } = this.props;
    const { option } = this.state;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 10 },
      },
    };

    const submitFormLayout = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 10, offset: 7 },
      },
    };

    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <Form onSubmit={this.handleSubmit} style={{ marginTop: 8 }}>
            <FormItem {...formItemLayout} label="用户名">
              {getFieldDecorator('username', {
                initialValue: currentItem.username,
                rules: [
                  {
                    required: true,
                    message: '请输入用户名',
                  },
                  {
                    validator: this.handleCheckUsername,
                  },
                ],
              })(<Input placeholder="用于登录的账号" />)}
            </FormItem>
            {option === 'create' ? (
              <FormItem {...formItemLayout} label="密码">
                {getFieldDecorator('password', {
                  rules: [
                    {
                      required: true,
                      message: '请输入密码',
                    },
                    {
                      min: 6,
                      message: '密码最少6位',
                    },
                  ],
                })(<Input type="password" placeholder="用于登录的账号" />)}
              </FormItem>
            ) : (
              ''
            )}
            {option === 'create' ? (
              <FormItem {...formItemLayout} label="确认密码">
                {getFieldDecorator('passwordConfirm', {
                  rules: [
                    {
                      required: true,
                      message: '请再次输入密码',
                    },
                    {
                      validator: this.handleConfirmPassword,
                    },
                  ],
                })(<Input type="password" placeholder="请再次输入密码" />)}
              </FormItem>
            ) : (
              ''
            )}
            <FormItem {...formItemLayout} label="姓名">
              {getFieldDecorator('name', {
                initialValue: currentItem.name,
                rules: [
                  {
                    required: true,
                    message: '请输入姓名',
                  },
                ],
              })(<Input placeholder="请输入姓名" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="角色">
              {getFieldDecorator('roleId', {
                initialValue: currentItem.roleId,
                rules: [
                  {
                    required: true,
                    message: '请选择角色',
                  },
                ],
              })(
                <Select placeholder="请选择">
                  {roles.map(role => (
                    <Option value={role.id} key={role.id}>
                      {role.name}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="状态">
              {getFieldDecorator('state', {
                initialValue: currentItem.state || '1',
              })(
                <Select placeholder="请选择">
                  <Option value="0">无效</Option>
                  <Option value="1">有效</Option>
                </Select>
              )}
            </FormItem>

            <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
              <Button type="primary" htmlType="submit" loading={submitting}>
                保存
              </Button>
            </FormItem>
          </Form>
        </Card>
      </PageHeaderWrapper>
    );
  }
}
export default UserForm;
