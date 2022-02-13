// Configurações iniciais ----------------------------------------
const divLogin = document.querySelector(".login");
divLogin.classList.remove("hidden");
const sidebar = document.querySelector("aside");
sidebar.classList.add("hidden");

// Variáveis Globais ---------------------------------------------
let userName;
let activeDestination;
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
    
    document.querySelector(".login>input").classList.add("hidden");
    document.querySelector(".login>button").classList.add("hidden");
    document.querySelector(".login div img").classList.remove("hidden");
    document.querySelector(".login div span").classList.remove("hidden");
}

function successfulLogin() {
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
    promise.then(() => { /*console.log("Ainda na sala!")*/ });
    promise.catch(() => { window.location.reload() });
}

// Função para recarregar as mensagens
function loadMessages() {
    let promise = axios.get(
        "https://mock-api.driven.com.br/api/v4/uol/messages"
    );
    promise.then((response) => { displayMessages(response.data) });
    promise.catch((error) => {/*console.log("Não carregou as mensagens. Erro: " + error.response.status)*/});
}

// Função para carregar as mensagens no chat
function displayMessages(messages) {
    document.querySelector("main").innerHTML = '';
    mainChat = document.querySelector("main");
    for (let i = 0; i < messages.length; i++) {
        if (messages[i].type == 'status') {
            statusMessage(messages[i], mainChat);
        } else if (messages[i].type === 'message') {
            textMessage(messages[i], mainChat);
        } else if (messages[i].type === 'private_message' && (messages[i].from === userName || messages[i].to === userName)) {
            privateMessage(messages[i], mainChat);
        }
        let message = document.querySelector("main .message:last-child");
        message.scrollIntoView();
    }
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
    const toUser = document.querySelector("aside .contacts .selected span").innerHTML;
    const message = document.querySelector("footer input").value;
    const visibility = document.querySelector("aside .visibility .selected span").innerHTML;

    if (visibility === 'Reservadamente') {
        var type = "private_message"
    } else {
        var type = "message"
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
    promise.then(() => { /*console.log("Enviou a mensagem!")*/ });
    promise.catch((error) => { /*console.log("Erro no envio! Erro: " + error.response.status)*/ });
    document.querySelector("footer input").value = "";
}

// Função para carregar os participantes online
function loadOnlineContacts() {
    let promise = axios.get(
        "https://mock-api.driven.com.br/api/v4/uol/participants"
    );
    promise.then((response) => { displayContacts(response.data) });
    promise.catch((error) => { /*console.log("Não carregou os contatos. Erro: " + error.response.status)*/ });
}

function displayContacts(dataContacts) {
    let divContacts = document.querySelector("aside .contacts");
    let contacts = document.querySelectorAll("aside .contact");
    let itWasInTheNewList = false;
    
    activeDestination = checkWhoIsSelected(contacts)
    
    divContacts.innerHTML = `
    <div class="contact all" onclick="selectContact(this)">
        <figure><img src="media/people.svg" alt="Todos"></figure>
            <div class="checked-style">
                <span>Todos</span>
                <img class="hidden" src="media/check.svg" alt="Selected">
        </div>
    </div>
    `
    for (let i = 0; i < dataContacts.length; i++) {
        divContacts.innerHTML += `
        <div class="contact person" onclick="selectContact(this)" data-identifier="participant">
            <figure><img src="media/person.svg" alt="${dataContacts[i].name}"></figure>
                <div class="checked-style">
                    <span>${dataContacts[i].name}</span>
                    <img class="hidden" src="media/check.svg" alt="Selected">
            </div>
        </div>
        `
        if (activeDestination === dataContacts[i].name) {
            divContacts.querySelector(".contact:last-child").classList.add("selected");
            divContacts.querySelector(".contact:last-child .checked-style img").classList.remove("hidden");
            itWasInTheNewList = true;
        }
    }
    if (typeof activeDestination === "undefined" || activeDestination === "Todos") {
        document.querySelector("aside .all").classList.add("selected");
        document.querySelector("aside .all .checked-style img").classList.remove("hidden");
    }
}

function checkWhoIsSelected(contacts) {
    let selectedUser;
    contacts.forEach((contact) => {
        if (contact.classList.contains("selected")) {
            selectedUser = contact.querySelector("span").innerHTML;
        }
    })
    return selectedUser;
}

function selectContact(nowSelected) {
    const previouslySelected = nowSelected.parentNode.querySelector(".selected");
    previouslySelected.querySelector(".checked-style img").classList.add("hidden");
    previouslySelected.classList.remove("selected");
    nowSelected.classList.add("selected");
    nowSelected.querySelector(".checked-style img").classList.remove("hidden");
    const toUser = nowSelected.querySelector("span").innerHTML;
    document.querySelector("footer .private").innerHTML = `Enviando para ${toUser} (reservadamente)`;
}

function selectVisibility(nowSelected) {
    const previouslySelected = nowSelected.parentNode.querySelector(".selected");
    previouslySelected.querySelector(".checked-style img").classList.add("hidden");
    previouslySelected.classList.remove("selected");
    nowSelected.classList.add("selected");
    nowSelected.querySelector(".checked-style img").classList.remove("hidden");

    if (nowSelected.querySelector("span").innerHTML === 'Reservadamente') {
        document.querySelector("footer .private").classList.remove("hidden")
    } else {
        document.querySelector("footer .private").classList.add("hidden")
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