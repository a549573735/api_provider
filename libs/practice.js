/**
 * Created by lukaijie on 16/5/12.
 */
var u = require("underscore");

exports.checkSession = function (req, res, next) {
    console.log('进入session验证:' +  JSON.stringify(req.session.user))
    if (typeof(req.session.user) != 'undefined') {
        if (!u.isEmpty(req.session.user)) {
            next();
        }
        else {
            res.redirect('/login');
            return;
        }
    }
    else {
        res.redirect('/login');
        return;
    }
}