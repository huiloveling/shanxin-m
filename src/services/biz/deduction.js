import { stringify } from 'qs';
import request from '@/utils/request';

const urlPrefix = '/api/recDeductionRecord';

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
    return request(`${urlPrefix}/saveOrUpdate`, {
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


export async function disCom(params) {
    return request(`${urlPrefix}/disCom?${stringify(params)}`);
}

export async function disPlayRec(params) {
    return request(`${urlPrefix}/disPlayRec?${stringify(params)}`);
}

export async function detail(params) {
    return request(`${urlPrefix}/detail?${stringify(params)}`);
}