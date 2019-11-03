import axios from 'axios'
import {Message} from "element-ui";

const service = axios.create({
    // baseURL:process.env.BASE_URL
    baseURL: "http://wcads.lz1998.xin/"
});

// 添加响应拦截器
service.interceptors.response.use(function (response) {
    // 对响应数据做点什么
    let data = response.data
    return data;
    // 需要使用粗饼，以下代码不能用
    // if(data.retcode==0){
    // }else{
    //     Message({
    //         message: data.msg,
    //         type: 'error',
    //         duration: 3000
    //     })
    // }
}, function (error) {
    // 对响应错误做点什么
    return Promise.reject(error);
});

export default service
