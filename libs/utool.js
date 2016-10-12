/**
 * Created by lukaijie on 16/5/12.
 */
var pool = require('./mysql'),
    logger = require('./logger');
var u = require("underscore");


module.exports = {
    reqErr: function (error, response, res, result, callback) {
        if (!error && response.statusCode == 200) {
            if (result.result == 'error') {
                res.render('common/error', {
                    message: result.error.message,
                    error: result.error.message,
                    status: result.error.code
                });
            }
            else {
                callback();
            }
        }
        else {
            res.render('common/error', {
                message: error != null ? error.message : response.statusMessage,
                error: error,
                status: 500,
            });
        }
    },
    errView: function (res, message) {
        res.render('common/error', {
            message: "",
            error: message,
            status: 500,
        });
    },
    format: function (string, args) {
        return string.replace(/\{(\d+)\}/g, function (s, i) {
            return args[i];
        });
    },
    checkSession: function (session) {
        if (typeof(session.shopexid) != 'undefined') {
            if (session.shopexid != "") {
                console.log('utool'+session.shopexid)
                return true
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    },
    sqlExect: function (sql, data, errinfo, callback) {
        pool.acquire(function (err, client) {
            if (err) {
                einfo = u.extend(errinfo, {err: err});
                logger.error(einfo.method, einfo.memo, einfo.params, JSON.stringify(einfo.err));
                callback(err);
            }
            else {
                client.query(sql, data, function (err, result) {
                    pool.release(client);
                    if (err) {
                        einfo = u.extend(errinfo, {err: err});
                        logger.error(einfo.method, einfo.memo, einfo.params, JSON.stringify(einfo.err));
                        callback(err);
                    }
                    else {
                        callback(null, result);

                    }
                })
            }
        });
    },
    //随机字符串
    randomString: function (len) {
        len = len || 32;
        var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
        /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
        var maxPos = $chars.length;
        var pwd = '';
        for (i = 0; i < len; i++) {
            pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd;
    }
}