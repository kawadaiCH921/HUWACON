// このファイルは変更禁止！！！！！
// コピーして作ったファイルで変更してください！

class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    this.stageData = null; // ステージデータを格納する変数
    this.startTime = 0;     // プレイ開始時刻
    this.bg = null;
    this.bgm = null; // BGM用の変数
    this.isGameOver = false; // ゲームオーバーフラグを追加
    this.isGameClear = false; // ゲームクリアフラグを追加
  }

  preload() {
    // JSONファイルの読み込み
    this.load.json('stageData', 'json/1-2.json');

    // JSONデータを取得し、アセットを自動的にロード
    this.load.on('filecomplete-json-stageData', () => {
    this.stageData = this.cache.json.get('stageData');
    const assets = this.collectAssets(this.stageData);
    assets.forEach(asset => this.load.image(asset.key, asset.path));

    // BGMのロード
    this.load.audio(this.stageData.stage.bgm, `img/1-2/${this.stageData.stage.bgm}.mp3`);

    // 固定されたSEのロード
    this.load.audio('jump', 'audio/jump.mp3');
    this.load.audio('hit', 'audio/hit.mp3');
    this.load.audio('gameOver', 'audio/gameOver2.mp3');
    this.load.audio('gameClear', 'audio/gameClear.mp3');
    });
  }

  // JSONから使用する画像をすべて集める
  collectAssets(stageData) {
    const assetList = new Set();

    // 背景、プレイヤー、敵、ブロック、ゴールの画像を収集
    assetList.add({ key: stageData.stage.background.image, path: `img/1-2/${stageData.stage.background.image}.jpg` }); // 変更要
    assetList.add({ key: stageData.player.image, path: `img/player/${stageData.player.image}.png` }); 

    stageData.blocks.forEach(block => {
      assetList.add({ key: block.image, path: `img/1-2/${block.image}.png` }); // 変更要
    });

    stageData.enemies.forEach(enemy => {
      assetList.add({ key: enemy.image, path: `img/1-2/${enemy.image}.png` }); // 変更要
      // 弾丸画像を追加
      if (enemy.bulletImage) {
        assetList.add({ key: enemy.bulletImage, path: `img/1-2/${enemy.bulletImage}.png` });
      }
    });

    stageData.ground.forEach(ground => {
      assetList.add({ key: ground.image, path: `img/1-2/${ground.image}.png` }); // 変更要
    });

    assetList.add({ key: stageData.goal.pole.image, path: `img/goals/${stageData.goal.pole.image}.png` });
    assetList.add({ key: stageData.goal.flag.image, path: `img/goals/${stageData.goal.flag.image}.png` });

    stageData.decorations.forEach(decoration => {
      assetList.add({ key: decoration.image, path: `img/1-2/${decoration.image}.png` });
    });
  
    return Array.from(assetList);
  }

  create() {
    // === すべてのサウンドを停止 ===
    this.sound.stopAll();
    this.isGameOver = false; // ゲームオーバーフラグを設定
    this.isGameClear = false; // ゲームオーバーフラグを設定
    this.input.keyboard.enabled = true; // キーボード入力を有効化
    
    const { stage, player, blocks, enemies, goal, ground, holes, decorations } = this.stageData;
    this.startTime = this.time.now;
  
    // JSONから背景画像のスケール値を取得
    const bgScaleX = stage.background.scaleX || 1;  // JSONの横方向スケール、デフォルトは1
    const bgScaleY = stage.background.scaleY || 1;  // JSONの縦方向スケール、デフォルトは1

    // === 背景のタイルスプライト生成 ===
    this.bg = this.add.tileSprite(
      0, 0,                       // 座標 (左上)
      stage.width, stage.height,    // ステージ全体のサイズ
      stage.background.image        // 使用する背景画像のキー
    ).setOrigin(0, 0)
    .setScale(bgScaleX, bgScaleY);  // 個別のスケールを設定

    // === BGMの再生 ===
    this.bgm = this.sound.add(stage.bgm, { loop: true, volume: 0.1 });
    this.bgm.play();

    // カメラとワールドの設定
    this.cameras.main.setBounds(0, 0, stage.width, stage.height - 70);
    this.physics.world.setBounds(0, 0, stage.width, stage.height);
  
    // プレイヤーの生成
    this.player = this.physics.add.sprite(player.x, player.y, player.image)
      .setScale(player.scale)
      .setCollideWorldBounds(true);
  
    // ブロックの生成 (静的グループ)
    this.blocks = this.physics.add.staticGroup();
    blocks.forEach(block => {
      const b = this.blocks.create(block.x, block.y, block.image)
        .setScale(block.scale)
        .refreshBody();
    });
  
    // 地面の生成 (静的グループ)
    this.ground = this.physics.add.staticGroup();
    ground.forEach(g => {
      const groundBlock = this.ground.create(g.x, g.y, g.image)
        .setOrigin(0, 0.5)  // 地面を底辺に合わせて配置
        .setDisplaySize(g.width, g.height)  // 地面の高さは固定
        .refreshBody();
    });
  
   // 敵キャラの生成 (動的グループ)
    this.enemies = this.physics.add.group();

    enemies.forEach(enemyData => {
      const enemy = this.enemies.create(enemyData.x, enemyData.y, enemyData.image)
          .setScale(enemyData.scale)
          .setVelocityX(enemyData.speedX)
          .setCollideWorldBounds(true)
          .setBounce(1, 0);
  
      enemy.fallable = enemyData.fallable;
  
      if (enemyData.type === 'jump') {
          enemy.jumpTimer = this.time.addEvent({
              delay: enemyData.jumpInterval,
              callback: () => {
                  if (enemy.active && enemy.body && enemy.body.blocked.down) {
                      enemy.setVelocityY(enemyData.jumpHeight);
                  }
              },
              loop: true,
              paused: true // 最初は停止
          });
      } else if (enemyData.type === 'shoot') {
          enemy.shootTimer = this.time.addEvent({
              delay: enemyData.shootInterval,
              callback: () => this.shootBullet(enemy, enemyData.bulletSpeed, enemyData.bulletImage),
              loop: true,
              paused: true // 最初は停止
          });
      }
  });
    // デコレーションオブジェクトの生成
    decorations.forEach(decoration => {
      this.add.image(decoration.x, decoration.y, decoration.image)
      .setDisplaySize(decoration.width, decoration.height);
    });

    // 敵とブロックの衝突を設定
    this.physics.add.collider(this.enemies, this.blocks);
  
    // 敵が地面に立つようにコライダーを追加
    this.physics.add.collider(this.enemies, this.ground);

    /// 敵同士の衝突を設定
    this.physics.add.collider(this.enemies, this.enemies, (enemy1, enemy2) => {
      // 衝突時に画像を反転（進行方向に合わせる）
      enemy1.setFlipX(enemy1.body.velocity.x > 0);
      enemy2.setFlipX(enemy2.body.velocity.x > 0);
    });

  
    // ゴールポールとフラッグの生成
    this.pole = this.physics.add.staticSprite(goal.pole.x, goal.pole.y, goal.pole.image)
      .setDisplaySize(goal.pole.width, goal.pole.height)
      .refreshBody();
  
    this.flag = this.physics.add.staticSprite(goal.flag.x, goal.flag.y, goal.flag.image)
      .setDisplaySize(goal.flag.width, goal.flag.height)
      .refreshBody();
  
    // 衝突判定
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.blocks);
    this.physics.add.overlap(this.player, this.enemies, this.onPlayerHit, null, this);
    this.physics.add.overlap(this.player, this.pole, this.onGoalReached, null, this);
    this.physics.add.overlap(this.player, this.flag, this.onGoalReached, null, this);
  
    // 穴の判定を追加
    holes.forEach(hole => {
      this.physics.add.overlap(this.player, this.createHoleZone(hole), this.onFallInHole, null, this);
    });
  
    // カメラの追従設定
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.5); // カメラのズームを設定（アップさせる）
  
    // キーボード入力の取得
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      jump: Phaser.Input.Keyboard.KeyCodes.SPACE
    });
  
    // タイマー表示用のテキストを追加
    this.timerText = this.add.text(10, 10, 'Time: 0.000', { fontSize: '20px', fill: '#fff' });
    // this.timerText.setScrollFactor(0); // カメラに固定

    // プレイヤーの当たり判定を小さくする
    this.player.setSize(this.player.width * 0.8, this.player.height * 0.9); // サイズの80％
    this.player.setOffset(this.player.width * 0.1, this.player.height * 0.1); // オフセットを調整

    // 敵の当たり判定を小さくする
    this.enemies.getChildren().forEach(enemy => {
      enemy.setSize(enemy.width * 0.8, enemy.height * 0.8); // サイズの80％
      enemy.setOffset(enemy.width * 0.1, enemy.height * 0.1); // オフセットを調整
    });
  }
  
