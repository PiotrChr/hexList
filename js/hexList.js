$.fn.hexList = function(data,options) {
    var settings = $.extend({
       width: $(this).width(),
       height: $(this).height(),
       container: this,
       data: data
    }, options );
    
    var hexGrid = new HexListClass(settings);
    
    return hexGrid;
};

function HexListClass(options) {
    this.options = options;
    this.grid = [];
    this.settings = $.extend({
       // These are the defaults.
       debug : 1,
       animate: true,
       animation: {
        type: 'shoot',
        offset: 400,
        duration: 1000
       },
       width : '500',
       height: '500',
       a: 50,
       cols: 0,
       tmplPreffix:'hl@',
       autoHeight: true,
       tmplPreffixHover: 'hlHover@',
       padding: 5,
       minRows: 2,
       data: [
            {test:'test'}
       ],
       template: {
            color: '#ffffff',
            borderColor: '',
            borderWidth: 0,
            hover: {
                color: '#ffffff',
                borderColor: '',
                borderWidth: 0
            }
        },
       layout: 'left', // center | left | random | right
       align: 'center', // center | left | right
       theme: 'default-light'
    }, this.options );

    this.width = this.settings.width;
    this.height = this.settings.height;

    this.dimensions();

    if (typeof this.items === 'undefined' || this.items.length === 0) {
        this.createItems();
    }

    this.setGrid();
    this.fillOrder(this.settings.layout);
    
    if (this.settings.autoHeight === true) {
        $(this.settings.container).css({
            'height':this.getHeight() + 'px'
        });
    }

    var init = (this.settings.init !== "undefined" && this.settings.init === true) ? true : false;

    if (init) this.init();
};

HexListClass.prototype.init = function() {
    if (typeof this.initialized == "undefined") this.initialized = false;
    
    if (!this.initialized) {
        this.putItems();
        this.initialized = true;
    }

}

HexListClass.prototype.debug = function(debug) {
    if (debug instanceof Array && this.settings.debug ==  1) {
        console.log(debug[0]);
        console.log(debug[1]);
    }
}

HexListClass.prototype.fillOrder = function(method) {
    var returnArray = [];
    switch(method) {
        case 'left':
            for (lr=0;lr<this.rows;lr++) {
                for (lc=0;lc<this.cols;lc++) {
                    returnArray.push([lr,lc]);
                }
            }
        break;
        case 'center':
            // thing
        break;
        case 'right':
            for (lc=this.cols;lc>0;--lc) {
                for (lr=0;lr<this.rows;lr++) {
                    returnArray.push([lr,lc]);
                }
            }
        break;
        case 'random':
            // thing
        break;
    }

    this.debug(['Fill order:',returnArray]);
    this.order = returnArray;
}

HexListClass.prototype.getHeight = function() {
    // check if there is a new element in the row and then cut by 'a'
    return (this.rows * 2 * this.r) + this.r;
    
}

HexListClass.prototype.openAnimation = function(object, position, animate, animation, duration, offset, count) {
    if (animate) {
        this.debug(['Animation:',animation]);
        this.debug(['Duration:',duration]);
        this.debug(['Offset:',offset]);
    } else {
        this.debug(['Animation:','none']);
    }
    
    if (typeof count == "undefined") count = 0;
    if (animate === false) return;

    switch(animation) {
        case 'fadeIn':
            console.log(position);
            object.css({
                'top':position['top'] + 'px',
                'left':position['left'] + 'px'
            });
            object.delay(count * offset).fadeIn(duration);
            break;
        case 'show':
            object.css({
                'display':'block',
                'opacity':1,
                'top': position['top'],
                'left': position['left']
            })
            break;
        case 'shoot':
            object.css({
                'top':0,
                'left':0,
                'display':'block',
                'opacity':0
            });
            object.delay(count * offset).animate({
                'top': position['top'],
                'left': position['left'],
                'opacity':1
            },duration);
        default:
            break;
    }
}

HexListClass.prototype.putItems = function() {
    var self = this;

    // if order of filling is known
    if (typeof self.order == "undefined") return false;

    // reset container
    $(self.settings.container).html('');

    var count = 0;

    self.debug(['Items',self.items]);

    $.each(self.items, function() {
        if (typeof self.order[count] == "undefined") return true;

        var cFillOrder = self.order[count];
        var position = {
            'top': self.grid[cFillOrder[0]][cFillOrder[1]][1] - (self.a),
            'left': self.grid[cFillOrder[0]][cFillOrder[1]][0] - (self.r)
        };

        this.appendTo(self.settings.container);

        self.debug(['Position hexagon-' + count + ' ', position['top'] + ' ' + position['left']]);

        self.openAnimation(
            this,
            position,
            self.settings.animate,
            self.settings.animation.type,
            self.settings.animation.duration,
            self.settings.animation.offset,count
        );

        count++;
    });
}

