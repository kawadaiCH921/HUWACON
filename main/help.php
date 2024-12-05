<?php
// セッションを開始
session_start();
// ユーザー名をセッションから取得（存在しない場合はゲストとする）
$username = isset($_SESSION['username']) ? $_SESSION['username'] : 'ゲスト';
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>操作説明</title>
    <link rel="stylesheet" href="css/help.css">
</head>
<body>
    <div class="instructions">
        <h1>操作方法</h1>
        <p>こんにちは、<?php echo htmlspecialchars($username); ?>さん！</p>
        <ul>
            <li>A：左に移動</li>
            <li>D：右に移動</li>
            <li>W or Space：ジャンプ</li>
        </ul>
        <a href="MainMenu.php" class="back-button">戻る</a>
    </div>
</body>
</html>