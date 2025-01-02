const ROWS = 10; // 行数
const COLS = 10; // 列数
const MINES = 10; // 地雷の数

let board = []; // ゲーム盤面
let revealedCellsCount = 0; // 公開されたセル数を追跡

let timer; // タイマーID
let timeElapsed = 0; // 経過時間（秒）
let isTimerRunning = false; // タイマーが動いているかの状態
let remainingFlags = MINES; // 初期の旗の数

// タイマー表示を更新する関数
function updateTimerDisplay() {
    const timerElement = document.getElementById('timer');
    timerElement.textContent = `タイマー：${timeElapsed}秒`;
}

// タイマーをスタートする関数
function startTimer() {
    if (isTimerRunning) return; // タイマーが既に動いている場合はスキップ
    isTimerRunning = true;

    timer = setInterval(() => {
        timeElapsed++;
        updateTimerDisplay();
    }, 1000); // 1秒ごとにカウントアップ
}

// タイマーをリセットする関数
function resetTimer() {
    clearInterval(timer);
    timeElapsed = 0;
    isTimerRunning = false;
    updateTimerDisplay();
}

// タイマーを停止する関数
function stopTimer() {
    clearInterval(timer);
    isTimerRunning = false;
}

// 旗の数を表示する関数
function updateFlagDisplay() {
    const flagElement = document.getElementById('remainingFlags');
    flagElement.textContent = `旗の数：${remainingFlags}個`;
}

// セルが左クリックされたとき
function handleCellLeftClick(e) {
    if (!isTimerRunning) {
        startTimer(); // 初回クリック時にタイマーを開始
    }

    // クリックされたセルの行と列を取得（HTMLのデータ属性から）
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);

    // セルが既に公開されている、またはフラグが立てられている場合は処理をスキップ
    if (board[row][col].isRevealed || board[row][col].isFlagged) return;

    // セルを公開済みとしてマーク
    board[row][col].isRevealed = true;
    const cell = e.target; // 対象となるDOM要素（セル）

    // クリックされたセルが地雷だった場合
    if (board[row][col].isMine) {
        cell.classList.add("mine"); // 地雷を視覚的に表示
        gameOver(); // ゲームオーバー
    } else {
        // セルが地雷でない場合
        cell.classList.add("revealed"); // セルを公開済みとして表示
        revealedCellsCount++; // 公開セル数を増加

        // 周囲に地雷がある場合、その数をセルに表示
        if (board[row][col].adjacentMines > 0) {
            cell.textContent = board[row][col].adjacentMines;
        } else {
            // 指定したセルから周囲の空のセルを再帰的に公開
            revealEmptyCells(row, col);
        }
    }

    const nonMineCells = ROWS * COLS - MINES; // 地雷以外のセル数
    if (revealedCellsCount === nonMineCells) {
        gameClear(); // ゲームクリア
    }
}

// 地雷のセルをクリックしたとき
function gameOver() {
    alert("ゲームオーバー"); // ゲームオーバーのメッセージを表示
    stopTimer(); // タイマーを停止する
    revealAllMines(); // すべての地雷を公開
}

// 地雷以外のセルがすべて公開されたとき
function gameClear() {
    alert("ゲームクリア"); // ゲームクリアのメッセージを表示
    stopTimer(); // タイマーを停止する
    revealAllMines(); // すべての地雷を公開
}

// 周囲に地雷がない場合、空のセルを再帰的に公開
function revealAllMines() {
    // 盤面全体を走査
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            // 地雷が配置されているセルを確認
            if (board[row][col].isMine) {
                // 対応するDOM要素（セル）を取得
                const cell = document.querySelector(
                    `.cell[data-row='${row}'][data-col='${col}']`
                );

                // 地雷を表すクラスを追加して視覚的に表示
                if (cell) {
                    cell.classList.add("mine");
                }
            }
        }
    }
}

// 指定したセルから周囲の空のセルを再帰的に公開
function revealEmptyCells(row, col) {
    // 周囲の8方向を表す相対座標のリスト
    const directions = [
        [-1, -1], [-1,  0], [-1,  1], // 左上、真上、右上
        [ 0, -1],           [ 0,  1], // 左、右
        [ 1, -1], [ 1,  0], [ 1,  1], // 左下、真下、右下
    ];

    // 周囲8方向を確認
    for (let [dx, dy] of directions) {
        const newRow = row + dx; // 新しい行の位置
        const newCol = col + dy; // 新しい列の位置

        // 新しい位置が盤面の範囲内で、未公開かつ地雷でないセルを対象とする
        if (
            newRow >= 0 &&                 // 行が範囲内か確認
            newRow < ROWS &&               // 行が範囲内か確認
            newCol >= 0 &&                 // 列が範囲内か確認
            newCol < COLS &&               // 列が範囲内か確認
            !board[newRow][newCol].isRevealed && // 既に公開されていないか確認
            !board[newRow][newCol].isMine       // 地雷でないか確認
        ) {
            board[newRow][newCol].isRevealed = true; // セルを「公開済み」に設定
            revealedCellsCount++; // 公開セル数を増加

            // DOM要素を取得して「公開済み」のスタイルを適用
            const cell = document.querySelector(
                `.cell[data-row='${newRow}'][data-col='${newCol}']`
            );
            cell.classList.add("revealed");

            // セルに周囲の地雷数を表示（0の場合は何も表示しない）
            if (board[newRow][newCol].adjacentMines > 0) {
                cell.textContent = board[newRow][newCol].adjacentMines;
            } else {
                // 周囲に地雷がない場合は再帰的に空のセルを開く
                revealEmptyCells(newRow, newCol);
            }
        }
    }
}

