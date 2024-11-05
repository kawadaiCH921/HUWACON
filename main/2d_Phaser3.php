<?php 
require 'db-connect.php';
try {
    $pdo = new PDO($connect, USER, PASS);

    // ステージ情報を取得
    $stmt = $pdo->prepare("SELECT * FROM stage");
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
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="2d_Phaser3.css">
  <title>Phaser 3 スクロールアクション</title>
  <script src="https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.min.js"></script>
  <script src="js/<?php echo htmlspecialchars($stage['stage_id']) ?>.js" defer></script>
</head>
<body></body>
</html>
