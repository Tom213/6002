class Goods{
    // 在构造方法中添加需要调用的方法
    constructor(){
        // 渲染列表方法
        this.list();
        // 给登录按钮添加点击事件
        $('#login').addEventListener('click',this.login);
        // 给退出按钮按钮添加事件
        $('#exit').addEventListener('click',this.exit);
    }
    // 动态渲染列表方法
    list(){
        // 发送get请求,获取数据库数据
        ajax.get('./server/goods.php',{fn:'lst'}).then(res => {
            // 将状态码和后端数据解构成对象
            let {stateCode,data} = JSON.parse(res);
            // 判断请求状态码是200是(请求成功时)
            if(stateCode == 200){
                // 声明一个字符串储存列表中的每个标签
                let str = '';
                // 遍历获取后端响应的数据
                data.forEach(ele =>{
                    str += `<div class="goodsCon"><a target = "_blank" >
                    <img src="${ele.goodsImg}" class="icon"><h4 class="title">${ele.goodsName}</h4>
                    <div class="info">限时抢购200条</div></a><div class="priceCon">
                    <span class="price">￥${ele.price}</span>
                    <span class="oldPrice">￥${(ele.price * 1.2).toFixed(2)}</span>
                    <div><span class="soldText">已售${ele.num}%</span>
                    <span class="soldSpan"><span style="width: 87.12px;">
                    </span></span></div>
                    <a class="button" target="_blank" onclick="Goods.addCart(${ele.id},1)">立即抢购</a></div></div >`;
                });
                // 将数据追加到父级元素中
                $('.divs').innerHTML = str;
            }
        })
    }
    // 数据加入购物车方法
    // 参数1: 当前商品id
    // 参数2: 当前商品数量
    static addCart(goodsId,goodsNum){
        // 判断未登录状态时
        if(localStorage.getItem('user')){
            // 将数据储存到数据库中
            // 参数: 同上
            Goods.setDataBase(goodsId,goodsNum);
        }else{
            // 将参数储存到浏览器中
            // 参数:同上
            Goods.setLocal(goodsId,goodsNum);
        }
    }
    // 储存到数据库方法
    static setDataBase(goodsId,goodsNum){
        // 回去当前用户id
        let userId = localStorage.getItem('userId');
        // 发送post请求,将数据进行储存
        ajax.post('./server/goods.php?fn=add',{
            userId:userId,gId:goodsId,gNum:goodsNum
        // 请求成功时返回值 -- res
        }).then(res =>{
            console.log(res);
        });
    }
    // 储存在浏览器中的方法
    // 参数1:商品id
    // 参数2:商品数量
    static setLocal(goodsId,goodsNum){
        // 获取本地储存里面的购物车数据
        let carts = localStorage.getItem('carts');
        // 判断有数据时
        if(carts){
            // 将数据转化为对象
            carts = JSON.parse(carts);
            // 遍历对象
            for(let gId in carts){
                // 判断购物车里面是否有当前商品
                if(gId == goodsId){
                    // 如果有该数据,将数据的数量储存
                    goodsNum = carts[gId] - 0 + goodsNum;
                }
                // console.log(goodsNum); 
            }
            // 如果当前面购物车没有该数据,就将该数量添加到购物车中
            carts[goodsId] = goodsNum;
            // 将当前购物车中的数据储存到本地储存中
            localStorage.setItem('carts',JSON.stringify(carts))
        // 当购物车里面没有数据时，就添加数据
        }else{
            // 将当前商品数据储存
            let goodsCart = { [goodsId]:goodsNum };
            // 将对象数据转化为json格式数据
            goodsCart = JSON.stringify(goodsCart);
            // 将商品数据储存到本地储存
            localStorage.setItem('carts',goodsCart);
        }
    }
    // 登录的方法
    login(){
        // 发送ajax请求，让后台验证用户名和密码
        // 验证成功则登录,将用户名保存到浏览器 
        // 设置当前用户名
        localStorage.setItem('user','zs');
        // 设置当前用户id
        localStorage.setItem('userId',1);
    }
    // 退出的方法
    exit(){
        // 删除当前用户名
        localStorage.removeItem('user');
        // 删除当前用户id
        localStorage.removeItem('userId');
    }
}
new Goods;