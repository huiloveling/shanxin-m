import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import moment from 'moment';
import { Card, Row, Col, Form, Input, Tabs, Button, Modal, Badge, Divider, Select, Drawer } from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from '@/assets/less/List.less';

const { TabPane } = Tabs;
const FormItem = Form.Item;
const { Option } = Select;
const { confirm } = Modal;
const getValue = obj =>
    Object.keys(obj)
        .map(key => obj[key])
        .join(',');

const CreateForm = Form.create()(props => {
    const { modalVisible, currentItem, form, handleSave, handleCancel, handleCheckCompanyName, disCom, disPlayRec } = props;
    const okHandle = () => {
        form.validateFields((err, fieldsValue) => {
            let companyId = fieldsValue.companyId;
            let recCompanyId = fieldsValue.recCompanyId;
            for (let i = 0; i < disCom.length; i++) {
                if (companyId == disCom[i].companyName) fieldsValue.companyId = disCom[i].id;
            }
            for (let i = 0; i < disPlayRec.length; i++) {
                if (recCompanyId == disPlayRec[i].companyName) fieldsValue.recCompanyId = disPlayRec[i].id;
            }
            if (err) return;
            handleSave(fieldsValue);
            form.resetFields();
        });
    };
    if (disCom && disPlayRec) {
        return (
            <Modal
                title={currentItem.id ? '编辑客户' : '新建客户'}
                visible={modalVisible}
                onOk={okHandle}
                onCancel={() => handleCancel()}
            >
                <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="企业名称">
                    {form.getFieldDecorator('companyId', {
                        initialValue: currentItem.companyName,
                        rules: [
                            {
                                required: true,
                                message: '请输入企业名称',
                            },
                        ],
                    })(
                        <Select
                            placeholder="请选择企业名称"
                        >
                            {
                                disCom.map((item) => <Option key={item.id}>{item.companyName}</Option>)
                            }
                        </Select>
                    )}
                </FormItem>
                <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="收款方">
                    {form.getFieldDecorator('recCompanyId', {
                        initialValue: currentItem.recCompanyName,
                        rules: [{ required: true, message: '请输入收款方' }],
                    })(
                        <Select
                            placeholder="请输入收款方"
                        >
                            {
                                disPlayRec.map((item) => <Option key={item.id}>{item.companyName}</Option>)
                            }
                        </Select>
                    )}
                </FormItem>
                <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="欠款总额">
                    {form.getFieldDecorator('arrearsCountTotal', {
                        initialValue: currentItem.arrearsCountTotal,
                        rules: [{ required: true, message: '请输入欠款总额' }],
                    })(<Input placeholder="请输入" />)}
                </FormItem>
            </Modal>
        );
    }
    return null

});

@connect(({ deduction, loading }) => ({
    deduction,
    loading: loading.models.deduction,
}))
@Form.create()
class Deduction extends PureComponent {
    state = {
        formValues: {},
        tabValues: { state: '1' },
    };

    componentDidMount() {
        const {
            dispatch,
        } = this.props;
        const { tabValues } = this.state;
        dispatch({
            type: 'deduction/list',
            payload: {
                ...tabValues,
                descs: 'id',
            },
        });
        dispatch({
            type: 'deduction/disCom',
            payload: {},
        });
        dispatch({
            type: 'deduction/disPlayRec',
            payload: {},
        });
    }

    handleRefresh = () => {
        const { dispatch, deduction } = this.props;
        dispatch({
            type: 'deduction/list',
            payload: deduction.searchParams,
        });
    };

    handleStandardTableChange = (pagination, filtersArg, sorter) => {
        const { dispatch } = this.props;
        const { formValues, tabValues } = this.state;

        const filters = Object.keys(filtersArg).reduce((obj, key) => {
            const newObj = { ...obj };
            newObj[key] = getValue(filtersArg[key]);
            return newObj;
        }, {});

        const params = {
            current: pagination.current,
            size: pagination.pageSize,
            ...formValues,
            ...tabValues,
            ...filters,
        };
        if (sorter.field) {
            if (sorter.order === 'ascend') {
                params.ascs = sorter.field;
            } else {
                params.descs = sorter.field;
            }
        } else {
            params.descs = 'id';
        }
        dispatch({
            type: 'deduction/list',
            payload: params,
        });
    };

