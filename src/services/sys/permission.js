import { stringify } from 'qs';
import request from '@/utils/request';

const urlPrefix = '/api/sys/permission';

export async function list(params) {
  return request(`${urlPrefix}/list?${stringify(params)}`);
}

export async function listMenu(params) {
  return request(`${urlPrefix}/listMenu?${stringify(params)}`);
}

export async function save(params) {
  return request(`${urlPrefix}/save?${stringify(params)}`, {
    method: 'POST',
    // body: `roleId=${params.roleId}&menuIdList=${params.menuIdList.join(',')}`,
  });
}
