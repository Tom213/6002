// 封装ajax
class ajax{
    // get请求
    // 参数1: 请求地址
    // 参数2: 请求携带的参数(对象类型)
    static get(url,obj){
        // 配合promise一起使用(返回promise方法)
        // 参数1: 成功时调用
        // 参数2: 失败时调用
        return new Promise((resolve,reject) => {
            // 创建ajax对象
            let xhr = new XMLHttpRequest();
            // 声明一个字符串储存拼接好的数据
            let param = '';
            // 判断携带数据时
            if(obj){
                // 遍历携带带的数据(对象)
                for(let attr in obj){
                    // 将数据拼接成键=值的格式
                    param += attr + '=' + obj[attr] + '&';
                }
            }
            // 设置请求
            // 参数1: get请求方式
            // 参数2: 在地址栏上拼接数据中间通过?拼接
            xhr.open('get',url + '?' + param);
            // 发送请求(get方式默认不用携带参数)
            xhr.send();

            // 键听请求状态,接收返回值
            xhr.onreadystatechange = function(){
                // 判断ajax状态为4
                if(xhr.readyState == 4){
                    // 判断服务器状态码为200时
                    if(xhr.status == 200){
                        // 调用成功函数并传入后端返回值
                        resolve(xhr.response)
                    // 如果请求不成功时
                    }else{
                        // 调用失败函数
                        reject('error');
                    }
                }
            }
        }) 
    }

    // post方式传参
    // 参数1: 请求地址
    // 参数2: 请求携带参数
    static post(url,obj){
        // 配合promise一起使用(返回promise方法)
        return new Promise((resolve,reject) => {
            // 创建ajax对象
            let xhr = new XMLHttpRequest();
            // 设置请求
            // 参数1: post请求方式
            // 参数2: 请求地址
            xhr.open('post',url);
            // 设置请求头
            xhr.setRequestHeader('content-type','application/x-www-form-urlencoded');
            // 声明一个字符串储存拼接数据
            let param = '';
            // 判断是否携带参数
            if(obj){
                // 携带参数时,遍历对象
                for(let attr in obj){
                    // 将对象拼接成 键=值& 的格式
                    param += attr + '=' + obj[attr] + '&';
                }
            }
            // 发送请求,携带拼接好的参数
            xhr.send(param);
            // 监听请求状态,接收返回值
            xhr.onreadystatechange = function(){
                // 判断ajax状态码为4时
                if(xhr.readyState == 4){
                    // 判断服务器状态码为200时
                    if(xhr.status == 200){
                        // 调用promise的成功函数传入请求返回值作为实参
                        resolve(xhr.response);
                    // 如果请求不成功时调用失败函数
                    }else{
                        reject('error');
                    }
                }
            }
        })
    }
}