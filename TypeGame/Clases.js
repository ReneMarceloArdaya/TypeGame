export const app = new PIXI.Application({
  width: innerWidth - 50,
  height: innerHeight - 50,
  backgroundColor: 0x000000, // Color de fondo negro
});

const PlayerTexture = "./asset/Player/Main Ship - Base - Full health.png";

export class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.texture = PIXI.Texture.from(PlayerTexture);
    this.sprite = new PIXI.Sprite(this.texture);
    this.sprite.x = x;
    this.sprite.y = y;
    this.sprite.anchor.set(0.5); // Establece el punto de anclaje en el centro
    // Ajusta el tamaño de la imagen
    this.sprite.scale.x = 2; // Escala horizontalmente al 50%
    this.sprite.scale.y = 2; // Escala verticalmente al 50%
    this.rotation = 0; // Ángulo de rotación inicial

    this.level = 1;
    this.score = 0;
    this.levelText = new PIXI.Text("Nivel: 1", {
      fontFamily: "Impact",
      fontSize: 24,
      fill: 0xffffff,
    });
    this.scoreText = new PIXI.Text("Puntaje: 0", {
      fontFamily: "Impact",
      fontSize: 24,
      fill: 0xffffff,
    });

    // Posición inicial de los elementos de texto
    this.levelText.position.set(20, 20);
    this.scoreText.position.set(app.screen.width - 150, 20);
  }

  draw() {
    this.scoreText.text = `Puntaje: ${this.score}`
    this.levelText.text = `Nivel: ${this.level}`
    app.stage.addChild(this.levelText, this.scoreText);
    app.stage.addChild(this.sprite);
  }

 

  updateRotation(targetX, targetY) {
    const angle = Math.atan2(targetY - this.y, targetX - this.x);
    this.sprite.rotation = angle - 11;
  }
}

const projectileAnimationTextures = [];
for (let i = 1; i <= 4; i++) {
  const texture = PIXI.Texture.from(`./asset/Projectile/Projectile_${i}.png`);
  projectileAnimationTextures.push(texture);
}
export class Projectile {
  constructor(x, y, radius, color, targetEnemy, lifetime, projectiles) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.targetEnemy = targetEnemy;
    this.speed = 5; // Velocidad del proyectil
    this.lifetime = lifetime; // Tiempo de vida en fotogramas
    this.projectilesArray = projectiles;

    //animación
    this.animationTextures = projectileAnimationTextures; // Referencia a las texturas de animación
    this.animation = null; // Inicialmente no se crea la animación
    this.createAnimation(); // Llama al método para crear la animación
    this.animation.scale.set(0.3);
  }

  createAnimation() {
    // Crea la animación solo una vez
    this.animation = new PIXI.AnimatedSprite(this.animationTextures);
    this.animation.x = this.x;
    this.animation.y = this.y;
    this.animation.anchor.set(0.5); // Establece el punto de anclaje en el centro
    this.animation.animationSpeed = 0.1; // Ajusta la velocidad de la animación
    this.animation.loop = true; // Haz que la animación se repita
    this.animation.play(); // Inicia la animación
  }

  update(allEnemies) {
    app.stage.addChild(this.animation);
    // Calcula la dirección hacia el targetEnemy
    const dx = this.targetEnemy.x - this.x;
    const dy = this.targetEnemy.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Normaliza la dirección hacia el targetEnemy
    let targetVelocityX = (dx / distance) * this.speed;
    let targetVelocityY = (dy / distance) * this.speed;

    // Verifica si el proyectil está cerca de otros enemigos
    const avoidanceRadius = 50; // Radio de evasión (ajusta según tu juego)

    for (const enemy of allEnemies) {
      if (enemy !== this.targetEnemy) {
        const distToEnemy = Math.hypot(this.x - enemy.x, this.y - enemy.y);
        if (distToEnemy < avoidanceRadius) {
          // Calcula la dirección para evitar al enemigo
          const avoidanceAngle = Math.atan2(this.y - enemy.y, this.x - enemy.x);
          targetVelocityX += Math.cos(avoidanceAngle) * this.speed;
          targetVelocityY += Math.sin(avoidanceAngle) * this.speed;
        }
      }
    }

    // Normaliza la nueva dirección del proyectil
    const newDistance = Math.sqrt(
      targetVelocityX * targetVelocityX + targetVelocityY * targetVelocityY
    );
    this.velocityX = (targetVelocityX / newDistance) * this.speed;
    this.velocityY = (targetVelocityY / newDistance) * this.speed;

    // Actualiza la posición del proyectil en función de la nueva dirección
    this.x += this.velocityX;
    this.y += this.velocityY;
    this.animation.x = this.x; // Actualiza la posición de la animación
    this.animation.y = this.y;
    // Calcula el ángulo del el enemigo
    const angleToPlayer = Math.atan2(
      this.targetEnemy.y - this.y,
      this.targetEnemy.x - this.x
    );
    // Establece la rotación de la animación para apuntar hacia el jugador
    this.animation.rotation = angleToPlayer - 11;

    // Decrementa el tiempo de vida en cada actualización
    this.lifetime--;
    if (this.lifetime <= 0) {
      // El proyectil ha agotado su tiempo de vida, elimínalo
      this.destroy();
    }
  }
  destroy() {
    // Detiene y elimina la animación del escenario
    if (this.animation) {
      app.stage.removeChild(this.animation); // Elimina la animación del escenario
    }
    // Elimina el proyectil del array de proyectiles
    const index = this.projectilesArray.indexOf(this);
    if (index !== -1) {
      this.projectilesArray.splice(index, 1);
    }
    // También puedes realizar cualquier otra limpieza necesaria aquí
  }
}

