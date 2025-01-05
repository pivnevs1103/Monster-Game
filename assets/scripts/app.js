// Declaring const variables that will stay the same through out the program
const ATTACK_VALUE = 10;
const STRONG_ATTACK_VALUE = 17;
const MONSTER_ATTACK_VALUE = 14;
const HEAL_VALUE = 20;
const MODE_ATTACK = 'ATTACK';
const MODE_STRONG_ATTACK = 'STRONG_ATTACK';
const LOG_EVENT_PLAYER_ATTACK = 'PLAYER_ATTACK';
const LOG_EVENT_PLAYER_STRONG_ATTACK = 'STRONG_ATTACK';
const LOG_EVENT_MONSTER_ATTACK = 'MONSTER_ATTACK';
const LOG_EVENT_PLAYER_HEAL = 'PLAYER_HEAL';
const LOG_EVENT_GAME_OVER = 'GAME_OVER';

function getMaxLifeValues() {
  let enteredValue = prompt(
    'Please enter the health for the monster and the player',
    '100'
  );
  const parseValue = parseInt(enteredValue);
  if (isNaN(parseValue) || parseValue <= 0) {
    throw { message: 'Invalid user input, either not a number or the health was set lass than 1!' };
  }
    return parseValue;
}
let chosenMaxLife;

try {
  chosenMaxLife = getMaxLifeValues();
} catch (error) {
  console.log(error);
  chosenMaxLife = 100;
  alert("Invalid input, health has been set to defaul(100 health)");
}

// Delcaring an array that will store the log as well as the starting health
let battleLog = [];
let currentMonsterHealth = chosenMaxLife;
let currentPlayerHealth = chosenMaxLife;
let hasBonusLife = true;
let lastLoggedEntry;

// This sets the initial health for both the player and monster based on user input
adjustHealthBars(chosenMaxLife);

// This will take a log entry and populate the array log
function writeToLog(event, value, monsterHealth, playerHealth) {
  let logEntry;
  logEntry = {
    event: event,
    value: value,
    finalMonsterHealth: monsterHealth,
    finalPlayerHealth: playerHealth,
  };
  battleLog.push(logEntry);
}

// Once game is over this gets called and resets health
function reset() {
  currentMonsterHealth = chosenMaxLife;
  currentPlayerHealth = chosenMaxLife;
  resetGame(chosenMaxLife);
}

// For every move a player makes this gets called, the monster attacks
function endRound() {
  // This is used to store the health when a player uses bonus life
  const savingPlayerHealth = currentPlayerHealth;
  const playerDamage = dealPlayerDamage(MONSTER_ATTACK_VALUE);
  currentPlayerHealth -= playerDamage;
  writeToLog(
    LOG_EVENT_MONSTER_ATTACK,
    playerDamage,
    currentMonsterHealth,
    currentPlayerHealth
  );

  // One bonus life that the user can use once he is almost dead
  if (currentPlayerHealth <= 0 && hasBonusLife) {
    hasBonusLife = false;
    removeBonusLife();
    currentPlayerHealth = savingPlayerHealth;
    setPlayerHealth(currentPlayerHealth);
    alert('You would be dead but the the bonus life saved you!');
  }

  // Three possible outcomes that can happen in the game, we write each to log
  if (currentMonsterHealth <= 0 && currentPlayerHealth > 0) {
    alert('You won!');
    writeToLog(
      LOG_EVENT_GAME_OVER,
      'PLAYER WON',
      currentMonsterHealth,
      currentPlayerHealth
    );
  } else if (currentPlayerHealth <= 0 && currentMonsterHealth > 0) {
    alert('You Lost! The monster beat you!');
    writeToLog(
      LOG_EVENT_GAME_OVER,
      'MONSTER WON',
      currentMonsterHealth,
      currentPlayerHealth
    );
  } else if (currentMonsterHealth <= 0 && currentPlayerHealth <= 0) {
    alert('You have a draw!');
    writeToLog(
      LOG_EVENT_GAME_OVER,
      'A DRAW',
      currentMonsterHealth,
      currentPlayerHealth
    );
  }

  // Once one of them has 0 or less health the game gets reset
  if (currentMonsterHealth <= 0 || currentPlayerHealth <= 0) {
    reset();
  }
}

// Player attacking the monster, has 2 different modes
function attackMonster(attackMode) {
  let maxDamage =
    attackMode === MODE_ATTACK ? ATTACK_VALUE : STRONG_ATTACK_VALUE;
  let logEvent =
    attackMode === MODE_ATTACK
      ? LOG_EVENT_PLAYER_ATTACK
      : LOG_EVENT_PLAYER_STRONG_ATTACK;
  // if(attackMode === MODE_ATTACK){
  //     maxDamage = ATTACK_VALUE;
  //     logEvent = LOG_EVENT_PLAYER_ATTACK;
  // }else{
  //     maxDamage = STRONG_ATTACK_VALUE;
  //     logEvent = LOG_EVENT_PLAYER_STRONG_ATTACK;
  // }
  const damage = dealMonsterDamage(maxDamage);
  currentMonsterHealth -= damage;
  writeToLog(logEvent, damage, currentMonsterHealth, currentPlayerHealth);
  endRound();
}

// Used when a player presses the heal button
function healPlayerHandler() {
  let healValue;

  // A player cant heal if its the start of the game and he has full health
  if (currentPlayerHealth === chosenMaxLife) {
    alert('You cant heal');
    return;
  }

  // The prompt is called if heal + player current health will be more than the set health
  if (HEAL_VALUE + currentPlayerHealth > chosenMaxLife) {
    alert(
      `You were healed to ${chosenMaxLife} and now the moster will attack you again`
    );
    healValue = chosenMaxLife - currentPlayerHealth;
  } else {
    healValue = HEAL_VALUE;
  }
  currentPlayerHealth += healValue;
  writeToLog(
    LOG_EVENT_PLAYER_HEAL,
    healValue,
    currentMonsterHealth,
    currentPlayerHealth
  );
  increasePlayerHealth(healValue);
  endRound();
}

// Just a handler for when I inspect the log
// Note this will print one battle log at a time
function printLogHandler() {
  // Note: because 'i' gets intialized to 0 everytime we have to loop through the whole array
  // from the beggining, if the lastLoggedEntry is equal to or bigger than 'i', that means
  // those entries were already printed.
  let i = 0;
  for (const logEntry of battleLog) {
    // This statement ensures that the already printed logs wont be printed using (lastLoggedEntry < i)
    if ((!lastLoggedEntry && lastLoggedEntry !== 0) || lastLoggedEntry < i) {
      console.log(`Battle log:  #${i + 1}`);
      for (const key in logEntry) {
        if (isNaN(logEntry[key])) {
          console.log(`${key}: ===========> ${logEntry[key]}`);
        } else console.log(`${key}: ===========> ${logEntry[key].toFixed(2)}`);
      }
      // Once we print out the current log we sync it up with the i and exit the loop
      lastLoggedEntry = i;
      break;
    }
    // This will loop through the array and increment the the i until it becomes greater than the
    // lastLoggedEntry entry, which after will enter the if statement and print out the log and then
    // break, repeating the same steps over and over again.
    i++;
  }
}

// 3 event callers
healBtn.addEventListener('click', healPlayerHandler);
attackBtn.addEventListener('click', function () {
  attackMonster(MODE_ATTACK);
});
strongAttackBtn.addEventListener('click', function () {
  attackMonster(MODE_STRONG_ATTACK);
});
logBtn.addEventListener('click', printLogHandler);
