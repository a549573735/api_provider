/**
 * Created by lukaijie on 16/5/20.
 */
UI = {
    loadshow: function () {
        $('#loading').remove();
        $('body').append('<div id="loading" class="loading">正在处理请稍等......</div>');
    },
    loadhide: function () {
        $('#loading').remove();
    }
}

$(function () {
    var doccenter = {
        onResize: function () {
            var responsive = function () {
                var viewportWidth = $(window).width();
                if (viewportWidth < 1240) {
                    $('body').addClass('narrow');
                } else {
                    $('body').removeClass('narrow');
                }
            };
            responsive();
        },
        init: function () {
            this.onResize();
        }
    }
    doccenter.init();
});