const enemyAnimationTextures = [];
for (let i = 1; i <= 8; i++) {
  const texture = PIXI.Texture.from(
    `./asset/enemies/BomberFrames/Bomber_${i}.png`
  );
  enemyAnimationTextures.push(texture);
}
export class Enemy {
  constructor(x, y, radius, velocity, player, word) {
    this.id = `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.player = player;
    //animación
    this.animationTextures = enemyAnimationTextures; // Referencia a las texturas de animación
    this.animation = null; // Inicialmente no se crea la animación
    this.velocity = velocity;
    this.createAnimation(); // Llama al método para crear la animación
    this.animation.scale.set(0.3);
    //Palabras
    this.currentWordIndex = 0; // Inicializa en la primera letra
    this.wordStyle = {
      fontFamily: "Consolas", // Establecer la fuente
      fontSize: 20, // Tamaño de la fuente
      fill: 0xffffff, // Color del texto
    };
    this.wordText = new PIXI.Text(word, this.wordStyle);
    this.wordText.x = x;
    this.wordText.y = y;
    this.wordCompleted = false;
  }

  createAnimation() {
    // Crea la animación solo una vez
    this.animation = new PIXI.AnimatedSprite(this.animationTextures);
    this.animation.x = this.x;
    this.animation.y = this.y;
    this.animation.anchor.set(0.5); // Establece el punto de anclaje en el centro
    this.animation.animationSpeed = 0.1; // Ajusta la velocidad de la animación
    this.animation.loop = true; // Haz que la animación se repita
    this.animation.play(); // Inicia la animación
  }

  update() {
    // Actualiza la posición del enemigo
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.animation.x = this.x; // Actualiza la posición de la animación
    this.animation.y = this.y;
    this.wordText.x = this.x - 20; // Actualiza la posición de la animación
    this.wordText.y = this.y + 30;
    // Calcula el ángulo hacia el jugador
    const angleToPlayer = Math.atan2(
      this.player.y - this.y,
      this.player.x - this.x
    );
    // Establece la rotación de la animación para apuntar hacia el jugador
    this.animation.rotation = angleToPlayer - 11;

    app.stage.addChild(this.wordText);
    app.stage.addChild(this.animation);
  }
}

const blueAnimationTextures = [];
for (let i = 1; i <= 8; i++) {
  const texture = PIXI.Texture.from(`./asset/enemies/BlueFrames/Blue_${i}.png`);
  blueAnimationTextures.push(texture);
}

export class BlueEnemy {
  constructor(x, y, radius, speed, waypoints, player, word) {
    this.id = `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speed = speed;
    this.waypoints = waypoints;
    this.player = player; // Almacena el jugador

    this.animation = new PIXI.AnimatedSprite(blueAnimationTextures);
    this.animation.x = x;
    this.animation.y = y;
    this.animation.anchor.set(0.5); // Establece el punto de anclaje en el centro
    this.animation.animationSpeed = 0.1; // Velocidad de la animación
    this.animation.play(); // Comienza la animación
    this.animation.scale.set(0.3);

    this.currentWordIndex = 0; // Inicializa en la primera letra
    this.wordStyle = {
      fontFamily: "Consolas", // Establecer la fuente
      fontSize: 20, // Tamaño de la fuente
      fill: 0xffffff, // Color del texto
    };
    this.wordText = new PIXI.Text(word, this.wordStyle);
    this.wordText.x = x;
    this.wordText.y = y + 20;
    this.wordCompleted = false;
  }