// セルが右クリックされたとき
function handleCellRightClick(e) {
    if (!isTimerRunning) {
        startTimer(); // 初回クリック時にタイマーを開始
    }
    
    // 右クリックのデフォルト動作（コンテキストメニュー表示）を無効化
    e.preventDefault();

    // クリックされたセルの行と列を取得（HTML要素のカスタムデータ属性を使用）
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    const cell = e.target; // クリックされたセルのDOM要素

    // セルが既に開かれている場合は何もしない
    if (board[row][col].isRevealed) return;
    console.log("A");
    // クラス "flag" の追加/削除とフラグ数の更新
    if (cell.classList.contains('flag')) {
        // セルに既にフラグが付いている場合
        // "flag" クラスを削除してフラグの状態を解除
        cell.classList.remove('flag');
        // セルのフラグ状態を false（フラグあり状態）に設定
        board[row][col].isFlagged = false;
        // フラグ数を増やす（フラグが減るため利用可能な数が増加）
        remainingFlags++;
    } else if (remainingFlags > 0) {
        // フラグ数がまだ残っている場合
        // "flag" クラスを追加してセルをフラグ付き状態にする
        cell.classList.add('flag');
        // セルのフラグ状態を true（フラグなし状態）に設定
        board[row][col].isFlagged = true;
        // フラグ数を減らす（新しいフラグを使うため利用可能な数が減少）
        remainingFlags--;
    }

    // フラグ数を表示に反映
    updateFlagDisplay();
}

// 地雷をランダムに配置
function randomPlaceMines() {
    let minesPlaced = 0; // 配置された地雷の数を記録する変数

    // 指定した数の地雷が配置されるまでループ
    while (minesPlaced < MINES) {
      // ランダムに行と列を選択
      let row = Math.floor(Math.random() * ROWS); // ROWS: 盤面の行数
      let col = Math.floor(Math.random() * COLS); // COLS: 盤面の列数
  
      // 選ばれたセルにまだ地雷が置かれていない場合
      if (!board[row][col].isMine) {
        board[row][col].isMine = true; // 地雷を配置
        minesPlaced++; // 配置した地雷の数を1増やす
      }
    }
}

// 隣接する地雷数を計算
function calculateAdjacentMines() {
    // 周囲8方向を表す相対座標のリスト
    const directions = [
        [-1, -1], [-1,  0], [-1,  1], // 左上、真上、右上
        [ 0, -1],           [ 0,  1], // 左、右
        [ 1, -1], [1,  0],  [ 1,  1], // 左下、真下、右下
    ];

    // 全てのセルをループで確認
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            // セルが地雷であれば周囲の地雷数を計算する必要はない
            if (board[row][col].isMine) continue;

            let count = 0; // 周囲の地雷数をカウントする変数

            // 各方向に移動し、地雷があるかを確認
            for (let [dx, dy] of directions) {
                const newRow = row + dx; // 新しい行の位置
                const newCol = col + dy; // 新しい列の位置

                // 新しい位置が盤面の範囲内かどうかを確認
                if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
                    if (board[newRow][newCol].isMine) {
                        count++; // 周囲に地雷があればカウントを増加
                    }
                }
            }

            // 現在のセルに周囲の地雷数を設定
            board[row][col].adjacentMines = count;
        }
    }
}

// ゲームを初期化
function initGame() {
    resetTimer(); // タイマーをリセット
    remainingFlags = 10; // 旗の数を初期化
    updateFlagDisplay(); // フラグ数を表示に反映

    board = [];
    revealedCellsCount = 0;
    gameBoard.innerHTML = "";

    // 盤面の作成
    for (let row = 0; row < ROWS; row++) {
        board[row] = [];
        for (let col = 0; col < COLS; col++) {
            board[row][col] = {
                isMine: false, // 地雷かどうか
                isRevealed: false, // 開かれているか
                isFlagged: false, // フラグが立っているか
                adjacentMines: 0, // 隣接する地雷の数
            };

            // セルをHTML上に作成
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = row;
            cell.dataset.col = col;

            // イベントリスナーを追加
            cell.addEventListener("click", handleCellLeftClick);
            cell.addEventListener("contextmenu", handleCellRightClick);

            gameBoard.appendChild(cell);
        }
    }

    // 地雷をランダム配置
    randomPlaceMines();

    // 隣接する地雷数を計算
    calculateAdjacentMines();

    // グリッドのスタイルを設定
    gameBoard.style.gridTemplateRows = `repeat(${ROWS}, 30px)`;
    gameBoard.style.gridTemplateColumns = `repeat(${COLS}, 30px)`;
}

// ゲームを初期化
initGame();