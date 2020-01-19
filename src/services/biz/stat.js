import { stringify } from 'qs';
import request from '@/utils/request';

export async function download(params) {
  return request(`/api/biz/customer/download/stat?${stringify(params)}`);
}

export async function customer(params) {
  return request(`/api/biz/customer/stat?${stringify(params)}`);
}

export async function salary(params) {
  return request(`/api/salary/detail/stat?${stringify(params)}`);
}
