const ROWS = 10; // 行数
const COLS = 10; // 列数
const MINES = 10; // 地雷の数

let board = []; // ゲーム盤面
let revealedCellsCount = 0; // 公開されたセル数を追跡

// セルが左クリックされたとき
function handleCellLeftClick(e) {
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
    revealAllMines(); // すべての地雷を公開
}

// 地雷以外のセルがすべて公開されたとき
function gameClear() {
    alert("ゲームクリア"); // ゲームクリアのメッセージを表示
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
    // 右クリックのデフォルト動作（コンテキストメニュー表示）を無効化
    e.preventDefault();

    // クリックされたセルの行と列を取得（HTML要素のカスタムデータ属性を使用）
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    const cell = e.target; // クリックされたセルのDOM要素

    // セルが既に開かれている場合は何もしない
    if (board[row][col].isRevealed) return;

    // フラグの状態を切り替える（true ↔ false）
    board[row][col].isFlagged = !board[row][col].isFlagged;

    // フラグの状態に応じてセルに "flag" クラスを追加または削除
    cell.classList.toggle("flag");
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