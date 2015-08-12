+function($) {
    'use strict';

    var Game = function (elem, options) {
        this.$elem = $(elem);
        this.canvas = this.$elem.find('canvas')[0];
        this.ctx = this.canvas.getContext('2d');
        this.options = $.extend({}, this.DEFAULT_OPTIONS, options);
        this.timers = {};
        this.level = null;

        this.init();
    };

    Game.prototype.DEFAULT_OPTIONS = {
        fps: 30
    };

    Game.prototype.init = function () {
        $(document.body).css('overflow', 'hidden');
        $(document).on('keypress', $.proxy(this.hotKeyBind, this));
        this.$elem.on('click', '[data-action]', $.proxy(this.action, this));
    };

    Game.prototype.ucfirst = function (str) {
        var char = str.charAt(0).toUpperCase();
        return char + str.substr(1, str.length - 1);
    };

    Game.prototype.lcfirst = function (str) {
        var char = str.charAt(0).toLowerCase();
        return char + str.substr(1, str.length - 1);
    };

    Game.prototype.strToCamel = function (str, divider) {
        var result = '',
            self = this;
        $.each(str.split(divider), function () {
            result += self.ucfirst(this);
        });

        return this.lcfirst(result);
    };

    Game.prototype.action = function (e, data) {
        var $elem = $(e.currentTarget),
            action = this.strToCamel($elem.data('action'), '-');

        if (typeof this[action] !== 'function') {
            return;
        }
        return this[action](e);
    };

    Game.prototype.renderMenu = function () {
        var menu = this.$elem.find('.menu');
        if(menu.hasClass('menu-shown')) {
            $(document.body).css('overflow', 'auto');
            menu.removeClass('menu-shown');
            menu.fadeOut('slow');
        } else {
            $(document.body).css('overflow', 'hidden');
            menu.css('left', 0);
            menu.css('top', $(document.body).scrollTop());
            menu.addClass('menu-shown');
            menu.fadeIn('slow');
        }
    };

    Game.prototype.hotKeyBind = function(e, data) {
        switch(e.keyCode) {
            case 112: this.renderMenu(); break;
        }
    };

    Game.prototype.lvlGenerate = function () {
        this.level = new Level(this.ctx, {});
        this.level.draw();
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