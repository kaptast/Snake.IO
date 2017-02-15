var socket;
var w = 20;
var grid = [];
var player;
var players = [];
var button, input;
var rSlider, gSlider, bSlider;
var started = false;
var food;
var scribble = new Scribble();

setInterval(update, 99);

function myrect(x, y, h, h2, r, g, b) {

    var x = x + h / 2;
    var y = y + h2 / 2;
    var xleft = x - h / 2;
    var xright = x + h / 2;
    var ytop = y - h2 / 2;
    var ybottom = y + h2 / 2;

    // the x coordinates of the border points of the hachure
    var xCoords = [xleft, xright, xright, xleft];
    // the y coordinates of the border points of the hachure
    var yCoords = [ytop, ytop, ybottom, ybottom];
    // the gap between two hachure lines
    var gap = 3.5;
    // the angle of the hachure in degrees
    var angle = 315;
    // set the thikness of our hachure lines
    strokeWeight(3);
    //set the color of the hachure to a nice blue
    stroke(r, g, b);
    // fill the rect with a hachure
    scribble.scribbleFilling(xCoords, yCoords, gap, angle);
    stroke(0);
    strokeWeight(1);
    scribble.scribbleRect(x, y, h, h2);
}

function setup() {
    var myCanvas = createCanvas(1001, 621);
    myCanvas.parent('myContainer');

    input = createInput();

    button = createButton('Belépés');
    button.mousePressed(start);

    rSlider = createSlider(0, 255, 127);
    gSlider = createSlider(0, 255, 127);
    bSlider = createSlider(0, 255, 127);

    input.position(windowWidth / 2 - 119, height / 2 - 30);
    button.position(windowWidth / 2 + 54, height / 2 - 30);
    rSlider.position(windowWidth / 2 - 119, height / 2 - 10);
    gSlider.position(windowWidth / 2 - 119, height / 2 + 20);
    bSlider.position(windowWidth / 2 - 119, height / 2 + 50);

    // Start a socket connection to the server
    // Some day we would run this server somewhere else
    socket = io.connect('http://localhost:3000');
    socket.on('heartbeat',
        function(data) {
            players = data;
            //console.log(players);
        }
    );

    socket.on('foodsent',
        function(data) {
            food = data;
            //console.log(players);
        }
    );
}

function start() {
    var name = input.value();
    player = new Player(name, rSlider.value(), gSlider.value(), bSlider.value());
    button.remove();
    input.remove();
    rSlider.remove();
    gSlider.remove();
    bSlider.remove();
    started = true;

    // Make a little object with  and y
    var data = {
        x: player.x,
        y: player.y,
        name: player.name,
        r: player.r,
        g: player.g,
        b: player.b,
        tail: player.tail,
        total: player.tailLength
    };
    socket.emit('start', data);
}

function draw() {
    background(255);
    stroke(172, 204, 252);
    for (var i = 0; i < width / w; i++) {
        line(0, i * w, width, i * w);
        line(i * w, 0, i * w, height);
    }
    if (!started) {
        textSize(100);
        textAlign(CENTER);
        fill(0);
        text("Snake.js", width / 2, height / 2 - 65);
        myrect(width / 2 + 21, height / 2 - 10, 85, 70, rSlider.value(), gSlider.value(), bSlider.value());

    } else {
        textSize(10);
        var textheight = 10;
        for (var i = 0; i < players.length; i++) {
            if (socket.id != players[i].id) {
                //fill(players[i].r, players[i].g, players[i].b);
                myrect(players[i].x, players[i].y, w, w, players[i].r, players[i].g, players[i].b);
                //scribble.scribbleRect(players[i].x, players[i].y, w, w);
                for (var j = 0; j < players[i].tail.length; j++) {
                    myrect(players[i].tail[j].x, players[i].tail[j].y, w, w, players[i].r, players[i].g, players[i].b);
                }
                textAlign(CENTER);
                fill(0);
                text(players[i].name, players[i].x + w / 2, players[i].y - 2);
                textAlign(LEFT);
                text(players[i].name + " pontszáma: " + players[i].total + " - Rekord: " + players[i].record, 10, height - 10 - textheight);
                textheight += 10;
            }
        }
        if (food) {
            myrect(food.x, food.y, w, w, 255, 0, 0);
        }

        if (player) {
            player.render();
            fill(0);
            textAlign(LEFT);
            text(player.name + " pontszáma: " + player.tailLength + " - Rekord: " + player.record, 10, height - 10);
        }
    }
}

function update() {
    if (player) {
        var data = {
            x: player.x,
            y: player.y,
            tail: player.tail,
            total: player.tailLength,
            record: player.record
        };
        socket.emit('update', data);
        player.dies();
        if (player.eat(food)) {
            socket.emit('food');
        }
        player.move();
    }
    socket.emit('update', data);
}

function keyPressed() {
    if (keyCode == UP_ARROW) {
        player.setDirection(0);
    } else if (keyCode == DOWN_ARROW) {
        player.setDirection(2);
    } else if (keyCode == RIGHT_ARROW) {
        player.setDirection(1);
    } else if (keyCode == LEFT_ARROW) {
        player.setDirection(3);
    }
}