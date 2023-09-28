import {
  app,
  Player,
  Projectile,
  Enemy,
  BlueEnemy,
  CargoShip,
} from "./Clases.js";

document.body.appendChild(app.view);
const backgroundMusic = document.getElementById('background-music');
backgroundMusic.volume = 0.5;

const spaceTexture = PIXI.Texture.from("/asset/SpaceBackground04.png"); // Cambia esto con la ruta de tu imagen de fondo
const space = new PIXI.Sprite(spaceTexture);
space.width = app.screen.width;
space.height = app.screen.height;
app.stage.addChild(space);


const startButton = new PIXI.Text("Start Game", {
  fontFamily: "GameInicio",
  fontSize: 60,
  fill: 0xffffff,
});
startButton.anchor.set(0.5);
startButton.x = app.screen.width / 2;
startButton.y = app.screen.height / 2;
startButton.interactive = true;
startButton.buttonMode = true;
startButton.on("pointerdown", startGame);

let currentColor = 0xffffff; // Color actual del botón
let targetColor = 0xffffff; // Color al que se desea llegar
let transitionTime = 1000; // Tiempo de transición en milisegundos
let transitionStartTime = 0; // Tiempo de inicio de la transición

// Agrega el efecto hover
startButton.interactive = true;

startButton.on("pointerover", () => {
  targetColor = 0xff0000; // Cambia el color de destino a rojo al pasar el cursor
  transitionStartTime = Date.now();
});

startButton.on("pointerout", () => {
  targetColor = 0xffffff; // Cambia el color de destino a blanco al salir el cursor
  transitionStartTime = Date.now();
});

app.ticker.add(() => {
  // Calcula el tiempo transcurrido desde el inicio de la transición
  const currentTime = Date.now();
  const elapsedTime = currentTime - transitionStartTime;

  // Interpola gradualmente el color
  if (elapsedTime < transitionTime) {
    const t = elapsedTime / transitionTime;
    const r =
      ((targetColor >> 16) & 0xff) * t +
      ((currentColor >> 16) & 0xff) * (1 - t);
    const g =
      ((targetColor >> 8) & 0xff) * t + ((currentColor >> 8) & 0xff) * (1 - t);
    const b = (targetColor & 0xff) * t + (currentColor & 0xff) * (1 - t);

    // Establece el nuevo color del botón
    startButton.style.fill = (r << 16) | (g << 8) | b;
    startButton.dirty = true; // Marca el botón como "sucio" para que se actualice
  }

  // Actualiza el color actual del botón
  currentColor = startButton.style.fill;
});

// Agrega el botón al escenario
app.stage.addChild(startButton);


const x = app.screen.width / 2;
const y = app.screen.height / 2;

const player = new Player(x, y, 20, 0xffffff);

let enemiesCreate = false;
const projectiles = [];
const enemies = [];
const blueEnemies = [];
const cargoShips = [];
const palabrasCuatroLetras = [
  "java",
  "html",
  "css",
  "unix",
  "tcp",
  "udp",
  "api",
  "dns",
  "php",
  "json",
];
const palabrasCincoLetras = [
  "linux",
  "mysql",
  "cloud",
  "docker",
  "stack",
  "nginx",
  "react",
  "scala",
  "swift",
  "mongo",
];
const palabrasSeisLetras = [
  "python",
  "apache",
  "tomcat",
  "github",
  "spring",
  "angular",
  "firebase",
  "sqlite",
  "nodejs",
  "hadoop",
];

const starTexture = PIXI.Texture.from("https://pixijs.com/assets/star.png"); // Textura de la estrella
const stars = [];

function createStars() {
  for (let i = 0; i < 100; i++) {
    const star = new PIXI.Sprite(starTexture);
    star.anchor.set(0.5); // Establece el punto de anclaje en el centro
    star.x = Math.random() * app.screen.width;
    star.y = Math.random() * app.screen.height;
    star.alpha = 1; // Configura la transparencia de la estrella
    star.scale.set(0.01 + Math.random() * 0.01); // Configura el tamaño de la estrella
    stars.push(star);
    app.stage.addChild(star);
  }
}

