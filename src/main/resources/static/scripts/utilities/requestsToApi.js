import {domainUrl} from "./constants.js";

const fetchJson = url =>
    fetch(domainUrl + url).then(response => {
        if (response.ok) {
            return response.json();
        } else if (response.status === 401) {
            alert('You are not authorized to see the game details!');
            window.location.href = '/web/games.html';
        } else {
            throw new Error('error: ' + response.statusText);
        }
    });

export async function getGamesList() {
    const gamesObject = await fetchJson('/api/games');
    return gamesObject['games'];
}

export async function getLoggedInPlayerUsername() {
    const gamesObject = await fetchJson('/api/games');
    return gamesObject['player']['username'];
}

export async function fetchGameViewObject(gamePlayerId) {
    return await fetchJson(`/api/game_view/${gamePlayerId}`);
}

export function joinGameRequest(gameId) {
    return fetch(`/api/game/${gameId}/players`, {
        method: 'POST'
    });
}

export function createNewGameRequest() {
    fetch('/api/games', {
        method: 'POST'
    }).then(response => {
        if (response.status === 201) {
            return response.json();
        } else {
            throw new Error('Game couldn\'t be created! Try again later.');
        }
    }).then(responseJSON => {
        alert('New game is successfully added.');
        window.location.href = `/web/game.html?gp=${responseJSON['gpid']}`;
    }).catch(error => alert(error.message));
}

export async function getShips(gamePlayerId) {
    const shipsWrapperObject = await fetchJson(`/api/games/players/${gamePlayerId}/ships`);
    return shipsWrapperObject['ships'];
}

export function sendShips(requestBody, gamePlayerId) {

    fetch(`/api/games/players/${gamePlayerId}/ships`, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    }).then((response) => {
        if(response.ok && response.status === 201) {
            alert('Ships have been saved');
            history.go(0);
        } else {
            return response.json().then(error => {
                throw new Error(error.message);
            });
        }
    }).catch(error => alert(error.message));
}

export async function getSalvoes(gamePlayerId) {
    return await fetchJson(`/api/games/players/${gamePlayerId}/salvoes`);
}

export async function sendSalvoes(requestBody, gamePlayerId){
    const response = await fetch(`/api/games/players/${gamePlayerId}/salvoes`, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    });
    if (response.ok && response.status === 201) {
        alert('Salvoes have been fired');
    } else {
        const error = await response.json();
        throw new Error(error.message);
    }
}