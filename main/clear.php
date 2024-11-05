<?php
session_start();

// game.phpから送られてきたクリアタイムを受け取りCookieに保存
if (isset($_POST['clear_time'])) {
  $clear_time = $_POST['clear_time'];
  setcookie('clear_time', $clear_time, time() + 3600, "/"); // 1時間の有効期限
  echo "POSTからクリアタイムが取得されました: " . htmlspecialchars($clear_time);
} else {
  // 単体用コード 削除予定
  $clear_time = 200; // テスト用クリアタイム
  setcookie('clear_time', $clear_time, time() + 3600, "/"); // 1時間の有効期限
  echo "POSTデータが存在しないため、テスト用クリアタイム200が設定されました。";
}


require 'DB-connect.php';
try {
    $pdo = new PDO($connect, USER, PASS);

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
      <input type="hidden" name="clear_time" value="<?php echo htmlspecialchars($clear_time); ?>">
  </form>
</body>
</html>
<script>
  // 次の画面へ自動遷移
  setTimeout(function(){
    document.getElementById('nextPageForm').submit();
}, 3*1000);

</script>
