<?php
// セッションを開始
session_start();
require 'db-connect.php';  // データベース接続設定 
// ユーザー名をセッションから取得（存在しない場合はゲストとする）
$username = isset($_SESSION['username']) ? $_SESSION['username'] : 'ゲスト';
?>

<?php
// HTML部分をPHP内に書き込む
echo '<!DOCTYPE html>';
echo '<html lang="ja">';
echo '<head>';
echo '<meta charset="UTF-8">';
echo '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
echo '<title>ステージ選択</title>';
echo '<link rel="stylesheet" href="./css/stageSelect.css">';
echo '</head>';
echo '<body>';
echo '<div class="container">';
echo '<button class="back-button">&larr;</button>';
echo '<h1>STAGE SELECT</h1>';
echo '<div class="stage-grid">';
?>
<?php

try {
    $pdo = new PDO($connect, user, pass);
    
    // ステージ情報をデータベースから取得
    $stmt = $pdo->prepare('SELECT * FROM stage ORDER BY stage_id ASC');                 
    $stmt->execute();                 

    // ステージ情報を表示
    foreach ($stmt as $row) {
        echo '<form method="POST" action="2d_Phaser3.php" class="stage-form">';
        echo '<input type="hidden" name="stage_id" value="' . htmlspecialchars($row['stage_id']) . '">';
        // echo '<div class="stage-button" onclick="this.closest(\'form\').submit();">';
        echo '<div class="stage-button" onclick="submitStageForm(this);">';
        // ステージ画像がある場合は表示
        if (!empty($row['stage_img'])) {
            echo '<img src="img/' . htmlspecialchars($row['stage_img']) . '" alt="Stage ' . $row['stage_id'] . '">';
        }
        echo '<p>' . htmlspecialchars($row['stage_name']) . '</p>';
        echo '</div>';
        echo '</form>';
    }
} catch (PDOException $e) {
    echo 'データベースエラー: ' . htmlspecialchars($e->getMessage());
    exit();
}             
?>
<?php
echo '</div>';
echo '</div>';

// バックボタンのJavaScriptのみ残す
echo '<script>';
echo 'document.querySelector(".back-button").addEventListener("click", function() {';
echo '    window.history.back();';
echo '});';
echo 'function submitStageForm(element) {
    const form = element.closest('form');
    if (form) {
        form.submit();
    }
    };'
echo '</script>';

echo '</body>';
echo '</html>';
?>
