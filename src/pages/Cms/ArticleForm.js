import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input, Select, Button, Card } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import BraftEditor from 'braft-editor';
import 'braft-editor/dist/braft.css';

import styles from './ArticleForm.less';

const FormItem = Form.Item;
const { Option } = Select;

@connect(({ article, loading }) => ({
  article,
  submitting: loading.effects['article/save'],
}))
@Form.create()
class ArticleForm extends PureComponent {
  state = {};

  componentDidMount() {
    const { dispatch, match } = this.props;

    dispatch({
      type: 'article/categories',
    });

    if (match.path === '/cms/article/edit/:id') {
      dispatch({
        type: 'article/get',
        payload: match.params,
      });
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'article/loadItem',
      payload: {},
    });
  }

  handleSubmit = e => {
    const { form, dispatch } = this.props;
    e.preventDefault();
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        dispatch({
          type: 'article/save',
          payload: values,
        });
      }
    });
  };

  handleEditorChange = content => {
    const { form } = this.props;
    form.setFieldsValue({ content });
  };

  render() {
    const {
      submitting,
      form: { getFieldDecorator },
      article: { currentItem, categories },
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

    const editorProps = {
      height: 500,
      contentFormat: 'html',
      initialContent: currentItem.content,
      onChange: this.handleEditorChange,
    };

    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <Form onSubmit={this.handleSubmit} style={{ marginTop: 8 }}>
            <FormItem {...formItemLayout} label="标题">
              {getFieldDecorator('title', {
                initialValue: currentItem.title,
                rules: [
                  {
                    required: true,
                    message: '请输入标题',
                  },
                ],
              })(<Input placeholder="文章标题" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="摘要">
              {getFieldDecorator('summary', {
                initialValue: currentItem.summary,
              })(<Input.TextArea rows={4} />)}
            </FormItem>

            <FormItem {...formItemLayout} label="内容">
              {getFieldDecorator('content', {
                initialValue: currentItem.content,
                rules: [
                  {
                    required: true,
                    message: '请输入内容',
                  },
                ],
              })(
                <div className={styles.editorWrap}>
                  <BraftEditor {...editorProps} />
                </div>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="栏目">
              {getFieldDecorator('categoryId', {
                initialValue: currentItem.categoryId ? currentItem.categoryId : 1,
                rules: [
                  {
                    required: true,
                    message: '请选择栏目',
                  },
                ],
              })(
                <Select placeholder="请选择">
                  {categories.map(category => (
                    <Option value={category.id} key={category.id}>
                      {category.name}
                    </Option>
                  ))}
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

export default ArticleForm;