function animateStars() {
  stars.forEach((star) => {
    star.alpha += 0.005 * (Math.random() > 0.5 ? 1 : -1); // Cambia la transparencia gradualmente
    if (star.alpha > 1) star.alpha = 1;
    if (star.alpha < 0.5) star.alpha = 0.5;
  });
}


function spawnEnemiesGradually(level) {

  let numNormalEnemies = 3 + level/level; // Aumenta la cantidad de enemigos normales con cada nivel
  let numBlueEnemies = 2 + Math.floor(level / 2); // Aumenta la cantidad de enemigos azules cada dos niveles
  let numCargo = Math.floor(level / 3); // Aumenta la cantidad de naves cargueras cada tres niveles
  
  // Función para generar un enemigo normal con retraso
  function generateNormalEnemy() {
    const radius = 20;
    let x;
    let y;

    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : app.screen.width + radius;
      y = Math.random() * app.screen.height;
    } else {
      x = Math.random() * app.screen.width;
      y = Math.random() < 0.5 ? 0 - radius : app.screen.height + radius;
    }

    const angle = Math.atan2(
      app.screen.height / 2 - y,
      app.screen.width / 2 - x
    );
    const speed = 1; // Velocidad de los enemigos
    const velocity = {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed,
    };

    enemies.push(
      new Enemy(
        x,
        y,
        radius,
        velocity,
        player,
        palabrasCuatroLetras[
          Math.floor(Math.random() * palabrasCuatroLetras.length)
        ]
      )
    );
  }

  // Función para generar un enemigo azul con retraso
  function generateBlueEnemy() {
    // Lógica para la generación de enemigos azules
    const radius = 20;
    let x;
    let y;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : app.screen.width + radius;
      y = Math.random() * app.screen.height;
    } else {
      x = Math.random() * app.screen.width;
      y = Math.random() < 0.5 ? 0 - radius : app.screen.height + radius;
    }
    const speed = 1; // Velocidad de los enemigos
    // Crea un conjunto de waypoints para el enemigo azul
    const numWaypoints = 3; // Número de waypoints
    const waypoints = [];

    for (let j = 0; j < numWaypoints; j++) {
      const waypointX = Math.random() * app.screen.width;
      const waypointY = Math.random() * app.screen.height;
      waypoints.push({ x: waypointX, y: waypointY });
    }
    blueEnemies.push(
      new BlueEnemy(
        x,
        y,
        radius,
        speed,
        waypoints,
        player,
        palabrasCincoLetras[
          Math.floor(Math.random() * palabrasCincoLetras.length)
        ]
      )
    );
  }

  // Función para generar un carguero con retraso
  function generateCargoShip() {
    const cargo = new CargoShip(
      80,
      player,
      palabrasSeisLetras[Math.floor(Math.random() * palabrasSeisLetras.length)],
      palabrasCuatroLetras[
        Math.floor(Math.random() * palabrasCuatroLetras.length)
      ]
    ); // Pasa el jugador como argumento
    cargoShips.push(cargo);
  }

  function generateRandomEnemy() {
    const availableTypes = [];
    if (numNormalEnemies > 0) availableTypes.push("normal");
    if (numBlueEnemies > 0) availableTypes.push("blue");
    if (numCargo > 0) availableTypes.push("cargo");

    if (availableTypes.length === 0) {
      // No hay tipos de enemigos disponibles, detener la generación
      return;
    }

    const randomType =
      availableTypes[Math.floor(Math.random() * availableTypes.length)];

    switch (randomType) {
      case "normal":
        generateNormalEnemy();
        numNormalEnemies--;
        break;
      case "blue":
        generateBlueEnemy();
        numBlueEnemies--;
        break;
      case "cargo":
        generateCargoShip();
        numCargo--;
        break;
    }

    // Si todavía quedan enemigos por generar, programa la próxima generación
    if (numNormalEnemies > 0 || numBlueEnemies > 0 || numCargo > 0) {
      const delay = 1000 - level*10 ; // Tiempo en milisegundos (por ejemplo, 5 segundos)
      setTimeout(generateRandomEnemy, delay);
    }else{
      enemiesCreate = true;
    }
  }

  // Comienza a generar enemigos gradualmente de forma intercalada y al azar
  generateRandomEnemy();
}

