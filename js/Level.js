var Level = function (context, options) {
    this.ctx = context;
    this.options = $.extend({}, this.DEFAULT_OPTIONS, options);
    this.time = 0;
    this.map = [];
    this.enters = [];

    this.generate();
};

Level.prototype.DEFAULT_OPTIONS = {
    width: 70,
    height: 70,
    maxEntryPoints: 10,
    minEntryPoints: 2
};

Level.prototype.ITEM_TYPES = {
    passable: {
        way: 1,
        enter: 2
    },
    impassable: {
        wall: 0
    }
};

Level.prototype.draw = function() {
    var ctx = this.ctx;
    var text = '';
    for(var i=0; i<this.options.width; i++) {
        for(var j=0; j<this.options.width; j++) {
            text += this.map[i][j].type + ' ';
        }
        text += '<br>';
    }
    $('.screen').html(text);
};

Level.prototype.update = function (dt) {

};

Level.prototype.generate = function () {
    this.emptyLevel();
    this.generateEntryPoints();
    this.generateMap();
};

Level.prototype.generateEntryPoints = function () {
    var countEntryPoints = parseInt(Math.random() * (this.options.maxEntryPoints - this.options.minEntryPoints) + this.options.minEntryPoints);

    for(var i=0; i<countEntryPoints; i++) {
        var x = parseInt(Math.random() * this.options.width),
            y = parseInt(Math.random() * this.options.height);
        this.enters.push({
            linked: false,
            branch: [{
                x: x,
                y: y
            }]
        });
        this.map[x][y] = {
            type: this.ITEM_TYPES.passable.enter,
            enter: i
        };
    }
};

Level.prototype.generateMap = function () {
    while(true) {
        for(var i=0; i<this.enters.length; i++) {
            for(var j=0; j< this.enters[i].branch.length; j++) {
                var x = this.enters[i].branch[j].x,
                    y = this.enters[i].branch[j].y;

                if(typeof this.map[x+1] !== 'undefined') {
                    this.createBranch(x+1, y, i);
                }
                if(typeof this.map[x][y+1] !== 'undefined') {
                    this.createBranch(x, y+1, i);
                }
                if(typeof this.map[x+1] !== 'undefined') {
                    if(typeof this.map[x+1][y+1] !== 'undefined') {
                        this.createBranch(x+1, y+1, i);
                    }
                }
                if(typeof this.map[x-1] !== 'undefined') {
                    this.createBranch(x-1, y, i);
                }
                if(typeof this.map[x][y-1] !== 'undefined') {
                    this.createBranch(x, y-1, i);
                }
                if(typeof this.map[x-1] !== 'undefined') {
                    if(typeof this.map[x-1][y-1] !== 'undefined') {
                        this.createBranch(x-1, y-1, i);
                    }
                }

                this.enters[i].branch.splice(j, 1);
            }
        }

        if(this.checkLink()) {
            break;
        }
    }
};

Level.prototype.createBranch = function (x, y, enter) {
    if(this.inAssoc(this.map[x][y].type, this.ITEM_TYPES.passable) !== -1) {
        if(enter !== this.map[x][y].enter) {
            this.enters[enter].linked = this.map[x][y].enter;
        }
    } else {
        var newBranch = parseInt(Math.random() * 100 +1);
        if((newBranch > 0 && newBranch < 35)
            || (newBranch > 70 && newBranch < 100)
            || (this.enters[enter].linked === false && this.enters[enter].branch.length < 2)) {
            this.enters[enter].branch.push({x: x, y: y, enter: enter});
            this.map[x][y] = {type: this.ITEM_TYPES.passable.way, enter: enter};
        }
    }
};

Level.prototype.checkLink = function () {
    for(var i=0; i<this.enters.length; i++) {
        if(this.enters[i].linked === false) {
            return false;
        }
    }

    return true;
};

Level.prototype.inAssoc = function (value, array) {
    for(var i in array) {
        if(array[i] === value) {
            return i;
        }
    }

    return -1;
};

Level.prototype.emptyLevel = function () {
    this.map = [];
    for(var i=0; i<this.options.width; i++) {
        this.map.push([]);
        for(var j=0; j<this.options.height; j++) {
            this.map[i].push({type: 0, enter: -1});
        }
    }
};