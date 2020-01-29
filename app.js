const board = document.querySelector('#board');
const form = document.querySelector('#config-form');
const sizeInput = document.querySelector('input[type="range"]');
const score = document.querySelector('#score');
const remainingPairsDisplay = document.querySelector('#remaining-matches');
const bestScoreDisplay = document.querySelector('#best-score');
let totalPairs = 10;
//storage of possible card "front" values
//supports up to 52 pairs on board
const cardDisplayValues = 'ABCDEFGHIJKLMNOPQRSTUIVXYZabcdefghijklmnopqrstuvwxyz';
let cardMap;
let cards;
let card1;
let card2;
let totalMoves;
let remainingPairs;

//Initialize card board to set size
function init(totalPairs){
    board.innerHTML = '';
    totalMoves = 0;
    remainingPairs = totalPairs;
    updateRemainingPairs();
    updateScore();
    updateRecordDisplay();
    cardMap = [];
    for(let i=0;i<totalPairs;i++){
        for (let j=0;j<2;j++){
            cardMap.push(i);
            const newCard = document.createElement('div');
            newCard.classList.add('card');
            board.append(newCard);
        }
    }
    shuffleArray(cardMap);
    cards = document.querySelectorAll('.card');

    for(let i=0; i<cards.length; i++){
        cards[i].dataset.cardId = i;
        cards[i].dataset.matchId = cardMap[i]; 
    }

}

//Add card flipping logic to board
board.addEventListener('click', (e) => {
    //make sure user clicks on an unmatched card
    if(
        e.target.classList.contains('card') && 
        !e.target.classList.contains('correct')) {
        //check if user is picking first card to match
        if(!card1){
            card1 = e.target;
            showCard(card1);
            totalMoves++;
            updateScore();
        //make sure user does not match card to itself
        } else if(!(card1 === e.target)){
            card2 = e.target;
            showCard(card2);
            totalMoves++;
            updateScore();
            checkMatch();
        }
    }
})

//Allow user to specify board size
form.addEventListener('submit', (e) => {
    e.preventDefault();
    totalPairs = sizeInput.value;
    init(totalPairs);
})

//check if two chosen cards match
const checkMatch = () => {
    if (card1.dataset.matchId === card2.dataset.matchId){
        card1.classList.add('correct');
        card2.classList.add('correct');
        remainingPairs--;
        updateRemainingPairs();
        if(remainingPairs <= 0){
            enableVictory();
        }
    } else{
        hideCard(card1);
        hideCard(card2);
    }
    card1.classList.remove('in-progress');
    card2.classList.remove('in-progress');
    card1 = null;
    card2 = null;
    
}

//Fisher-Yates shuffling algorithm
function shuffleArray(array){
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

//Make "front" of card visible after "flipping"
const showCard = (card) => {
    card.classList.add('in-progress');
    card.innerText = cardDisplayValues[card.dataset.matchId];
}

//Flip card to its "back" after a set time
// occurs following an incorrect match
const hideCard = (card) => {
    const id = card.dataset.cardId;
    setTimeout(() => {
        cards[id].innerText = '';
    }, 1000)
}

//Update the display of total moves during game
const updateScore = () => {
    score.innerText = totalMoves;
}
//Update the display of the record of the 
// lowest total moves for given game size
const updateRecordDisplay = () => {
    if(localStorage.matches){
        const matches = JSON.parse(localStorage.matches);
        if(matches[totalPairs]){
            bestScoreDisplay.innerText = matches[totalPairs].bestScore;
        } else{
            bestScoreDisplay.innerText = '-';
        }
    } else{
        bestScoreDisplay.innerText = '-';
    }
}

//Update the display of the total remaining
// unmatched pairs on the board
const updateRemainingPairs = () => {
    remainingPairsDisplay.innerText = remainingPairs;
}

//Record user's score in browser localStorage.
//Only the fastest score will be recorded
const recordScore = () => {
    if(!localStorage.matches){
        const myMatch = {}
        myMatch[totalPairs] = {bestScore: totalMoves};
        localStorage.setItem("matches", JSON.stringify(myMatch));
    } else {
        const matches = JSON.parse(localStorage.matches);
        if(!matches[totalPairs]){
            matches[totalPairs] = {bestScore: totalMoves};
            localStorage.setItem("matches", JSON.stringify(matches));
        } else{
            const {bestScore} = matches[totalPairs];
            if (totalMoves < bestScore){
                matches[totalPairs] = {bestScore: totalMoves}
                localStorage.setItem("matches", JSON.stringify(matches));
            } 
        }
    }
}

//Indicate to the user that all matches
//have been successfully made
const enableVictory = () => {
    recordScore();
    updateRecordDisplay();
    for(let card of cards){
        card.innerHTML = '&#128526';
        setInterval(() => {
            const r = Math.floor(Math.random()*256);
            const g = Math.floor(Math.random()*256);
            const b = Math.floor(Math.random()*256);
            card.style.backgroundColor = `rgb(${r},${g},${b})`
        },1000);
    }
}

init(totalPairs);