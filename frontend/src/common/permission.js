import axios from 'axios';

// 获取用户角色
const getUserRole = async () => {
    try {
        const response = await axios.get('/login/status');
        if (response.data.isLoggedIn) {
            return response.data.user.role;
        }
        return null;
    } catch (error) {
        console.error('获取用户角色失败:', error);
        return null;
    }
};

// 根据角色获取用户权限
const getPermissionsByRole = async (roleId) => {
    try {
        const response = await axios.get(`/role/permissions?roleId=${roleId}`);
        const functionIds = response.data.map(item => item.FunctionID);
        const functionsResponse = await axios.get('/function/all');
        const allFunctions = functionsResponse.data;
        const permissions = functionIds.map(id => {
            const func = allFunctions.find(f => f.FunctionID === id);
            return func ? func.FunctionName : null;
        }).filter(Boolean);
        return permissions;
    } catch (error) {
        console.error('获取用户权限失败:', error);
        return [];
    }
};

// 获取用户的权限列表
const getUserPermissions = async () => {
    const roleId = await getUserRole();
    if (roleId) {
        return await getPermissionsByRole(roleId);
    }
    return [];
};

// 检查用户是否具有特定权限
export const checkPermission = async (requiredPermissions) => {
    const userPermissions = await getUserPermissions();
    return requiredPermissions.some(permission => userPermissions.includes(permission));
};

// 全局前置守卫逻辑
export const routerGuard = async (to, from, next) => {
    // try {
    //     // 检查用户是否已登录
    //     const response = await axios.get('/user/checkAuth');
    //     const isAuthenticated = response.data.isAuthenticated;

    //     if (!isAuthenticated) {
    //         // 用户未登录，重定向到登录页面
    //         next('/login');
    //     } else {
            const requiredPermissions = to.meta?.requiredPermissions || [];
            if (requiredPermissions.length > 0) {
                // 检查用户是否具有所需权限
                const hasPermission = await checkPermission(requiredPermissions);
                if (!hasPermission) {
                    window.alert('你没有权限访问该页面！');
                    next('/HomePage');
                } else {
                    // 用户有权限访问，继续导航
                    next();
                }
            } else {
                // 路由没有定义所需权限，直接放行
                next();
            }
    //  }
    // } catch (error) {
    //     console.error('权限验证失败:', error);
    //     next('/login');
    // }
};