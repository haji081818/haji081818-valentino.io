// Snake Game with Valentine's Theme
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game Variables
const LOGICAL_SIZE = 600; // logical canvas size for game coordinates
const gridSize = 20; // logical pixels per tile
const tileCount = LOGICAL_SIZE / gridSize;

let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameOver = false;
let gameRunning = true;

// Update high score display
document.getElementById('highScore').textContent = highScore;

// Game Loop
let gameSpeed = 100; // milliseconds
let lastGameTime = 0;

// Responsive and HiDPI canvas setup
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const displaySize = Math.min(window.innerWidth * 0.92, LOGICAL_SIZE);
    // CSS size (what the user sees)
    canvas.style.width = displaySize + 'px';
    canvas.style.height = displaySize + 'px';
    // backing store size (actual drawing buffer)
    canvas.width = Math.round(LOGICAL_SIZE * dpr);
    canvas.height = Math.round(LOGICAL_SIZE * dpr);
    // scale drawing operations so 1 unit = 1 logical pixel
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function gameLoop(currentTime) {
    requestAnimationFrame(gameLoop);

    if (!gameRunning) return;

    if (currentTime - lastGameTime > gameSpeed) {
        lastGameTime = currentTime;
        update();
        draw();
    }
}

function update() {
    // Update direction
    direction = nextDirection;

    // Move snake
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // Check wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        endGame();
        return;
    }

    // Check self collision
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            endGame();
            return;
        }
    }

    snake.unshift(head);

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        document.getElementById('score').textContent = score;
        generateFood();
        // Slightly increase speed
        gameSpeed = Math.max(60, gameSpeed - 2);
    } else {
        snake.pop();
    }
}

function draw() {
    // Clear canvas with gradient (use logical size)
    const gradient = ctx.createLinearGradient(0, 0, LOGICAL_SIZE, LOGICAL_SIZE);
    gradient.addColorStop(0, '#fff5f9');
    gradient.addColorStop(1, '#ffe0ec');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, LOGICAL_SIZE, LOGICAL_SIZE);

    // Draw snake
    snake.forEach((segment, index) => {
        // Head - darker pink with cute eyes
        if (index === 0) {
            // Snake head: purple
            ctx.fillStyle = '#7e40b1';
            ctx.beginPath();
            ctx.roundRect(
                segment.x * gridSize + 2,
                segment.y * gridSize + 2,
                gridSize - 4,
                gridSize - 4,
                6
            );
            ctx.fill();

            // Draw cute eyes
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(segment.x * gridSize + 8, segment.y * gridSize + 8, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(segment.x * gridSize + 14, segment.y * gridSize + 8, 2, 0, Math.PI * 2);
            ctx.fill();

            // Draw pupils (dark purple)
            ctx.fillStyle = '#3a0066';
            ctx.beginPath();
            ctx.arc(segment.x * gridSize + 8, segment.y * gridSize + 8, 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(segment.x * gridSize + 14, segment.y * gridSize + 8, 1, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Body - purple shades gradient
            ctx.fillStyle = `hsl(270, 60%, ${60 - index * 2}%)`;
            ctx.beginPath();
            ctx.roundRect(
                segment.x * gridSize + 2,
                segment.y * gridSize + 2,
                gridSize - 4,
                gridSize - 4,
                5
            );
            ctx.fill();
        }
    });

    // Draw food (cute heart)
    drawHeart(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, 6);
}

function drawHeart(x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 10, size / 10);

    // Purple gradient heart for food
    const g = ctx.createLinearGradient(-10, -10, 10, 10);
    g.addColorStop(0, '#b18cff');
    g.addColorStop(1, '#7e40b1');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, 3);
    ctx.bezierCurveTo(-5, -2, -10, -5, -10, -5);
    ctx.bezierCurveTo(-10, -8, -7, -10, -5, -10);
    ctx.bezierCurveTo(-3, -10, 0, -8, 0, -5);
    ctx.bezierCurveTo(0, -8, 3, -10, 5, -10);
    ctx.bezierCurveTo(7, -10, 10, -8, 10, -5);
    ctx.bezierCurveTo(10, -5, 5, -2, 0, 3);
    ctx.fill();

    ctx.restore();
}

function generateFood() {
    let newFood;
    let collision = true;

    while (collision) {
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };

        collision = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    }

    food = newFood;
}

function endGame() {
    gameRunning = false;
    gameOver = true;

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        document.getElementById('highScore').textContent = highScore;
    }

    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOverScreen').classList.add('show');
}

// Keyboard Controls
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;

    switch (e.key) {
        case 'ArrowUp':
            if (direction.y === 0) nextDirection = { x: 0, y: -1 };
            e.preventDefault();
            break;
        case 'ArrowDown':
            if (direction.y === 0) nextDirection = { x: 0, y: 1 };
            e.preventDefault();
            break;
        case 'ArrowLeft':
            if (direction.x === 0) nextDirection = { x: -1, y: 0 };
            e.preventDefault();
            break;
        case 'ArrowRight':
            if (direction.x === 0) nextDirection = { x: 1, y: 0 };
            e.preventDefault();
            break;
    }
});

// Touch / Swipe Controls for mobile
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
const SWIPE_THRESHOLD = 20; // px

