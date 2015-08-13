+function($) {
    'use strict';

    var Game = function (elem, options) {
        this.$elem = $(elem);
        this.canvas = this.$elem.find('canvas')[0];
        this.ctx = this.canvas.getContext('2d');
        this.options = $.extend({}, this.DEFAULT_OPTIONS, options);
        this.timers = {};
        this.level = null;
        this.paused = false;
        this.started = false;
        this.keysDown = {};

        this.init();
    };

    Game.prototype.DEFAULT_OPTIONS = {
        screenWidth: 1680,
        screenHeight: 1024,
        fps: 30
    };

    Game.prototype.keyCodes = {
        w: 87,
        a: 65,
        s: 83,
        d: 68,
        p: 80
    };

    Game.prototype.init = function () {
        this.applyOptions();
        this.renderMenu(true);

        $(document).on('keydown', $.proxy(this.addKeyDown, this));
        $(document).on('keydown', $.proxy(this.hotKeyBind, this));
        $(document).on('keyup', $.proxy(this.removeKeyDown, this));
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

    Game.prototype.renderMenu = function (toggle) {
        var menu = this.$elem.find('.menu');
        if(menu.hasClass('menu-shown') && toggle) {
            menu.removeClass('menu-shown');
            menu.fadeOut('slow');
        } else {
            menu.css('left', 0);
            menu.css('top', $(document.body).scrollTop());
            menu.addClass('menu-shown');
            menu.fadeIn('slow');
            var $elem = menu.find('.container-fluid > div:first-child');

            if(!this.started) {
                $elem.data('action', 'start');
                $elem.html('Start');
            } else if(this.paused) {
                $elem.data('action', 'unpause');
                $elem.html('Resume');
            } else {
                $elem.data('action', 'pause');
                $elem.html('Pause');
            }
        }
    };

    Game.prototype.hotKeyBind = function(e, data) {
        var code = e.which;
        if(this.keysDown[code] && code == this.keyCodes.p) {
            this.renderMenu(true);
        } else if(this.keyCodes.a in this.keysDown && this.keyCodes.w in this.keysDown) {
            /** Move left up */
            this.level.translate(50, 50);
        } else if(this.keyCodes.d in this.keysDown && this.keyCodes.w in this.keysDown) {
            /** Move right up */
            this.level.translate(-50, 50);
        } else if(this.keyCodes.a in this.keysDown && this.keyCodes.s in this.keysDown) {
            /** Move left down */
            this.level.translate(50, -50);
        } else if(this.keyCodes.d in this.keysDown && this.keyCodes.s in this.keysDown) {
            /** Move right down */
            this.level.translate(-50, -50);
        } else if(this.keysDown[code] && code == this.keyCodes.a) {
            /** Move left */
            this.level.translate(50, 0);
        } else if(this.keysDown[code] && code == this.keyCodes.d) {
            /** Move right */
            this.level.translate(-50, 0);
        } else if(this.keysDown[code] && code == this.keyCodes.w) {
            /** Move up */
            this.level.translate(0, 50);
        } else if(this.keysDown[code] && code == this.keyCodes.s) {
            /** Move down */
            this.level.translate(0, -50);
        }
    };

    Game.prototype.lvlGenerate = function () {
        this.level = new Level(this.ctx, {
            screenWidth: this.options.screenWidth,
            screenHeight: this.options.screenHeight
        });

        this.stopDrawing();
        this.startDrawing();
    };

    Game.prototype.clear = function () {
        $.each(this.timers, function () {
            clearInterval(this);
        });
        if(this.level) {
            this.ctx.clearRect(0, 0, this.level.options.mapWidth, this.level.options.mapHeight);
            delete(this.level);
        }
        this.ctx.restore();
        this.paused = true;
    };

    Game.prototype.start = function (e, data) {
        this.clear();

        this.canvas.width = this.options.screenWidth;
        this.canvas.height = this.options.screenHeight;
        this.started = true;

        this.lvlGenerate();
        this.renderMenu(true);
    };

    Game.prototype.pause = function (e, data) {
        this.setPause();
        this.renderMenu();
    };

    Game.prototype.unpause = function (e, data) {
        this.unsetPause();
        this.renderMenu();
    };

    Game.prototype.endGame = function () {
        this.started = false;
        this.clear();
        this.renderMenu();
    };

    Game.prototype.setPause = function () {
        this.paused = true;
        this.stopDrawing();
    };

    Game.prototype.unsetPause = function () {
        this.paused = false;
        this.startDrawing();
    };

    Game.prototype.startDrawing = function () {
        this.timers.drawProc = setInterval($.proxy(this.level.draw, this.level), 1000 / this.options.fps);
    };

    Game.prototype.stopDrawing = function () {
        clearInterval(this.timers.drawProc);
    };

    Game.prototype.applyOptions = function () {
        this.canvas.width = this.options.screenWidth;
        this.canvas.height = this.options.screenHeight;
        if(this.level) {
            this.level.setOptions({
                screenWidth: this.options.screenWidth,
                screenHeight: this.options.screenHeight
            });
        }
    };

    Game.prototype.addKeyDown = function (e, data) {
        this.keysDown[e.which] = true;
    };

    Game.prototype.removeKeyDown = function (e, data) {
        if(this.keysDown[e.which]) {
            delete(this.keysDown[e.which]);
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