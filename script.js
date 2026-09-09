const SUPABASE_URL = "https://yxqukgbubjfdxebwxnil.supabase.co";
const SUPABASE_KEY = "sb_publishable_lUFvf5d39j8g2kgkgBaYFQ_GGr6duNS";
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
// ==========================================
// Supabase
// ==========================================

const SUPABASE_URL = "https://yxqukgbubjfdxebwxnil.supabase.co";
const SUPABASE_KEY = "sb_publishable_lUFvf5d39j8g2kgkgBaYFQ_GGr6duNS";

const sb = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// ==========================================
// 画面取得
// ==========================================

const screens = document.querySelectorAll(".screen");

const homeScreen = document.getElementById("homeScreen");
const settingScreen = document.getElementById("settingScreen");
const ruleScreen = document.getElementById("ruleScreen");
const onlineScreen = document.getElementById("onlineScreen");
const waitingScreen = document.getElementById("waitingScreen");


// ==========================================
// ボタン取得
// ==========================================

const startBtn = document.getElementById("startBtn");
const ruleBtn = document.getElementById("ruleBtn");
const settingBtn = document.getElementById("settingBtn");

const saveSettingBtn = document.getElementById("saveSettingBtn");

const createRoomBtn = document.getElementById("createRoomBtn");
const joinRoomBtn = document.getElementById("joinRoomBtn");

const roomCodeInput = document.getElementById("roomCodeInput");
const roomCodeDisplay = document.getElementById("roomCodeDisplay");

const playerNameInput = document.getElementById("playerName");


// ==========================================
// ゲーム情報
// ==========================================

let currentRoomId = null;
let currentRoomCode = null;
let currentPlayerId = null;
let currentChannel = null;


// ==========================================
// 画面切り替え
// ==========================================

function showScreen(screen) {
  screens.forEach(s => {
    s.classList.remove("active");
    s.style.display = "none";
  });

  screen.classList.add("active");
  screen.style.display = "block";
}


// ==========================================
// プレイヤー名
// ==========================================

let playerName =
  localStorage.getItem("kanteiPlayerName") || "";

if (playerNameInput) {
  playerNameInput.value = playerName;
}


// ==========================================
// スタート
// ==========================================

startBtn.addEventListener("click", () => {

  playerName =
    playerNameInput?.value.trim() ||
    localStorage.getItem("kanteiPlayerName") ||
    "";

  if (!playerName) {
    alert("設定からプレイヤー名を入力してください。");
    showScreen(settingScreen);
    return;
  }

  localStorage.setItem("kanteiPlayerName", playerName);

  showScreen(onlineScreen);
});


// ==========================================
// ルール
// ==========================================

ruleBtn.addEventListener("click", () => {
  showScreen(ruleScreen);
});


// ==========================================
// 設定
// ==========================================

settingBtn.addEventListener("click", () => {
  showScreen(settingScreen);
});


// ==========================================
// 設定保存
// ==========================================

saveSettingBtn.addEventListener("click", () => {

  const name = playerNameInput.value.trim();

  if (!name) {
    alert("プレイヤー名を入力してください。");
    return;
  }

  playerName = name;

  localStorage.setItem(
    "kanteiPlayerName",
    playerName
  );

  alert("設定を保存しました。");

  showScreen(homeScreen);
});


// ==========================================
// 戻るボタン
// ==========================================

document.querySelectorAll(".backBtn").forEach(btn => {

  btn.addEventListener("click", () => {
    showScreen(homeScreen);
  });

});


// ==========================================
// 合言葉生成
// ==========================================

function generateRoomCode() {

  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "";

  for (let i = 0; i < 6; i++) {
    code += chars[
      Math.floor(Math.random() * chars.length)
    ];
  }

  return code;
}


// ==========================================
// 合言葉入力
// ==========================================

roomCodeInput.addEventListener("input", () => {

  roomCodeInput.value =
    roomCodeInput.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6);

});


// ==========================================
// マッチング表示
// ==========================================

function showMatched() {

  const waitingText =
    document.getElementById("waitingText");

  if (waitingText) {
    waitingText.textContent =
      "マッチングしました";
  }

  setTimeout(() => {

    if (waitingText) {
      waitingText.textContent =
        "先攻・後攻を決めています…";
    }

  }, 1500);

}


// ==========================================
// 相手が入ったか確認
// ==========================================

async function checkPlayers(roomId) {

  const { data, error } = await sb
    .from("room_players")
    .select("id, player_name, role")
    .eq("room_id", roomId);

  if (error) {
    console.error(error);
    return;
  }

  console.log("現在のプレイヤー:", data);

  if (data && data.length >= 2) {

    await sb
      .from("rooms")
      .update({
        status: "matched"
      })
      .eq("id", roomId);

    showMatched();
  }
}


// ==========================================
// リアルタイム監視
// ==========================================

