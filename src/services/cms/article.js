import { stringify } from 'qs';
import request from '@/utils/request';

const urlPrefix = '/api/cms/article';

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

export async function update(params) {
  return request(`${urlPrefix}/update/state?${stringify(params)}`);
}