function animate() {
  app.ticker.add(() => {
    // Limpia el lienzo antes de redibujar
    app.stage.removeChildren();

    // Vuelve a agregar el fondo
    app.stage.addChild(space);

    createStars();
    animateStars();

    const allEnemies = enemies.concat(blueEnemies, cargoShips);
    // Agregar enemigos generados por los cargueros a la lista
    for (const cargoShip of cargoShips) {
      if (cargoShip.generatedEnemies) {
        allEnemies.push(...cargoShip.generatedEnemies);
      }
    }
    
    player.draw();
    projectiles.forEach((projectile, index) => {
      projectile.update(allEnemies, projectile);
      if (
        projectile.x - projectile.radius < 0 ||
        projectile.x - projectile.radius > app.screen.width ||
        projectile.y + projectile.radius < 0 ||
        projectile.y - projectile.radius > app.screen.height
      ) {
        setTimeout(() => {
          projectiles.splice(index, 1);
        }, 0);
      }
    });

    // Dibujar y actualizar enemigos
    enemies.forEach((enemy, index) => {
      enemy.update();
      const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
      if (dist - enemy.radius - player.radius < 1) {
        // Maneja la colisión con el jugador
        app.ticker.stop();
      }
      projectiles.forEach((projectile, projectileIndex) => {
        const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
        if (dist - enemy.radius - projectile.radius < 1) {
          // Maneja la colisión con proyectiles
          player.score += 10
          enemies.splice(index, 1);
          projectiles.splice(projectileIndex, 1);
        }
      });
    });

    // Dibujar y actualizar enemigos azules
    blueEnemies.forEach((blueEnemy, index) => {
      blueEnemy.update();
      // Detecta colisiones con proyectiles
      projectiles.forEach((projectile, projectileIndex) => {
        const dist = Math.hypot(
          projectile.x - blueEnemy.x,
          projectile.y - blueEnemy.y
        );
        if (dist - blueEnemy.radius - projectile.radius < 1) {
          // Maneja la colisión con proyectiles
          player.score += 50
          blueEnemies.splice(index, 1);
          projectiles.splice(projectileIndex, 1);
        }
      });
      // Detecta colisión con el jugador
      const distToPlayer = Math.hypot(
        player.x - blueEnemy.x,
        player.y - blueEnemy.y
      );
      if (distToPlayer - blueEnemy.radius - player.radius < 1) {
        // Maneja la colisión con el jugador
        app.ticker.stop();
      }
    });

    // Actualiza los cargueros
    cargoShips.forEach((cargo, index) => {
      cargo.update();
      projectiles.forEach((projectile, projectileIndex) => {
        const dist = Math.hypot(projectile.x - cargo.x, projectile.y - cargo.y);
        if (dist - cargo.radius - projectile.radius < 1) {
          // Maneja la colisión con proyectiles
          player.score += 100
          cargoShips.splice(index, 1);
          projectiles.splice(projectileIndex, 1);
        }
      });
    });

    // Actualiza y muestra los enemigos generados por los cargueros
    cargoShips.forEach((cargo) => {
      cargo.generatedEnemies.forEach((enemy, enemyIndex) => {
        enemy.update();
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (dist - enemy.radius - player.radius < 1) {
          // Maneja la colisión con el jugador
          app.ticker.stop();
        }

        projectiles.forEach((projectile, projectileIndex) => {
          const distToEnemy = Math.hypot(
            projectile.x - enemy.x,
            projectile.y - enemy.y
          );
          if (distToEnemy - enemy.radius - projectile.radius < 1) {
            // Maneja la colisión con proyectiles
            player.score += 10
            cargo.generatedEnemies.splice(enemyIndex, 1); // Elimina el enemigo del carguero
            projectiles.splice(projectileIndex, 1); // Elimina el proyectil
          }
        });
      });
    });
    
    if(allEnemies.length === 0 && enemiesCreate){
      app.ticker.stop();
      level += 1
      player.level = level
      spawnEnemiesGradually(level);
      app.ticker.start();
    }
  });
}

