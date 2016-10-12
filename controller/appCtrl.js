/**
 * Created by lukaijie on 16/5/13.
 */
var pool = require('../libs/mysql'),
    request = require('request'),
    utool = require('../libs/utool'),
    redis = require('../libs/redis'),
    config = require('../libs/config'),
    logger = require('../libs/logger'),
    prism = require('prism-js');

/**
 * @method 获取我的所有服务,分页查询
 * @author lukaijie
 * @datetime 16/5/19
 */
exports.getMyApp = function (req, res) {
    //查询数据
    var pagenum = typeof req.params.pagenum == 'undefined' ? 1 : req.params.pagenum;
    var fd_uid = req.session.user.fd_uid;

    var rdata = {
        apis: [],
        count: 0,
        pagenum: pagenum,    //页码
        pagesize: 10,        //页大小
        pages: 1             //页数
    }

    var ErrInfo = {
        method: 'getMyApp',
        memo: '根据fd_uid查询所有的服务数',
        params: {fd_uid: fd_uid}
    }
    //根据shopexid查询对应的应用,分页查询
    var pagesize = rdata.pagesize;
    var pageindex = (pagenum - 1) * pagesize;
    utool.sqlExect('SELECT COUNT(*) as counts FROM t_service WHERE fd_uid = ?', fd_uid, ErrInfo, function (err, result) {
        if (err) {
            utool.errView(res, err);
        }
        else {
            rdata.count = result[0].counts;
            rdata.pages = Math.ceil(rdata.count / rdata.pagesize);

            var ErrInfo = {
                method: 'getMyApp',
                memo: '分页查询数据',
                params: {fd_uid: fd_uid}
            }
            utool.sqlExect('SELECT * FROM t_service WHERE fd_uid = ? ORDER BY fd_create_time DESC LIMIT ?,?', [fd_uid, pageindex, pagesize], ErrInfo, function (err, result) {
                if (err) {
                    utool.errView(res, err);
                }
                else {
                    rdata.apis = result;
                    res.render('app/index', {
                        nav: 'service',
                        navs: [
                            {
                                name: '我的服务',
                                url: '/my/app'
                            },
                            {
                                name: '服务列表',
                                url: null
                            }
                        ],
                        rdata: rdata,
                        uid: req.session.user.fd_uid,
                        shopexid: req.session.user.shopexid,
                        app_id: req.session.user.app_id,
                        appkey: req.session.user.app_key,
                        appSecret: req.session.user.app_secret
                    });
                }
            });
        }
    });
}

/**
 * @method 返回创建服务页面
 * @author lukaijie
 * @datetime 16/5/19
 */
exports.addMyApp = function (req, res) {
    res.render('app/addapp', {
        nav: 'service',
        navs: [
            {
                name: '我的服务',
                url: '/my/app'
            },
            {
                name: '服务列表',
                url: '/my/app'
            },
            {
                name: '创建服务',
                url: null
            }
        ],
        action: 'add',
        uid: req.session.user.fd_uid,
        shopexid: req.session.user.shopexid,
        appkey: req.session.user.app_key,
        appSecret: req.session.user.app_secret
    });
}

/**
 * @method 返回更新服务内容页面
 * @author lukaijie
 * @datetime 16/5/20
 */
exports.updateMyAppPage = function (req, res) {
    //根据fd_serviceid查询服务内容
    var ErrInfo = {
        method: 'updateMyAppPage',
        memo: '根据fd_serviceid查询服务内容',
        params: {fd_serviceid: req.params.id}
    }
    utool.sqlExect('SELECT * FROM t_service WHERE fd_serviceid = ?', req.params.id, ErrInfo, function (err, result) {
        if (err) {
            utool.errView(res, err);
        }
        else {
            res.render('app/addapp', {
                nav: 'service',
                navs: [
                    {
                        name: '我的服务',
                        url: '/my/app'
                    },
                    {
                        name: '服务列表',
                        url: '/my/app'
                    },
                    {
                        name: '编辑服务',
                        url: null
                    }
                ],
                list: result,
                action: 'edit',
                uid: req.session.user.fd_uid,
                shopexid: req.session.user.shopexid,
                appkey: req.session.user.app_key,
                appSecret: req.session.user.app_secret
            });
        }
    });
}

