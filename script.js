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
//database.ref('leaderboard').push({ name: "Initial", time: 999 });


// Sample compound data
const compounds = [
  { name: 'Sulfuric acid', pKa: -9 },
  { name: 'Hydrochloric acid', pKa: -7 },
  // { name: 'Hydronium ion', pKa: 2 },
  // { name: 'Carboxylic acids', pKa: 5 },
  // { name: 'Ammonium ion', pKa: 9 },
  // { name: 'Protonated amines', pKa: 11 },
  // { name: 'Thiol', pKa: 10 },
  // { name: 'Amine', pKa: 33 },
  // { name: 'Alkane', pKa: 50 },
  // { name: 'Alkene', pKa: 44 },
  // { name: 'Alkyne', pKa: 25 },
  // { name: 'Amide', pKa: 15 },
  // { name: 'Diisopropylamine', pKa: 37 },
  // { name: 'Beta-Diketone', pKa: 10 },
  // { name: 'Beta-Ketoester', pKa: 12 },
  // { name: 'Malonate Ester', pKa: 14 },
  // { name: 'Phenol', pKa: 9 },
  // { name: 'Protonated Carbonyl Group', pKa: -5 },
  // { name: 'Ketone', pKa: 20 },
  // { name: 'Ester', pKa: 25 }
];

// Shuffle compounds for random placement
const shuffledCompounds = compounds.sort(() => Math.random() - 0.5);

// Create divs for compound and pKa rows
const compoundRow = document.createElement('div');
compoundRow.id = 'compoundRow';
const pKaRow = document.createElement('div');
pKaRow.id = 'pKaRow';

// Load compound images and pKa values
const gameBoard = document.getElementById('gameBoard');
const timerElement = document.getElementById('timer');
const scoreElement = document.getElementById('score');

let score = 0; // Initialize score

// Create compound divs
shuffledCompounds.forEach((compound, index) => {
  const compoundDiv = document.createElement('div');
  compoundDiv.id = `compound-${index}`;
  compoundDiv.innerHTML = `<img src='${compound.name}.png'>`;
  compoundDiv.draggable = true;
  compoundDiv.className = 'draggable'; // Added class for hover indicator
  compoundRow.appendChild(compoundDiv);
});

// Create pKa divs and sort them
const sortedCompounds = [...compounds].sort((a, b) => a.pKa - b.pKa);
sortedCompounds.forEach((compound, index) => {
  const pKaDiv = document.createElement('div');
  pKaDiv.id = `pKa-${index}`;
  pKaDiv.innerHTML = `<span>${compound.pKa}</span>`; // Wrapped pKa in a span for better drag and drop
  // pKaDiv.draggable = true;
  // pKaDiv.className = 'draggable'; // Added class for hover indicator
  pKaRow.appendChild(pKaDiv);
});
// Add rows to game board
gameBoard.appendChild(compoundRow);
gameBoard.appendChild(pKaRow);

// Improved Drag and Drop functionality
let draggedItem = null;
gameBoard.addEventListener('dragstart', (e) => {
  draggedItem = e.target.closest('div');
});
gameBoard.addEventListener('dragover', (e) => {
  e.preventDefault();
});

function checkGameEnd() {
  console.log("Checking if game has ended...");
  if (compoundRow.childElementCount === 0) {
    console.log("Game has ended!");
    clearInterval(stopwatchInterval);

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
      }
    });
  }
}


gameBoard.addEventListener('drop', (e) => {
  e.preventDefault();
  const target = e.target.closest('div');
  if (draggedItem && target && draggedItem.id.includes('compound')) {
    const compoundIndex = draggedItem.id.split('-')[1];
    const correctPKa = compounds[compoundIndex].pKa;
    const targetPKa = parseInt(target.textContent, 10); // Convert the text content to a number

    if (correctPKa === targetPKa) {
      try {
        compoundRow.removeChild(draggedItem);
        pKaRow.removeChild(target);
      } catch (error) {
        console.error('Failed to remove child:', error);
      }
      score++;
      scoreElement.textContent = `Score: ${score}`; // Update the score display
    }
  }
  checkGameEnd();
});

let timeElapsed = 0; // Time in seconds
let stopwatchInterval = setInterval(() => {
  timeElapsed++;
  timerElement.textContent = timeElapsed;
}, 1000);

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