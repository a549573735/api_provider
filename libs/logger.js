/**
 * Created by lukaijie on 16/5/12.
 */
var log4js = require('log4js');
log4js.configure({
    appenders: [
        {type: 'console'},
        {
            type: 'dateFile',
            filename: './logs/access.log',
            pattern: '_yyyy-MM-dd',
            maxLogSize: 1024,
            alwaysIncludePattern: false,
            backups: 4,
            category: 'normal'
        }
    ],
    replaceConsole: true
});

var logger = log4js.getLogger('normal');
logger.setLevel('info');
exports.trace = function (msg) {
    logger.trace(msg);
};
exports.debug = function (msg) {
    logger.debug(msg);
};
exports.info = function (msg) {
    logger.info(msg);
};
exports.error = function (msg1, msg2, msg3, msg4) {
    console.log(JSON.stringify(msg1))
    var utool = require('./utool');
    logger.error(utool.format('\n方法名:{0}\n动作:{1}\n参数:{2}\n错误:{3}\n*******************************************************************', [msg1, msg2, JSON.stringify(msg3), msg4]));
};
exports.warn = function (msg) {
    logger.warn(msg);
};
exports.fatal = function (msg) {
    logger.fatal(msg);
};