  update() {
    app.stage.addChild(this.animation);
    app.stage.addChild(this.wordText);
    if (this.waypoints.length > 0) {
      // Si hay waypoints disponibles, el enemigo azul se mueve hacia el próximo waypoint
      const nextWaypoint = this.waypoints[0];
      const angleToWaypoint = Math.atan2(
        nextWaypoint.y - this.y,
        nextWaypoint.x - this.x
      );

      this.animation.rotation = angleToWaypoint - 11;
      // Calcula la velocidad hacia el próximo waypoint
      const velocity = {
        x: Math.cos(angleToWaypoint) * this.speed,
        y: Math.sin(angleToWaypoint) * this.speed,
      };

      // Comprueba si el jugador está en el camino hacia el waypoint
      const playerDistanceToWaypoint = Math.hypot(
        nextWaypoint.x - this.player.x,
        nextWaypoint.y - this.player.y
      );

      // Define una distancia mínima entre el jugador y el waypoint
      const minPlayerDistanceToWaypoint = this.radius * 2; // Ajusta según tus preferencias

      if (playerDistanceToWaypoint < minPlayerDistanceToWaypoint) {
        // El jugador está cerca del waypoint, ajusta el ángulo para evitar al jugador
        const avoidanceAngle = Math.atan2(
          this.player.y - this.y,
          this.player.x - this.x
        );
        angleToWaypoint += avoidanceAngle;
      }

      // Actualiza la posición del enemigo azul
      this.x += velocity.x;
      this.y += velocity.y;

      const distToWaypoint = Math.hypot(
        nextWaypoint.x - this.x,
        nextWaypoint.y - this.y
      );

      // Si el enemigo azul está cerca del waypoint, pasa al siguiente
      if (distToWaypoint < 5) {
        this.waypoints.shift();
      }
    } else {
      // Si no hay más waypoints, el enemigo azul persigue al jugador directamente
      const angle = Math.atan2(this.player.y - this.y, this.player.x - this.x);

      // Calcula la velocidad hacia el jugador
      const velocity = {
        x: Math.cos(angle) * this.speed,
        y: Math.sin(angle) * this.speed,
      };
      // Calcula el ángulo hacia el jugador
      const angleToPlayer = Math.atan2(
        this.player.y - this.y,
        this.player.x - this.x
      );
      // Establece la rotación de la animación para apuntar hacia el jugador
      this.animation.rotation = angleToPlayer - 11;
      // Actualiza la posición del enemigo azul
      this.x += velocity.x;
      this.y += velocity.y;
    }

    // Actualiza la posición de la animación de textura
    this.animation.x = this.x;
    this.animation.y = this.y;
    this.wordText.x = this.x - 50; // Actualiza la posición de la animación
    this.wordText.y = this.y + 30;
  }
}

