function Player(name, r, g, b) {
    this.x = floor(random(width / w)) * w;
    this.y = floor(random(height / w)) * w;
    this.name = name;
    this.direction = floor(random(4));
    this.r = r;
    this.g = g;
    this.b = b;
    this.tail = [];
    this.tailLength = 0;
    this.record = 0;

    this.setDirection = function(value) {
        switch (value) {
            case 0:
                if (this.direction != 2) {
                    this.direction = value;
                }
                break;
            case 1:
                if (this.direction != 3) {
                    this.direction = value;
                }
                break;
            case 2:
                if (this.direction != 0) {
                    this.direction = value;
                }
                break;
            case 3:
                if (this.direction != 1) {
                    this.direction = value;
                }
                break;
        }
    }

    this.move = function() {

        if (this.tailLength === this.tail.length) {
            for (var i = 0; i < this.tail.length; i++) {
                this.tail[i] = this.tail[i + 1];
            }
        }
        this.tail[this.tailLength - 1] = new Tail(this.x, this.y);

        switch (this.direction) {
            case 0:
                this.y -= w;
                break;
            case 1:
                this.x += w;
                break;
            case 2:
                this.y += w;
                break;
            case 3:
                this.x -= w;
                break;
            default:
                break;
        }
        this.edges();
    }

    this.edges = function() {
        if (this.x < 0) {
            this.x = width - w;
        } else if (this.x > width - w) {
            this.x = 0;
        }
        if (this.y < 0) {
            this.y = height - w;
        } else if (this.y > height - w) {
            this.y = 0;
        }
    }

    this.eat = function(food) {
        d = dist(this.x, this.y, food.x, food.y);
        if (d < 10) {
            this.tailLength++;
            if (this.tailLength > this.record) {
                this.record = this.tailLength;
            }
            return true;
        }
        return false;
    }

    this.render = function() {
        myrect(this.x, this.y, w, w, this.r, this.g, this.b);
        for (var i = 0; i < this.tail.length; i++) {
            if (this.tail[i])
                this.tail[i].render(this.r, this.g, this.b);
        }
    }

    this.dies = function() {
        for (var i = 0; i < this.tail.length; i++) {
            var pos = this.tail[i];
            var d = dist(this.x, this.y, pos.x, pos.y);
            if (d < 1) {
                this.tailLength = 0;
                this.tail = [];
            }
        }
        for (var i = 0; i < players.length; i++) {
            for (var j = 0; j < players[i].tail.length; j++) {
                var pos = players[i].tail[j];
                var d = dist(this.x, this.y, pos.x, pos.y);
                if (d < 1) {
                    this.tailLength = 0;
                    this.tail = [];
                }
            }
        }
    }
}

function Tail(x, y) {
    this.x = x;
    this.y = y;

    this.render = function(r, g, b) {
        myrect(this.x, this.y, w, w, r, g, b);
        //scribble.scribbleRect(this.x, this.y, w, w, r, g, b);
    }
}