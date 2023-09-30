// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBf3IAznhveYZIGKMAKxO3ghaRfPdxS_UI",
  authDomain: "triple-carrier-369922.firebaseapp.com",
  databaseURL: "https://triple-carrier-369922-default-rtdb.firebaseio.com",
  projectId: "triple-carrier-369922",
  storageBucket: "triple-carrier-369922.appspot.com",
  messagingSenderId: "889455071435",
  appId: "1:889455071435:web:5fbbdf82c51bacc0714b4e",
  measurementId: "G-T08TRTHB4C"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
firebase.auth().signInAnonymously()
  .then(() => {
    console.log('Signed in anonymously');
  })
  .catch((error) => {
    console.error('Error signing in anonymously:', error);
  });


let timeElapsed = 0;
let stopwatchInterval;
let score = 0;
let compoundRow;
let pKaRow;

const timerElement = document.getElementById('timer');
const scoreElement = document.getElementById('score');
const startGameButton = document.getElementById('startGameBtn');

// Initially hide the timer, score, and game board
timerElement.style.display = 'none';
scoreElement.style.display = 'none';

// Attach the event listener to the existing button in HTML
startGameButton.addEventListener('click', startGame);

// compound data
const compounds = [
  { name: 'Sulfuric acid', pKa: -9 },
  { name: 'Hydrochloric acid', pKa: -7 },
  { name: 'Hydronium ion', pKa: -2 },
  { name: 'Carboxylic acids', pKa: 5 },
  { name: 'Alcohol Water', pKa: 16 },
  { name: 'Ammonium ion', pKa: 9 },
  { name: 'Protonated amines', pKa: 11 },
  { name: 'Thiol', pKa: 10 },
  { name: 'Amine', pKa: 33 },
  { name: 'Alkane', pKa: 50 },
  { name: 'Alkene', pKa: 44 },
  { name: 'Alkyne', pKa: 25 },
  { name: 'Amide', pKa: 15 },
  { name: 'Diisopropylamine', pKa: 37 },
  { name: 'Beta-Diketone', pKa: 10 },
  { name: 'Beta-Ketoester', pKa: 12 },
  { name: 'Malonate Ester', pKa: 14 },
  { name: 'Phenol', pKa: 9 },
  { name: 'Protonated Carbonyl Group', pKa: -5 },
  { name: 'Ketone', pKa: 20 },
  { name: 'Ester', pKa: 25 }
];

const shuffledCompounds = compounds.sort(() => Math.random() - 0.5);

function createGameBoard() {
  let gameBoard = document.getElementById('gameBoard');
  if (!gameBoard) {
    gameBoard = document.createElement('div');
    gameBoard.id = 'gameBoard';
    document.body.appendChild(gameBoard);  // Append to the body or another container
  } else {
    // Clear existing child elements from the game board
    gameBoard.innerHTML = '';
  }
  gameBoard.style.width = '90%';
  gameBoard.style.height = '70%';

  compoundRow = document.createElement('div');
  compoundRow.id = 'compoundRow';
  pKaRow = document.createElement('div');
  pKaRow.id = 'pKaRow';

  compoundRow.addEventListener('dragenter', (e) => {
    e.preventDefault();
    const target = e.target.closest('div');
    target.classList.add('drag-over');
  });
  
  compoundRow.addEventListener('dragleave', (e) => {
    e.preventDefault();
    const target = e.target.closest('div');
    target.classList.remove('drag-over');
  });

  shuffledCompounds.forEach((compound, index) => {
    const compoundDiv = document.createElement('div');
    compoundDiv.id = `compound-${index}`;
    compoundDiv.innerHTML = `<img src='${compound.name}.png'>`;
    compoundDiv.draggable = true;
    compoundDiv.className = 'draggable';
    compoundRow.appendChild(compoundDiv);
  });

  const sortedCompounds = [...compounds].sort((a, b) => a.pKa - b.pKa);
  sortedCompounds.forEach((compound, index) => {
    const pKaDiv = document.createElement('div');
    pKaDiv.id = `pKa-${index}`;
    pKaDiv.innerHTML = `<span style='color:black;'>${compound.pKa}</span>`;
    pKaRow.appendChild(pKaDiv);
  });

  gameBoard.appendChild(compoundRow);
  gameBoard.appendChild(pKaRow);
}