/**
 * @method 更新服务内容
 * @author lukaijie
 * @datetime 16/5/20
 */
exports.updateMyApp = function (req, res) {
    var t_service = {
        fd_serviceid: req.body.fd_serviceid,
        fd_name: req.body.fd_name,
        fd_uid: req.session.user.fd_uid,
        fd_description: req.body.fd_description,
        fd_remark: req.body.fd_remark
    }
    var ErrInfo = {
        method: 'updateMyApp',
        memo: '根据fd_serviceid更新服务内容',
        params: {
            fd_name: t_service.fd_name,
            fd_description: t_service.fd_description,
            fd_remark: t_service.fd_remark,
            fd_serviceid: t_service.fd_serviceid,
            fd_uid: t_service.fd_uid
        }
    }
    utool.sqlExect('UPDATE t_service SET fd_name = ? , fd_description= ? , fd_remark= ? WHERE fd_serviceid= ? AND fd_uid= ?', [
        t_service.fd_name, t_service.fd_description, t_service.fd_remark, t_service.fd_serviceid, t_service.fd_uid
    ], ErrInfo, function (err, result) {
        if (err) {
            utool.errView(res, err);
        }
        else {
            redis.pub({
                "type": "service_update",
                "from": "website",
                "content": t_service.fd_serviceid
            });
            res.redirect('/my/app');
        }
    });
}

/**
 * @method 刷新服务
 * @author lukaijie
 * @datetime 16/6/2
 */
exports.refreshMyApp = function (req, res) {
    redis.pub({
        "type": "service_update",
        "from": "website",
        "content": req.body.fd_serviceid
    });
    return res.json({status: 0, message: '服务刷新成功!'})
}

/**
 * @method 保存新建的服务
 * @author lukaijie
 * @datetime 16/5/19
 */
exports.saveMyApp = function (req, res) {
    var param = {
        fd_serviceid: utool.randomString(7), //fd_serviceid 生成7位随机字符串
        fd_name: req.body.fd_name,
        fd_uid: req.session.user.fd_uid,
        fd_status: 1,    //服务状态 0-已禁用，1-未上线, 2-申请下线, 3-申请上线, 4-已上线 (默认为1)
        fd_description: req.body.fd_description,
        fd_config: '',
        fd_visible: 0,    //是否全平台可见（0-不可见 1-可见  默认为0）
        fd_remark: req.body.fd_remark
    }
    var ErrInfo = {
        method: 'saveMyApp',
        memo: '保存新建服务',
        params: param
    }
    utool.sqlExect('INSERT INTO t_service SET ? ', param, ErrInfo, function (err, result) {
        if (err) {
            utool.errView(res, err);
        }
        else {
            redis.pub({
                "type": "service_add",
                "from": "website",
                "content": param.fd_serviceid
            });
            res.redirect('/my/app');
        }

        //自动绑定新建的服务到默认的app
        var param1 = {
            fd_status: 2,                                       //--  申请类型类型（1申请使用，2、审核通过）
            fd_serviceid: param.fd_serviceid,			      //--  服务的id
            fd_app_id: req.session.user.app_id			      //--	应用id
        }
        var ErrInfo1 = {
            method: 'saveMyApp',
            memo: '自动绑定新建的服务到默认的app',
            params: param1
        }
        utool.sqlExect('INSERT INTO t_app_service SET ? ', param1, ErrInfo1, function (err, result) {
            if (err) {
                utool.errView(res, err);
            }
            else {
                redis.pub({
                    "type": "service_add",
                    "from": "website",
                    "content": param.fd_serviceid
                });
            }
        });
    });
}

