/**
 * Created by lukaijie on 16/4/27.
 */

var pool = require('../libs/mysql'),
    request = require('request'),
    utool = require('../libs/utool'),
    redis = require('../libs/redis'),
    config = require('../libs/config'),
    logger = require('../libs/logger'),
    u = require("underscore");

/**
 * @method 主页面
 * @author lukaijie
 * @datetime 16/5/12
 */
exports.oauth = function (req, res, next) {
    var params = {
        code: req.query.code,
        client_id: config.oauth.client_id,
        client_secret: config.oauth.client_secret
    }
    //session中没有shopexid
    //if (!utool.checkSession(req.session)) {

    request.post('https://openapi.shopex.cn/oauth/token?grant_type=authorization_code&code=' + params.code + '&client_id=' + params.client_id + '&client_secret=' + params.client_secret, function (error, response, result) {
      
        result = JSON.parse(result);
          console.log(result)
        if (result.result == 'error') { //oauth服务器返回错误
            console.log(result)
            res.redirect('/');
            return;
        }
        utool.reqErr(error, response, res, result, function () {
            console.log(result)

            req.session['user'] = {
                shopexid: result.data.shopexid,
                eid: result.data.eid,
                fd_uid: result.data.eid,
                realName: result.data.realName,
                username: result.data.username
            }
            checkShopexId(result.data.eid, req.session.user, req, res, function (data) {

                req.session.user['app_id'] = data.fd_id;    //存储应用的id
                req.session.user['app_key'] = data.fd_key;  //存储应用的appkey
                req.session.user['app_secret'] = data.fd_secret;  //存储应用的appSecret

                console.log(req.session);
                res.redirect('/apis');
            });
        })
    });
}

/**
 * @method 根据shopexid获取所有的服务
 * @author lukaijie
 * @datetime 16/5/13
 */
exports.apis = function (req, res) {
    //查询服务
    var ErrInfo = {
        method: 'apis',
        memo: '查询所有的全平台可见并且是已经上线的服务',
        params: {}
    }
    utool.sqlExect('SELECT * FROM t_service WHERE fd_visible= ? AND fd_status= ? ORDER BY fd_create_time DESC', [1, 4], ErrInfo, function (err, result) {
        if (err) {
            utool.errView(res, err);
        }
        else {
            if (result.length > 0) {
                res.redirect('/apis/db/' + result[0].fd_serviceid);
                return;
            }
            res.render('home/index', {
                nav: 'api',
                title: 'index',
                apis: result,
                uid: (typeof req.session.user != 'undefined') ? req.session.user.fd_uid : null,
                shopexid: (typeof req.session.user != 'undefined') ? req.session.user.shopexid : "",
                appkey: (typeof req.session.user != 'undefined') ? req.session.user.app_key : "",
                appSecret: (typeof req.session.user != 'undefined') ? req.session.user.app_secret : ""
            });
        }
    });
}

/**
 * @method 根据服务id查询所有的服务列表
 * @author lukaijie
 * @datetime 16/5/13
 */
exports.apisOfService = function (req, res) {
    //查询所有的已上线并且全平台可见的服务
    var ErrInfo = {
        method: 'apisOfService',
        memo: '根据服务id查询所有的服务列表',
        params: {fd_serviceid: req.params.sid}
    }
    utool.sqlExect('SELECT * FROM t_service WHERE fd_visible= ? AND fd_status= ? ORDER BY fd_create_time DESC', [1, 4], ErrInfo, function (err, result) {
        if (err) {
            utool.errView(res, err);
        }
        else {
            var ErrInfo = {
                method: 'apisOfService',
                memo: '根据服务id查询服务明细',
                params: {fd_serviceid: req.params.sid}
            }
            var servicelist = result;
            utool.sqlExect('SELECT * FROM t_service WHERE fd_serviceid=? AND fd_visible= ? AND fd_status= ? ORDER BY fd_create_time DESC', [req.params.sid, 1, 4], ErrInfo, function (err, result) {
                if (err) {
                    utool.errView(res, err);
                }
                else {
                    var service;
                    try {
                        service = JSON.parse(result[0].fd_config);
                    }
                    catch (e) {
                        service = {};
                    }
                    res.render('home/apilist', {
                        nav: 'api',
                        navs: [
                            {
                                name: '文档中心',
                                url: ''
                            },
                            {
                                name: 'API类目',
                                url: '/apis'
                            },
                            {
                                name: u.where(servicelist, {fd_serviceid: req.params.sid})[0].fd_name,
                                url: null
                            }
                        ],
                        list: servicelist,
                        service: service,
                        serviceid: req.params.sid,
                        servicename: u.where(servicelist, {fd_serviceid: req.params.sid})[0].fd_name,
                        uid: (typeof req.session.user != 'undefined') ? req.session.user.fd_uid : null,
                        shopexid: (typeof req.session.user != 'undefined') ? req.session.user.shopexid : "",
                        appkey: (typeof req.session.user != 'undefined') ? req.session.user.app_key : "",
                        appSecret: (typeof req.session.user != 'undefined') ? req.session.user.app_secret : ""
                    });
                }
            });
        }
    });

}

/**
 * @method detailOfApi
 * @author lukaijie
 * @datetime 16/5/27
 */
