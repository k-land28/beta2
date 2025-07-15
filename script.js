const itemsByStore = {
  "ベルク": [
    "ねぎ", "きゅうり", "キャベツ", "もやし", "ドレッシング", "サラダチキン", "牛肉", "豚肉", "鶏肉", "ひき肉",
    "味付け肉", "ごま油", "マヨネーズ", "韓国のり", "シーチキン", "麻婆豆腐", "カニカマ", "たまご", "菓子パン",
    "食パン", "千切りキャベツ", "豆腐", "冷凍うどん", "アイス"
  ],
  "スギ薬局": [
    "マスク", "綿棒", "絆創膏", "目薬", "ハイチオールC", "鼻炎薬", "キュキュットウルトラ", "JOY", "カビキラー",
    "マジックリン", "消臭剤", "ビニール袋", "三角ネット", "サランラップ", "ナプキン", "トイレシート",
    "歯磨きガム", "歯ブラシ", "歯磨き粉", "デンタルリンス", "マウピー洗浄剤", "ボディーソープ", "バブ",
    "消臭ビーズ", "ファブリーズ", "柔軟剤", "洗濯洗剤", "ドラム洗浄剤", "ティッシュ", "トイペ", "犬用トイペ",
    "ファンタ", "菓子パン", "食パン", "シャンプー", "コンディショナー", "白髪染め", "ハードスプレー"
  ],
  "パレッテ": [
    "漬け物", "お菓子類", "プルコギ丼のタレ", "スープパスタ", "辛麺", "おにぎりのもと", "ファンタ", "パン",
    "キャベせん", "アイス", "チャーハン"
  ],
  "業スー": [
    "コーヒー", "豆乳", "マカロニサラダ", "らっきょ", "ビン鮭", "豆板醤", "のり", "ミックスベジタブル",
    "ほうれん草", "パプリカ", "コーン", "唐揚げ", "辛麺", "どら焼き"
  ]
};

let currentStore = "ベルク";
let selectedItems = [];
const todoData = JSON.parse(localStorage.getItem("todoData")) || {
  "ベルク": [], "スギ薬局": [], "パレッテ": [], "業スー": []
};

const itemList = document.getElementById("item-list");
const todoList = document.getElementById("todo-list");

function renderItems() {
  itemList.innerHTML = "";
  selectedItems = [];
  itemsByStore[currentStore].forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    li.addEventListener("click", () => {
      li.classList.toggle("selected");
      if (selectedItems.includes(item)) {
        selectedItems = selectedItems.filter(i => i !== item);
      } else {
        selectedItems.push(item);
      }
    });
    itemList.appendChild(li);
  });
}

function renderTodo() {
  todoList.innerHTML = "";
  todoData[currentStore].forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    li.addEventListener("click", () => {
      li.classList.toggle("selected");
    });
    todoList.appendChild(li);
  });
}

document.querySelectorAll(".tab-button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentStore = btn.dataset.store;
    renderItems();
    renderTodo();
  });
});

document.getElementById("add-selected").addEventListener("click", () => {
  const existing = new Set(todoData[currentStore]);
  selectedItems.forEach(item => existing.add(item));
  todoData[currentStore] = Array.from(existing);
  localStorage.setItem("todoData", JSON.stringify(todoData));
  renderTodo();
  selectedItems = [];
  renderItems();
});

document.getElementById("reset").addEventListener("click", () => {
  todoData[currentStore] = [];
  localStorage.setItem("todoData", JSON.stringify(todoData));
  renderTodo();
});

renderItems();
renderTodo();

// スクロールで押し出しヘッダー処理
const stickyHeaders = document.querySelectorAll('.sticky-header');

window.addEventListener('scroll', () => {
  let current = null;

  stickyHeaders.forEach(header => {
    const rect = header.parentElement.getBoundingClientRect();
    if (rect.top <= 40) current = header;
  });

  stickyHeaders.forEach(header => {
    if (header === current) {
      header.classList.add('active-sticky');
    } else {
      header.classList.remove('active-sticky');
    }
  });
});
