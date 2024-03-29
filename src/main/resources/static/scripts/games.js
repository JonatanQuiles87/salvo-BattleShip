import {showPlayerUsername} from "./utilities/helpers.js";
import {login, signup, logout} from "./utilities/authorization.js";
import {
    createNewGameRequest,
    getGamesList,
    joinGameRequest,
    getLoggedInPlayerUsername
} from "./utilities/requestsToApi.js";

const leaderboard = document.querySelector('#leaderboard');
const gamesList = document.getElementById("games-list");
const loggedInPlayerUsernameArea = document.getElementById("logged-in-player");
const loginBtn = document.querySelector('#login-btn');
const logoutBtn = document.querySelector('#logout-btn');
const signupBtn = document.querySelector('#signup-btn');
const createGameBtn = document.querySelector('#create-game');
const loginForm = document.querySelector('#login-form');
const warningToLogin = document.querySelector('#warning-to-login');
const infoAboutGames = document.querySelector('#info-about-games');
let fetchedGamesList = await getGamesList(); //top level await
const loggedInPlayerUsername = await getLoggedInPlayerUsername();
let highestGameIdAdded = 0;
let previouslySavedPlayerList = [];

loginBtn.addEventListener('click', evt => login(evt));
signupBtn.addEventListener('click', evt => signup(evt)); // Normally we do not need evt parameter for signup since we are sending the json file to our endpoint but we are also logging in after signing up automatically. This is why we use evt parameter.
createGameBtn.addEventListener('click', () => createNewGameRequest());

if (loggedInPlayerUsername) {
    showPlayerUsername(loggedInPlayerUsername, loggedInPlayerUsernameArea);
    loginForm.remove();
    warningToLogin.remove();
    infoAboutGames.setAttribute('style', 'visibility: visible');
    loggedInPlayerUsernameArea.setAttribute('style', 'visibility: visible');
    logoutBtn.setAttribute('style', 'visibility: visible');
    logoutBtn.addEventListener('click', logout);
    createGameBtn.removeAttribute('disabled');
}

briefGameInfo(fetchedGamesList).forEach(createGamesListTable);
scoresOfPlayers(fetchedGamesList).forEach(createLeaderboardTable);

async function updateGamesList() {
    fetchedGamesList = await getGamesList();
    briefGameInfo(fetchedGamesList).forEach(createGamesListTable);
    scoresOfPlayers(fetchedGamesList).forEach(createLeaderboardTable);
}

setInterval(updateGamesList, 5000);

function briefGameInfo(games) {
    // Only downside of this function (together with createGamesListTable) is that we do not update the games table
    // in case a new player joined to an existing game unless the page is refreshed. This is because when a game is created
    // and there is no second player, the table row is already added. We need to add some code to be able to update the table row cell
    // in case the second player is joined.
    const newGames = games
        .filter(game => game['gameId'] > highestGameIdAdded);
    const previouslySavedGamesNumber = games.length - newGames.length;
    let newGamesInfoList = [];
    if (newGames.length > 0) {
        newGames.reduce((briefGameInfoList, game, index) => {
            const date = new Date(game['created']);
            const formattedDate = date.toLocaleString();
            const briefGameInfo = {
                'no': previouslySavedGamesNumber + index + 1,
                'created-time': formattedDate,
                'first-player': game['gamePlayers'][0]['player']['username'],
                'second-player': game['gamePlayers'][1]?.['player']?.['username'] || '', // If there is a game, there must be created time and first player who is the creator but second player might not exist.
                'game-id': game['gameId']
            }
            briefGameInfoList.push(briefGameInfo);
            return briefGameInfoList;
        }, newGamesInfoList);
        highestGameIdAdded = Math.max(...newGames.map(newGame => newGame['gameId']));
    }
    return newGamesInfoList;
}

function scoresOfPlayers(games) {
    const uniquePlayerNamesFromGamesJson = createPlayerListFromGamesJson(games);
    const newPlayerList = uniquePlayerNamesFromGamesJson.filter(player => !previouslySavedPlayerList.includes(player));
    let newPlayersScoreboardList = [];

    if (newPlayerList.length > 0) {
        newPlayerList.reduce((scoresOfPlayers, player, index) => {
            const playerResult = {
                'no': previouslySavedPlayerList.length + index + 1,
                'name': player,
                'total': getTotalScoreOfPlayer(player, games),
                'won': getTotalWinCountOfPlayer(player, games),
                'lost': getTotalLossCountOfPlayer(player, games),
                'tied': getTotalTieCountOfPlayer(player, games)
            }
            scoresOfPlayers.push(playerResult);
            return scoresOfPlayers;
        }, newPlayersScoreboardList).sort((firstPlayer, secondPlayer) => secondPlayer['total'] - firstPlayer['total']);
        previouslySavedPlayerList.push(...newPlayerList);
    }
    return newPlayersScoreboardList;
}

