// Configurações iniciais ----------------------------------------
const divLogin = document.querySelector(".login");
divLogin.classList.remove("hidden");
const sidebar = document.querySelector("aside");
sidebar.classList.add("hidden");

// Variáveis Globais ---------------------------------------------
let userName;
let mainChat;

// Chamando as funções -------------------------------------------
const input = document.querySelector(".login input");
input.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        document.querySelector(".login button").click();
    }
});


// FUNÇÕES -------------------------------------------------------

//Função de login
function login() {
    userName = document.querySelector(".login input").value;

    let promise = axios.post(
        "https://mock-api.driven.com.br/api/v4/uol/participants",
        { name: userName }
    );
    promise.then(successfulLogin);
    promise.catch(failedLogin);
    // Colocar aqui uma função que coloca o LOADING
}

function successfulLogin() {
    console.log("Login com sucesso!");
    const divLogin = document.querySelector(".login");
    divLogin.classList.add("hidden");
    setInterval(checkUserStatus, 5000);
    setInterval(loadMessages, 3000);
}

function failedLogin(error) {
    if (parseInt(error.response.status) === 400) {
        alert("\nEsse nome já existe. Escolha outro.");
    } else {
        alert("Erro " + error.response.status);
    }
}

//Função para checar status do usuário
function checkUserStatus() {
    let promise = axios.post(
        "https://mock-api.driven.com.br/api/v4/uol/status",
        { name: userName }
    );
    promise.then(stillInTheRoom);
    promise.catch(outTheRoom);
}

function stillInTheRoom() {
    console.log("Ainda na sala!");
}

function outTheRoom(error) {
    console.log("Saiu da sala!");
}

// Função para recarregar as mensagens a cada 3 segundos
function loadMessages() {
    let promise = axios.get(
        "https://mock-api.driven.com.br/api/v4/uol/messages"
    );
    promise.then(loadingMessages);
    promise.catch(errorLoadingMessages);
}

function loadingMessages(response) {
    console.log("Mensagens carregadas :)");
    // console.log(response.data);
    displayMessages(response.data);
}

function errorLoadingMessages(error) {
    console.log("Não carregou as mensagens :(");
}

// Função para carregar as mensagens no chat
function displayMessages(messages) {
    console.log("entrei na displayMessages")
    mainChat = document.querySelector("main");
    console.log("carreguei o mainChat")
    for (let i=0; i < messages.lenght; i++) {
        console.log(messages[i]);
        if (messages[i].type == 'status') {
            statusMessage(messages[i], mainChat);
        } else if (messages[i].type === 'message') {
            textMessage(messages[i], mainChat);
        } else if (messages[i].type === 'private_message' && (messages[i].from === userName || messages[i].to === userName)) {
            privateMessage(messages[i], mainChat);
        }
    } // PAREI AQUI !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!11
}

function statusMessage(message) {
    mainChat.innerHTML += `
        <div class="in-out">
            <span class="time">(${message.time})</span>
            <span class="from-to"><span class="username">${message.from}</span></span>
            <span class="text" data-identifier="message">${message.text}</span>
        </div>
    `
}

function textMessage(message) {
    mainChat.innerHTML += `
        <div class="message">
            <span class="time">(${message.time})</span>
            <span class="from-to"><span class="username">${message.from}</span> para <span class="username">${message.to}</span>:</span>
            <span class="text" data-identifier="message">${message.text}</span>
        </div>
    `
}

function privateMessage(message) {
    mainChat.innerHTML += `
        <div class="private message">
            <span class="time">(${message.time})</span>
            <span class="from-to"><span class="username">${message.from}</span> reservadamente para <span class="username">${message.to}</span>:</span>
            <span class="text" data-identifier="message">${message.text}</span>
        </div>
    `
}


// Funções para navegar no chat
function closeSidebar(button) {
    const sidebar = button.parentNode;
    sidebar.classList.add("hidden");
}

function openSidebar() {
    const sidebar = document.querySelector("aside");
    sidebar.classList.remove("hidden");
}