function subscribeToRoom(roomId) {

  if (currentChannel) {
    sb.removeChannel(currentChannel);
  }

  currentChannel = sb
    .channel("room-" + roomId)

    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "room_players",
        filter: "room_id=eq." + roomId
      },
      async () => {

        console.log("相手が参加しました！");

        await checkPlayers(roomId);

      }
    )

    .subscribe((status) => {

      console.log(
        "Realtime status:",
        status
      );

    });
}


// ==========================================
// 部屋を作る
// ==========================================

createRoomBtn.addEventListener(
  "click",
  async () => {

    const name =
      localStorage.getItem(
        "kanteiPlayerName"
      ) || "";

    if (!name) {
      alert(
        "先に設定からプレイヤー名を入力してください。"
      );
      return;
    }

    createRoomBtn.disabled = true;

    try {

      const roomCode =
        generateRoomCode();

      // 部屋を作成
      const { data: room, error: roomError } =
        await sb
          .from("rooms")
          .insert({
            room_code: roomCode,
            status: "waiting",
            round_number: 1,
            turn_number: 1
          })
          .select()
          .single();

      if (roomError) {
        console.error(roomError);

        alert(
          "部屋を作れませんでした。\n" +
          roomError.message
        );

        createRoomBtn.disabled = false;
        return;
      }

      currentRoomId = room.id;
      currentRoomCode = room.room_code;

      // 自分を部屋に登録
      const { data: player, error: playerError } =
        await sb
          .from("room_players")
          .insert({
            room_id: room.id,
            player_name: name,
            role: "pending",
            money: 3000
          })
          .select()
          .single();

      if (playerError) {
        console.error(playerError);

        alert(
          "プレイヤー登録に失敗しました。\n" +
          playerError.message
        );

        createRoomBtn.disabled = false;
        return;
      }

      currentPlayerId = player.id;

      roomCodeDisplay.textContent =
        roomCode;

      const waitingText =
        document.getElementById("waitingText");

      if (waitingText) {
        waitingText.textContent =
          "対戦相手を待っています…";
      }

      showScreen(waitingScreen);

      // 相手の参加を監視
      subscribeToRoom(room.id);

    } catch (error) {

      console.error(error);

      alert(
        "エラーが発生しました。\n" +
        error.message
      );

    }

    createRoomBtn.disabled = false;
  }
);


// ==========================================
// 部屋に入る
// ==========================================

joinRoomBtn.addEventListener(
  "click",
  async () => {

    const name =
      localStorage.getItem(
        "kanteiPlayerName"
      ) || "";

    if (!name) {
      alert(
        "先に設定からプレイヤー名を入力してください。"
      );
      return;
    }

    const code =
      roomCodeInput.value.trim().toUpperCase();

    if (code.length !== 6) {
      alert(
        "6文字の合言葉を入力してください。"
      );
      return;
    }

    joinRoomBtn.disabled = true;

    try {

      // 部屋を検索
      const { data: room, error: roomError } =
        await sb
          .from("rooms")
          .select("*")
          .eq("room_code", code)
          .eq("status", "waiting")
          .maybeSingle();

      if (roomError) {
        console.error(roomError);

        alert(
          "部屋を検索できませんでした。\n" +
          roomError.message
        );

        joinRoomBtn.disabled = false;
        return;
      }

      if (!room) {
        alert(
          "その合言葉の部屋がありません。"
        );

        joinRoomBtn.disabled = false;
        return;
      }

      currentRoomId = room.id;
      currentRoomCode = room.room_code;

      // すでに2人いるか確認
      const { data: players, error: playersError } =
        await sb
          .from("room_players")
          .select("id")
          .eq("room_id", room.id);

      if (playersError) {
        console.error(playersError);

        alert(
          "参加者を確認できませんでした。\n" +
          playersError.message
        );

        joinRoomBtn.disabled = false;
        return;
      }

      if (players.length >= 2) {
        alert(
          "この部屋は満員です。"
        );

        joinRoomBtn.disabled = false;
        return;
      }

      // 自分を登録
      const { data: player, error: playerError } =
        await sb
          .from("room_players")
          .insert({
            room_id: room.id,
            player_name: name,
            role: "pending",
            money: 3000
          })
          .select()
          .single();

      if (playerError) {
        console.error(playerError);

        alert(
          "部屋に入れませんでした。\n" +
          playerError.message
        );

        joinRoomBtn.disabled = false;
        return;
      }

      currentPlayerId = player.id;

      roomCodeDisplay.textContent =
        room.room_code;

      showScreen(waitingScreen);

      // 参加直後に2人になったか確認
      await checkPlayers(room.id);

      // 部屋の変化を監視
      subscribeToRoom(room.id);

    } catch (error) {

      console.error(error);

      alert(
        "エラーが発生しました。\n" +
        error.message
      );

    }

    joinRoomBtn.disabled = false;
  }
);


// ==========================================
// 最初の画面
// ==========================================

showScreen(homeScreen);

console.log("鑑定ゲーム Supabase接続版 起動");