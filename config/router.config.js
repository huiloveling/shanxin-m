module.exports = [
    // account
    {
        path: '/account',
        component: '../layouts/AccountLayout',
        routes: [
            { path: '/account', redirect: '/account/login' },
            { path: '/account/login', component: './Account/Login' },
        ],
    },
    // app
    {
        path: '/',
        component: '../layouts/BasicLayout',
        Routes: ['src/pages/Authorized'],
        authority: ['admin', 'user', '1'],
        routes: [
            { path: '/', redirect: '/home' },
            {
                path: '/home',
                name: '首页',
                icon: 'home',
                component: './Dashboard/Home',
            },
            {
                path: '/home/userInfo',
                name: '个人信息',
                component: './Account/UpdateUserInfo',
                hideInMenu: true,
            },
            {
                path: '/home/updatePassword',
                name: '修改密码',
                component: './Account/UpdatePassword',
                hideInMenu: true,
            },
            {
                path: '/biz',
                name: '业务管理',
                icon: 'solution',
                routes: [
                    {
                        path: '/biz/intention',
                        name: '意向客户管理',
                        component: './Biz/IntentionList',
                    },
                    {
                        path: '/biz/intention/users/:customerId',
                        name: '账号管理',
                        component: './Biz/BizUserList',
                        hideInMenu: true,
                    },
                    {
                        path: '/biz/intention/contacts/:customerId',
                        name: '跟进记录',
                        component: './Biz/IntentionContact',
                        hideInMenu: true,
                    },
                    {
                        path: '/biz/customer',
                        name: '客户管理',
                        component: './Biz/CustomerList',
                    },
                    {
                        path: '/biz/receivables',
                        name: '企业收款方页面',
                        component: './Biz/Receivables',
                    },
                    {
                        path: '/biz/deduction',
                        name: '扣款企业列表页面',
                        component: './Biz/DeductionList',
                    },
                    {
                        path: '/biz/enterpriseCredit',
                        name: '企业收款',
                        component: './Biz/EnterpriseCredit',
                    },
                    {
                        path: '/biz/customer/users/:customerId',
                        name: '账号管理',
                        component: './Biz/BizUserList',
                        hideInMenu: true,
                    },
                    {
                        path: '/biz/customer/companies/:customerId',
                        name: '企业列表',
                        component: './Biz/CompanyList',
                        hideInMenu: true,
                    },
                    {
                        path: '/biz/salary',
                        name: '发薪管理',
                        component: './Biz/SalaryBatchList',
                    },
                    {
                        path: '/biz/salary/details/:batchId',
                        name: '发薪详情',
                        component: './Biz/SalaryDetailList',
                        hideInMenu: true,
                    },
                ],
            },
            {
                path: '/cms',
                name: '内容管理',
                icon: 'book',
                routes: [
                    {
                        path: '/cms/category',
                        name: '栏目管理',
                        component: './Cms/CategoryList',
                    },
                    {
                        path: '/cms/article',
                        name: '文章管理',
                        component: './Cms/ArticleList',
                    },
                    {
                        path: '/cms/article/create',
                        name: '新建文章',
                        component: './Cms/ArticleForm',
                        hideInMenu: true,
                    },
                    {
                        path: '/cms/article/edit/:id',
                        name: '编辑文章',
                        component: './Cms/ArticleForm',
                        hideInMenu: true,
                    },
                ],
            },
            {
                path: '/sys',
                name: '系统管理',
                icon: 'setting',
                routes: [
                    {
                        path: '/sys/user',
                        name: '用户管理',
                        component: './Sys/UserList',
                    },
                    {
                        path: '/sys/user/create',
                        name: '新建用户',
                        component: './Sys/UserForm',
                        hideInMenu: true,
                    },
                    {
                        path: '/sys/user/edit/:id',
                        name: '编辑用户',
                        component: './Sys/UserForm',
                        hideInMenu: true,
                    },
                    {
                        path: '/sys/role',
                        name: '角色管理',
                        component: './Sys/RoleList',
                    },
                    {
                        path: '/sys/menu',
                        name: '菜单管理',
                        component: './Sys/MenuList',
                    },
                    {
                        path: '/sys/permission',
                        name: '权限管理',
                        component: './Sys/PermissionList',
                    },
                    {
                        path: '/sys/permission/detail/:id',
                        name: '权限编辑',
                        component: './Sys/PermissionDetailList',
                        hideInMenu: true,
                    },
                ],
            },
        ],
    },
];