function startGame() {
  startGameButton.textContent = 'Stop Game';
  startGameButton.removeEventListener('click', startGame);
  startGameButton.addEventListener('click', stopGame);

  document.getElementById('pdfDisplay').style.display = 'none';
  
  // Create the game board dynamically
  createGameBoard();

  const gameBoard = document.getElementById('gameBoard');
  if (!gameBoard) {
    console.error("gameBoard is undefined");
    return;
  }

  gameBoard.style.display = 'block';

  timerElement.style.display = 'block';
  scoreElement.style.display = 'block';

  stopwatchInterval = setInterval(() => {
    timeElapsed++;
    timerElement.textContent = `Time Taken: ${timeElapsed}`;
  }, 1000);

  gameBoard.addEventListener('drop', (e) => {
    e.preventDefault();
    const target = e.target.closest('div');
    if (target) {
      target.classList.remove('drag-over');
    }
    if (draggedItem && target && target.id.startsWith('pKa-')) {
      const compoundIndex = parseInt(draggedItem.id.split('-')[1], 10);
      const correctPKa = shuffledCompounds[compoundIndex].pKa;
      const targetPKa = parseInt(target.textContent, 10);
  
      if (correctPKa === targetPKa) {
        compoundRow.removeChild(draggedItem);
        pKaRow.removeChild(target);
        score++;
        scoreElement.textContent = `Score: ${score}`;
      }
    }
    checkGameEnd();
  });

  gameBoard.addEventListener('dragstart', (e) => {
    draggedItem = e.target.closest('div');
  });
  
  gameBoard.addEventListener('dragover', (e) => {
    e.preventDefault();
    const target = e.target.closest('div');
    if (target && target !== draggedItem) {
      dragOverItem = target;
    }
  });


}


// Function to stop the game and reset to initial state
function stopGame() {
  startGameButton.textContent = 'Start Game';
  startGameButton.removeEventListener('click', stopGame);
  startGameButton.addEventListener('click', startGame);

  clearInterval(stopwatchInterval);
  timeElapsed = 0;
  score = 0;
  timerElement.textContent = 'Time taken: 0';
  scoreElement.textContent = 'Score: 0';

  document.getElementById('pdfDisplay').style.display = 'block';
  gameBoard.style.display = 'none';
  timerElement.style.display = 'none';
  scoreElement.style.display = 'none';
}

// Function to restart the game after it has finished
function restartGame() {
  stopGame();
  startGame();
}  

// Drag and Drop functionality
let draggedItem = null;
let dragOverItem = null;


function checkGameEnd() {
  console.log("Checking if game has ended...");
  if (compoundRow.childElementCount === 0) {
    console.log("Game has ended!");
    clearInterval(stopwatchInterval);

    startGameButton.textContent = 'Restart Game';
    startGameButton.removeEventListener('click', stopGame);
    startGameButton.addEventListener('click', restartGame);

    console.log("Fetching leaderboard...");  // Debug log
    database.ref('leaderboard').orderByChild('time').limitToLast(10).once('value').then((snapshot) => {
      const scores = snapshot.val();
      console.log("Leaderboard fetched:", scores);  // Debug log

      let isEligibleForLeaderboard = false;

      for (const id in scores) {
        if (timeElapsed < scores[id].time) {
          isEligibleForLeaderboard = true;
          break;
        }
      }

      if (isEligibleForLeaderboard) {
        console.log("You are eligible for the leaderboard!");  // Debug log
        const playerName = prompt("Congratulations! You made it to the leaderboard! What's your name?");
        database.ref('leaderboard').push({ name: playerName, time: timeElapsed });
        updateLeaderboard();
      }
    });
  }
}

function updateLeaderboard() {
  // Fetch the leaderboard data from Firebase
  database.ref('leaderboard').orderByChild('time').once('value').then((snapshot) => {
    const scores = snapshot.val();
    const scoreKeys = Object.keys(scores);

    // Check if there are more than 10 entries
    if (scoreKeys.length > 10) {
      // Remove the lowest scores so that only 10 remain
      const scoresToRemove = scoreKeys.slice(0, scoreKeys.length - 10); // Get the keys of the scores to remove

      scoresToRemove.forEach((key) => {
        database.ref('leaderboard/' + key).remove(); // Remove each score by its key
      });
    }
  });
}







// Update the leaderboard display
database.ref('leaderboard').orderByChild('time').limitToLast(10).on('value', (snapshot) => {
  const scores = snapshot.val();
  const scoreList = document.getElementById('scoreList');
  scoreList.innerHTML = '';

  // Convert the scores object to an array and sort it in ascending order
  const sortedScores = Object.keys(scores).map(id => scores[id]).sort((a, b) => a.time - b.time);

  sortedScores.forEach(score => {
    const li = document.createElement('li');
    li.innerHTML = `${score.name}: ${score.time}`;
    scoreList.appendChild(li);
  });
});


// Initially hide the game elements and show the PDF
document.getElementById('pdfDisplay').style.display = 'block';
