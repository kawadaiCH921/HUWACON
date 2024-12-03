<?php  
session_start();   
require 'db-connect.php';  // データベース接続設定 
$pdo = new PDO($connect, user, pass);  
?>  

<!DOCTYPE html> 
<html lang="ja"> 
<head>     
    <meta charset="UTF-8">     
    <title>RANKING</title>     
    <style>         
        @import url('https://fonts.googleapis.com/css2?family=DotGothic16&display=swap');         
        /* 基本スタイル */         
        body {             
            background-color: #30264A;             
            font-family: 'DotGothic16', sans-serif;             
            margin: 0;             
            padding-top: 80px;             
            display: flex;             
            flex-direction: column;             
            align-items: center;             
        }          

        .button-text-container {             
            width: 100%;             
            display: flex;             
            justify-content: center;             
            align-items: center;             
            position: fixed;             
            top: 0;             
            left: 0;             
            padding: 10px;         
        }          

        #backButton {             
            width: 50px;             
            height: 50px;             
            background-color: #f0f0f0;             
            font-size: 24px;             
            cursor: pointer;             
            position: absolute;             
            top: 20px;             
            left: 20px;             
            border-radius: 50%;             
            border: none;         
        }          

        #RANKING-text {             
            color: rgb(255, 234, 0);             
            font-size: 65px;
            font-weight: bold;
            -webkit-text-stroke: 4px rgb(255, 234, 0); /* 枠線の幅と色を設定 */
            letter-spacing: 3px; /* 文字の間隔を調整 */
        }


        .ranking-container {             
            display: flex;             
            width: 100%;             
            max-width: 1200px;             
            padding: 20px;             
            box-sizing: border-box;         
        }          

        .top-ranks {             
            width: 70%;             
            padding: 5px;             
            box-sizing: border-box;         
        }          

        .rank-item {             
            padding: 30px;             
            margin-bottom: 14px;             
            border-radius: 15px;             
            font-size: 22px;             
            font-weight: bolder;             
            position: relative;             
            overflow: hidden;         
        }

        /* 虹色ネオンの枠線 */
        .rank-item.rank-1, .rank-item.rank-2, .rank-item.rank-3 {
            border: 5px solid transparent; /* 枠線を太く */
            animation: rainbowBorder 2s infinite;
        }

        /* 1位から3位の色 */
        .rank-item.rank-1 {
            color: gold;
        }
        .rank-item.rank-2 {
            color: silver;
        }
        .rank-item.rank-3 {
            color: #cd7f32;
        }
        
        .ranking {
            font-size: 55px;
            font-weight: bold;
        }

        /* 虹色ネオンアニメーション */
        @keyframes rainbowBorder {
            0% { border-color: #ff0000; }
            20% { border-color: #ff7f00; }
            40% { border-color: #ffff00; }
            60% { border-color: #00ff00; }
            80% { border-color: #0000ff; }
            100% { border-color: #8b00ff; }
        }

        .other-ranks {             
            width: 60%;             
            padding: 5px;             
            max-height: 590px;             
            overflow-y: auto;             
            background-color: transparent;             
            border-radius: 10px;             
            box-sizing: border-box;         
        }          

        .rank-item-small {             
            background-color: transparent;             
            padding: 23px;             
            margin-bottom: 9px;             
            border-radius: 15px;             
            font-size: 18px;             
            color: #ffffff; /* 白文字 */
            font-weight: bold; /* 太字 */
            border: 2px solid #ffffff; /* 白い枠線 */
        }     
    </style> 
</head> 

<body>  
    <form action="main.html" method="post">     
        <div class="button-text-container">         
            <button type="submit" id="backButton">←</button>         
            <span id="RANKING-text">TIME RANKING</span>     
        </div> 
    </form>  

    <div class="ranking-container">         
        <!-- 左側: トップ3ランキング -->         
        <div class="top-ranks">             
            <?php                 
            // ステージ1の上位3位のユーザーとクリアタイムを取得                 
            $stmt = $pdo->prepare('SELECT user_name, clear_time FROM ranking WHERE stage_id = 2 ORDER BY clear_time ASC LIMIT 3');                 
            $stmt->execute();                 
            $rank = 1;                  

            // 各順位のデータを表示                 
            foreach ($stmt as $row) {
                $clear_time = $row['clear_time'];
                $hours = floor($clear_time / 3600);
                $minutes = floor(($clear_time % 3600) / 60);
                $seconds = $clear_time % 60;
                $formatted_time = sprintf('%02d:%02d:%02d', $hours, $minutes, $seconds);

                echo '<div class="rank-item rank-' . $rank . '"><div class="ranking">' . $rank . '</div> '                      
                    . htmlspecialchars($row['user_name']) . ', タイム: ' . $formatted_time . '</div>';                     
                $rank++;                 
            }             
            ?>         
        </div>          

        <!-- 右側: 4位から50位 -->         
        <div class="other-ranks">             
            <?php                 
            // ステージ1の4位から50位までのユーザーとクリアタイムを取得                 
            $stmt = $pdo->prepare('SELECT user_name, clear_time FROM ranking WHERE stage_id = 2 ORDER BY clear_time ASC LIMIT 3, 47');                 
            $stmt->execute();                 
            $rank = 4; // 4位からスタート                  

            // 各順位のデータを表示                 
            foreach ($stmt as $row) {  
                $clear_time = $row['clear_time'];
                $hours = floor($clear_time / 3600);
                $minutes = floor(($clear_time % 3600) / 60);
                $seconds = $clear_time % 60;
                $formatted_time = sprintf('%02d:%02d:%02d', $hours, $minutes, $seconds);

                echo '<div class="rank-item-small">' . $rank . ' '                      
                    . htmlspecialchars($row['user_name']) . ', タイム: ' . $formatted_time . '</div>';                     
                $rank++;                 
            }             
            ?>         
        </div>     
    </div>  
</body> 
</html>
