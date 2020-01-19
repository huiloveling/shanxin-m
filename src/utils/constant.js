/**
 * 用于存放 model 中的 effect 和 reducer 名字，以及在多处使用的常量
 */
let baseUrl = '';
if (process.env.NODE_ENV === 'development') {
   baseUrl = 'http://192.168.1.190:8081';
  // baseUrl = 'http://mgt-api.xindongkj.com';
} else {
  baseUrl = 'http://mgt-api.zhqianbao.com';
}
const cons = {
  baseUrl,
};

export default cons;
