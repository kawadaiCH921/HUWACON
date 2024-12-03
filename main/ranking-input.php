<?php
session_start();

$success = false;  // 登録が成功したかを示すフラグ

// clear_timeの取得と検証
if (isset($_POST['clear_time'])) {
    $clear_time = $_POST['clear_time'];
} elseif (isset($_GET['clear_time'])) {
    $clear_time = $_GET['clear_time'];
} else {
    $clear_time = null; // デフォルト値
}

// デバッグ用: 値を確認
error_log("DEBUG: Received clear_time=" . var_export($clear_time, true));

// 値が不正な場合はエラー
if ($clear_time === null || $clear_time === '' || !is_numeric($clear_time) || intval($clear_time) <= 0) {
    echo "エラー: 無効なクリアタイムが指定されました。 clear_time=" . htmlspecialchars($clear_time ?? 'null');
    exit;
}

// 有効な場合のみ整数に変換
$clear_time = intval($clear_time);


// Cookieに保存されたcookie_idを取得、なければ新しく生成してCookieに保存
if (isset($_COOKIE['cookie_id'])) {
    $cookie_id = $_COOKIE['cookie_id'];
} else {
    $cookie_id = bin2hex(random_bytes(16));
    setcookie('cookie_id', $cookie_id, time() + (86400 * 30), "/");  // 30日間有効
}

// ステージIDの取得（POST、GET、デフォルトの順で取得）
$stage_id = isset($_POST['stage_id']) ? intval($_POST['stage_id']) : (isset($_GET['stage_id']) ? intval($_GET['stage_id']) : null);

// データベースに接続
require 'db-connect.php';
$pdo = new PDO($connect, user, pass);

// ステージが存在するか確認
$stmt = $pdo->prepare("SELECT * FROM stage WHERE stage_id = :stage_id");
$stmt->bindParam(':stage_id', $stage_id, PDO::PARAM_INT);
$stmt->execute();

$stage = $stmt->fetch(PDO::FETCH_ASSOC); // ステージ情報を取得
if (!$stage) {
    echo "エラー: 指定されたstage_idは存在しません。";
    exit;
}

// クリアタイムを「時間:分:秒」形式に変換
$formatted_time = gmdate("H:i:s", $clear_time);

// 名前が送信された場合の登録処理
if (isset($_POST['name']) && !empty($_POST['name'])) {
    try {
        $user_name = $_POST['name'];

        // cookie_idが存在するか確認
        $stmt = $pdo->prepare("SELECT * FROM ranking WHERE cookie_id = :cookie_id AND stage_id = :stage_id");
        $stmt->execute([
            ':cookie_id' => $cookie_id,
            ':stage_id' => $stage_id,
        ]);

        if ($stmt->rowCount() > 0) {
            // cookie_idが存在する場合、UPDATEでクリアタイムを更新
            $stmt = $pdo->prepare("UPDATE ranking SET clear_time = :clear_time, user_name = :user_name WHERE cookie_id = :cookie_id AND stage_id = :stage_id");
            $stmt->execute([
                ':clear_time' => $clear_time,
                ':user_name' => $user_name,
                ':cookie_id' => $cookie_id,
                ':stage_id' => $stage_id,
            ]);
        } else {
            // cookie_idが存在しない場合、INSERTで新規登録
            $stmt = $pdo->prepare("INSERT INTO ranking (stage_id, user_name, clear_time, cookie_id) VALUES (:stage_id, :user_name, :clear_time, :cookie_id)");
            $stmt->execute([
                ':stage_id' => $stage_id,
                ':user_name' => $user_name,
                ':clear_time' => $clear_time,
                ':cookie_id' => $cookie_id,
            ]);
        }

        $success = true;  // 登録成功フラグを立てる
    } catch (PDOException $e) {
        echo "エラー: " . htmlspecialchars($e->getMessage());
    }
}
?>

<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HUWACON</title>
  <link rel="stylesheet" href="css/ranking.css">
</head>
<body>
  <p id="clear_time"><?php echo htmlspecialchars($formatted_time); ?></p>
  <form id="nextPageForm" action="ranking-input.php" method="POST">
      <input type="text" name="name" placeholder="登録する場合は名前を入力してください" id="name" required>
      <input type="hidden" name="stage_id" value="<?php echo $stage['stage_id']; ?>"> <!-- ステージIDを送信 -->
      <input type="hidden" name="clear_time" value="<?php echo $clear_time ?>">
    <div id="push">
        <button type="submit">登録</button>
        <button type="button" onclick="location.href='ranking.php'">ランキング</button>
        <button type="button" onclick="location.href='stageSelect.php'">ステージ選択</button>
    </div>
  </form>

  <script>
      const registrationSuccess = <?php echo json_encode($success); ?>;
      if (registrationSuccess) {
          alert("登録完了しました。");
      }
  </script>
</body>
</html>
