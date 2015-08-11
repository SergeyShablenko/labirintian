var Level = function (context, options) {
    this.ctx = context;
    this.options = $.extend({}, this.DEFAULT_OPTIONS, options);
    this.time = 0;
    this.map = [];

    this.generate();
};

Level.prototype.DEFAULT_OPTIONS = {
    width: 50,
    height: 50,
    maxEntryPoints: 5
};

Level.prototype.DEFAULT_TYPES = {
    way: 1,
    enter: 3
};

Level.prototype.draw = function() {
    var ctx = this.ctx;
    var text = '';
    for(var i=0; i<this.options.width; i++) {
        for(var j=0; j<this.options.width; j++) {
            text += this.map[i][j] + ' ';
        }
        text += '<br>';
    }
    $('.wrapper').append(text);
};

Level.prototype.update = function (dt) {

};

Level.prototype.generate = function () {
    var countEntryPoints = parseInt(Math.random() * this.options.maxEntryPoints + 2),
        branches = [],
        connectedEntries = [];

    this.emptyLevel();
    for(var i=0; i<countEntryPoints; i++) {
        var x = parseInt(Math.random() * this.options.width),
            y = parseInt(Math.random() * this.options.height);
        branches.push({i: x, j: y, point: i});
        this.map[x][y] = this.DEFAULT_TYPES.enter;
    }

    for(var i=0; i<branches.length; i++) {
        var x = branches[i].i,
            y = branches[i].j;

        if(typeof this.map[x+1] !== 'undefined') {
            this.newBranch(x+1, y, branches, i);
        }
        if(typeof this.map[x][y+1] !== 'undefined') {
            this.newBranch(x, y+1, branches, i);
        }
        if(typeof this.map[x+1] !== 'undefined') {
            if(typeof this.map[x+1][y+1] !== 'undefined') {
                this.newBranch(x + 1, y + 1, branches, i);
            }
        }
        if(typeof this.map[x-1] !== 'undefined') {
            this.newBranch(x-1, y, branches, i);
        }
        if(typeof this.map[x][y-1] !== 'undefined') {
            this.newBranch(x, y-1, branches, i);
        }
        if(typeof this.map[x-1] !== 'undefined') {
            if(typeof this.map[x-1][y-1] !== 'undefined') {
                this.newBranch(x - 1, y - 1, branches, i);
            }
        }
    }
};

Level.prototype.newBranch = function (i, j, branches, pos) {
    if(this.inTypes(this.map[i][j], this.DEFAULT_TYPES) !== -1) {
        branches.splice(pos, 1);
    } else {
        var newBranch = parseInt(Math.random() * 2);
        if(newBranch === 1) {
            branches.push({i: i, j: j});
            this.map[i][j] = this.DEFAULT_TYPES.way;
        }
    }

    return branches;
};

Level.prototype.emptyLevel = function () {
    this.map = [];
    for(var i=0; i<this.options.width; i++) {
        this.map.push([]);
        for(var j=0; j<this.options.height; j++) {
            this.map[i].push(0);
        }
    }
};

Level.prototype.inTypes = function (value) {
    for(var i in this.DEFAULT_TYPES) {
        if(this.DEFAULT_TYPES[i] === value) {
            return i;
        }
    }

    return -1;
};