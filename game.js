const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Dynamiczne dopasowanie rozmiaru
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const playerImg = new Image();
playerImg.src = "player.png";

const heartImg = new Image();
heartImg.src = "heart.png";

const xImg = new Image();
xImg.src = "x.png";

const GOOD_COUNT = 19;
const BAD_COUNT = 16;

let goodImages = [];
let badImages = [];

// POPRAWKA: Usunięto ścieżki folderów, bo pliki są w katalogu głównym
for (let i = 1; i <= GOOD_COUNT; i++) {
    let img = new Image();
    img.src = `good${i}.png`; 
    goodImages.push(img);
}

for (let i = 1; i <= BAD_COUNT; i++) {
    let img = new Image();
    img.src = `bad${i}.png`;
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
    let isGood = Math.random() < 0.55; // 55% szans na dobry przedmiot
    let imgArray = isGood ? goodImages : badImages;
    let img = imgArray[Math.floor(Math.random() * imgArray.length)];

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

        // Kolizja
        if (
            item.x < player.x + player.width &&
            item.x + item.width > player.x &&
            item.y < player.y + player.height &&
            item.y + item.height > player.y
        ) {
            effects.push({
                x: player.x + player.width / 2 - 25,
                y: player.y - 60,
                img: item.good ? heartImg : xImg,
                time: 30
            });
            items.splice(i, 1);
        } else if (item.y > canvas.height) {
            items.splice(i, 1);
        }
    }
}

function updateEffects() {
    for (let i = effects.length - 1; i >= 0; i--) {
        let e = effects[i];
        ctx.drawImage(e.img, e.x, e.y, 50, 50);
        e.y -= 1; // Efekt lekko unosi się do góry
        e.time--;
        if (e.time <= 0) effects.splice(i, 1);
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateItems();
    drawPlayer();
    updateEffects();
    requestAnimationFrame(gameLoop);
}

setInterval(spawnItem, 600);

// Obsługa ruchu z blokadą krawędzi ekranu
function movePlayer(clientX) {
    let newX = clientX - player.width / 2;
    if (newX < 0) newX = 0;
    if (newX > canvas.width - player.width) newX = canvas.width - player.width;
    player.x = newX;
}

canvas.addEventListener("mousemove", (e) => movePlayer(e.clientX));
canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    movePlayer(e.touches[0].clientX);
}, { passive: false });

gameLoop();