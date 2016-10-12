/**
 * Created by lukaijie on 16/7/5.
 */
var pool = require('../libs/mysql'),
    request = require('request'),
    utool = require('../libs/utool'),
    redis = require('../libs/redis'),
    config = require('../libs/config'),
    logger = require('../libs/logger'),
    u = require('underscore');

/**
 * @method 新增消息页面
 * @author lukaijie
 * @datetime 16/7/6
 */
exports.newMsgPage = function (req, res) {
    res.render('msg/new', {
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
                name: '创建消息',
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
 * @method 保存消息
 * @author lukaijie
 * @datetime 16/7/6
 */
exports.saveMsg = function (req, res) {
    var ErrInfo = {
        method: 'saveMsg',
        memo: '保存服务的消息内容',
        params: {
            fd_name: req.body.fd_name,
            fd_serviceid: req.body.fd_serviceid,
            fd_config: req.body.fd_config,
            fd_description: req.body.fd_description,
            fd_update_time: new Date()
        }
    }
    utool.sqlExect('INSERT t_service_message SET ? ', ErrInfo.params, ErrInfo, function (err, result) {
        if (err) {
            res.json({status: -1, message: err});
        }
        else {
            res.json({status: 0, message: '保存成功!'});
        }
    });
}

/**
 * @method 校验消息名称是否存在.
 * @author lukaijie
 * @datetime 16/7/6
 */
exports.checkName = function (req, res) {
    var ErrInfo = {
        method: 'checkName',
        memo: '校验消息名称是否存在',
        params: {
            fd_name: req.body.fd_name
        }
    }
    utool.sqlExect('SELECT fd_name FROM t_service_message WHERE fd_name = ? AND fd_serviceid = ?', [req.body.fd_name, req.body.fd_serviceid], ErrInfo, function (err, result) {
        if (err) {
            res.json({status: -1, message: err});
        }
        else {
            if (result.length == 0) {
                res.json({status: 0, message: '消息名称可以使用!'});
            }
            else {
                res.json({status: -1, message: '消息名称重复!'});
            }
        }
    });
}

/**
 * @method 根据服务ID查询消息列表
 * @author lukaijie
 * @datetime 16/7/6
 */
exports.getMsgListByServiceId = function (req, res) {
    var ErrInfo = {
        method: 'getMsgListByServiceId',
        memo: '根据服务ID查询消息列表',
        params: {
            fd_serviceid: req.body.fd_serviceid
        }
    }
    utool.sqlExect('SELECT fd_id, fd_name, fd_serviceid, fd_from, fd_description FROM t_service_message WHERE fd_serviceid = ?', [req.body.fd_serviceid], ErrInfo, function (err, result) {
        if (err) {
            res.json({status: -1, message: err});
        }
        else {
            res.json({status: 0, data: result});
        }
    });
}

/**
 * @method 删除消息
 * @author lukaijie
 * @datetime 16/7/6
 */
exports.deleteMsg = function (req, res) {
    var ErrInfo = {
        method: 'deleteMsg',
        memo: '删除消息',
        params: {
            fd_id: req.body.fd_id
        }
    }
    utool.sqlExect('DELETE FROM t_service_message WHERE fd_id = ?', req.body.fd_id, ErrInfo, function (err, result) {
        if (err) {
            res.json({status: -1, message: err})
        }
        else {
            res.json({status: 0, message: '删除成功!'})
        }
    });
}

/**
 * @method 编辑消息页面
 * @author lukaijie
 * @datetime 16/7/6
 */
exports.editorMsgPage = function (req, res) {
    //根据fd_serviceid和fd_id 查询消息的fd_config
    var ErrInfo = {
        method: 'editorMsgPage',
        memo: '编辑消息页面',
        params: {
            fd_id: req.params.serviceid,
            fd_serviceid: req.params.msgid
        }
    }
    utool.sqlExect('SELECT fd_name, fd_config, fd_description FROM t_service_message WHERE fd_id = ? AND fd_serviceid = ?', [req.params.msgid, req.params.serviceid], ErrInfo, function (err, result) {
        if (err) {
            utool.errView(res, err);
        }
        else {
            var config;
            try {
                config = JSON.parse(result[0].fd_config);
            }
            catch (e) {
                config = {};
            }
            res.render('msg/edit', {
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
                        name: '编辑消息',
                        url: null
                    }
                ],
                fd_serviceid: req.params.serviceid,
                fd_id: req.params.msgid,
                fd_config: JSON.stringify(config),
                fd_name: result[0].fd_name,
                fd_description: result[0].fd_description,
                uid: req.session.user.fd_uid,
                shopexid: req.session.user.shopexid,
                appkey: req.session.user.app_key,
                appSecret: req.session.user.app_secret
            })
        }
    });
}

/**
 * @method 更新服务的消息内容
 * @author lukaijie
 * @datetime 16/7/6
 */
exports.updateMsg = function (req, res) {
    var ErrInfo = {
        method: 'updateMsg',
        memo: '保存服务的消息内容',
        params: {
            fd_id: req.body.fd_id,
            fd_name: req.body.fd_name,
            fd_serviceid: req.body.fd_serviceid,
            fd_config: req.body.fd_config,
            fd_description: req.body.fd_description,
            fd_update_time: new Date()
        }
    }
    utool.sqlExect('UPDATE t_service_message SET ? WHERE fd_serviceid = ? AND fd_id = ?', [
        {
            fd_name: ErrInfo.params.fd_name,
            fd_config: ErrInfo.params.fd_config,
            fd_description: ErrInfo.params.fd_description,
            fd_update_time: ErrInfo.params.fd_update_time
        }, req.body.fd_serviceid, req.body.fd_id], ErrInfo, function (err, result) {
        if (err) {
            res.json({status: -1, message: err});
        }
        else {
            res.json({status: 0, message: '更新成功!'});
        }
    });
}

/**
 * @method 根据shopexid获取所有的消息
 * @author lukaijie
 * @datetime 16/5/13
 */
exports.msg = function (req, res) {
    //查询服务
    var ErrInfo = {
        method: 'msg',
        memo: '查询所有的全平台可见并且是已经上线的服务所关联的消息',
        params: {}
    }
    utool.sqlExect('select t1.fd_serviceid,t1.fd_name,t2.fd_config from t_service t1 left outer join t_service_message t2 on t1.fd_serviceid = t2.fd_serviceid Where t1.fd_visible= ? AND t1.fd_status = ?', [1, 4], ErrInfo, function (err, result) {

        if (err) {
            utool.errView(res, err);
        }
        else {
            if (result.length > 0) {
                res.redirect('/msg/db/' + result[0].fd_serviceid);
                return;
            }
            res.render('msg/index', {
                nav: 'api',
                navs: [
                    {
                        name: '文档中心',
                        url: ''
                    },
                    {
                        name: '消息类目',
                        url: null
                    }
                ],
                title: 'index',
                msgs: result,
                uid: (typeof req.session.user != 'undefined') ? req.session.user.fd_uid : null,
                shopexid: (typeof req.session.user != 'undefined') ? req.session.user.shopexid : "",
                appkey: (typeof req.session.user != 'undefined') ? req.session.user.app_key : "",
                appSecret: (typeof req.session.user != 'undefined') ? req.session.user.app_secret : ""
            });
        }
    });
}

/**
 * @method 消息列表
 * @author lukaijie
 * @datetime 16/7/8
 */
exports.msgOfService = function (req, res) {
    //查询服务消息列表
    var ErrInfo = {
        method: 'msgOfService',
        memo: '根据服务id查询所有的消息内容',
        params: {fd_serviceid: req.params.sid}
    }

    //查询
    utool.sqlExect('SELECT * FROM t_service WHERE fd_visible= ? AND fd_status= ? ORDER BY fd_create_time DESC', [1, 4], ErrInfo, function (err, result) {
        if (err) {
            utool.errView(res, err);
        }
        else {
            utool.sqlExect('SELECT t1.fd_serviceid,t2.fd_id,t2.fd_name,t2.fd_config,t2.fd_from,t2.fd_description FROM t_service t1 LEFT OUTER JOIN t_service_message t2 ON t1.fd_serviceid = t2.fd_serviceid WHERE t1.fd_visible= ? AND t1.fd_status = ? AND t1.fd_serviceid = ?', [1, 4, req.params.sid], ErrInfo, function (err, result1) {
                if (err) {
                    utool.errView(res, err);
                }
                else {
                    res.render('msg/msglist', {
                        nav: 'api',
                        navs: [
                            {
                                name: '文档中心',
                                url: ''
                            },
                            {
                                name: '消息类目',
                                url: '/msg'
                            },
                            {
                                name: u.where(result, {fd_serviceid: req.params.sid})[0].fd_name,
                                url: null
                            }
                        ],
                        list: result, //所有的服务
                        msgs: result1,
                        serviceid: req.params.sid,
                        servicename: u.where(result, {fd_serviceid: req.params.sid})[0].fd_name,
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
 * @method 消息明细
 * @author lukaijie
 * @datetime 16/7/8
 */
exports.detailOfMsg = function (req, res) {
    var ErrInfo = {
        method: 'detailOfMsg',
        memo: '消息明细',
        params: {fd_id: req.params.sid}
    }
    //查询服务下的所有消息
    utool.sqlExect('SELECT * FROM t_service_message WHERE fd_serviceid= ? ORDER BY fd_create_time ASC', [req.params.sid], ErrInfo, function (err, result) {
        if (err) {
            utool.errView(res, err);
        }
        else {


            for (var i = 0; i < result.length; i++) {
                var msg_content;
                try {
                    msg_content = JSON.parse(result[i].fd_config);
                }
                catch (e) {
                    msg_content = {};
                }
                result[i]['config'] = msg_content;
            }
            res.render('msg/msgdetail', {
                nav: 'api',
                navs: [
                    {
                        name: '文档中心',
                        url: ''
                    },
                    {
                        name: '消息类目',
                        url: '/msg'
                    },
                    {
                        name: req.query.servicename,
                        url: null
                    }
                ],
                msgs: result,
                serviceid: req.params.sid,
                servicename: req.query.servicename,
                msgname: req.query.msgname,
                uid: (typeof req.session.user != 'undefined') ? req.session.user.fd_uid : null,
                shopexid: (typeof req.session.user != 'undefined') ? req.session.user.shopexid : "",
                appkey: (typeof req.session.user != 'undefined') ? req.session.user.app_key : "",
                appSecret: (typeof req.session.user != 'undefined') ? req.session.user.app_secret : ""
            });
        }
    });
}