import { stringify } from 'qs';
import request from '../utils/request';

const urlPrefix = '/api/sys/account';

export async function login(params) {
  return request(`${urlPrefix}/login?${stringify(params)}`);
}

export async function updatePassword(params) {
  return request(`${urlPrefix}/updatePassword?${stringify(params)}`);
}
