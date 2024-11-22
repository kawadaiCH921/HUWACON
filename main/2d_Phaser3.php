<?php 
require 'db-connect.php';

try {
    $stage_id = isset($_POST['stage_id']) ? $_POST['stage_id'] : null;

    // stage_idが指定されていない場合の処理
    if ($stage_id === null) {
        echo "ステージIDが指定されていません。";
        exit;
    }

    $pdo = new PDO($connect, user, pass);

    // ステージ情報を取得
    $stmt = $pdo->prepare("SELECT * FROM stage WHERE stage_id = :stage_id");
    $stmt->bindParam(':stage_id', $stage_id, PDO::PARAM_INT);
    $stmt->execute();
    $stage = $stmt->fetch(PDO::FETCH_ASSOC);

    // ステージ情報が取得できない場合の処理
    if ($stage === false) {
        echo "指定されたステージが見つかりません。";
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
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Phaser 3 スクロールアクション</title>
  <script src="https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.min.js"></script>
  <script src="js/<?php echo htmlspecialchars($stage['stage_name']) ?>.js" defer></script>
</head>
<body></body>
</html>