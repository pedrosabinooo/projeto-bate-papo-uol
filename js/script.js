let userName;

const input = document.querySelector(".login input");
input.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        document.querySelector(".login button").click();
    }
});

function login() {
    userName = document.querySelector(".login input").value;

    let promise = axios.post(
        "https://mock-api.driven.com.br/api/v4/uol/participants", 
        {name: userName}
    );
    promise.then(successfulLogin);
    promise.catch(failedLogin);
    // Colocar aqui uma função que coloca o LOADING
}

function successfulLogin() {
    console.log("Login com sucesso!");
    const divLogin = document.querySelector(".login");
    divLogin.classList.add("hidden");
}

function failedLogin(error) {
    if (parseInt(error.response.status) === 400) {
        alert("\nEsse nome já existe. Escolha outro.");
    } else {
        alert("Erro " + error.response.status);
    }
}