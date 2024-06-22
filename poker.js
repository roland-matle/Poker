const newGameButton = document.querySelector(".js-new-game-button");
const playerCardsContainer = document.querySelector(".js-player-cards-container");
const chipCountContainer = document.querySelector(".js-chip-count-container");
const potContainer = document.querySelector(".js-pot-container");
const betArea = document.querySelector(".js-bet-area");
const betSlider = document.querySelector("#bet-amount");
const betSliderValue = document.querySelector(".js-slider-value")


// program state
let {
    deckID,
    playerCards,
    playerChips,    // játékos zsetonjai
    computerChips,  // gép zsetonjai
    pot             // kassza
} = getInitialState();

function getInitialState() {
    return {
        deckID: null,
        playerCards: [],
        playerChips: 100,
        computerChips: 100,
        pot: 0,
    }
}

function initialize() {
    ({ deckID, playerCards, playerChips, computerChips, pot } = getInitialState ());
}

function canBet() {
    return playerCards.length === 2 && playerChips > 0 && pot === 0;
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

function startGame() {
    fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1")
        .then(data => data.json())
        .then(function(response) {
            deckID = response.deck_id;
            drawAndRenderPlayerCards(); // TODO: refactorálás async-await segítségével
            console.log(response)
        });
}


newGameButton.addEventListener("click", startGame);
betSlider.addEventListener("change", render);
initialize();
render();