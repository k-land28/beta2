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

let currentMode = 'openraise';
let currentQuestion = null;

const situationText = document.getElementById('situationText');
const handText = document.getElementById('handText');
const actionButtons = document.getElementById('actionButtons');
const resultText = document.getElementById('resultText');
const nextButton = document.getElementById('nextButton');
const tabs = document.querySelectorAll('.tab-button');

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
    // 他モード対応のgenerateRandomQuestion呼び出し（元コードの関数を使う想定）
    currentQuestion = generateRandomQuestion(currentMode);
  }

  const q = currentQuestion;
  situationText.textContent = q.situation;
  handText.textContent = ''; // situation内にハンド表示済みのため空欄

  resultText.textContent = '';
  actionButtons.innerHTML = '';

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

// ポジション表示（テーブル上の楕円配置）
function renderPositions() {
  const table = document.getElementById('table');
  table.innerHTML = ''; // 一旦中身をクリア

  const angleStep = (2 * Math.PI) / positions.length;
  const radiusX = 160;
  const radiusY = 80;
  const centerX = 200;
  const centerY = 110;

  positions.forEach((pos, i) => {
    const angle = angleStep * i - Math.PI / 2;
    const x = centerX + radiusX * Math.cos(angle);
    const y = centerY + radiusY * Math.sin(angle);

    const div = document.createElement('div');
    div.className = 'position';
    div.textContent = pos;
    div.style.left = `${x - 25}px`;
    div.style.top = `${y - 15}px`;

    table.appendChild(div);
  });
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    if (tab.dataset.mode !== currentMode) {
      switchMode(tab.dataset.mode);
    }
  });
});

nextButton.addEventListener('click', displayQuestion);

window.addEventListener('load', () => {
  renderPositions(); // ← ポジション表示の復活！
  switchMode(currentMode);
});