let closestEnemy = null;
function checkWordMatch(letter) {
  let closestDistance = Infinity;
  const allEnemies = enemies.concat(blueEnemies, cargoShips);

  // Agregar enemigos generados por los cargueros a la lista
  for (const cargoShip of cargoShips) {
    if (cargoShip.generatedEnemies) {
      allEnemies.push(...cargoShip.generatedEnemies);
    }
  }

  if (!closestEnemy) {
    for (const enemy of allEnemies) {
      const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);
      if (
        distance < closestDistance &&
        enemy.wordText.text.toLowerCase().startsWith(letter.toLowerCase()) &&
        !enemy.wordCompleted
      ) {
        closestDistance = distance;
        closestEnemy = enemy;
      }
    }
  }
  if (closestEnemy) {
    findAndModifyEnemyById(closestEnemy.id, letter);
  }
}

function findAndModifyEnemyById(id, letter) {
  // Busca el enemigo en la lista de 'enemies'
  let foundEnemy = enemies.find((enemy) => enemy.id === id);

  if (!foundEnemy) {
    // Si no se encuentra en 'enemies', busca en 'blueEnemies'
    foundEnemy = blueEnemies.find((enemy) => enemy.id === id);
  }

  if (!foundEnemy) {
    // Si no se encuentra en 'blueEnemies', busca en 'cargoShips'
    foundEnemy = cargoShips.find((enemy) => enemy.id === id);
  }
  if (!foundEnemy) {
    // Si no se encuentra en 'blueEnemies', busca en 'cargoShips'
    foundEnemy = cargoShips.find((enemy) => enemy.id === id);
  }

  if (!foundEnemy && cargoShips.length > 0) {
    // Si no se encuentra en 'cargoShips', busca en los enemigos generados por los cargueros
    for (const cargoShip of cargoShips) {
      foundEnemy = cargoShip.generatedEnemies.find((enemy) => enemy.id === id);
      if (foundEnemy) break; // Salir del bucle si se encuentra el enemigo
    }
  }

  if (foundEnemy) {
    // Si se encuentra el enemigo, modifica las propiedades
    const currentWord = foundEnemy.wordText.text;
    const letterIndex = currentWord.toLowerCase().indexOf(letter.toLowerCase());

    if (letterIndex !== -1 && letterIndex === 0) {
      // Encuentra la posición de la letra seleccionada
      // Elimina la letra seleccionada y actualiza el texto
      foundEnemy.wordText.text = currentWord.slice(1);

      // Modifica el color de la propiedad wordStyle.fill a rojo (0xFF0000)
      foundEnemy.wordStyle.fill = 0xff0000;

      // Actualiza el estilo del texto para aplicar los cambios de color
      foundEnemy.wordText.style = foundEnemy.wordStyle;

      if (foundEnemy.wordText.text.trim() === "") {
        // La palabra se ha completado, marca 'wordCompleted' como true
        foundEnemy.wordCompleted = true;

        // Aquí puedes realizar cualquier acción adicional
        const proyectil = new Projectile(
          player.x,
          player.y,
          5,
          0xff0000,
          foundEnemy,
          250,
          projectiles
        );
        projectiles.push(proyectil);
        player.updateRotation(foundEnemy.x, foundEnemy.y);
        closestEnemy = null;
      }
    }
  } else {
    closestEnemy = null;
  }
}

document.addEventListener("keydown", (event) => {
  if (event.key.length === 1) {
    // Es una letra, pasa la letra directamente a checkWordMatch
    checkWordMatch(event.key);
  }
});

let level = 1;
function startGame() {
  // Oculta el menú de inicio
  startButton.visible = false;
  backgroundMusic.play();
  animate();
  spawnEnemiesGradually(level);
  
}

