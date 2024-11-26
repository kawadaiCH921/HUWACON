<?php
session_start();

// JSONデータを受け取る
$data = json_decode(file_get_contents('php://input'), true);

// クリアタイムを取得
if (isset($data['time'])) {
    $clearTime = $data['time'];
    echo "クリアタイム: {$clearTime} 秒";
} else {
    echo "エラー: タイムデータが送信されていません！";
}

// DB接続ファイルを読み込む
require 'db-connect.php'; // USER, PASS, DB_NAMEが定義されているファイル

try {
    // PDOを使ったデータベース接続
    $pdo = new PDO($connect, user, pass);

    // ステージ情報を取得
    $stmt = $pdo->prepare("SELECT * FROM stage WHERE stage_id = 1");
    $stmt->execute();
    $stage = $stmt->fetch(PDO::FETCH_ASSOC);
    $stage_id = $stage['stage_id']; // ステージIDを取得
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
<body style="background-image:url('img/background/<?php echo htmlspecialchars($stage['stage_img']) ?>')">
  <div id="container">
      <h2>MISSION</h2>
      <h2>COMPLETE</h2>
  </div>
  <!-- 次のページへ送信するためのフォーム -->
  <form id="nextPageForm" action="ranking-input.php" method="POST" style="display: none;">
      <input type="hidden" name="stage" value="<?php echo htmlspecialchars($stage_id); ?>">
      <input type="hidden" name="clear_time" value="<?php echo htmlspecialchars($clearTime); ?>">
  </form>
</body>
</html>
<script>
  // 次の画面へ自動遷移
  setTimeout(function(){
    document.getElementById('nextPageForm').submit();
}, 3*1000);

</script>