/**
 * @method 删除服务;只能删除未上线的服务
 * @author lukaijie
 * @datetime 16/5/23
 */
exports.deleteMyApp = function (req, res) {
    var param = {
        fd_serviceid: req.body.fd_serviceid
    }
    var ErrInfo = {
        method: 'deleteMyApp',
        memo: '查询服务状态,已下线的服务才能删除',
        params: param
    }
    
    utool.sqlExect('SELECT * FROM t_service WHERE fd_serviceid = ?', param.fd_serviceid, ErrInfo, function (err, result) {
        if (err) {
            utool.errView(res, err);
        }
        else {
            if (result[0].fd_status == 1) { //已下线
                var ErrInfo = {
                    method: 'deleteMyApp',
                    memo: '删除服务',
                    params: param
                }
                utool.sqlExect('DELETE FROM t_service WHERE fd_serviceid = ? AND fd_status = 1', param.fd_serviceid, ErrInfo, function (err, result) {
                    if (err) {
                        utool.errView(res, err);
                    }
                    else {
                        res.json({status: 0, message: ''})
                    }
                });
            }
            else {
                redis.pub({
                    "type": "service_delete",
                    "from": "website",
                    "content": param.fd_serviceid
                });
                res.json({status: 101, message: '服务没有下线,不能删除!'})
            }
        }
    });
}

/**
 * @method 申请上线
 * @author lukaijie
 * @datetime 16/5/20
 */
exports.applyMyApp = function (req, res) {
    var t_service_apply = {
        fd_type: req.body.code == 2 ? 0 : 1,         	//--  申请类型类型（0申请下线，1申请上线，3、审核通过）
        fd_uid: req.session.user.fd_uid,      		//--  申请者的uid
        fd_serviceid: req.body.fd_serviceid				//--  服务的id
    }
    var ErrInfo = {
        method: 'applyMyApp',
        memo: '根据fd_uid查询是否存在申请列表',
        params: {fd_uid: t_service_apply.fd_uid}
    }
    utool.sqlExect('SELECT COUNT(*) as counts FROM t_service_apply WHERE fd_serviceid = ?', t_service_apply.fd_serviceid, ErrInfo, function (err, result) {
        if (err) {
            utool.errView(res, err);
        }
        else {
            if (result[0].counts == 0) {
                //插入新的申请
                var ErrInfo = {
                    method: 'applyMyApp',
                    memo: '插入新的上下线申请',
                    params: t_service_apply
                }
                utool.sqlExect('INSERT INTO t_service_apply SET ?', t_service_apply, ErrInfo, function (err, result) {
                    if (err) {
                        utool.errView(res, err);
                    }
                    else {
                        var ErrInfo = {
                            method: 'applyMyApp',
                            memo: 't_service申请上下线',
                            params: {fd_status: req.body.code, fd_serviceid: t_service_apply.fd_serviceid}
                        }
                        utool.sqlExect('UPDATE t_service SET fd_status = ? WHERE fd_serviceid= ?', [req.body.code, t_service_apply.fd_serviceid], ErrInfo, function (err, result) {
                            if (err) {
                                utool.errView(res, err);
                            }
                            else {
                                redis.pub({
                                    "type": "service_update",
                                    "from": "website",
                                    "content": t_service_apply.fd_serviceid
                                });
                                res.json({'status': 0})
                            }
                        })
                    }
                });
            }
            else {
                //update申请
                var ErrInfo = {
                    method: 'applyMyApp',
                    memo: 't_service申请上下线',
                    params: {fd_type: t_service_apply.fd_type, fd_serviceid: t_service_apply.fd_serviceid}
                }
                utool.sqlExect('UPDATE t_service_apply SET fd_type = ? WHERE fd_serviceid= ?', [t_service_apply.fd_type, t_service_apply.fd_serviceid], ErrInfo, function (err, result) {
                    if (err) {
                        utool.errView(res, err);
                    }
                    else {
                        var ErrInfo = {
                            method: 'applyMyApp',
                            memo: 't_service申请上下线',
                            params: {fd_status: req.body.code, fd_serviceid: t_service_apply.fd_serviceid}
                        }
                        utool.sqlExect('UPDATE t_service SET fd_status = ? WHERE fd_serviceid= ?', [req.body.code, t_service_apply.fd_serviceid], ErrInfo, function (err, result) {
                            if (err) {
                                utool.errView(res, err);
                            }
                            else {
                                redis.pub({
                                    "type": "service_update",
                                    "from": "website",
                                    "content": t_service_apply.fd_serviceid
                                });
                                res.json({'status': 0})
                            }
                        })
                    }
                })
            }
        }
    });
}

