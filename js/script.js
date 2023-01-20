const avaliableBuckets = [];
const basePath = '../img/garbage/';
const types = {
    organic: [
        'banana.png',
        'apple.png',
    ],
    plastic: [
        'soda-bottle.png',
        'bottle.png',
        'gallon.png',
    ],
    paper: [
        'toilet.png',
        'parchment.png',
        'news.png',
    ],
    metal: [
        'cola.png',
        'can.png',
    ],
    glass: [
        'time.png',
        'glasses.png',
    ],
    danger: [
        'battery.png',
        'plastic.png',
    ],
};

const getRandomItem = items => {
    return items[Math.floor(Math.random() * items.length)];
}

const getRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
}


class Garbage {
    constructor(line) {
        this.type = getRandomItem(avaliableBuckets).type;
        this.image = basePath + getRandomItem(types[this.type]);

        this.element = document.createElement('div');

        this.element.classList.add('garbage_item');
        this.element.style.setProperty('--img', `url(${this.image})`);
        this.element.dataset.position = 1;
        this.element.dataset.line = line;

        document.querySelector('.garbage').append(this.element);
    }

    move() {
        return ++this.element.dataset.position;
    }
}


class TrashLine {
    constructor(number) {
        this.number = number;
        this.collection = [];

        this.element = document.createElement('div');
        this.element.classList.add('line', 'line-' + this.number);
        document.querySelector('.lines').append(this.element);
    }

    moveGarbage() {
        this.collection.forEach(garbage => garbage.move());
    }
}


class Bucket {
    constructor() {
        this.type = Object.keys(types)[avaliableBuckets.length];

        this.bucket = document.createElement('div');
        this.bucketIcon = document.createElement('div');
        this.bucketKey = document.createElement('div');

        this.bucket.classList.add('bucket');
        this.bucketKey.classList.add('bucket_key');
        this.bucketIcon.classList.add('bucket_icon', this.type);

        this.bucketKey.textContent = avaliableBuckets.length + 1;
        this.bucket.append(this.bucketIcon, this.bucketKey);

        document.querySelector('.buckets').append(this.bucket);
    }

    set active(value) {
        if (value) {
            this.bucket.classList.add('active');
            const bucketIcon = this.bucketIcon.cloneNode(true);
            bucketIcon.classList.add('game_bucket');

            gameBucketBox.innerHTML = '';
            gameBucketBox.append(bucketIcon);
        } else {
            this.bucket.classList.remove('active');
        }
    }
}

const gameBucketBox = document.querySelector('.game_bucket_box');
const scoreBox = document.querySelector('.score').dataset;
const lifeBox = document.querySelector('.life_box').dataset;

const trashLines = [
    new TrashLine(1),
    new TrashLine(2),
    new TrashLine(3),
    new TrashLine(4),
];

let playing;

function startGame() {
    if (playing) clearInterval(playing);

    scoreBox.score = 0;
    lifeBox.life = 3;

    avaliableBuckets.forEach(bucket => {
        bucket.bucket.remove();
    });
    avaliableBuckets.splice(0, avaliableBuckets.length);
    avaliableBuckets.push(new Bucket());
    avaliableBuckets[0].active = true;

    trashLines.forEach(trashLine => {
        trashLine.collection.forEach(garbage => garbage.element.remove());
        trashLine.collection = [];
    });

    playing = setInterval(tick, 500);
}

function tick() {
    const bucketLine = +gameBucketBox.dataset.line;
    const bucketTypes = gameBucketBox.firstElementChild.classList;

    trashLines.forEach(trashLine => {
        trashLine.moveGarbage();

        const garbageToRemoveIndex = trashLine.collection.findIndex(garbage => {
            return +garbage.element.dataset.position > 5
        });
        if (garbageToRemoveIndex !== -1) {
            const garbageToRemove = trashLine.collection[garbageToRemoveIndex];

            if (bucketLine === trashLine.number && bucketTypes.contains(garbageToRemove.type)) {
                scoreBox.score++;
            } else if (--lifeBox.life === 0) {
                alert(`Ваш результат: ${scoreBox.score}`)
                startGame();
            }

            garbageToRemove.element.remove();
            trashLine.collection.splice(garbageToRemoveIndex, 1);
        }

    });

    const allCollectionEmpty = trashLines.every(i => i.collection.every(j => j.length === 0));

    if (getRandomNumber(0, 10) < 3 || allCollectionEmpty) {
        const line = getRandomNumber(0, trashLines.length-1);
        trashLines[line].collection.push(new Garbage(line+1));
    }


    if (+scoreBox.score > 20 * avaliableBuckets.length &&
        Object.keys(types).length > avaliableBuckets.length) avaliableBuckets.push(new Bucket());
}

document.addEventListener('keydown', e => {
    const line = +gameBucketBox.dataset.line;
    if (e.key === 'ArrowRight' && line < 3) {
        gameBucketBox.dataset.line = line + 2;
    } else if (e.key === 'ArrowLeft' && line > 2) {
        gameBucketBox.dataset.line = line - 2;
    } else if (e.key === 'ArrowUp' && line % 2 === 0) {
        gameBucketBox.dataset.line = line - 1;
    } else if (e.key === 'ArrowDown' && line % 2 === 1) {
        gameBucketBox.dataset.line = line + 1;
    } else if (e.key === '0') return;

    if (+e.key-1 < avaliableBuckets.length) {
        avaliableBuckets.forEach(bucket => bucket.active = false);
        avaliableBuckets[+e.key-1].active = true;
    }
});

startGame();
