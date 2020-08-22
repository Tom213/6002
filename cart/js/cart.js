class Cart{
    constructor(){
        this.list();
        // 给全选按钮绑定事件
        all('.check-all')[0].addEventListener('click',this.checkAll);
        all('.check-all')[1].addEventListener('click',this.checkAll)
    }
    // 生成购物车列表方法
    list(){
        // 根据用户id判断登录账户,获取对应商品id
        let userId = localStorage.getItem('userId');
        // 声明一个字符串储存商品id
        let cartGoodsId = '';
        // 判断当账户登录时
        if(userId){
            // 发送get请求,携带参数(用户id)
            ajax.get('./server/cart.php',{fn:'getGoodsId',userId:userId}).then(res => {
                // 将后端响应的数据转化为对象
                // data  响应数据
                // stateCode  成功状态码
                let {data,stateCode} = JSON.parse(res);
                // 判断请求成功时
                if(stateCode == 200){
                    // 后端没有响应数据直接返回不再执行之后程序
                    if(!data){
                        return;
                    }
                    // 声明一个对象储存商品和对应数量
                    let cartIdNum = {};
                    // 遍历后端响应的数据
                    data.forEach(ele =>{
                        // 将商品id拼接 ',' 储存到变量中
                        cartGoodsId += ele.productId + ',';
                        // 将商品id和对应商品数量作为键值对储存到一个对象中
                        cartIdNum[ele.productId] = ele.num;
                    })
                    // 调用购车列表渲染方法
                    // 参数1: 商品id
                    // 参数2: 商品数量
                    Cart.getCartGoods(cartGoodsId,cartIdNum);
                }
            })
        // 判断当当用户登录时(将数据储存到本地储存)
        }else{
            // 获取本地储存中的购物车数据
            let cartGoods = localStorage.getItem('carts');
            // 判断如果没有数据的话直接返回不再执行
            if(!cartGoods){
                return;
            } 
            // 将数据转化为对象
                cartGoods = JSON.parse(cartGoods);
            // 将对象进行遍历
            for(let gId in cartGoods){
                // 将当前商品id拼接 ','储存到变量中
                // console.log(gId);
                cartGoodsId += gId + ',';
            }
            // 调用购物车列表渲染方法
            // 参数:商品id
            Cart.getCartGoods(cartGoodsId);
        }
    }
    // 购物车列表渲染方法
    // 参数1: 商品id
    // 参数2: 储存未登录时购物车商品数量
    static getCartGoods(gId,cartIds = ''){
        // 判断如果是登录状态使用数据库默认数量
        // 如果未登录就从浏览器中(本地储存)获取
        cartIds = cartIds || JSON.parse(localStorage.getItem('carts'));
        // 发送post请求,携带参数(当前商品id)
        // console.log(cartIds);
        ajax.post('./server/cart.php?fn=lst',{goodsId:gId}).then(res => {
            // console.log(res);
            // 将后端响应数据转化为对象
            let {data,stateCode} = JSON.parse(res);
            // 判断请求成功时
            if(stateCode == 200){
                // 声明一个变量储存购物车列表标签
                let str = '';
                // 遍历对象
                data.forEach(ele => {
                    // 设置购物车列表标签
                    str += `
                        <tr>
                            <td class="checkbox">
                            <input class="check-one check" type="checkbox"/ onclick="Cart.goodsCheck(this)">
                        </td>
                        <td class="goods">
                            <img src="${ele.goodsImg}" alt=""/>
                            <span>${ele.goodsName}</span>
                        </td>
                        <td class="price">
                            ${ele.price}
                        </td>
                        <td class="count">
                            <span class="reduce" onclick="Cart.delGoodsNum(this,${ele.id})">-</span>
                            <input class="count-input" type="text" value="${cartIds[ele.id]}"/>
                            <span class="add" onclick="Cart.addGoodsNum(this,${ele.id})">+</span>
                        </td>
                        <td class="subtotal">
                            ${(ele.price * cartIds[ele.id]).toFixed(2)}
                        </td>
                        <td class="operation">
                            <span class="delete" onclick='Cart.delGoods(this,${ele.id})'>删除</span>
                        </td>
                    </tr>
                    `
                })
                // 将购物车列表标签追加到页面中
                $('tbody').innerHTML = str;
            }
        })
    }

    // 删除商品数据方法
    // 参数1: 当前元素节点
    // 参数2: 当前商品id
    static delGoods(eleObj,gId){
        // 获取当前用户名id
        let userId = localStorage.getItem('userId');
        // 判断当前用户是否登录
        if(userId){
            // 以登录时,发送get方式传参
            // 携带参数(当前商品id)
            ajax.get('./server/cart.php',{fn:'delete',goodsId:gId,userId:userId}).then(res =>{
                // res 后端响应值
                console.log(res);
            })
        // 判断用户登录时
        }else{
            // 获取本地储存的商品数据
            // 获取到的是当前商品id和对象的数量
            let cartGoods = JSON.parse(localStorage.getItem('carts'));
            // 删除当前的商品
            // delete 对象的删除的方法
            delete cartGoods[gId];
            // 将删除好的购物车列表数据在储存到本地浏览器
            localStorage.setItem('carts',JSON.stringify(cartGoods));
        }
        // 删除当前商品对应的tr元素
        eleObj.parentNode.parentNode.remove();
        // 调用价格计算方法
        Cart.cpCount();
    }
    // 价格计算方法
    static cpCount(){
        // 获取页面中的每个商品的复选框
        let checkOne = all('.check-one');
        // 声明变量储存选中商品数量
        let count = 0;
        // 声明变量储存选中商品价格
        let xj = 0;
        // 遍历所有的商品复选框
        checkOne.forEach(ele =>{
            // 判断当前复选框如果选中时
            if(ele.checked){
                // console.log(ele);
                // 获取当前复选框对应的tr元素
                let trObj = ele.parentNode.parentNode;
                // 获取当前商品数量
                let tmpCount = trObj.getElementsByClassName('count-input')[0].value
                // console.log(tmpCount);
                // 获取当前商品总共价格
                let tmpXj = trObj.getElementsByClassName('subtotal')[0].innerHTML;
                // console.log(tmpXj);
                // 获取当前所有选中商品
                count = tmpCount - 0 + count;
                xj = tmpXj - 0 + xj;
                // console.log(count);
            }
        })
        // 将当前选中商品数量写入对应标签中
        $('#selectedTotal').innerHTML = count;
        // 将当前选中商品价格写入对应标签中
        $('#priceTotal').innerHTML = parseInt(xj * 100) / 100;
    }

    // 商品数量增加方法
    // 参数1：当前事件源
    // 参数2：当前商品id
    static addGoodsNum(eleObj,gId){
        // 获取当前像是商品数量文本框
        let inputNumObj = eleObj.previousElementSibling;
        // 将当前商品数量+1(每次点击商品数量+1)
        inputNumObj.value = inputNumObj.value - 0 + 1;
        // 判断当前登录状态
        // 用户登录时获取商品数量
        if(localStorage.getItem('user')){
            // 调用数据库获取数量方法
            Cart.updateCart(gId,inputNumObj.value);
        // 判断当前用户未登录时
        }else{
            // 调用未登录时在本地储存的当前商品数量方法
            Cart.updateLocal(gId,inputNumObj.value);
        }
        // 获取储存但单价的元素节点
        let priceObj = eleObj.parentNode.previousElementSibling;
        // 将选中时所有商品总价写入总价的元素节点中
        // 总价保存两位小数点
        eleObj.parentNode.nextElementSibling.innerHTML = (priceObj.innerHTML * inputNumObj.value).toFixed(2);
        // 调用计算价格和数量方法
        Cart.cpCount();
    }
        // 商品数量减少方法
    // 参数1：当前事件源
    // 参数2：当前商品id
    static delGoodsNum(eleObj,gId){
        // 获取当前像是商品数量文本框
        let inputNumObj = eleObj.nextElementSibling;
        // 将当前商品数量-1(每次点击商品数量-1)
        inputNumObj.value = inputNumObj.value - 1;
        if(inputNumObj.value == 0){
            eleObj.onclick = null;
        }
        // 判断当前登录状态
        // 用户登录时获取商品数量
        if(localStorage.getItem('user')){
            // 调用数据库获取数量方法
            Cart.updateCart(gId,inputNumObj.value);
        // 判断当前用户未登录时
        }else{
            // 调用未登录时在本地储存的当前商品数量方法
            Cart.updateLocal(gId,inputNumObj.value);
        }
        // 获取储存但单价的元素节点
        let priceObj = eleObj.parentNode.previousElementSibling;
        console.log(priceObj);
        // 将选中时所有商品总价写入总价的元素节点中
        // 总价保存两位小数点
        eleObj.parentNode.nextElementSibling.innerHTML = (priceObj.innerHTML * inputNumObj.value).toFixed(2);
        console.log(priceObj);
        // 调用计算价格和数量方法
        Cart.cpCount();
    }
    // 在数据库中获取当前商品数据方法
    // 参数1: 当前商品id
    // 参数2：当前商品数量
    static updateCart(gId,gNum){
        // 获取当前用户id
        let id = localStorage.getItem('userId');
        // 发送get请求，携带参数(当前商品id,当前商品数量,当前用户id)
        ajax.get('./server/cart.php',{fn:'update',goodsId:gId,goodsNum:gNum,userId:id}).then(res => {
            console.log(res);
        })
    }
    // 在本地储存获取商品数据方法
    // 参数1：当前商品id
    // 参数2：当前商品数量
    static updateLocal(gId,gNum){
        // 获取本地储存的商品数据
        let cartGoods = JSON.parse(localStorage.getItem('carts'));
        // 设置当前商品的数量
        cartGoods[gId] = gNum;
        // 将设置好的商品数据在储存到本地浏览器
        localStorage.setItem('carts',JSON.stringify(cartGoods));
    }

    // 全选商品的方法
    checkAll(){
        // 获取当前商品的选中状态
        let state = this.checked;
        // 实现两个全选按钮的关联
        all('.check-all')[this.getAttribute('all-key')].checked = state;
        // 获取每个单个商品选择框
        let checkGoods = all('.check-one');
        // 遍历所有商品选择框
        checkGoods.forEach(ele => {
            // console.log(state);
            // 将全选框的选择状态设置给每一个商品选择框
            ele.checked = state;
        })
        // 调用商品计算价格和数量方法
        Cart.cpCount();
    }
    // 单选实现的方法
    // 参数：当前事件源
    static goodsCheck(eleObj){
        // 获取当前商品选择框
        let state = eleObj.checked;
        // 判断当前商品选择框未选中时
        if(!state){
            // 给每个全选按钮设置为未选中
            all('.check-all')[0].checked = false;
            all('.check-all')[1].checked = false;
        // 当前商品选框选中时
        }else{
            // 获取每一个商品选择框
            let checkOne = all('.check-one');
            // 获取商品选择框的个数
            let len = checkOne.length;
            // 计算选中的选择框
            let checkCount = 0;
            // 遍历所有商品的选择框
            checkOne.forEach(ele => {
                // 如果当前商品选中时，选中框的数量+1
                ele.checked && checkCount++;
            })
            // console.log(all('.check-all'));
            // 如果所有的商品选择框 == 选中商品选择框时
            if(len == checkCount){
                // 所有全选按钮设置为选中状态
                all('.check-all')[0].checked = true;
                all('.check-all')[1].checked = true;
            }
        }
        Cart.cpCount();
    }
}
new Cart;