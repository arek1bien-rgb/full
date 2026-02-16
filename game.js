const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const playerImg = new Image();
playerImg.src = "assets/player.png";

const heartImg = new Image();
heartImg.src = "assets/heart.png";

const xImg = new Image();
xImg.src = "assets/x.png";

const GOOD_COUNT = 19;
const BAD_COUNT = 16;

let goodImages = [];
let badImages = [];

for (let i = 1; i <= GOOD_COUNT; i++) {
    let img = new Image();
    img.src = `assets/good/good${i}.png`;
    goodImages.push(img);
}

for (let i = 1; i <= BAD_COUNT; i++) {
    let img = new Image();
    img.src = `assets/bad/bad${i}.png`;
    badImages.push(img);
}

let player = {
    width: 100,
    height: 100,
    x: canvas.width / 2 - 50,
    y: canvas.height - 120
};

let items = [];
let effects = [];

function spawnItem() {
    let isGood = Math.random() < 0.55; // trochę więcej dobrych
    let img = isGood
        ? goodImages[Math.floor(Math.random() * goodImages.length)]
        : badImages[Math.floor(Math.random() * badImages.length)];

    items.push({
        x: Math.random() * (canvas.width - 60),
        y: -60,
        width: 60,
        height: 60,
        speed: 3 + Math.random() * 4,
        good: isGood,
        image: img
    });
}

function drawPlayer() {
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
}

function updateItems() {
    for (let i = items.length - 1; i >= 0; i--) {
        let item = items[i];
        item.y += item.speed;

        ctx.drawImage(item.image, item.x, item.y, item.width, item.height);

        // kolizja
        if (
            item.x < player.x + player.width &&
            item.x + item.width > player.x &&
            item.y < player.y + player.height &&
            item.y + item.height > player.y
        ) {
            if (item.good) {
                effects.push({
                    x: player.x + player.width / 2 - 25,
                    y: player.y - 50,
                    img: heartImg,
                    time: 30
                });
            } else {
                effects.push({
                    x: player.x + player.width / 2 - 25,
                    y: player.y - 50,
                    img: xImg,
                    time: 30
                });
            }

            items.splice(i, 1);
        }

        if (item.y > canvas.height) {
            items.splice(i, 1);
        }
    }
}

function updateEffects() {
    for (let i = effects.length - 1; i >= 0; i--) {
        let e = effects[i];
        ctx.drawImage(e.img, e.x, e.y, 50, 50);
        e.time--;
        if (e.time <= 0) effects.splice(i, 1);
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawPlayer();
    updateItems();
    updateEffects();

    requestAnimationFrame(gameLoop);
}

setInterval(spawnItem, 600);

canvas.addEventListener("mousemove", (e) => {
    player.x = e.clientX - player.width / 2;
});

canvas.addEventListener("touchmove", (e) => {
    player.x = e.touches[0].clientX - player.width / 2;
});

gameLoop();