exports.detailOfApi = function (req, res) {
    var ErrInfo = {
        method: 'detailOfApi',
        memo: '根据fd_serviceid查询api明细',
        params: {fd_serviceid: req.params.sid}
    }
    utool.sqlExect('SELECT * FROM t_service WHERE fd_serviceid=? AND fd_visible= ? AND fd_status= ? ORDER BY fd_create_time DESC', [req.params.sid, 1, 4], ErrInfo, function (err, result) {
        if (err) {
            utool.errView(res, err);
        }
        else {
            var service;
            try {
                service = JSON.parse(result[0].fd_config);
            }
            catch (e) {
                service = {};
            }
            res.render('home/apidetail', {
                nav: 'api',
                navs: [
                    {
                        name: '文档中心',
                        url: ''
                    },
                    {
                        name: 'API类目',
                        url: '/apis'
                    },
                    {
                        name: u.where(result, {fd_serviceid: req.params.sid})[0].fd_name,
                        url: null
                    }
                ],
                service: service,
                serviceid: req.params.sid,
                rapi: req.query.api,
                app_gateway_online_http: config.app_gateway_online_http,
                app_gateway_online_https: config.app_gateway_online_https,
                app_gateway_sndbox_http: config.app_gateway_sndbox_http,
                app_gateway_sndbox_https: config.app_gateway_sndbox_https,
                uid: (typeof req.session.user != 'undefined') ? req.session.user.fd_uid : null,
                shopexid: (typeof req.session.user != 'undefined') ? req.session.user.shopexid : "",
                appkey: (typeof req.session.user != 'undefined') ? req.session.user.app_key : "",
                appSecret: (typeof req.session.user != 'undefined') ? req.session.user.app_secret : ""
            });
        }
    });
}

/**
 * @method 检查数据库中是否有shopexid,如果没有插入一条新的数据
 * @author lukaijie
 * @datetime 16/5/13
 */
function checkShopexId(eid, obj, req, res, callback) {
    var ErrInfo = {
        method: 'checkShopexId',
        memo: '根据fd_eid查询用户信息',
        params: {fd_eid: eid}
    }
    utool.sqlExect('SELECT * FROM t_user WHERE fd_eid= ?', eid, ErrInfo, function (err, result) {
        if (err) {
            utool.errView(res, err);
        }
        else {

            if (result.length == 0) { //如果没有帐号
                var data = {
                    fd_uid: obj.fd_uid,             //  --  用户id，应通过序号表获得
                    fd_utype: 2,                    //  --  用户类型，1-普通用户，2-开发者用户， 100-管理员
                    fd_uname: obj.realName,         //  --  用户名字
                    fd_account: obj.username,       //  --  用户账号
                    fd_shopexid: obj.shopexid,      //  --  商派shopexid，商派统一登录时用
                    fd_eid: obj.eid,                //  --  eid
                    fd_account_type: 1,             //  --  账户类型 1-为shopexid， 2-为平台注册用户
                    fd_last_time: new Date()        //  --  最后登录时间
                }
                var ErrInfo = {
                    method: 'checkShopexId',
                    memo: '检查数据库中是否有fd_eid,如果没有插入一条新的数据',
                    params: data
                }
                utool.sqlExect('INSERT INTO t_user SET ?', data, ErrInfo, function (err, result) {
                    if (err) {
                        utool.errView(res, err);
                    }
                });

                //第一次登录,创建一个默认app;
                var idata = {
                    fd_id: utool.randomString(7), //fd_id 生成7位随机字符串
                    fd_uid: req.session.user.fd_uid,
                    fd_name: 'default_app',
                    fd_status: 1,    //服务状态 0-禁用，1-可用
                    fd_key: utool.randomString(7), //fd_key 生成7位随机字符串
                    fd_secret: utool.randomString(20), //fd_secret 生成20位随机字符串
                    fd_sandbox: 0, //是否沙箱  0-正常用户app, 1-沙箱测试app,系统初始化自动创建
                    fd_type: 1, //默认app标志
                    fd_description: '默认应用'
                }
                utool.sqlExect('INSERT INTO t_app SET ?', idata, ErrInfo, function (err, result) {
                    if (err) {
                        utool.errView(res, err);
                    }
                    else {
                        //req.session['app_id'] = idata.fd_id;    //存储应用的id
                        //req.session['app_key'] = idata.fd_key;  //存储应用的appkey
                        //req.session['app_secret'] = idata.fd_secret;  //存储应用的appSecret
                        redis.pub({
                            "type": "app_add",
                            "from": "website",
                            "content": idata.fd_id
                        });
                        callback(idata);
                    }
                });
            }
            else {
                //查询默认app的id key screct
                console.log(obj);

                if (result[0].fd_utype == 1) { // 如果不是apiprovider 账户,跳转到提醒页面
                    console.log('logout-provider')
                    //res.redirect('http://openapi.shopex.cn/oauth/logout?redirect_uri=' + config.api_provider.logout_url);
                    utool.errView(res, '开发者帐号不能登录此平台');
                }
                utool.sqlExect('SELECT * FROM t_app WHERE fd_uid= ? AND fd_type = ?', [obj.fd_uid, 1], ErrInfo, function (err, result1) {
                    if (err) {
                        utool.errView(res, err);
                    }
                    else {
                        console.log(result1);
                        //req.session['app_key'] = result1[0].fd_id;
                        callback(result1[0]);
                    }
                });

            }
        }
    });
}