    handleFormReset = () => {
        const { form, dispatch } = this.props;
        const { tabValues } = this.state;
        form.resetFields();
        this.setState({
            formValues: {},
        });
        dispatch({
            type: 'deduction/list',
            payload: {
                ...tabValues,
                descs: 'id'
            },
        });
    };

    handleSearch = e => {
        e.preventDefault();
        const { dispatch, form } = this.props;
        const { tabValues } = this.state;
        form.validateFields((err, fieldsValue) => {
            if (err) return;

            const values = {
                ...fieldsValue,
            };
            this.setState({
                formValues: values,
            });
            dispatch({
                type: 'deduction/list',
                payload: {
                    ...values,
                    ...tabValues,
                    descs: 'id'
                },
            });
        });
    };

    handleEdit = (record = {}) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'deduction/showModal',
            payload: record,
        });
    };

    handleSave = values => {
        const { dispatch } = this.props;
        dispatch({
            type: 'deduction/save',
            payload: {
                ...values,
                checkState: '1',
            },
        }).then(() => this.handleRefresh());
    };

    handleCancel = () => {
        const { dispatch } = this.props;
        dispatch({
            type: 'deduction/hideModal',
        });
    };

    handleUpdate = (record, payload) => {
        const that = this;
        const { dispatch } = this.props;

        confirm({
            title: `确认修改[${record.companyName}]这条记录吗？`,
            onOk() {
                dispatch({
                    type: 'deduction/save',
                    payload: { ...record, ...payload },
                }).then(() => that.handleRefresh());
            },
        });
    };

    handleTabChange = activeKey => {
        const { dispatch } = this.props;
        const payload = {
            state: activeKey,
        };
        this.setState({
            tabValues: payload,
        });

        dispatch({
            type: 'deduction/list',
            payload: {
                ...payload,
            },
        });
    };

    handleCheckCompanyName = (rule, value, callback) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'deduction/check',
            payload: {
                companyName: value,
            },
        }).then(response => {
            if (response.code === 0) {
                callback();
            } else {
                callback(response.msg);
            }
        });
    };

    handleUpdate = (record, payload) => {
        const that = this;
        const { dispatch } = this.props;

        confirm({
            title: `确认修改[${record.companyName}]这条记录吗？`,
            onOk() {
                dispatch({
                    type: 'deduction/delete',
                    payload: { ...record, ...payload },
                }).then(() => that.handleRefresh());
            },
        });
    };

    handleSelectChange = (fieldsValue, value) => {
        this.props.form.setFieldsValue({
            [fieldsValue]: value,
        });
    }

    handleDeductionDetail = record => {
        const { dispatch } = this.props;
        dispatch({
            type: 'deduction/detail',
            payload: record,
        });
    }

    onClose = () => {
        const { dispatch } = this.props;
        dispatch({
            type: 'deduction/hideDrawer',
            payload: {},
        });
    }

    renderForm(disCom, disPlayRec) {
        const {
            form: { getFieldDecorator },
        } = this.props;
        if (disCom && disPlayRec) {
            return (
                <Form onSubmit={this.handleSearch} layout="inline">
                    <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                        <Col md={6} sm={18}>
                            <FormItem label="企业名称">{getFieldDecorator('companyName')(
                                <Select
                                    placeholder="请选择企业名称"
                                    maxTagTextLength={5}
                                    onChange={(value) => this.handleSelectChange('companyName', value)}
                                >
                                    {
                                        disCom.map((item) => <Option value={item.companyName} key={item.id}>{item.companyName}</Option>)
                                    }
                                </Select>
                            )}</FormItem>
                        </Col>
                        <Col md={6} sm={18}>
                            <FormItem label="收款方">{getFieldDecorator('recCompanyName')(
                                <Select
                                    placeholder="请选择收款方"
                                    onChange={(value) => this.handleSelectChange('recCompanyName', value)}
                                >
                                    {
                                        disPlayRec.map((item) => <Option value={item.companyName} key={item.id}>{item.companyName}</Option>)
                                    }
                                </Select>
                            )}</FormItem>
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
    }

    renderDetail = (detail) => {
        return detail.map((item, index) => {
            return (
                <div key={index}>
                    <Card>
                        <div className={styles.detailItem}>
                            <span>划扣金额：</span> {item.amount} 元
            </div>
                        <div className={styles.detailItem}>
                            <span>公司名称：</span> {item.companyName}
                        </div>
                        <div className={styles.detailItem}>
                            <span>划扣时间：</span> {item.createTime}
                        </div>
                        <div className={styles.detailItem}>
                            <span>收款企业名称：</span> {item.reCompanyName}
                        </div>
                        <div className={styles.detailItem}>
                            <span>状态：</span> {item.status === 0 ? '失败' : status === 1 ? '成功' : '进行中'}
                        </div>
                    </Card>
                </div>
            )
        })
    }

    render() {
        const {
            deduction: { modalVisible, currentItem, data, disCom, disPlayRec, drawerVisible, detail },
            loading,
        } = this.props;
        const statusMap = ['error', 'success'];
        const status = ['无效', '有效'];
        const panes = [{ title: '正常', state: '1' }, { title: '停用', state: '0' }, { title: '全部', state: '' }];
        console.log(detail)
        const columns = [
            {
                title: '客户编号',
                dataIndex: 'id',
                sorter: true,
            },
            {
                title: '企业名称',
                dataIndex: 'companyName',
                width: '220px',
            },
            {
                title: '创建时间',
                dataIndex: 'createTime',
            },
            {
                title: '划扣金额',
                dataIndex: 'deductionTotal',
            },
            {
                title: '收款企业名称',
                dataIndex: 'recCompanyName',
            },
            {
                title: '还款时间',
                dataIndex: 'repayTime',
            },
            {
                title: '剩余还款总额',
                dataIndex: 'surplusTotal',
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
                                this.handleDeductionDetail(record)
                            }}
                        >
                            明细
            </a>
                    </Fragment>
                ),
            },
        ];

        const parentMethods = {
            handleSave: this.handleSave,
            handleCancel: this.handleCancel,
            handleCheckCompanyName: this.handleCheckCompanyName,
            handleSelectChange: this.handleSelectChange
        };

        return (
            <PageHeaderWrapper>
                <Card bordered={false}>
                    <div className={styles.tableList}>
                        <div className={styles.tableListForm}>{this.renderForm(disCom, disPlayRec)}</div>
                        <div className={styles.tableListOperator}>
                            <Button icon="plus" type="primary" onClick={() => this.handleEdit()}>
                                新建
              </Button>
                        </div>

                        {/*
              <Tabs onChange={this.handleTabChange} defaultActiveKey="1">
                {panes.map(pane => (
                  <TabPane tab={pane.title} key={pane.state} closable={false} />
                ))}
              </Tabs>
            */}

                        <StandardTable loading={loading} data={data} columns={columns} onChange={this.handleStandardTableChange} />
                    </div>
                    <CreateForm {...parentMethods} modalVisible={modalVisible} currentItem={currentItem} disCom={disCom} disPlayRec={disPlayRec} />
                    <Drawer
                        title="扣款明细"
                        visible={drawerVisible}
                        closable={false}
                        maskClosable={false}
                        onClose={this.onClose}
                        width={500}
                    >
                        <div>
                            {detail ? this.renderDetail(detail) : null}
                            <div
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    width: '100%',
                                    borderTop: '1px solid #e8e8e8',
                                    padding: '10px 16px',
                                    textAlign: 'center',
                                    left: 0,
                                    background: '#fff',
                                    borderRadius: '0 0 4px 4px',
                                }}
                            >
                                <Button
                                    type="primary"
                                    style={{ width: '70%' }}
                                    onClick={this.onClose}
                                >
                                    Cancel
                </Button>
                            </div>
                        </div>
                    </Drawer>
                </Card>
            </PageHeaderWrapper>
        );
    }
}

export default Deduction;