/**
 * @method 检查服务名称是否重复;检查规则,同一服务创建者下的服务名称唯一
 * @author lukaijie
 * @datetime 16/5/23
 */
exports.checkMyAppName = function (req, res) {
    var param = {
        fd_name: req.body.fd_name,
        fd_uid: req.session.fd_uid,
        fd_serviceid: req.body.fd_serviceid
    }
    var ErrInfo = {
        method: 'checkMyAppName',
        memo: '检查服务名称是否重复;检查规则,同一服务创建者下的服务名称唯一',
        params: param
    }
    utool.sqlExect('SELECT * FROM t_service WHERE fd_name= ? AND fd_uid= ?', [param.fd_name, param.fd_uid], ErrInfo, function (err, result) {
        if (err) {
            utool.errView(res, err);
        }
        else {
            if (result.length == 0 || (result.length == 1 && result[0].fd_serviceid == param.fd_serviceid)) {
                res.json({status: 0, message: ''});
            }
            else {
                res.json({status: 100, message: '服务名称已经存在!'});
            }
        }
    })
}

/**
 * @method
 * @author lukaijie
 * @datetime 16/5/23
 */
exports.getMyAppSetup = function (req, res) {
    //根据fd_serviceid查询服务内容
    var ErrInfo = {
        method: 'getMyAppSetup',
        memo: '根据fd_serviceid查询服务内容',
        params: {fd_serviceid: req.params.serviceid}
    }
    utool.sqlExect('SELECT * FROM t_service WHERE fd_serviceid = ?', req.params.serviceid, ErrInfo, function (err, result) {
        if (err) {
            utool.errView(res, err);
        }
        else {
            res.render('app/' + req.params.menu, {
                nav: 'service',
                navs: [
                    {
                        name: '我的服务',
                        url: '/my/app'
                    },
                    {
                        name: '服务列表',
                        url: '/my/app'
                    },
                    {
                        name: '服务概览',
                        url: null
                    }
                ],
                list: result,
                uid: req.session.user.fd_uid,
                shopexid: req.session.user.shopexid,
                appkey: req.session.user.app_key,
                appSecret: req.session.user.app_secret
            });
        }
    });
}

/**
 * @method 设置是否全平台可见
 * @author lukaijie
 * @datetime 16/5/23
 */
exports.applyMyAppVisible = function (req, res) {
    var ErrInfo = {
        method: 'getMyAppSetup',
        memo: '根据fd_serviceid查询服务内容',
        params: {fd_serviceid: req.body.fd_serviceid}
    }
    utool.sqlExect('update t_service set fd_visible=(1 - fd_visible) WHERE fd_serviceid = ? ', req.body.fd_serviceid, ErrInfo, function (err, result) {
        if (err) {
            res.json({status: -1, message: err});
        }
        else {
            res.json({status: 0, message: ''});
        }
    });
}

/**
 * @method 添加服务的API
 * @author lukaijie
 * @datetime 16/5/23
 */