// 弾を発射するメソッド
shootBullet(enemy, bulletSpeed, bulletImage) {
  if (!enemy.active) return; // 無効な敵はスキップ

  const direction = enemy.body.velocity.x > 0 ? 1 : -1; // 敵の進行方向を確認
  const bullet = this.physics.add.sprite(enemy.x, enemy.y, bulletImage)
      .setVelocityX(direction * bulletSpeed) // 弾丸の速度を設定
      .setCollideWorldBounds(true)
      .setGravity(0, 0);

  bullet.body.setAllowGravity(false);

  // 弾丸の向きを進行方向に合わせる
  bullet.setFlipX(direction < 0);

  bullet.body.onWorldBounds = true;
  bullet.body.world.on('worldbounds', (body) => {
      if (body.gameObject === bullet) {
          bullet.destroy();
      }
  });

  this.physics.add.overlap(this.player, bullet, this.onPlayerHit, null, this);
}


  // 穴のゾーンを生成する関数
  createHoleZone(hole) {
    const zone = this.add.zone(hole.x, hole.y, hole.width, hole.height);  // 地面と同じ高さに配置
    this.physics.world.enable(zone);
    zone.body.setAllowGravity(false);  // 重力の影響を受けない
    zone.body.moves = false;  // 動かないように設定
    return zone;
  }
  
  // 穴に落ちたときの処理
  onFallInHole() {
    if (this.isGameOver || this.isGameClear) return; // すでに終了している場合はスキップ
    this.isGameOver = true;

    this.input.keyboard.enabled = false;
    this.player.setTint(0xff0000);
    this.player.setVelocity(0);

    const hitSound = this.sound.add('hit', { volume: 1 });
    const gameOverSound = this.sound.add('gameOver', { loop: true, volume: 0.1 });

    hitSound.once('complete', () => {
        this.bgm.stop();
        gameOverSound.play();
        this.scene.start('OverScene');
    });

    hitSound.play();
  }

  // プレイヤーが敵にヒットしたときの処理
  onPlayerHit() {
    if (this.isGameOver || this.isGameClear) return; // すでに終了している場合はスキップ
    this.isGameOver = true;

    this.input.keyboard.enabled = false;
    this.player.setTint(0xff0000);
    this.player.setVelocity(0);

    const hitSound = this.sound.add('hit', { volume: 1.5 });
    const gameOverSound = this.sound.add('gameOver', { loop: true, volume: 0.1 });

    hitSound.once('complete', () => {
        this.bgm.stop();
        gameOverSound.play();
        this.scene.start('OverScene');
    });

    hitSound.play();
  }

  //プレイヤーがゴールした時の処理
  onGoalReached() {
    if (this.isGameClear || this.isGameOver) return; // 重複防止
    this.isGameClear = true; // ゲームクリアフラグを設定

    this.input.keyboard.enabled = false; // キーボード入力を無効化
    this.player.setVelocity(0); // プレイヤーを停止

    const gameClearSound = this.sound.add('gameClear', { loop: false, volume: 0.1 });

    // ゲームクリア音が終わったらclear.phpに遷移
    gameClearSound.once('complete', () => {
        const finalTime = (this.time.now - this.startTime) / 1000;
        const url = `clear.php?time=${encodeURIComponent(finalTime.toFixed(3))}`;
        window.location.href = url; // clear.phpに遷移
    });

    gameClearSound.play();
  }

  // 敵の進行方向に地面があるか確認
  checkGroundAhead(enemy, offset) {
    const footX = enemy.x + offset;
    const footY = enemy.y + enemy.height / 2 + 5;

    return this.ground.getChildren().some(ground =>
        ground.getBounds().contains(footX, footY)
    );
  }
  
  update() {
    // ゲームオーバーまたはクリアの場合、入力を無効化し、プレイヤーを停止
    if (this.isGameOver || this.isGameClear) return;

    const playerX = this.player.x;

    this.enemies.getChildren().forEach(enemy => {
      const enemyX = enemy.x;

      // 敵がアクティブでボディが存在する場合のみ処理を進める
      if (!enemy.active || !enemy.body) return;
  
      // プレイヤーと敵の距離を確認
      const isNearPlayer = playerX - 550 <= enemyX && enemyX <= playerX + 2500;

      // 範囲内の場合、通常の処理を実行
      enemy.body.setCollideWorldBounds(true); // ワールド内に閉じ込める
      enemy.body.maxVelocity.y = 2000;       // 落下速度の上限を設定
      enemy.body.checkCollision.up = true;
      enemy.body.checkCollision.down = true;
      enemy.body.checkCollision.left = true;
      enemy.body.checkCollision.right = true;
  
      // 敵がステージの底に到達した場合、削除
      if (enemy.y > (this.physics.world.bounds.height - 30)) {
          enemy.destroy();
          return;
      }
  
      // ジャンプ中かどうかのフラグを確認または設定
       if (isNearPlayer) {
            // 処理を再開
            enemy.body.enable = true;

            if (enemy.jumpTimer && !enemy.jumpTimer.running) {
                enemy.jumpTimer.paused = false; // ジャンプタイマー再開
            }
            if (enemy.shootTimer && !enemy.shootTimer.running) {
                enemy.shootTimer.paused = false; // シュートタイマー再開
            }

            // 通常の動作処理
            if (!enemy.isJumping && enemy.body.blocked.down) {
              const offset = enemy.body.velocity.x > 0 ? 10 : -10;
              const scaledHeight = enemy.height * enemy.scaleY; // スケールを考慮
              const footX = enemy.x + offset;
              const footY = enemy.y + scaledHeight / 2 + 5;

                // 足元に地面があるか判定
                const hasGroundAhead = this.ground.getChildren().some(ground =>
                    ground.getBounds().contains(footX, footY)
                );

                if (!hasGroundAhead) {
                    if (enemy.fallable) {
                        enemy.body.checkCollision.down = false; // 落下可能
                    } else {
                        enemy.setVelocityX(-enemy.body.velocity.x); // 方向反転
                    }
                }

                // 向きを更新
                enemy.setFlipX(enemy.body.velocity.x > 0);
            }
        } else {
            // 処理を停止
            enemy.body.enable = false;

            if (enemy.jumpTimer && enemy.jumpTimer.running) {
                enemy.jumpTimer.paused = true; // ジャンプタイマー停止
            }
            if (enemy.shootTimer && enemy.shootTimer.running) {
                enemy.shootTimer.paused = true; // シュートタイマー停止
            }
        }
    });

    const elapsedTime = (this.time.now - this.startTime) / 1000;
    const hours = Math.floor(elapsedTime / 3600);
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = Math.floor(elapsedTime % 60);
    this.timerText.setText(`Time: ${hours} 時間 ${minutes} 分 ${seconds} 秒`);

    if (!this.cursors || !this.keys) return;

    const { left, right, up, jump } = this.keys;

    if (this.cursors.left.isDown || left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown || right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    if ((this.cursors.up.isDown || up.isDown || jump.isDown) && this.player.body.blocked.down) {
      this.player.setVelocityY(-500);
      this.sound.play('jump', {volume: '0.1'});
    }

    // === 背景のスクロール処理 ===
    this.bg.tilePositionX = this.cameras.main.scrollX * 0.2; // パララックス効果を追加
  }
}

