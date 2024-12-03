<?php  
session_start();   
require 'db-connect.php';  
$pdo = new PDO($connect, user, pass);  
?>  

<!DOCTYPE html> 
<html lang="ja"> 
<head>     
    <meta charset="UTF-8">     
    <title>RANKING</title>     
    <style>         
        @import url('https://fonts.googleapis.com/css2?family=DotGothic16&display=swap');         

    body {             
        background-color: #30264A;             
        font-family: 'DotGothic16', sans-serif;             
        margin: 0;             
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
        -webkit-text-stroke: 4px rgb(255, 234, 0);
        letter-spacing: 3px;
    }

    .tab-container {
        display: flex;
        margin-top: 90px;
        width: 100%;
        max-width: 1200px;  
        justify-content: flex-start;
    }

    .tab-buttons {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
        margin: 0;
        padding-left: 10px;
        margin-top: 30px;
    }

    .tab-button {
        background-color: #444;
        color: #fff;
        padding: 10px 20px;
        border: none;
        cursor: pointer;
        font-size: 20px;
        font-weight: bold;
    }

    .tab-button.active {
        background-color: #ff0;
        color: #30264A;
    }

    .tab-content {
        display: none;
        width: 100%;
    }

    .tab-content.active {
        display: flex;
        flex-direction: row;
    }

    .ranking-container {
        display: flex;
        width: 100%;
        max-width: 1600px;
        padding: 20px;
        box-sizing: border-box;
    }

    .top-ranks {
        width: 100%;
        padding: 4px;
        box-sizing: border-box;
    }

    .rank-item {
        padding: 45px;
        margin-bottom: 14px;
        border-radius: 15px;
        font-size: 22px;
        font-weight: bolder;
        position: relative;
        overflow: hidden;
        left: 5px;
    }

    .rank-item.rank-1, .rank-item.rank-2, .rank-item.rank-3 {
        border: 5px solid transparent;
        animation: rainbowBorder 2s infinite;
    }

    .rank-item.rank-1 { color: gold; }
    .rank-item.rank-2 { color: silver; }
    .rank-item.rank-3 { color: #cd7f32; }

    .ranking {
        font-size: 55px;
        font-weight: bold;
        padding: 5px;
        display: inline-block;
    }

    @keyframes rainbowBorder {
        0% { border-color: #ff0000; }
        20% { border-color: #ff7f00; }
        40% { border-color: #ffff00; }
        60% { border-color: #00ff00; }
        80% { border-color: #0000ff; }
        100% { border-color: #8b00ff; }
    }

    .other-ranks {
        width: 80%;
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
        color: #ffffff;
        font-weight: bold;
        border: 2px solid #ffffff;
    }

    .rank-item .time-display {
        font-size: 45px;
        position: absolute;
        bottom: 15px;
        right: 30px;
        color: inherit;
        animation: pulse 0.8s infinite alternate; /* タイムのアニメーション */
    }

    .rank-item .username {
        font-size: 50px;
        position: absolute;
        top: 15px;
        left: 90px;
        color: inherit;
    }

    @keyframes pulse {
        0% { transform: scale(1); }
        100% { transform: scale(1.2); } /* サイズを20%増減 */
    }


    </style> 
</head> 

<body>  
    <form action="MainMenu.php" method="post">     
        <div class="button-text-container">         
            <button type="submit" id="backButton">←</button>         
            <span id="RANKING-text">TIME RANKING</span>     
        </div> 
    </form>  

    <?php
    // Retrieve distinct stage IDs from the database
    $stmt = $pdo->query('SELECT DISTINCT stage_id FROM stage ORDER BY stage_id ASC');
    $stageid = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $stmt = $pdo->query('SELECT DISTINCT stage_id FROM ranking ORDER BY stage_id ASC');
    $stages = $stmt->fetchAll(PDO::FETCH_COLUMN);
    ?>

    <div class="tab-container">
        <div class="tab-buttons">
            <?php
            // Generate a tab button for each stage
            foreach ($stageid as $index => $stage_id) {
                $activeClass = $index === 0 ? 'active' : '';
                echo "<button class='tab-button $activeClass' onclick='showTab($stage_id)'>ステージ $stage_id</button>";
            }
            ?>
        </div>

        <?php
        // Generate content for each tab
        foreach ($stages as $index => $stage_id) {
            $activeClass = $index === 0 ? 'active' : '';
            echo "<div class='tab-content $activeClass' id='tab-$stage_id'>";
            echo "<div class='ranking-container'>";
            
            // Display top 3 ranks for the current stage
            echo "<div class='top-ranks'>";
            $stmt = $pdo->prepare('SELECT user_name, clear_time FROM ranking WHERE stage_id = ? ORDER BY clear_time ASC LIMIT 3');
            $stmt->execute([$stage_id]);
            $rank = 1; 

            foreach ($stmt as $row) {
                $clear_time = $row['clear_time'];
                $hours = floor($clear_time / 3600);
                $minutes = floor(($clear_time % 3600) / 60);
                $seconds = $clear_time % 60;
                $formatted_time = sprintf('%02d:%02d:%02d', $hours, $minutes, $seconds);

                echo "<div class='rank-item rank-$rank'><div class='ranking'>$rank</div><div class='username'> "
                . htmlspecialchars($row['user_name']) 
                . "</div><div class='time-display'>$formatted_time</div></div>";
    $rank++;                  
            }
            echo "</div>";

            // Display other ranks for the current stage
            echo "<div class='other-ranks'>";
            $stmt = $pdo->prepare('SELECT user_name, clear_time FROM ranking WHERE stage_id = ? ORDER BY clear_time ASC LIMIT 3, 47');
            $stmt->execute([$stage_id]);
            $rank = 4;

            foreach ($stmt as $row) {
                $clear_time = $row['clear_time'];
                $hours = floor($clear_time / 3600);
                $minutes = floor(($clear_time % 3600) / 60);
                $seconds = $clear_time % 60;
                $formatted_time = sprintf('%02d:%02d:%02d', $hours, $minutes, $seconds);

                echo "<div class='rank-item-small'>$rank "
                    . htmlspecialchars($row['user_name']) . $formatted_time . "</div>";
                $rank++;                 
            }
            echo "</div>"; // close other-ranks
            echo "</div>"; // close ranking-container
            echo "</div>"; // close tab-content
        }
        ?>
    </div>

    <script>
        function showTab(stageId) {
            document.querySelectorAll('.tab-content').forEach((tab) => {
                tab.classList.remove('active');
            });
            document.getElementById(`tab-${stageId}`).classList.add('active');
            
            document.querySelectorAll('.tab-button').forEach((button) => {
                button.classList.remove('active');
            });
            document.querySelector(`.tab-button:nth-child(${stageId})`).classList.add('active');
        }
    </script>
</body> 
</html>