exports.addMyAppAPI = function (req, res) {
    res.render('app/addapi', {
        nav: 'service',
        navs: [
            {
                name: '我的服务',
                url: '/my/app'
            },
            {
                name: '服务列表',
                url: '/my/app'
            },
            {
                name: '服务概览',
                url: '/my/app/p/' + req.params.serviceid + '/msglist'
            },
            {
                name: '创建API',
                url: null
            }
        ],
        fd_serviceid: req.params.serviceid,
        uid: req.session.user.fd_uid,
        shopexid: req.session.user.shopexid,
        appkey: req.session.user.app_key,
        appSecret: req.session.user.app_secret
    });
}

/**
 * @method getMyAppAPI
 * @author lukaijie
 * @datetime 16/5/26
 */
exports.getMyAppAPI = function (req, res) {
    var ErrInfo = {
        method: 'addMyAppAPI',
        memo: '根据fd_serviceid查询对应的API',
        params: {
            fd_serviceid: req.body.fd_serviceid
        }
    }
    utool.sqlExect('SELECT * FROM t_service WHERE fd_serviceid = ? ', req.body.fd_serviceid, ErrInfo, function (err, result) {
        if (err) {
            utool.errView(res, err);
        }
        else {
            res.json({status: 0, data: result});
        }
    });
}

/**
 * @method 保存服务的API;修改t_service 表中的fd_config 字段的内容
 * @author lukaijie
 * @datetime 16/5/25
 */
exports.saveMyAppAPI = function (req, res) {
    var ErrInfo = {
        method: 'saveMyAppAPI',
        memo: '保存服务的API;修改t_service 表中的fd_config 字段的内容',
        params: {
            fd_serviceid: req.body.fd_serviceid,
            fd_config: req.body.fd_config
        }
    }
    utool.sqlExect('UPDATE t_service SET fd_config= ? WHERE fd_serviceid = ? ', [req.body.fd_config, req.body.fd_serviceid], ErrInfo, function (err, result) {
        if (err) {
            res.json({status: -1, message: err});
        }
        else {
            redis.pub({
                "type": "api_update",
                "from": "website",
                "content": req.body.fd_serviceid
            });
            res.json({status: 0, message: '保存成功!'});
        }
    });
}

/**
 * @method 退出系统
 * @author lukaijie
 * @datetime 16/6/29
 */
exports.exitSystem = function (req, res) {
    delete req.session.user;
    res.redirect('http://openapi.shopex.cn/oauth/logout?redirect_uri=' + config.api_provider.logout_url);
}

/**
 * @method 注册页面
 * @author lukaijie
 * @datetime 16/7/1
 */
exports.registerPage = function (req, res) {
    res.render('signup');
}

/**
 * @method 注册
 * @author lukaijie
 * @datetime 16/7/4
 */
