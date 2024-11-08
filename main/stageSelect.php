<?php
const SERVER = 'mysql311.phy.lolipop.lan';
const DBNAME = 'LAA1517481-huwacon';
const USER = 'LAA1517481';
const PASS = 'huwacon0921';

$connect = 'mysql:host=' . SERVER . ';dbname=' . DBNAME . ';charset=utf8';

try {
    // 変数名を定数名に修正
    $pdo = new PDO($connect, USER, PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo 'データベース接続失敗: ' . $e->getMessage();
    exit();
}

// ステージデータを取得
$query = $pdo->query('SELECT * FROM stages');
$stages = $query->fetchAll(PDO::FETCH_ASSOC);
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

// PHPでループ処理をしてステージのボタンを生成
foreach ($stages as $stage) {
    echo '<div class="stage-button" onclick="goToStage(' . $stage['stage_id'] . ')">';
    echo '<img src="' . htmlspecialchars($stage['stage_img']) . '" alt="Stage ' . $stage['stage_id'] . '">';
    echo '<p>' . htmlspecialchars($stage['stage_name']) . '</p>';
    echo '</div>';
}

echo '</div>';
echo '</div>';

// JavaScript部分もPHP内に書き込む
echo '<script>';
echo 'function goToStage(stageNumber) {';
echo '    window.location.href = "stage.php?stage=" + stageNumber;';
echo '}';
echo 'document.querySelector(".back-button").addEventListener("click", function() {';
echo '    window.history.back();';
echo '});';
echo '</script>';

echo '</body>';
echo '</html>';
?>