const cargoAnimationTextures = [];
for (let i = 1; i <= 25; i++) {
  const texture = PIXI.Texture.from(
    `./asset/enemies/CargoFrames/Cargo_${i}.png`
  );
  cargoAnimationTextures.push(texture);
}
export class CargoShip {
  constructor(radius, player, word, naveWord) {
    this.id = `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.radius = radius;
    this.x = Math.random() * app.screen.width;
    this.y = Math.random() * app.screen.height;
    this.timer = 0;
    this.velocityX = Math.random() * 2 - 1; // Velocidad horizontal aleatoria
    this.velocityY = Math.random() * 2 - 1; // Velocidad vertical aleatoria
    this.generatedEnemies = []; // Almacena los enemigos generados por el carguero
    this.player = player;

    this.animation = new PIXI.AnimatedSprite(cargoAnimationTextures);
    this.animation.x = this.x;
    this.animation.y = this.y;
    this.animation.anchor.set(0.5); // Establece el punto de anclaje en el centro
    this.animation.animationSpeed = 0.07; // Velocidad de la animación
    this.animation.play(); // Comienza la animación
    this.animation.scale.set(0.3);

    this.currentWordIndex = 0; // Inicializa en la primera letra
    this.naveWord = naveWord;
    this.wordStyle = {
      fontFamily: "Consolas", // Establecer la fuente
      fontSize: 25, // Tamaño de la fuente
      fill: 0xffffff, // Color del texto
    };
    this.wordText = new PIXI.Text(word, this.wordStyle);
    this.wordText.x = this.x;
    this.wordText.y = this.y;
    this.wordCompleted = false;
  }

  update() {
    app.stage.addChild(this.animation);
    app.stage.addChild(this.wordText);

    const moveSpeed = 0.5; // Velocidad de movimiento del carguero

    // Mueve el carguero en una dirección aleatoria
    this.x += this.velocityX * moveSpeed;
    this.y += this.velocityY * moveSpeed;

    // Limita al carguero para que no salga del lienzo
    if (this.x < this.radius) {
      this.x = this.radius;
      this.velocityX *= -1; // Invierte la dirección en el eje X
    } else if (this.x > app.screen.width - this.radius) {
      this.x = app.screen.width - this.radius;
      this.velocityX *= -1; // Invierte la dirección en el eje X
    }

    if (this.y < this.radius) {
      this.y = this.radius;
      this.velocityY *= -1; // Invierte la dirección en el eje Y
    } else if (this.y > app.screen.height - this.radius) {
      this.y = app.screen.height - this.radius;
      this.velocityY *= -1; // Invierte la dirección en el eje Y
    }

    // Actualiza el temporizador y genera enemigos normales periódicamente
    this.timer++;
    if (this.timer >= 300) {
      this.generateEnemy();
      this.timer = 0;
    }

    // Actualiza y muestra los enemigos generados
    this.generatedEnemies.forEach((enemy) => {
      enemy.update();
    });

    // Calcula la distancia entre el carguero y el jugador
    const distanceToPlayer = Math.hypot(
      this.player.x - this.x,
      this.player.y - this.y
    );

    // Define una distancia mínima entre el carguero y el jugador
    const minDistanceToPlayer = 500; // Ajusta la distancia mínima según tus preferencias

    // Si la distancia es menor que la distancia mínima, ajusta la posición
    if (distanceToPlayer < minDistanceToPlayer) {
      // Calcula el ángulo entre el carguero y el jugador
      const angle = Math.atan2(this.player.y - this.y, this.player.x - this.x);

      // Calcula la nueva posición del carguero para mantener la distancia mínima
      const newX = this.player.x - minDistanceToPlayer * Math.cos(angle);
      const newY = this.player.y - minDistanceToPlayer * Math.sin(angle);

      // Actualiza la posición del carguero
      this.x = newX;
      this.y = newY;
    }

    // Actualiza la posición de la animación de textura
    this.animation.x = this.x;
    this.animation.y = this.y;

    // Calcula el ángulo hacia el jugador
    const angleToPlayer = Math.atan2(
      this.player.y - this.y,
      this.player.x - this.x
    );
    // Establece la rotación de la animación para apuntar hacia el jugador
    this.animation.rotation = angleToPlayer - 11;

    this.wordText.x = this.x - 10; // Actualiza la posición de la animación
    this.wordText.y = this.y + 55;
  }

  generateEnemy() {
    const radius = 20; // Radio de los enemigos generados por el carguero
    const speed = 1; // Velocidad de los enemigos generados

    // Calcula el ángulo entre el carguero y el jugador
    const angleToPlayer = Math.atan2(
      this.player.y - this.y,
      this.player.x - this.x
    );

    // Calcula la velocidad hacia el jugador
    const velocityX = Math.cos(angleToPlayer) * speed;
    const velocityY = Math.sin(angleToPlayer) * speed;

    const enemy = new Enemy(
      this.x,
      this.y,
      radius,
      { x: velocityX, y: velocityY },
      this.player,
      this.naveWord
    );
    this.generatedEnemies.push(enemy);
  }
}
