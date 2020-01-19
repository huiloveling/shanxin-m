import { stringify } from 'qs';
import request from '@/utils/request';

const urlPrefix = '/api/biz/user';

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

export async function checkUsername(params) {
  return request(`${urlPrefix}/check/username?${stringify(params)}`);
}

export async function checkPhone(params) {
  return request(`${urlPrefix}/check/phone?${stringify(params)}`);
}