// クリア画面のシーン
// class ClearScene extends Phaser.Scene {
//   constructor() {
//     super('ClearScene');
//   }

//   create(data) {
//   const time = data.time || 0; // 渡された経過時間（秒）を取得
//   const hours = Math.floor(time / 3600); // 時間
//   const minutes = Math.floor((time % 3600) / 60); // 分
//   const seconds = Math.floor(time % 60); // 秒

//   // 経過時間の表示
//   this.add.text(config.width / 2 , (config.height / 2) - 50, 
//     `Game Clear!`, 
//     { fontSize: '48px', fill: '#fff' }
//   ).setOrigin(0.5); // 中央に配置;

//   this.add.text(config.width / 2, (config.height / 2) + 50,
//     `Time: ${hours} 時間 ${minutes} 分 ${seconds} 秒`, 
//     { fontSize: '48px', fill: '#fff' }
//   ).setOrigin(0.5); // 中央に配置;

//   // クリックまたはスペースキーで再スタート
//   this.input.once('pointerdown', () => {
//       this.scene.start('MainScene');
//     });
//     this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
//     this.spaceKey.on('down', () => {
//       this.scene.start('MainScene');
//     });
//   }
// }

class OverScene extends Phaser.Scene {
  constructor() {
    super('OverScene');
  }

