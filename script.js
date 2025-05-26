'use strict';

const positions = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];

let openraiseRangeData = null;  // JSONデータをここに格納
let allOpenraiseHandsList = null; // 全ポジション×ハンドの展開リスト

// JSONファイルをfetchで読み込み（openraise.json）
async function loadOpenraiseRange() {
  try {
    const res = await fetch('openraise.json');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    openraiseRangeData = await res.json();

    // 全ポジション×ハンドの組み合わせリストを作成（BB除外）
    allOpenraiseHandsList = buildAllHandsList(openraiseRangeData);

  } catch (e) {
    console.error('openraise.jsonの読み込みに失敗しました:', e);
  }
}

// 全ポジション×ハンドの組み合わせリストを作る関数
function buildAllHandsList(rangeData) {
  const list = [];
  for (const pos in rangeData) {
    if (pos === 'BB') continue; // openraiseモードではBB除外
    const hands = rangeData[pos].hands;
    for (const hand in hands) {
      list.push({
        position: pos,
        hand: hand,
        correct: hands[hand]
      });
    }
  }
  return list;
}

// openraiseモードの問題生成（全展開リストからランダムに1問抽出）
function generateOpenraiseQuestion() {
  if (!allOpenraiseHandsList || allOpenraiseHandsList.length === 0) {
    return {
      situation: 'openraise.jsonのデータが読み込まれていません、または問題がありません。',
      correct: null,
      choices: [],
      position: null,
      hand: null,
      stage: 'openraise'
    };
  }

  const item = allOpenraiseHandsList[Math.floor(Math.random() * allOpenraiseHandsList.length)];

  return {
    situation: `あなたのポジションは${item.position}です。\nハンドは${item.hand}です。\nOpen Raiseしますか？`,
    correct: item.correct,
    choices: ['Raise', 'Fold'],
    position: item.position,
    hand: item.hand,
    stage: 'openraise'
  };
}

// 他モード用の仮関数（元コードのgenerateRandomQuestionを使う想定）
function generateRandomQuestion(mode) {
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
  table.innerHTML = '';

  const W = table.clientWidth;
  const H = table.clientHeight;

  const cx = W / 2;
  const cy = H / 2;

  const rx = W / 2 * 0.85;
  const ry = H / 2 * 0.85;

  const selfIndex = positions.indexOf(selectedPosition);
  if (selfIndex < 0) {
    console.warn('renderPositions: selectedPositionが不正です。', selectedPosition);
  }

  positions.forEach((pos, i) => {
    const relativeIndex = (i - selfIndex + positions.length) % positions.length;
    const deg = relativeIndex * (360 / positions.length) + 180; // 下を0度にするため180度オフセット
    const rad = deg * Math.PI / 180;

    const x = cx + rx * Math.cos(rad);
    const y = cy + ry * Math.sin(rad);

    const div = document.createElement('div');
    div.className = 'position';
    div.textContent = pos;

    div.style.left = `${x - 25}px`;
    div.style.top = `${y - 15}px`;

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
  handText.textContent = ''; // situationに含むので空に

  resultText.textContent = '';
  actionButtons.innerHTML = '';

  if (q.position) {
    renderPositions(q.position);
  } else {
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
