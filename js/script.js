// Configurações iniciais ----------------------------------------
const divLogin = document.querySelector(".login");
divLogin.classList.remove("hidden");
const sidebar = document.querySelector("aside");
sidebar.classList.add("hidden");

// Variáveis Globais ---------------------------------------------
let userName;
let mainChat;

// Chamando as funções para enviar texto com Enter ---------------
const inputLogin = document.querySelector(".login input");
inputLogin.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        document.querySelector(".login button").click();
    }
});

const inputMessage = document.querySelector("footer input");
inputMessage.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        document.querySelector("footer button").click();
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
    // console.log("Login com sucesso!");
    const divLogin = document.querySelector(".login");
    divLogin.classList.add("hidden");
    setInterval(checkUserStatus, 5000);
    setInterval(loadMessages, 3000);
    setInterval(loadOnlineContacts, 10000);
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
    // console.log("Ainda na sala!");
}

function outTheRoom(error) {
    // console.log("Saiu da sala!");
    alert("Você saiu. Entre novamente com o seu nome.");
    window.location.reload();
}

// Função para recarregar as mensagens
function loadMessages() {
    let promise = axios.get(
        "https://mock-api.driven.com.br/api/v4/uol/messages"
    );
    promise.then(loadingMessages);
    promise.catch(errorLoadingMessages);
}

function loadingMessages(response) {
    // console.log("Mensagens carregadas :)");
    // console.log(response.data);
    displayMessages(response.data);
}

function errorLoadingMessages(error) {
    console.log("Não carregou as mensagens. Erro: " + error.response.status);
}

// Função para carregar as mensagens no chat
function displayMessages(messages) {
    mainChat = document.querySelector("main");
    // console.log(messages)
    for (let i=0; i < messages.length; i++) {
        // console.log(messages[i]);
        // if (i==0 || messages[i].time > mainChat.querySelector(".message:last-child").value){
            if (messages[i].type == 'status') {
                statusMessage(messages[i], mainChat);
            } else if (messages[i].type === 'message') {
                textMessage(messages[i], mainChat);
            } else if (messages[i].type === 'private_message' && (messages[i].from === userName || messages[i].to === userName)) {
                privateMessage(messages[i], mainChat);
            }
            let message = document.querySelector("main .message:last-child");
            message.scrollIntoView();
        // }
    } // LEMBRAR DE TIRAR ESSES COMENTÁRIOS -------------------------------------------------------------------
}

function statusMessage(message) {
    mainChat.innerHTML += `
        <div class="in-out message">
            <span class="time">(${message.time})</span>
            <span class="from-to"><span class="username">${message.from}</span></span>
            <span class="text" data-identifier="message">${message.text}</span>
        </div>
    `
}

function textMessage(message) {
    mainChat.innerHTML += `
        <div class="public message">
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

// Funções para enviar as mensagens
function sendMessage() {
    const toUser = document.querySelector("aside .contacts .selected").innerHTML;
    const message = document.querySelector("footer input").value;
    const visibility = document.querySelector("aside .visibility .selected").innerHTML;
    
    if (visibility==='Público') {
        var type = "message"
    } else {
        var type = "private_message"
    }

    let promise = axios.post(
        "https://mock-api.driven.com.br/api/v4/uol/messages",
        {
            from: userName,
            to: toUser,
            text: message,
            type: type
        }
    );
    promise.then(messageSent);
    promise.catch(messageNotSent);
    document.querySelector("footer input").value = "";
}

function messageSent(response) {
    // console.log("Enviou a mensagem!");
    // console.log(response);
}

function messageNotSent(error) {
    console.log("Erro no envio! Erro: " + error.response.status);
}

// Função para carregar os participantes online
function loadOnlineContacts() {
    let promise = axios.get(
        "https://mock-api.driven.com.br/api/v4/uol/participants"
    );
    promise.then(loadingContacts);
    promise.catch(errorLoadingContacts);
}

function loadingContacts(response) {
    // console.log("Contatos carregados :)");
    console.log(response.data);
    displayContacts(response.data);
}

function errorLoadingContacts(error) {
    console.log("Não carregou os contatos. Erro: " + error.response.status);
}

function displayContacts(contacts) {
    let divContacts = document.querySelector("aside .contacts");
    divContacts.innerHTML += `
        <div class="contact all">
            <figure><img src="media/people.svg" alt="Todos"></figure>
            <div class="checked-style">
                <span class="selected">Todos</span>
                <img src="media/check.svg" alt="Selected">
            </div>
        </div>
    `
    for (let i=0;i<contacts.length;i++) {
        divContacts.innerHTML += `
            <div class="contact person" data-identifier="participant">
                <figure><img src="media/person.svg" alt="${contacts[i].name}"></figure>
                <div class="checked-style">
                    <span>${contacts[i].name}</span>
                    <img class="hidden" src="media/check.svg" alt="Selected">
                </div>
            </div>
        `
    }
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