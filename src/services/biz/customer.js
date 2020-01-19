import { stringify } from 'qs';
import request from '@/utils/request';

const urlPrefix = '/api/biz/customer';

export async function list(params) {
  return request(`${urlPrefix}/list?${stringify(params)}`);
}
export async function get(params) {
  return request(`${urlPrefix}/get?${stringify(params)}`);
}
export async function remove(params) {
  return request(`${urlPrefix}/delete?${stringify(params)}`);
}
export async function save(params) {
  return request(`${urlPrefix}/save`, {
    method: 'POST',
    body: params,
  });
}
export async function updateCheckState(params) {
  return request(`${urlPrefix}/update/checkState`, {
    method: 'POST',
    body: params,
  });
}

export async function check(params) {
  return request(`${urlPrefix}/check?${stringify(params)}`);
}