function createGamesListTable(briefGameInfo) {
    createTable(briefGameInfo, gamesList);
}

function createLeaderboardTable(player) {
    createTable(player, leaderboard);
}

function createTable(data, tableName) {
    const tableRow = document.createElement('tr');

    Object.keys(data).forEach(key => {
        const tableCell = document.createElement('td');
        const tableCellText = document.createTextNode(data[key]);
        tableCell.appendChild(tableCellText);
        tableRow.appendChild(tableCell);
    });

    if (tableName === gamesList) {
        createViewButton(tableRow, data);
        createJoinButton(tableRow, data);
    }
    tableName.appendChild(tableRow);
}

function createViewButton(tableRow, gameData) {
    const firstPlayer = gameData['first-player'];
    const secondPlayer = gameData['second-player'];
    const gameId = gameData['game-id'];
    const buttonCell = document.createElement('td');
    const button = createButtonBasics('View');
    buttonCell.appendChild(button);
    tableRow.appendChild(buttonCell);
    button.disabled = !loggedInPlayerUsername || ![firstPlayer, secondPlayer].includes(loggedInPlayerUsername);
    button.addEventListener('click', () => viewTheGame(gameId));
}

function createJoinButton(tableRow, gameData) {
    const firstPlayer = gameData['first-player'];
    const secondPlayer = gameData['second-player'];
    const gameId = gameData['game-id'];
    const buttonCell = document.createElement('td');
    const button = createButtonBasics('Join');
    buttonCell.appendChild(button);
    tableRow.appendChild(buttonCell);
    button.disabled = !loggedInPlayerUsername || !!secondPlayer || firstPlayer === loggedInPlayerUsername;
    button.addEventListener('click', () => joinTheGame(gameId));
}

function createButtonBasics(buttonText) {
    const button = document.createElement('button');
    button.classList.add('btn');
    button.classList.add('btn-primary');
    button.textContent = buttonText;
    return button;
}

function viewTheGame(gameId) {
    const gameClickedToView = fetchedGamesList.find(game => game['gameId'] === gameId);
    const gamePlayerOfLoggedInUser = gameClickedToView['gamePlayers']
        .find(gamePlayer => gamePlayer['player']['username'] === loggedInPlayerUsername);
    const gamePlayerId = gamePlayerOfLoggedInUser['id'];
    window.location.href = `/web/game.html?gp=${gamePlayerId}`;
}

async function joinTheGame(gameId) {
    try {
        const response = await joinGameRequest(gameId);
        if (response.status === 201) {
            const responseJSON = await response.json();
            alert('You have joined the game!');
            window.location.href = `/web/game.html?gp=${responseJSON['gpid']}`;
        } else {
            throw new Error('You couldn\'t join the game. Try again later.');
        }
    } catch (error) {
        alert(error.message);
    }
}

function createPlayerListFromGamesJson(games) {
    return games.reduce((playerList, {gamePlayers}) => {
        gamePlayers.forEach(({player}) => {
            if (!playerList.includes(player['username'])) {
                playerList.push(player['username']);
            }
        });
        return playerList;
    }, []);
}

function getTotalScoreOfPlayer(playerUsername, games) {
    return games.reduce((totalScore, {gamePlayers}) => {
        gamePlayers.forEach(gamePlayer => {
            if (gamePlayer['player']['username'] === playerUsername) {
                totalScore += gamePlayer['score'];
            }
        })
        return totalScore;
    }, 0);
}

function getTotalWinCountOfPlayer(playerUsername, games) {
    return resultCounter(playerUsername, games, 'win');
}

function getTotalTieCountOfPlayer(playerUsername, games) {
    return resultCounter(playerUsername, games, 'tie');
}

function getTotalLossCountOfPlayer(playerUsername, games) {
    return resultCounter(playerUsername, games, 'loss');
}

function resultCounter(playerUsername, games, resultType) {
    const score = resultType === 'win' ? 1.0 : resultType === 'tie' ? 0.5 : 0.0;
    return games.reduce((counter, {gamePlayers}) => {
        gamePlayers.forEach(gamePlayer => {
            if (gamePlayer['player']['username'] === playerUsername && gamePlayer['score'] === score) {
                counter += 1;
            }
        });
        return counter;
    }, 0);
}