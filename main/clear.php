<?php
session_start();

// GETパラメータからタイムデータを取得
$clearTime = isset($_GET['time']) ? $_GET['time'] : null;
$clearTime = intval($clearTime); // 小数点以下を切り捨てて整数型に変換

if ($clearTime === null) {
    echo "エラー: タイムデータが送信されていません！";
    exit;
}

// デバッグ用
error_log("DEBUG: _GET data: " . print_r($_GET, true));
error_log("DEBUG: _POST data: " . print_r($_POST, true));


// DB接続ファイルを読み込む
require 'db-connect.php';
$pdo = new PDO($connect, user, pass);

try {
// ステージIDの取得（POST、GET、デフォルトの順で取得）
$stage_id = isset($_POST['stage_id']) ? intval($_POST['stage_id']) : (isset($_GET['stage_id']) ? intval($_GET['stage_id']) : null);

// ステージIDが指定されていない場合のエラーハンドリング
if ($stage_id === null) {
    echo "エラー: stage_idが指定されていません。";
    exit;
}

// ステージ情報を取得

$stmt = $pdo->prepare("SELECT * FROM stage WHERE stage_id = :stage_id");
$stmt->bindParam(':stage_id', $stage_id, PDO::PARAM_INT);
$stmt->execute();

$stage = $stmt->fetch(PDO::FETCH_ASSOC); // ステージ情報を取得
if (!$stage) {
    echo "エラー: 指定されたstage_idは存在しません。";
    exit;
}

} catch (PDOException $e) {
    echo "エラー: " . htmlspecialchars($e->getMessage());
    exit;
}
?>
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HUWACON</title>
  <link rel="stylesheet" href="css/clear.css">
</head>
<body style="background-image:url('img/<?php echo htmlspecialchars($stage['stage_img']);  ?>')">
  <div id="container">
      <h2>MISSION</h2>
      <h2>COMPLETE</h2>
      <p>クリアタイム: <?php echo htmlspecialchars($clearTime); ?> 秒</p>
  </div>
  <form id="nextPageForm" action="ranking-input.php" method="POST" style="display: none;">
      <input type="hidden" id="stage_id" name="stage_id" value="<?php echo htmlspecialchars($stage_id); ?>">
      <input type="hidden" id="clear_time" name="clear_time" value="<?php echo htmlspecialchars($clearTime); ?>">
  </form>
</body>
</html>
<script>
  setTimeout(function(){
    document.getElementById('nextPageForm').submit();
}, 3*1000);
</script>
