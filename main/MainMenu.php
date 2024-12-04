<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>MainMenu</title>
    <link rel="stylesheet" href="./css/MainMenu.css" type="text/css">
</head>
<body>

    <form action="help.php" method="post">
        <button class="info-button" type="submit">i</button>
    </form>
    
    <h1 class="title">HUWACON</h1>
    
    <!-- ボタンをまとめたコンテナ -->
    <div class="button-container">
        <form action="stageSelect.php" method="post">
            <button class="start-button" type="submit">START</button>
        </form>
    
        <form action="ranking.php" method="post">
            <button class="rank-button" type="submit">RANKING</button>
        </form>
    </div>
    
    </body>
</html>