const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// --- SYSTEM ŁADOWANIA GRAFIK ---
let imagesLoaded = 0;
const totalImages = 1 + 1 + 1 + 19 + 16; // player + heart + x + good + bad

function imageLoaded() {
    imagesLoaded++;
    if (imagesLoaded >= totalImages) {
        startGame(); // Ruszamy dopiero jak wszystko się załaduje
    }
}

const playerImg = new Image();
playerImg.onload = imageLoaded;
playerImg.src = "player.png";

const heartImg = new Image();
heartImg.onload = imageLoaded;
heartImg.src = "heart.png";

const xImg = new Image();
xImg.onload = imageLoaded;
xImg.src = "x.png";

const GOOD_COUNT = 19;
const BAD_COUNT = 16;
let goodImages = [];
let badImages = [];

for (let i = 1; i <= GOOD_COUNT; i++) {
    let img = new Image();
    img.onload = imageLoaded;
    img.src = `good${i}.png`;
    goodImages.push(img);
}

for (let i = 1; i <= BAD_COUNT; i++) {
    let img = new Image();
    img.onload = imageLoaded;
    img.src = `bad${i}.png`;
    badImages.push(img);
}

// --- LOGIKA GRY ---
let player = {
    width: 80,
    height: 80,
    x: canvas.width / 2 - 40,
    y: canvas.height - 100
};

let items = [];
let effects = [];
let spawnTimer = 0;

function spawnItem() {
    let isGood = Math.random() < 0.6; // 60% szans na dobre
    let imgArray = isGood ? goodImages : badImages;
    let randomImg = imgArray[Math.floor(Math.random() * imgArray.length)];

    items.push({
        x: Math.random() * (canvas.width - 50),
        y: -60,
        width: 50,
        height: 50,
        speed: 3 + Math.random() * 3,
        good: isGood,
        image: randomImg
    });
}

function update() {
    // Spawnowanie przedmiotów co ok. 40 klatek
    spawnTimer++;
    if (spawnTimer > 40) {
        spawnItem();
        spawnTimer = 0;
    }

    // Aktualizacja przedmiotów
    for (let i = items.length - 1; i >= 0; i--) {
        let item = items[i];
        item.y += item.speed;

        // Kolizja
        if (
            item.x < player.x + player.width &&
            item.x + item.width > player.x &&
            item.y < player.y + player.height &&
            item.y + item.height > player.y
        ) {
            effects.push({
                x: player.x + player.width / 2 - 20,
                y: player.y - 40,
                img: item.good ? heartImg : xImg,
                time: 25
            });
            items.splice(i, 1);
            continue;
        }

        if (item.y > canvas.height) {
            items.splice(i, 1);
        }
    }

    // Aktualizacja efektów
    for (let i = effects.length - 1; i >= 0; i--) {
        effects[i].time--;
        effects[i].y -= 1; // Unoszenie się
        if (effects[i].time <= 0) effects.splice(i, 1);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Rysuj przedmioty
    items.forEach(item => {
        ctx.drawImage(item.image, item.x, item.y, item.width, item.height);
    });

    // Rysuj gracza
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

    // Rysuj efekty
    effects.forEach(e => {
        ctx.drawImage(e.img, e.x, e.y, 40, 40);
    });
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function startGame() {
    // Usuwamy ewentualny tekst "Ładowanie" i startujemy
    gameLoop();
}

// Obsługa sterowania
function handleMove(clientX) {
    let targetX = clientX - player.width / 2;
    // Ograniczenie żeby nie wychodził poza ekran
    if (targetX < 0) targetX = 0;
    if (targetX > canvas.width - player.width) targetX = canvas.width - player.width;
    player.x = targetX;
}

canvas.addEventListener("mousemove", (e) => handleMove(e.clientX));
canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    handleMove(e.touches[0].clientX);
}, { passive: false });

// Wyświetl info o ładowaniu na starcie
ctx.fillStyle = "white";
ctx.font = "20px Arial";
ctx.textAlign = "center";
ctx.fillText("Ładowanie grafiki...", canvas.width / 2, canvas.height / 2);