/**
 * Created by shopex on 15/12/28.
 */


function serviceCheck() {
    this.regIphone = /^1\d{10}$/i;
    this.regEmail = /^(\w)+(\.\w+)*@(\w)+((\.\w{2,3}){1,3})$/;
}

serviceCheck.prototype.checkEmpty = function (obj) {
    var count = 0;
    $.each(obj, function (i, val) {
        if ($(val).val() === "") {
            count++;
        }
    });

    if (count !== 0) {
        return {message: '输入框不能为空', state: 'false'};
    } else {
        return {message: '', state: 'true'};
    }
};

serviceCheck.prototype.checkEmail = function (obj) {

    if (!this.regEmail.test(obj.val())) {
        return {message: '您输入的邮箱有误,请重新输入', state: 'false'};
    } else {
        return {message: '', state: 'true'};
    }

};

serviceCheck.prototype.checkIphone = function (obj) {

    if (!this.regIphone.test(obj.val())) {
        return {message: '您输入的手机有误,请重新输入', state: 'false'};
    } else {
        return {message: '', state: 'true'};
    }
};


serviceCheck.prototype.countdown = function (obtn) {
    obtn.attr('disabled', 'disabled');
    var _t = 60, _timer = null;

    clearInterval(_timer);
    _timer = setInterval(function () {
        _t--;
        if (_t < 0) {
            clearInterval(_timer);
            obtn.removeAttr('disabled').html('重新发送');
            obtn.css({cursor: 'pointer'});
            return false;
        }
        if (_t < 10) {
            _t = '0' + _t;
        }
        obtn.html('正在发送请稍后...' + _t + '秒');

    }, 1000);

};




