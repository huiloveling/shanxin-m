import React, { PureComponent } from 'react';
import { Table } from 'antd';
import styles from './index.less';

class StandardTable extends PureComponent {
  handleTableChange = (pagination, filters, sorter) => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(pagination, filters, sorter);
    }
  };

  render() {
    const { data, loading, columns, scroll, pagination = true } = this.props;

    const paginationProps = {
      pageSizeOptions: ['10', '20', '30', '50', '100'],
      showSizeChanger: true,
      // showQuickJumper: true,
      total: data.total,
      current: data.current,
      pageSize: data.size,
    };

    return (
      <div className={styles.standardTable}>
        <Table
          bordered
          loading={loading}
          rowKey={record => record.id}
          dataSource={pagination ? data.records : data}
          columns={columns}
          pagination={pagination ? paginationProps : false}
          scroll={scroll}
          onChange={this.handleTableChange}
        />
      </div>
    );
  }
}

export default StandardTable;
