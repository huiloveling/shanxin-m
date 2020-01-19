import { stringify } from 'qs';
import request from '@/utils/request';

const urlPrefix = '/api/sys/menu';

export async function list(params) {
  return request(`${urlPrefix}/list?${stringify(params)}`);
}

export async function tree(params) {
  return request(`${urlPrefix}/tree?${stringify(params)}`);
}

export async function parents(params) {
  return request(`${urlPrefix}/parents?${stringify(params)}`);
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
