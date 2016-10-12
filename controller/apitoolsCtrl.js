/**
 * Created by lukaijie on 16/7/11.
 */
var pool = require('../libs/mysql'),
    request = require('request'),
    utool = require('../libs/utool'),
    redis = require('../libs/redis'),
    config = require('../libs/config'),
    logger = require('../libs/logger'),
    u = require('underscore');

/**
 * @method
 * @author lukaijie
 * @datetime 16/5/13
 */
exports.apitools = function (req, res) {
    //查询所有已上线且全平台可见的服务
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
            var apis = JSON.parse(u.where(result, {fd_serviceid: req.query.serviceid})[0].fd_config).paths;
            res.render('apitools/index', {
                nav: '',
                navs: [],
                serviceid: req.query.serviceid,
                apiname: req.query.apiName,
                result: result,
                service: apis,
                title: 'index',
                uid: (typeof req.session.user != 'undefined') ? req.session.user.fd_uid : null,
                shopexid: (typeof req.session.user != 'undefined') ? req.session.user.shopexid : ""
            });
        }
    });

}