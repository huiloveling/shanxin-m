import { stringify } from 'qs';
import request from '@/utils/request';

const urlPrefix = '/api/sys/permission';

export async function list(params) {
  return request(`${urlPrefix}/listDetail?${stringify(params)}`);
}

export async function save(params) {
  return request(`${urlPrefix}/saveDetail`, {
    method: 'POST',
    body: params,
  });
}
