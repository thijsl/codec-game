
function setupDom(container) {
    var dom = `<div id="start"><button>START GAME</button></div>
<div id="game">
<div id="result">👍</div>
<h2>Is the original on the <button class="left">left</button> side or <button class="right">right</button> side?</h2>
    <div id="loading">Loading video<br /><div class="spinner"></div></div>
    <div id="wrapper">
    <div id="first"><video id="vid1" src="" muted="true" loop></video></div>
    <div id="second"><video id="vid2" src="" muted="true" loop></video></div>
    <div id="overlay">
        <div id="choice"><div id="col1"><span><button class="left"><< Left</button></span></div><div id="col2"><span><button class="right">Right >></button></span></div></div>
    </div>
</div>
<p id="score-container">Your score: <span id="score">0</span></p>
<p id="game-info">Original (<span id="originalType">H.264</span>, <span id="originalSize">32</span> MB, <span id="originalResolution">1920x800</span>) vs Fake (<span id="fakeType"></span>, <span id="fakeSize"></span> MB, <span id="fakeResolution"></span>, <span id="fakeCreatedBy"></span>)
    <br />#1 rule: Only use your eyes. (Don't use the Developer Tools / Console.)
    <br /><span id="play">Play video! (Experimental)</span><br /><button id="again">Try again?</button></p>
</div>`;
    container.innerHTML = dom;
}

function createCodecGame(container) {
    setupDom(container);
    setupLogic();
}

function setupLogic() {

    var vid1 = document.querySelector("#vid1"), vid2 = document.querySelector("#vid2");
    var result = document.querySelector('#result');
    var vid1Loaded = false, vid2Loaded = false;
    var score = 0;

    function getData() {
        var request = new XMLHttpRequest();
        request.open('GET', 'data.json', false);  // `false` makes the request synchronous
        request.send(null);
        var data = null;
        if (request.status === 200) {
            data = JSON.parse(request.responseText);
        }
        return data
    }

    var data = getData();
    vid1.src = data.original.url;
    document.querySelector('#originalType').textContent = data.original.codec;
    document.querySelector('#originalSize').textContent = data.original.size;
    document.querySelector('#originalResolution').textContent = data.original.resolution;

    function getFakes(allFakes) {
        var acceptedFakes = [];
        for (var i = 0; i < allFakes.length; i++) {
            var currentFake = allFakes[i];
            if (vid1.canPlayType(currentFake.type) != "") {
                acceptedFakes.push(currentFake);
            }
        }
        return acceptedFakes;
    }

    var fakes = getFakes(data.fakes)

    function getFake() {
        var random = Math.floor(Math.random() * (fakes.length));
        return fakes[random];
    }

    function getPosition() {
        return Math.floor(Math.random() * 2);
    }

    var originalPosition;
    var position;

    function shuffle() {
        hideVideos()
        for (var i = 0; i < leftButtons.length; i++) {
            leftButtons[i].disabled = false;
        }
        for (var i = 0; i < rightButtons.length; i++) {
            rightButtons[i].disabled = false;
        }
        var fake = getFake();
        document.querySelector('#fakeType').textContent = fake.codec;
        document.querySelector('#fakeSize').textContent = fake.size;
        document.querySelector('#fakeResolution').textContent = fake.resolution;
        document.querySelector('#fakeCreatedBy').textContent = fake.createdBy;
        originalPosition = getPosition();

        function canplayListener() {
            this.removeEventListener('canplay', canplayListener);
            this.currentTime = position;
        }

        vid1.addEventListener('canplay', canplayListener);
        vid2.addEventListener('canplay', canplayListener);

        vid1.pause();
        vid2.pause();
        playing = false;
        document.querySelector('#play').textContent = "Play video! (Experimental)";

        vid2.src = fake.url;
        if (originalPosition == 0) {
            vid1.className = "leftVideo";
            vid2.className = "rightVideo";
        } else {
            vid1.className = "rightVideo";
            vid2.className = "leftVideo";
        }
        position = Math.floor(Math.random() * 54) + 7;
        vid1.currentTime = position;
        vid2.currentTime = position;
    }

    function showVideos() {
        if (vid1Loaded && vid2Loaded) {
            vid1.style.display = "block";
            vid2.style.display = "block";
            document.querySelector('#choice').style.display = "block";
            document.querySelector('#loading').style.display = "none";
        }
    }

    function hideVideos() {
        vid1Loaded = false;
        vid2Loaded = false;
        vid1.style.display = "none";
        vid2.style.display = "none";
        document.querySelector('#choice').style.display = "none";
        document.querySelector('#loading').style.display = "block";
    }

    vid1.addEventListener('seeked', function () {
        vid1Loaded = true;
        showVideos();
    })
    vid2.addEventListener('seeked', function () {
        vid2Loaded = true;
        showVideos();
    })

    var playing = false;
    document.querySelector('#play').addEventListener('click', function (e) {
        if (!playing) {
            document.querySelector('#play').textContent = "Pause video! (Experimental)";
            vid1.play();
            vid2.play();
        } else {
            document.querySelector('#play').textContent = "Play video! (Experimental)"
            vid1.pause();
            vid2.pause();
        }
        playing = !playing;
    })

    function start() {
        result.style.display = 'none';
        document.querySelector('#score').textContent = 0;
        shuffle();
    }

    document.querySelector('#again').addEventListener('click', function () {
        start();
    });

    var leftButtons = document.querySelectorAll('.left'), rightButtons = document.querySelectorAll('.right');

    var yes = ['👍', '👌', '✅'];
    var no = ['👎', '❌', '😓'];
    function updateScore() {
        result.textContent = yes[Math.floor(Math.random() * yes.length)];
        result.style.display = 'block';
        setTimeout(function() {
            result.style.display = 'none';
        }, 1000)
        score = score + 1;
        document.querySelector('#score').textContent = score;
    }

    function gameOver() {
        result.textContent = no[Math.floor(Math.random() * no.length)];
        result.style.display = 'block';

        document.querySelector('#score').textContent = score + " (GAME OVER)";
        score = 0;
        for (var i = 0; i < leftButtons.length; i++) {
            leftButtons[i].disabled = true;
        }
        for (var i = 0; i < rightButtons.length; i++) {
            rightButtons[i].disabled = true;
        }
    }

    for (var i = 0; i < leftButtons.length; i++) {
        leftButtons[i].addEventListener('click', function (e) {
            if (originalPosition == 0) {
                updateScore();
                shuffle();
            } else {
                gameOver();
            }
        });
    }
    for (var i = 0; i < rightButtons.length; i++) {
        rightButtons[i].addEventListener('click', function (e) {
            if (originalPosition == 1) {
                updateScore();
                shuffle();
            } else {
                gameOver();
            }
        });
    }

    document.querySelector('#start button').addEventListener('click', function () {
        document.querySelector('#start').style.display = "none";
        document.querySelector('#game').style.display = "block";
        start();
    })

}