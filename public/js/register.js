/**
 * Created by lukaijie on 16/7/1.
 */
var UI = {
    alert: function (msg) {
        if ($('#myAlert').length != 0) {
            $('#myAlert').alert('close');
        }
        $('body').append('<div id="myAlert" class="alert alert-danger">' +
            '<a href="#" class="close" data-dismiss="alert">' +
            '&times;' +
            '</a>' + msg +
            '</div>');
        $('#myAlert').alert();
    },
    success: function (msg) {
        if ($('#myAlert').length != 0) {
            $('#myAlert').alert('close');
        }
        $('body').append('<div id="myAlert" class="alert alert-success">' +
            '<a href="#" class="close" data-dismiss="alert">' +
            '&times;' +
            '</a>' + msg +
            '</div>');
        $('#myAlert').alert();
    },
    loading: function (msg, close) {
        if (!close) {
            $('#myAlert').alert('close');
            return;
        }
        if ($('#myAlert').length != 0) {
            $('#myAlert').alert('close');
        }
        $('body').append('<div id="myAlert" class="alert alert-danger">' +
            '<a href="#" class="close" data-dismiss="alert">' +
            '&times;' +
            '</a>' + '<i class="fa fa-spinner fa-spin" style="margin-right: 10px;"></i>' + msg +
            '</div>');
        $('#myAlert').alert();
    },
    confirm: function (msg, callback) {
        $('body').append(
            '<div class="modal fade comfimModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" style="color: #000;">' +
            '<div class="modal-dialog" role="document">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
            '<h4 class="modal-title" id="exampleModalLabel">鎻愮ず</h4>' +
            '</div>' +
            '<div class="modal-body" id="details">' +
            msg +
            '</div>' +
            '<div class="modal-footer">' +
            '<button type="button" class="btn btn-success ok" data-dismiss="modal">纭畾</button>' +
            '<button type="button" class="btn btn-default cancel" data-dismiss="modal">鍏抽棴</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>'
        );
        $('.comfimModal').modal({
            keyboard: false
        });
        $('.comfimModal .ok').on('click', function () {
            $('.comfimModal').remove();
            $('.modal-backdrop').remove();
            callback(true);
        });
        $('.comfimModal .cancel').on('click', function () {
            $('.comfimModal').remove();
            $('.modal-backdrop').remove();
            callback(false);
        });
    },
    showAlarmDialog: function (dtitle, user, create, content) {
        $('body').append(
            '<div class="modal fade comfimModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" style="color: #000;">' +
            '<div class="modal-dialog" role="document">' +
            '<div class="modal-content">' +
            '<div class="modal-header" style="background-color: #FF0000;">' +
            '<h4 class="modal-title" id="exampleModalLabel" style="text-align: center;">' + dtitle + '</h4>' +
            '</div>' +
            '<div class="modal-body" id="details">' +
            '<div class="mtl" style="margin-bottom: 20px;">' +
            '<p class="mtl-time">鍙戝竷浜�: ' + user + '</p>' +
            '<p class="mtl-time">鍙戝竷浜�: ' + create + '</p>' +
            '</div>' +
            '<div class="support-detail-bd" id="bd">' +
            content +
            '</div>' +
            '</div>' +
            '<div class="modal-footer">' +
            '<button type="button" class="btn btn-default cancel" data-dismiss="modal">鍏抽棴</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>'
        );
        $('.comfimModal').modal({
            keyboard: false
        });
        $('.comfimModal .cancel').on('click', function () {
            $('.comfimModal').remove();
            $('.modal-backdrop').remove();
        });
    },
    add: function (a, b) {
        return a + b;
    },
    formatJson: function (json, options) {
        var reg = null,
            formatted = '',
            pad = 0,
            PADDING = '    '; // one can also use '\t' or a different number of spaces

        // optional settings
        options = options || {};
        // remove newline where '{' or '[' follows ':'
        options.newlineAfterColonIfBeforeBraceOrBracket = (options.newlineAfterColonIfBeforeBraceOrBracket === true) ? true : false;
        // use a space after a colon
        options.spaceAfterColon = (options.spaceAfterColon === false) ? false : true;

        // begin formatting...

        // make sure we start with the JSON as a string
        if (typeof json !== 'string') {
            json = JSON.stringify(json);
        }
        // parse and stringify in order to remove extra whitespace
        json = JSON.parse(json);
        json = JSON.stringify(json);

        // add newline before and after curly braces
        reg = /([\{\}])/g;
        json = json.replace(reg, '\r\n$1\r\n');

        // add newline before and after square brackets
        reg = /([\[\]])/g;
        json = json.replace(reg, '\r\n$1\r\n');

        // add newline after comma
        reg = /(\,)/g;
        json = json.replace(reg, '$1\r\n');

        // remove multiple newlines
        reg = /(\r\n\r\n)/g;
        json = json.replace(reg, '\r\n');

        // remove newlines before commas
        reg = /\r\n\,/g;
        json = json.replace(reg, ',');

        // optional formatting...
        if (!options.newlineAfterColonIfBeforeBraceOrBracket) {
            reg = /\:\r\n\{/g;
            json = json.replace(reg, ':{');
            reg = /\:\r\n\[/g;
            json = json.replace(reg, ':[');
        }
        if (options.spaceAfterColon) {
            reg = /\:/g;
            json = json.replace(reg, ': ');
        }

        $.each(json.split('\r\n'), function (index, node) {
            var i = 0,
                indent = 0,
                padding = '';

            if (node.match(/\{$/) || node.match(/\[$/)) {
                indent = 1;
            } else if (node.match(/\}/) || node.match(/\]/)) {
                if (pad !== 0) {
                    pad -= 1;
                }
            } else {
                indent = 0;
            }

            for (i = 0; i < pad; i++) {
                padding += PADDING;
            }

            formatted += padding + node + '\r\n';
            pad += indent;
        });

        return formatted;
    },
    getQueryString: function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }
};
