var Level = function (context, options) {
    this.ctx = context;
    this.options = $.extend({}, this.DEFAULT_OPTIONS, options);
    this.map = [];
    this.enters = [];
    this.offset = {x: 0, y: 0};

    this.generate();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
};

Level.prototype.DEFAULT_OPTIONS = {
    screenWidth: 1680,
    screenHeight: 1024,
    mapWidth: 0,
    mapHeight: 0,
    width: 50,
    height: 50,
    maxEntryPoints: 10,
    minEntryPoints: 2,
    gridSize: 50
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

Level.prototype.setOptions = function (options) {
    this.options = $.extend({}, this.options, options);
};

Level.prototype.draw = function() {
    var ctx = this.ctx,
        xStart = Math.abs(parseInt(this.offset.x / this.options.gridSize)),
        xStop = xStart + parseInt(this.options.screenWidth / this.options.gridSize),
        yStart = Math.abs(parseInt(this.offset.y / this.options.gridSize)),
        yStop = yStart + parseInt(this.options.screenHeight / this.options.gridSize);

    for(var i=xStart; i<=xStop; i++) {
        if(!this.map[i]) {
            break;
        }

        for(var j=yStart; j<=yStop; j++) {
            if(!this.map[i][j]) {
                break;
            }

            switch(this.map[i][j].type) {
                case this.ITEM_TYPES.impassable.wall: ctx.fillStyle = '#000'; break;
                case this.ITEM_TYPES.passable.way: ctx.fillStyle = '#fff'; break;
                case this.ITEM_TYPES.passable.enter: ctx.fillStyle = 'green'; break;
            }
            ctx.fillRect(i * this.options.gridSize, j * this.options.gridSize, this.options.gridSize, this.options.gridSize);
        }
    }
};

Level.prototype.update = function (dt) {

};


/**
 * Level generation
 */
Level.prototype.generate = function () {
    this.emptyLevel();
    this.generateEntryPoints();
    this.generateMap();
    this.setMapSize();
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
            }],
            coords: {
                x: x,
                y: y
            }
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
    var isLinked = false;
    if(this.inAssoc(this.map[x][y].type, this.ITEM_TYPES.passable) !== -1) {
        if(this.enters.length > 2) {
            if (enter !== this.map[x][y].enter && this.enters[this.map[x][y].enter].linked !== enter) {
                this.enters[enter].linked = this.map[x][y].enter;
                isLinked = true;
            } else if(enter === this.map[x][y].enter && this.enters[enter].branch.length > 1) {
                isLinked = true;
            }
        } else {
            if (enter !== this.map[x][y].enter) {
                this.enters[enter].linked = this.map[x][y].enter;
                isLinked = true;
            } else if(enter === this.map[x][y].enter && this.enters[enter].branch.length > 1) {
                isLinked = true;
            }
        }
    }
    if(!isLinked) {
        var newBranch = parseInt(Math.random() * 100 +1);
        if((newBranch > 0 && newBranch < 25)
            || (newBranch > 80 && newBranch < 100)
            || (this.enters[enter].linked === false && this.enters[enter].branch.length < 2)) {
            this.enters[enter].branch.push({x: x, y: y, enter: enter});
            if(this.map[x][y].type == this.ITEM_TYPES.passable.enter) {
                this.map[x][y] = {type: this.map[x][y].type, enter: enter};
            } else {
                this.map[x][y] = {type: this.ITEM_TYPES.passable.way, enter: enter};
            }
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

Level.prototype.setMapSize = function () {
    this.options.mapWidth = this.options.width * this.options.gridSize;
    this.options.mapHeight = this.options.height * this.options.gridSize;
};

/**
 * Level manipulation
 */

Level.prototype.translate = function (x, y) {
    var offsetX = x,
        offsetY = y;
    if(this.offset.x + x > 0) {
        offsetX = x - (this.offset.x + x);
    }
    if(Math.abs(this.offset.x + x) + this.options.screenWidth > this.options.mapWidth) {
        offsetX = -this.offset.x - (this.options.mapWidth - this.options.screenWidth);
    }
    if(this.offset.y + y > 0) {
        offsetY = y - (this.offset.y + y);
    }
    if(Math.abs(this.offset.y + y) + this.options.screenHeight > this.options.mapHeight) {
        offsetY = -this.offset.y - (this.options.mapHeight - this.options.screenHeight);
    }

    this.offset.x += offsetX;
    this.offset.y += offsetY;

    this.ctx.translate(offsetX, offsetY);
};