exports.registerSystem = function (req, res) {
    client = prism("http://openapi.ishopex.cn/api", config.oauth_register.app_key, config.oauth_register.app_secret);

    client.rpc("yunqiaccount/passport/add", {
        async: false,
        type: "POST",
        params: req.body,
        success: function (result) {
            console.info("test-success:");

            console.log(result)
            if (result.data.status == 'failure') {
                res.json({status: -1, message: '注册失败, ' + result.data.msg})
            }
            else if (result.data.status == 'success') {
                //注册成功后向user表插入数据
                utool.sqlExect('SELECT * FROM t_user WHERE fd_eid = ? ', result.data.data.eid, null, function (err, result1) {
                    if (err) {
                        utool.errView(res, err);
                    }
                    else {
                        if (result.length > 0) {
                            //修改已经注册过的用户的类型
                            utool.sqlExect('UPDATE t_user SET fd_utype= ? WHERE fd_eid = ? ', [2, result.data.data.eid], ErrInfo, function (err, result2) {
                                if (err) {
                                    res.json({status: -1, message: err});
                                }
                                else {
                                    res.json({status: 0, message: '注册成功!'});
                                }
                            });
                        }
                        else {
                            //新增用户
                            var param = {
                                fd_uid: result.data.data.eid,                  //  --  用户id，应通过序号表获得
                                fd_utype: 2,                              //  --  用户类型，1-普通用户，2-开发者用户， 100-管理员
                                fd_uname: result.data.data.login_name,         //  --  用户名字
                                fd_account: result.data.data.login_name,       //  --  用户账号
                                fd_shopexid: result.data.data.login_name,      //  --  商派shopexid，商派统一登录时用
                                fd_eid: result.data.data.eid,                  //  --  eid
                                fd_account_type: 2,                       //  --  账户类型 1-为shopexid， 2-为平台注册用户
                                fd_last_time: new Date()                  //  --  最后登录时间
                            }
                            utool.sqlExect('INSERT INTO t_user SET ? ', param, null, function (err, result3) {
                                if (err) {
                                    res.json({status: -1, message: err});
                                }
                                else {
                                    //创建默认app
                                    //第一次登录,创建一个默认app;
                                    var idata = {
                                        fd_id: utool.randomString(7), //fd_id 生成7位随机字符串
                                        fd_uid: result.data.data.eid,
                                        fd_name: 'default_app',
                                        fd_status: 1,    //服务状态 0-禁用，1-可用
                                        fd_key: utool.randomString(7), //fd_key 生成7位随机字符串
                                        fd_secret: utool.randomString(20), //fd_secret 生成20位随机字符串
                                        fd_sandbox: 0, //是否沙箱  0-正常用户app, 1-沙箱测试app,系统初始化自动创建
                                        fd_type: 1, //默认app标志
                                        fd_description: '默认应用'
                                    }
                                    utool.sqlExect('INSERT INTO t_app SET ?', idata, null, function (err, result) {
                                        if (err) {
                                            res.json({status: -1, message: err});
                                        }
                                        else {
                                            redis.pub({
                                                "type": "app_add",
                                                "from": "website",
                                                "content": idata.fd_id
                                            });
                                            res.json({status: 0, message: '注册成功!'});
                                        }
                                    });

                                }
                            });
                        }
                    }
                });
            }
        },
        error: function (err) {
            console.info("test-error:");
            res.json({status: -2, message: '注册失败'})
        },
        timeout: 3
    });
}

/**
 * @method 检查名称
 * @author lukaijie
 * @datetime 16/7/4
 */
 
exports.checkname = function (req, res) {
    console.log(req.body.login_name);
    client = prism("http://openapi.ishopex.cn/api", config.oauth_register.app_key, config.oauth_register.app_secret);

    client.rpc("yunqiaccount/passport/check", {
        async: false,
        type: "POST",
        params: req.body,
        success: function (result) {
            console.info("test-success:");
            console.log(JSON.stringify(result))
            if (result.data.status == 'success') {
                res.json({status: -1, message: '该手机号已被注册'})
            }
            else if (result.data.status == 'failure') {
                res.json({status: 0, message: '该手机号可以正常注册'})
            }
        },
        error: function (err) {
            console.info("test-error:");
            res.json({status: -2, message: '请求出错'})
        },
        timeout: 3
    });
}

/**
 * @method 重置secret
 * @author lukaijie
 * @datetime 16/6/27
 */
exports.resetSecret = function (req, res) {
    var ErrInfo = {
        method: 'resetSecret',
        memo: '重置secret',
        params: {
            fd_id: req.body.fd_id,
            fd_secret: utool.randomString(20)
        }
    }
    console.log(ErrInfo)
    utool.sqlExect('UPDATE t_app SET fd_secret = ? WHERE fd_id= ?', [
        ErrInfo.params.fd_secret, ErrInfo.params.fd_id
    ], ErrInfo, function (err, result) {
        if (err) {
            utool.errView(res, err);
        }
        else {
            req.session.user.app_secret = ErrInfo.params.fd_secret;
            res.json({status: 0, data: ErrInfo.params.fd_secret});
        }
    });
}

