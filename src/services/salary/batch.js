import { stringify } from 'qs';
import request from '@/utils/request';

const urlPrefix = '/api/salary/batch';

export async function list(params) {
  return request(`${urlPrefix}/list?${stringify(params)}`);
}
export async function get(params) {
  return request(`${urlPrefix}/get?${stringify(params)}`);
}
