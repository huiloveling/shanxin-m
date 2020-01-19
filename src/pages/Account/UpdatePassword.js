import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Form, Input, Button } from 'antd';

const FormItem = Form.Item;

@connect(({ account, loading }) => ({
  account,
  submitting: loading.effects['account/updatePassword'],
}))
@Form.create()
class UpdatePassword extends PureComponent {
  handleSubmit = e => {
    const { form, dispatch } = this.props;
    e.preventDefault();
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        dispatch({
          type: 'account/updatePassword',
          payload: values,
        });
      }
    });
  };

  handleConfirmPassword = (rule, value, callback) => {
    const {
      form: { getFieldValue },
    } = this.props;
    if (value && value !== getFieldValue('newPassword')) {
      callback('两次密码输入不一致！');
    }
    callback();
  };

  render() {
    const {
      submitting,
      form: { getFieldDecorator },
    } = this.props;

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
      <Card bordered={false}>
        <Form onSubmit={this.handleSubmit} style={{ marginTop: 8 }}>
          <FormItem {...formItemLayout} label="旧密码">
            {getFieldDecorator('oldPassword', {
              rules: [
                {
                  required: true,
                  message: '请输入旧密码',
                },
              ],
            })(<Input placeholder="请输入旧密码" />)}
          </FormItem>
          <FormItem {...formItemLayout} label="新密码">
            {getFieldDecorator('newPassword', {
              rules: [
                {
                  required: true,
                  message: '请输入新密码',
                },
                {
                  min: 6,
                  message: '密码最少6位',
                },
              ],
            })(<Input type="password" placeholder="请输入新密码" />)}
          </FormItem>
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

          <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
            <Button type="primary" htmlType="submit" loading={submitting}>
              修改密码
            </Button>
          </FormItem>
        </Form>
      </Card>
    );
  }
}

export default UpdatePassword;
