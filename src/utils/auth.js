
export function getAuthToken (){
    const token = localStorage.getItem('accessToken')
    return token 
    
}
export function removeToken(){
    const removeToken = localStorage.removeItem('accessToken')
    return removeToken
}
