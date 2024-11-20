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
    this.load.json('stageData', 'json/teststage.json');

    // JSONデータを取得し、アセットを自動的にロード
    this.load.on('filecomplete-json-stageData', () => {
    this.stageData = this.cache.json.get('stageData');
    const assets = this.collectAssets(this.stageData);
    assets.forEach(asset => this.load.image(asset.key, asset.path));

    // BGMのロード
    this.load.audio(this.stageData.stage.bgm, `audio/${this.stageData.stage.bgm}.mp3`);

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
    assetList.add({ key: stageData.stage.background.image, path: `img/teststage/${stageData.stage.background.image}.png` }); // 変更要
    assetList.add({ key: stageData.player.image, path: `img/teststage/${stageData.player.image}.png` }); 

    stageData.blocks.forEach(block => {
      assetList.add({ key: block.image, path: `img/teststage/${block.image}.png` }); // 変更要
    });

    stageData.enemies.forEach(enemy => {
      assetList.add({ key: enemy.image, path: `img/teststage/${enemy.image}.png` }); // 変更要
    });

    stageData.ground.forEach(ground => {
      assetList.add({ key: ground.image, path: `img/teststage/${ground.image}.png` }); // 変更要
    });

    assetList.add({ key: stageData.goal.pole.image, path: `img/goals/${stageData.goal.pole.image}.png` });
    assetList.add({ key: stageData.goal.flag.image, path: `img/goals/${stageData.goal.flag.image}.png` });

    stageData.decorations.forEach(decoration => {
      assetList.add({ key: decoration.image, path: `img/teststage/${decoration.image}.png` });
    });

    assetList.add({ key: 'bullet', path: 'img/teststage/tama.png' });
  
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

    // fallableプロパティを設定
    enemy.fallable = enemyData.fallable;

    if (enemy.active && enemy.body && enemy.body.blocked.down) {
      enemy.setVelocityY(enemyData.jumpHeight);
    }

    let jumpEvent; // スコープ外で宣言

    // 敵のタイプによる動作設定
    if (enemyData.type === 'jump') {
        this.time.addEvent({
            delay: enemyData.jumpInterval,
            callback: () => {
              if (enemy.active && enemy.body && enemy.body.blocked.down) {
                enemy.setVelocityY(enemyData.jumpHeight);
              }
            },
            loop: true
        });
    } else if (enemyData.type === 'shoot') {
        this.time.addEvent({
            delay: enemyData.shootInterval,
            callback: () => this.shootBullet(enemy, enemyData.bulletSpeed, enemyData.bulletImage),
            loop: true
        });
    }
    enemy.body.world.on('worldbounds', (body) => {
      if (body.gameObject === enemy) {
        enemy.destroy(); // 弾がステージ範囲外に出たら削除
      }
    })
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
    this.cameras.main.setZoom(0.5); // カメラのズームを設定（アップさせる）
  
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
  const bullet = this.physics.add.sprite(enemy.x, enemy.y, bulletImage);

  // 敵の進行方向に合わせて弾の速度を設定
  // enemy.body.velocity.x が正なら右方向、負なら左方向に進む
  bullet.setVelocityX(enemy.body.velocity.x !== 0 ? enemy.body.velocity.x > 0 ? bulletSpeed : -bulletSpeed : 0);

  // 弾が重力の影響を受けないように設定
  bullet.body.setAllowGravity(false);

  // ステージの境界を設定し、ステージ範囲外に出たら自動的に削除する
  bullet.setCollideWorldBounds(true);
  bullet.body.onWorldBounds = true;
  bullet.body.world.on('worldbounds', (body) => {
    if (body.gameObject === bullet) {
      bullet.destroy(); // 弾がステージ範囲外に出たら削除
    }
  });

  // 弾とプレイヤーの衝突処理
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
    if (this.isGameOver) return; // すでにゲームオーバーなら処理をスキップ
    this.isGameOver = true; // ゲームオーバーフラグを設定
    this.input.keyboard.enabled = false; // キーボード入力を無効化

    this.player.setTint(0xff0000);  // プレイヤーを赤くするエフェクト
    this.player.setVelocity(0);     // プレイヤーを停止

    const hitSound = this.sound.add('hit', {volume: 1});
    const gameOverSound = this.sound.add('gameOver', { loop: true, volume: 0.1 });

    // ヒット音が終わった後にゲームオーバー音を再生
    hitSound.once('complete', () => {
      this.bgm.stop();  // BGMを停止
      gameOverSound.play();
      this.scene.start('OverScene');  // ゲームオーバー画面に移行 
    });

    hitSound.play();  // ヒット音の再生開始
  }

  // プレイヤーが敵にヒットしたときの処理
  onPlayerHit() {
    if (this.isGameOver) return; // すでにゲームオーバーなら処理をスキップ
    this.isGameOver = true; // ゲームオーバーフラグを設定
    this.input.keyboard.enabled = false; // キーボード入力を無効化

    this.player.setTint(0xff0000);  // プレイヤーを赤くするエフェクト
    this.player.setVelocity(0);     // プレイヤーを停止

    const hitSound = this.sound.add('hit', {volume: 1.5});
    const gameOverSound = this.sound.add('gameOver', { loop: true, volume: 0.1 });

    // ヒット音が終わった後にゲームオーバー音を再生
    hitSound.once('complete', () => {
      this.bgm.stop();  // BGMを停止
      gameOverSound.play();
      this.scene.start('OverScene');  // ゲームオーバー画面に移行 
    });

    hitSound.play();  // ヒット音の再生開始
  }

  //プレイヤーがゴールした時の処理
  onGoalReached() {
    if (this.isGameClear) return; // すでにゲームクリアなら処理をスキップ
    this.isGameClear = true; // ゲームクリアフラグを設定

    this.input.keyboard.enabled = false; // キーボード入力を無効化
    this.player.setVelocity(0);     // プレイヤーを停止

    const gameClearSound = this.sound.add('gameClear', { loop: false, volume: 0.1 });
  
    // ゲームクリア音が終わったらClearSceneに移行
    gameClearSound.once('complete', () => {
      const finalTime = (this.time.now - this.startTime) / 1000;
      this.scene.start('ClearScene', { time: finalTime });
    });
  
    gameClearSound.play();
  }
  
  update() {
    // ゲームオーバーまたはクリアの場合、入力を無効化し、プレイヤーを停止
    if (this.isGameOver || this.isGameClear) {
      this.player.setVelocityX(0);
      return; // これ以上の処理をしない
    }

     this.enemies.getChildren().forEach(enemy => {
        // 敵がステージの底に到達した場合、削除
        if (enemy.y > (this.physics.world.bounds.height - 30)) {
            enemy.destroy();
            return;
        }

        // ジャンプ中かどうかのフラグを確認または設定
        if (enemy.body.velocity.y < 0) {
            enemy.isJumping = true;
        } else if (enemy.body.blocked.down) {
            enemy.isJumping = false;
        }

        if (!enemy.isJumping && enemy.body.blocked.down) {
            const offset = enemy.body.velocity.x > 0 ? 10 : -10;
            const footX = enemy.x + offset;
            const footY = enemy.y + enemy.height / 2 + 5;

            // 進行方向の下に地面があるか確認
            const hasGroundAhead = this.ground.getChildren().some(ground => 
                ground.getBounds().contains(footX, footY)
            );

            if (!hasGroundAhead) {
                if (enemy.fallable) {
                    // 落下可能な敵は落下する
                    enemy.body.checkCollision.down = false;
                } else {
                    // 落下不可の敵は反転する
                    enemy.setVelocityX(-enemy.body.velocity.x);
                }
            }
            // 画像の向きを更新
            enemy.setFlipX(enemy.body.velocity.x > 0);
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
class ClearScene extends Phaser.Scene {
  constructor() {
    super('ClearScene');
  }

  create(data) {
  const time = data.time || 0; // 渡された経過時間（秒）を取得
  const hours = Math.floor(time / 3600); // 時間
  const minutes = Math.floor((time % 3600) / 60); // 分
  const seconds = Math.floor(time % 60); // 秒

  // 経過時間の表示
  this.add.text(config.width / 2 , (config.height / 2) - 50, 
    `Game Clear!`, 
    { fontSize: '48px', fill: '#fff' }
  ).setOrigin(0.5); // 中央に配置;

  this.add.text(config.width / 2, (config.height / 2) + 50,
    `Time: ${hours} 時間 ${minutes} 分 ${seconds} 秒`, 
    { fontSize: '48px', fill: '#fff' }
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
      debug: true,          // デバッグ用の当たり判定表示をオン
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,      // 画面にフィットさせる
    autoCenter: Phaser.Scale.CENTER_BOTH, // 中央に表示する
  },
  scene: [MainScene, ClearScene, OverScene], // シーンを登録
};

// ゲームのインスタンスを作成して起動
const game = new Phaser.Game(config);