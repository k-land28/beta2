'use strict';

const positions = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];

let openraiseRangeData = null;  // JSONデータをここに格納

// JSONファイルをfetchで読み込み（openraise.json）
async function loadOpenraiseRange() {
  try {
    const res = await fetch('openraise.json');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    openraiseRangeData = await res.json();
  } catch (e) {
    console.error('openraise.jsonの読み込みに失敗しました:', e);
  }
}

// openraiseモードの問題生成
function generateOpenraiseQuestion() {
  if (!openraiseRangeData) {
    return {
      situation: 'openraise.jsonのデータが読み込まれていません。',
      correct: null,
      choices: [],
      position: null,
      hand: null,
      stage: 'openraise'
    };
  }

  // BBはopenraiseモードでは除外
  const validPositions = Object.keys(openraiseRangeData).filter(pos => pos !== 'BB');

  // ランダムにポジション選択
  const position = validPositions[Math.floor(Math.random() * validPositions.length)];

  // そのポジションのハンド一覧からランダムに選択
  const hands = Object.keys(openraiseRangeData[position].hands);
  const hand = hands[Math.floor(Math.random() * hands.length)];

  // 正解アクションを取得
  const correct = openraiseRangeData[position].hands[hand];

  return {
    situation: `あなたのポジションは${position}です。\nハンドは${hand}です。\nOpen Raiseしますか？`,
    correct: correct,
    choices: ['Raise', 'Fold'],
    position: position,
    hand: hand,
    stage: 'openraise'
  };
}

// 他モード用の仮関数（元コードのgenerateRandomQuestionを使う想定）
function generateRandomQuestion(mode) {
  // 実装は別途
  return {
    situation: `モード「${mode}」の問題をまだ実装していません。`,
    correct: null,
    choices: [],
    position: null,
    hand: null,
    stage: mode
  };
}

let currentMode = 'openraise';
let currentQuestion = null;

const situationText = document.getElementById('situationText');
const handText = document.getElementById('handText');
const actionButtons = document.getElementById('actionButtons');
const resultText = document.getElementById('resultText');
const nextButton = document.getElementById('nextButton');
const tabs = document.querySelectorAll('.tab-button');
const table = document.getElementById('table');

// 楕円テーブル上にポジション表示を描画する関数
// selectedPosition: 今の自分のポジション名（例: 'MP'）
function renderPositions(selectedPosition) {
  // 一旦中身クリア
  table.innerHTML = '';

  // テーブルの幅・高さ取得（style.cssで400x220のmax-widthだが動的取得）
  const W = table.clientWidth;
  const H = table.clientHeight;

  // 楕円の中心座標
  const cx = W / 2;
  const cy = H / 2;

  // 半径（横・縦）
  const rx = W / 2 * 0.85;  // 少し余裕を持たせる
  const ry = H / 2 * 0.85;

  // 自分ポジションが下（270度）になるようにオフセット回転角度
  // 通常均等配置なら i * (360/6) = i * 60度
  // オフセットを加算して自分を270度にする
  // 自分のインデックスを調べる
  const selfIndex = positions.indexOf(selectedPosition);
  if (selfIndex < 0) {
    console.warn('renderPositions: selectedPositionが不正です。', selectedPosition);
  }
  // オフセット角度（度）
  const offsetDeg = 270 - selfIndex * (360 / positions.length);

  // 各ポジションの描画
  positions.forEach((pos, i) => {
    // 角度計算（度数法 → ラジアン）
    const deg = i * (360 / positions.length) + offsetDeg;
    const rad = deg * Math.PI / 180;

    // 楕円上の座標計算
    const x = cx + rx * Math.cos(rad);
    const y = cy + ry * Math.sin(rad);

    // ポジション要素生成
    const div = document.createElement('div');
    div.className = 'position';
    div.textContent = pos;

    // 左上基準なので中央にするため調整（幅50、高さ30の半分）
    div.style.left = `${x - 25}px`;
    div.style.top = `${y - 15}px`;

    // 自分のポジションだけ特別クラス付けて光らせる
    if (pos === selectedPosition) {
      div.classList.add('active-position');
    }

    table.appendChild(div);
  });
}

async function displayQuestion() {
  if (currentMode === 'openraise') {
    if (!openraiseRangeData) {
      await loadOpenraiseRange();
      if (!openraiseRangeData) {
        situationText.textContent = '問題データの読み込みに失敗しました。';
        return;
      }
    }
    currentQuestion = generateOpenraiseQuestion();
  } else {
    currentQuestion = generateRandomQuestion(currentMode);
  }

  const q = currentQuestion;
  situationText.textContent = q.situation;
  handText.textContent = ''; // situation内にハンド表示済みのため空欄

  resultText.textContent = '';
  actionButtons.innerHTML = '';

  // テーブル上に自分のポジションを下に固定し光らせる
  if (q.position) {
    renderPositions(q.position);
  } else {
    // もしポジション情報ないなら一応デフォルト描画（光らせなし）
    renderPositions(null);
  }

  q.choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.textContent = choice;
    if (/fold/i.test(choice)) {
      btn.classList.add('fold');
    } else if (/call/i.test(choice)) {
      btn.classList.add('call');
    } else {
      btn.classList.add('raise');
    }
    btn.addEventListener('click', () => {
      if (choice === q.correct) {
        resultText.style.color = '#0faa00';
        resultText.textContent = '正解！🎉';
      } else {
        resultText.style.color = '#ff2200';
        resultText.textContent = `不正解。正解は「${q.correct}」です。`;
      }
    });
    actionButtons.appendChild(btn);
  });
}

function switchMode(newMode) {
  currentMode = newMode;
  tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.mode === newMode));
  displayQuestion();
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    if (tab.dataset.mode !== currentMode) {
      switchMode(tab.dataset.mode);
    }
  });
});

nextButton.addEventListener('click', displayQuestion);

window.addEventListener('load', () => switchMode(currentMode));
