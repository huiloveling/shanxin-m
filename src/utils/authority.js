// use localStorage to store the authority info, which might be sent from server in actual project.
export function getAuthority() {
    return sessionStorage.getItem('zhiduoduo-authority');
}

export function setAuthority(authority) {
    return sessionStorage.setItem('zhiduoduo-authority', authority);
}

export function getCurrentUser() {
    const user = sessionStorage.getItem('zhiduoduo-currentUser');
    return JSON.parse(user);
}

export function setCurrentUser(user) {
    sessionStorage.setItem('zhiduoduo-token', user.token);
    sessionStorage.setItem('zhiduoduo-currentUser', JSON.stringify(user));
}

export function getMenuData() {
    const menuData = sessionStorage.getItem('zhiduoduo-menuData');
    return JSON.parse(menuData);
}

export function setMenuData(menuData) {
    sessionStorage.setItem('zhiduoduo-menuData', JSON.stringify(menuData));
}

export function getToken() {
    return sessionStorage.getItem('zhiduoduo-token');
}

export function clear() {
    sessionStorage.clear();
}
