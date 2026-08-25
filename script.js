// =========================
// 画面取得
// =========================

const screens = document.querySelectorAll(".screen");

const homeScreen = document.getElementById("homeScreen");
const settingScreen = document.getElementById("settingScreen");
const ruleScreen = document.getElementById("ruleScreen");
const onlineScreen = document.getElementById("onlineScreen");
const waitingScreen = document.getElementById("waitingScreen");


// =========================
// ボタン取得
// =========================

const startBtn = document.getElementById("startBtn");
const ruleBtn = document.getElementById("ruleBtn");
const settingBtn = document.getElementById("settingBtn");

const saveSettingBtn = document.getElementById("saveSettingBtn");

const createRoomBtn = document.getElementById("createRoomBtn");
const joinRoomBtn = document.getElementById("joinRoomBtn");

const roomCodeInput = document.getElementById("roomCodeInput");
const roomCodeDisplay = document.getElementById("roomCodeDisplay");

const playerNameInput = document.getElementById("playerName");


// =========================
// プレイヤー名
// =========================

let playerName =
    localStorage.getItem("kanteiPlayerName") || "";

playerNameInput.value = playerName;


// =========================
// 画面切り替え
// =========================

function showScreen(screen) {

    screens.forEach(function(s) {
        s.classList.remove("active");
    });

    screen.classList.add("active");
}


// =========================
// ホーム
// =========================

function goHome() {
    showScreen(homeScreen);
}


// =========================
// スタート
// =========================

startBtn.addEventListener("click", function() {

    if (playerName.trim() === "") {

        alert("先に設定からプレイヤー名を入力してください。");

        showScreen(settingScreen);

        return;
    }

    showScreen(onlineScreen);
});


// =========================
// ルール
// =========================

ruleBtn.addEventListener("click", function() {

    showScreen(ruleScreen);

});


// =========================
// 設定
// =========================

settingBtn.addEventListener("click", function() {

    showScreen(settingScreen);

});


// =========================
// 設定保存
// =========================

saveSettingBtn.addEventListener("click", function() {

    const name =
        playerNameInput.value.trim();

    if (name === "") {

        alert("プレイヤー名を入力してください。");

        return;
    }

    playerName = name;

    localStorage.setItem(
        "kanteiPlayerName",
        playerName
    );

    alert("プレイヤー名を保存しました。");

    showScreen(homeScreen);

});


// =========================
// 戻るボタン
// =========================

document.querySelectorAll(".backBtn").forEach(function(button) {

    button.addEventListener("click", function() {

        showScreen(homeScreen);

    });

});


// =========================
// 合言葉生成
// =========================

function generateRoomCode() {

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code = "";

    for (let i = 0; i < 6; i++) {

        const index =
            Math.floor(
                Math.random() * characters.length
            );

        code += characters[index];
    }

    return code;
}


// =========================
// 部屋を作る
// =========================

createRoomBtn.addEventListener("click", function() {

    const roomCode =
        generateRoomCode();

    roomCodeDisplay.textContent =
        roomCode;

    showScreen(waitingScreen);

    console.log(
        "作成した部屋:",
        roomCode
    );

});


// =========================
// 部屋に参加
// =========================

joinRoomBtn.addEventListener("click", function() {

    const code =
        roomCodeInput.value
            .trim()
            .toUpperCase();

    if (code.length !== 6) {

        alert(
            "6文字の合言葉を入力してください。"
        );

        return;
    }

    console.log(
        "参加する部屋:",
        code
    );

    roomCodeDisplay.textContent =
        code;

    showScreen(waitingScreen);

});


// =========================
// 合言葉入力
// =========================

roomCodeInput.addEventListener("input", function() {

    roomCodeInput.value =
        roomCodeInput.value
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "")
            .slice(0, 6);

});