HexListClass.prototype.createItems = function() {
    var z = 0;
    var self = this;
    this.items = [];

    $.each(this.settings.data, function(k,v) {
        self.items.push(self.createItem(v));
        z++;
    });
}

HexListClass.prototype.getRandomColor = function() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

HexListClass.prototype.createItem = function(data) {
    var item, color;

    var radius = this.a - this.settings.padding;

    if (this.settings.template.color == 'random') {
        color = this.getRandomColor();
    } else {
        color = this.settings.template.color;
    }

    var canvas = this.drawOnGrid(radius, color, this.settings.template.borderColor, this.settings.template.borderWidth);
    
    var hasHover = (typeof this.settings.template.hover !== "undefined") ? true : false;

    if (hasHover) {
        var hoverCanvas = this.drawOnGrid(radius,this.settings.template.hover.color, this.settings.template.hover.borderColor, this.settings.template.hover.borderWidth)
        var hoverDiv = $.render[this.settings.tmplPreffixHover + this.settings.theme](data);

        var hoverContainer = $('<div />').attr({
            class:'hexListHooverContainer'
        }).append(hoverDiv).append(hoverCanvas);
    }
    
    var contentDiv = $.render[this.settings.tmplPreffix + this.settings.theme](data);

    var bottomContainer = $('<div />').attr({
            class:'hexListBottomContainer'
        }).append(contentDiv).append(canvas);

    item = $('<div />').attr({
            class: this.settings.theme + 'Container hexListContainer'
        }).css({
             width: parseInt(this.a * 2) + 'px',
             height: parseInt(this.r * 2) + 'px',
             'position':'absolute'
        }).append(hoverContainer).append(bottomContainer);

    if (hasHover) item.append(hoverContainer);
    item.append(bottomContainer);

    return item;
}

HexListClass.prototype.dimensions = function() {
    if (this.settings.cols !== 0) {
        this.cols = this.settings.cols;
        this.a = (this.settings.width * ((2 * this.cols) - 1)) / (3 * (Math.pow(this.cols,2)));
    } else {
        this.a = this.settings.a;
        // TODO: update this.cols
        this.cols = Math.floor(this.settings.width/(this.a * 1.5));
    }

    this.r = (this.a * Math.sqrt(3))/2;
}

HexListClass.prototype.setGrid = function() {
    var grid = [];
    var initial = [this.a, this.r];
    var offsetX, offsetY;

    this.rows = Math.ceil(this.items.length / this.cols);

    for (r = 0; r < this.rows; r++) {
        var offsetYcur;

        offsetY = initial[0] + (2 * this.r * r);
        
        if (typeof grid[r] === 'undefined') {
            grid[r] = [];
        }
        for (c = 0; c <= this.cols-1; c++) {
            if (c%2 !== 0) {
                offsetYcur = offsetY + this.r;
            } else {
                offsetYcur = offsetY;
            }

            offsetX = initial[1] + (1.5 * this.a * c);
            grid[r][c] = [offsetX,offsetYcur];
        }
    }

    this.grid = grid;
    this.debug(['Grid:',grid]);
};

HexListClass.prototype.drawOnGrid = function(radius,color,border,borderWidth) {
    
    this.debug(['hex radius',radius]);
    this.debug(['hex color',color]);
    this.debug(['hex border',border]);
    this.debug(['hex border-width',borderWidth]);

    var numberOfSides = 6;
    var size = radius;

    var canvas = $('<canvas />').attr({
        class: 'hexGridCanvas',
        width: parseInt(2*this.a) + 'px',
        height: parseInt(2*this.r) + 'px'
    });

    var cxt = $(canvas)[0].getContext('2d');
    var dif = this.a - this.r;

    cxt.beginPath();
    cxt.moveTo (this.a +  size * Math.cos(0), this.a - dif +  size *  Math.sin(0));          
     
    for (var i = 1; i <= numberOfSides;i += 1) {
        cxt.lineTo (this.a + size * Math.cos(i * 2 * Math.PI / numberOfSides), this.a - dif + size * Math.sin(i * 2 * Math.PI / numberOfSides));
    }

    cxt.fillStyle = color;
    cxt.strokeStyle = border;
    cxt.lineWidth = borderWidth;
    cxt.closePath();
    cxt.fill();
    
    return canvas;
}


$.templates("hl@default-light", "<div class=\"default-lightTextTop\">\
                                </div>\
                                <div class=\"default-lightMid\">\
                                </div>\
                                <div class=\"default-lightTextBottom\">\
                                </div>\
                                ");
$.templates("hlHover@default-light", "<div class=\"default-ligthHoverOverlay\">\
                                </div>");