window.addEventListener('touchstart', (e) => {
    if (!e.touches || e.touches.length === 0) return;
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
}, { passive: true });

window.addEventListener('touchend', (e) => {
    // touchend doesn't have touches; use changedTouches
    const t = e.changedTouches ? e.changedTouches[0] : null;
    if (!t) return;
    touchEndX = t.clientX;
    touchEndY = t.clientY;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;
    if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return;
    if (Math.abs(dx) > Math.abs(dy)) {
        // horizontal
        if (dx > 0 && direction.x === 0) nextDirection = { x: 1, y: 0 };
        else if (dx < 0 && direction.x === 0) nextDirection = { x: -1, y: 0 };
    } else {
        // vertical
        if (dy > 0 && direction.y === 0) nextDirection = { x: 0, y: 1 };
        else if (dy < 0 && direction.y === 0) nextDirection = { x: 0, y: -1 };
    }
}

// On-screen control buttons
document.addEventListener('click', (e) => {
    const btn = e.target.closest && e.target.closest('.ctrl');
    if (!btn) return;
    const dir = btn.getAttribute('data-dir');
    applyDirection(dir);
});

// Support touchstart on buttons (immediate response)
document.addEventListener('touchstart', (e) => {
    const btn = e.target.closest && e.target.closest('.ctrl');
    if (!btn) return;
    e.preventDefault();
    const dir = btn.getAttribute('data-dir');
    applyDirection(dir);
}, { passive: false });

function applyDirection(dir) {
    if (!gameRunning) return;
    if (dir === 'up' && direction.y === 0) nextDirection = { x: 0, y: -1 };
    if (dir === 'down' && direction.y === 0) nextDirection = { x: 0, y: 1 };
    if (dir === 'left' && direction.x === 0) nextDirection = { x: -1, y: 0 };
    if (dir === 'right' && direction.x === 0) nextDirection = { x: 1, y: 0 };
}

// Button Event Listeners
let noBtnSize = 1;

document.getElementById('yesBtn').addEventListener('click', () => {
    document.getElementById('gameOverScreen').classList.remove('show');
    document.getElementById('popupMessage').classList.add('show');

    // Create floating hearts
    for (let i = 0; i < 8; i++) {
        createFloatingHeart();
    }
    // Create floating tulips (Tailwind-styled + custom animation)
    for (let i = 0; i < 6; i++) {
        createFloatingTulip();
    }
    // Keep popup open until user clicks 'Play Again'
    document.getElementById('yesBtn').disabled = true;
});

document.getElementById('noBtn').addEventListener('click', function () {
    noBtnSize += 0.2;
    this.style.transform = `scale(${noBtnSize})`;

    if (noBtnSize > 2.5) {
        // NO button gets too big, show yes message anyway
        document.getElementById('gameOverScreen').classList.remove('show');
        document.getElementById('popupMessage').classList.add('show');

        for (let i = 0; i < 8; i++) {
            createFloatingHeart();
        }

        setTimeout(() => {
            restartGame();
        }, 3000);
    }
});

function createFloatingHeart() {
    const heart = document.createElement('div');
    heart.classList.add('heart-float');
    heart.textContent = '💕';
    heart.style.left = Math.random() * 100 + '%';
    heart.style.bottom = '-30px';
    document.body.appendChild(heart);

    setTimeout(() => heart.remove(), 3000);
}

function createFloatingTulip() {
        const wrap = document.createElement('div');
        // Use Tailwind utility classes for sizing & positioning; .tulip-anim handles the motion
        wrap.className = 'absolute tulip-anim w-10 h-12';
        wrap.style.left = (10 + Math.random() * 80) + '%';
        wrap.style.bottom = '-40px';

        // Simple tulip SVG (pink petals + green stem)
        wrap.innerHTML = `
            <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
                <g>
                    <path d="M32 10 C24 10 16 18 16 26 C16 34 24 40 32 40 C40 40 48 34 48 26 C48 18 40 10 32 10 Z" fill="#ff6fa8" />
                    <path d="M22 26 C26 30 26 36 32 36 C38 36 38 30 42 26" fill="#ff8fc0" opacity="0.95" />
                    <rect x="30" y="36" width="4" height="18" fill="#4CAF50" rx="2" />
                </g>
            </svg>
        `;

        document.body.appendChild(wrap);
        setTimeout(() => wrap.remove(), 3200);
}

function restartGame() {
    // Reset game variables
    snake = [{ x: 10, y: 10 }];
    food = { x: 15, y: 15 };
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    gameOver = false;
    gameRunning = true;
    gameSpeed = 100;

    // Reset UI
    document.getElementById('score').textContent = score;
    document.getElementById('popupMessage').classList.remove('show');
    document.getElementById('gameOverScreen').classList.remove('show');
    noBtnSize = 1;
    document.getElementById('noBtn').style.transform = 'scale(1)';
}

// Close popup and restart when 'Play Again' pressed
document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'closePopupBtn') {
        document.getElementById('popupMessage').classList.remove('show');
        document.getElementById('yesBtn').disabled = false;
        restartGame();
    }
});

// Start the game loop
requestAnimationFrame(gameLoop);

// Polyfill for roundRect if not supported
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.beginPath();
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
        return this;
    };
}
