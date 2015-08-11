+function($) {
    'use strict';

    var Game = function (elem, options) {
        this.$elem = $(elem);
        this.canvas = this.$elem.find('canvas')[0];
        this.ctx = this.canvas.getContext('2d');
        this.options = $.extend({}, this.DEFAULT_OPTIONS, options);
        this.timers = {};

        this.init();
    };

    Game.prototype.DEFAULT_OPTIONS = {
        fps: 30
    };

    Game.prototype.init = function () {
        $(document).on('keypress', $.proxy(this.hotKeyBind, this));
//        this.timers.game = setInterval($.proxy(this.test, this), 1000 / 30);
//        this.test();
    };

    Game.prototype.test = function () {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    };

    Game.prototype.renderMenu = function () {
        var menu = this.$elem.find('.menu');
        if(menu.hasClass('menu-shown')) {
            menu.removeClass('menu-shown');
            menu.fadeOut('slow');
        } else {
            menu.addClass('menu-shown');
            menu.fadeIn('slow');
        }
    };

    Game.prototype.hotKeyBind = function(e, data) {
        switch(e.keyCode) {
            case 112: this.renderMenu(); break;
        }
    };

    function Plugin(option) {
        var $this = $(this);
        var data = $this.data('Game.Game');
        var options = typeof option === 'object' && option;

        if (!data) {
            $this.data('Game.Game', (data = new Game(this, options)));
        }

        if (typeof option === 'string' && typeof data[option] !== 'undefined') {
            data[option]();
        }
    }

    var old = $.fn.Game;

    $.fn.Game = Plugin;
    $.fn.Game.Constructor = Game;
    $.fn.Game.noConflict = function () {
        $.fn.Game = old;
        return this;
    };
}(jQuery);