  create() {
    this.add.text(config.width / 2 , config.height / 2,
      'Game Over!', { fontSize: '48px', fill: '#f00' }
    ).setOrigin(0.5); // 中央に配置;

    // クリックまたはスペースキーで再スタート
    this.input.once('pointerdown', () => {
      this.scene.start('MainScene');
    });
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', () => {
      this.scene.start('MainScene');
    });
  }
}

// ===== Phaserのゲーム設定 =====
// ゲーム全体の基本設定を定義します。
const config = {
  type: Phaser.AUTO, // 自動的に WebGL か Canvas を選択
  width: 1280,        // 初期の幅（比率を保つために必要）
  height: 720,       // 初期の高さ
  physics: {
    default: 'arcade', // Arcade 物理エンジンを使用
    arcade: {
      gravity: { y: 1000 }, // 重力の設定
      debug: false,
      tileBias: 64, // 衝突検出のバイアス (タイルの大きさを基準に設定)
      checkCollision: {
        up: true,
        down: true,
        left: true,
        right: true 
      }
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,      // 画面にフィットさせる
    autoCenter: Phaser.Scale.CENTER_BOTH, // 中央に表示する
  },
  scene: [MainScene, OverScene], // シーンを登録
};

// ゲームのインスタンスを作成して起動
const game = new Phaser.Game(config);