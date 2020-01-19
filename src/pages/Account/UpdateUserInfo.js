import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Form, Input, Button } from 'antd';

const FormItem = Form.Item;

@connect(({ account, loading }) => ({
  account,
  submitting: loading.effects['account/updateUserInfo'],
}))
@Form.create()
class UpdateUserInfo extends PureComponent {
  handleSubmit = e => {
    const { form, dispatch } = this.props;
    e.preventDefault();
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        dispatch({
          type: 'account/updateUserInfo',
          payload: values,
        });
      }
    });
  };

  render() {
    const {
      submitting,
      form: { getFieldDecorator },
      account: { currentUser },
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
          <FormItem {...formItemLayout} label="用户名">
            {getFieldDecorator('username', {
              initialValue: currentUser.username,
              rules: [
                {
                  required: true,
                  message: '请输入用户名',
                },
              ],
            })(<Input placeholder="用于登录的账号" />)}
          </FormItem>

          <FormItem {...formItemLayout} label="姓名">
            {getFieldDecorator('name', {
              initialValue: currentUser.name,
              rules: [
                {
                  required: true,
                  message: '请输入姓名',
                },
              ],
            })(<Input placeholder="请输入姓名" />)}
          </FormItem>

          <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
            <Button type="primary" htmlType="submit" loading={submitting}>
              保存
            </Button>
          </FormItem>
        </Form>
      </Card>
    );
  }
}

export default UpdateUserInfo;
