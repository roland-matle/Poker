const newGameButton = document.querySelector(".js-new-game-button");
const playerCardsContainer = document.querySelector(".js-player-cards-container");
const chipCountContainer = document.querySelector(".js-chip-count-container");
const potContainer = document.querySelector(".js-pot-container");
const betArea = document.querySelector(".js-bet-area");
const betSlider = document.querySelector("#bet-amount");
const betSliderValue = document.querySelector(".js-slider-value")
const betButton = document.querySelector(".js-bet-button")


// program state
let {
    deckID,
    playerCards,        // játékos lapjai
    computerCards,      // számítógép lapjai (TODO: private? OOP???)
    playerChips,        // játékos zsetonjai
    computerChips,      // gép zsetonjai
    playerBetPlaced,    // játékos már licitált
    pot                 // kassza
} = getInitialState();

function getInitialState() {
    return {
        deckID: null,
        playerCards: [],
        playerChips: 100,
        computerChips: 100,
        playerBetPlaced: false,
        pot: 0,
    }
}

function initialize() {
    ({ 
        deckID,
        playerCards,
        playerChips,
        computerChips,
        playerBetPlaced,
        pot    
    } = getInitialState ());
}

function canBet() {
    return playerCards.length === 2 && playerChips > 0 && playerBetPlaced === false;
}

function renderSlider() {
    if (canBet()) {
        betArea.classList.remove("invisible");
        betSlider.setAttribute("max", playerChips);
        betSliderValue.innerText = betSlider.value;
    }else{
        betArea.classList.add("invisible");
    }

}


function renderPlayercards() {
    let html = "";

    for (let card of playerCards) {
        html += `<img src="${card.image}" alt="${card.code}"/>`;
    }

    playerCardsContainer.innerHTML = html;
}

function renderChips() {
    chipCountContainer.innerHTML = `
        <div class="chip-count">Player: ${playerChips}</div>
        <div class="chip-count">Computer: ${computerChips}</div>
    `;
}

function renderPot() {
    potContainer.innerHTML =`
        <div class="chip-count">Pot: ${pot}</div>
    `;
}

function render() {
    renderPlayercards();
    renderChips();
    renderPot();
    renderSlider();
}

function drawAndRenderPlayerCards() {
    if (deckID == null) return;
    fetch(`https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=2`)
        .then(data => data.json())
        .then(function(response) {
            console.log("Húzott lapok", response)
            playerCards = response.cards;
            render();
        });
}

function postBlinds() {
    playerChips -= 1;
    computerChips -= 2;
    pot += 3;
    render();
}

// Egy leosztást is indíthatunk
function startHand() { //hand = leosztás
    postBlinds(); // vaktétek adminisztrálása
    fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1")
    .then(data => data.json())
    .then(function(response) {
        deckID = response.deck_id;
        drawAndRenderPlayerCards(); // TODO: refactorálás async-await segítségével
        console.log(response)
    });
}

// Eg yjáték egy vagy több leosztásból áll
function startGame() {
    initialize();
    startHand();
}

function shouldComputerCall() {
    if (computerCards.length !== 2) return true;    // extra védelem
    const card1Code = computerCards[0].code;        // pl AC, 4H, 9C, 0H (10: 0)
    const card2Code = computerCards[1].code;
    const card1Value = card1Code[0];
    const card2Value = card2Code[0];
    const card1Suit = card1Code[1];
    const card2Suit = card1Code[1];

    return  card1Code === card2Code ||
            ["0", "J", "Q", "K", "A"].includes(card1Value) ||
            ["0", "J", "Q", "K", "A"].includes(card2Value) || 
            (
                card1Suit === card2Suit &&
                Math.abs(Number(card1Value) - Number(card2Value)) <= 2
            );
}

function computerMoveAfterBet() {
    fetch(`https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=2`)
    .then(data => data.json())
    .then(function(response) {
        computerCards = response.cards;
        alert(shouldComputerCall() ? "Call" : "Fold");
        console.log(computerCards);

        //render();
    });
}

function bet() {
    const betValue = Number(betSlider.value);
    //pothoz hozzáadjuk a bet méretét
    pot += betValue;
    //játékos zsetonjaiból kivonjuk a bet méretét
    playerChips -= betValue;
    // játék állapota: játékos megtette a tétjét
    playerBetPlaced = true;
    //render
    render();
    // ellenfél reakciója
    computerMoveAfterBet();
}

newGameButton.addEventListener("click", startGame);
betSlider.addEventListener("change", render);
betButton.addEventListener("click", bet)
initialize();
render();