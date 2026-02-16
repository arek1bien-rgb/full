const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Funkcja bezpiecznego dopasowania ekranu
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// --- KONFIGURACJA I ŁADOWANIE ---
const GOOD_COUNT = 19;
const BAD_COUNT = 16;
let imagesLoaded = 0;
const totalImages = 3 + GOOD_COUNT + BAD_COUNT;

let goodImages = [];
let badImages = [];
let gameStarted = false;

function loadImage(src) {
    const img = new Image();
    img.onload = () => {
        imagesLoaded++;
        if (imagesLoaded >= totalImages && !gameStarted) {
            gameStarted = true;
            requestAnimationFrame(gameLoop);
        }
    };
    img.onerror = () => {
        console.warn("Pominięto uszkodzony plik: " + src);
        imagesLoaded++; 
        if (imagesLoaded >= totalImages && !gameStarted) {
            gameStarted = true;
            requestAnimationFrame(gameLoop);
        }
    };
    img.src = src;
    return img;
}

// Ładowanie zasobów
const playerImg = loadImage("player.png");
const heartImg = loadImage("heart.png");
const xImg = loadImage("x.png");

for (let i = 1; i <= GOOD_COUNT; i++) goodImages.push(loadImage(`good${i}.png`));
for (let i = 1; i <= BAD_COUNT; i++) badImages.push(loadImage(`bad${i}.png`));

// --- LOGIKA GRY ---
let player = { width: 80, height: 80, x: window.innerWidth / 2 - 40, y: window.innerHeight - 130 };
let items = [];
let effects = [];
let spawnTimer = 0;

function update() {
    spawnTimer++;
    if (spawnTimer > 40) {
        const isGood = Math.random() < 0.6;
        const pool = isGood ? goodImages : badImages;
        const validPool = pool.filter(img => img.complete && img.naturalWidth > 0);
        
        if (validPool.length > 0) {
            items.push({
                x: Math.random() * (canvas.width - 60),
                y: -80,
                width: 60,
                height: 60,
                speed: 3 + Math.random() * 4,
                good: isGood,
                image: validPool[Math.floor(Math.random() * validPool.length)]
            });
        }
        spawnTimer = 0;
    }

    for (let i = items.length - 1; i >= 0; i--) {
        let it = items[i];
        it.y += it.speed;

        // Hitbox (Safari friendly)
        if (it.y + it.height > player.y && it.y < player.y + player.height &&
            it.x + it.width > player.x && it.x < player.x + player.width) {
            effects.push({ x: player.x + 15, y: player.y - 40, img: it.good ? heartImg : xImg, time: 25 });
            items.splice(i, 1);
            continue;
        }
        if (it.y > canvas.height + 50) items.splice(i, 1);
    }

    for (let i = effects.length - 1; i >= 0; i--) {
        effects[i].time--;
        effects[i].y -= 1;
        if (effects[i].time <= 0) effects.splice(i, 1);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    items.forEach(it => ctx.drawImage(it.image, it.x, it.y, it.width, it.height));
    
    if (playerImg.complete) {
        ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
    }

    effects.forEach(e => {
        if (e.img.complete) ctx.drawImage(e.img, e.x, e.y, 50, 50);
    });
}