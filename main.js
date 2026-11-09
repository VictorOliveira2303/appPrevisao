
// Chave da API OpenWeatherMap
// Gere uma nova chave após revogar a anterior.
const API_KEY = "4be034b9f68d3ccc6e2c84889944a292";

const campoCidade = document.querySelector(".input-cidade");
const botaoPesquisa = document.querySelector(".btn-pesquisa");

// Área destinada às mensagens
const mensagem = document.createElement("p");
mensagem.className = "mensagem";
mensagem.setAttribute("aria-live", "polite");

document.querySelector(".pesquisa").insertAdjacentElement(
    "afterend",
    mensagem
);

// Pesquisa as condições climáticas
async function Coletar() {
    const cidade = campoCidade.value.trim();

    if (!cidade) {
        mensagem.textContent = "Digite o nome de uma cidade.";
        campoCidade.focus();
        return;
    }

    botaoPesquisa.disabled = true;
    mensagem.textContent = "Buscando informações...";

    try {
        await Dados(cidade);
        mensagem.textContent = "";
    } catch (erro) {
        mensagem.textContent = erro.message;
    } finally {
        botaoPesquisa.disabled = false;
    }
}

// Consulta à API OpenWeatherMap
async function Dados(cidade) {
    const parametros = new URLSearchParams({
        q: cidade,
        appid: API_KEY,
        lang: "pt_br",
        units: "metric"
    });

    let resposta;

    try {
        resposta = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?${parametros}`
        );
    } catch {
        throw new Error(
            "Falha de conexão. Verifique sua internet e tente novamente."
        );
    }

    let dados;

    try {
        dados = await resposta.json();
    } catch {
        throw new Error("A API retornou uma resposta inválida.");
    }

    if (!resposta.ok) {
        if (resposta.status === 404) {
            throw new Error("Cidade não encontrada.");
        }

        if (resposta.status === 401) {
            throw new Error("Chave da API inválida ou não autorizada.");
        }

        if (resposta.status === 429) {
            throw new Error(
                "Limite de consultas atingido. Tente novamente mais tarde."
            );
        }

        throw new Error("Não foi possível consultar o clima.");
    }

    // Verifica se os dados essenciais estão disponíveis
    if (!dados.main || !dados.weather?.[0]) {
        throw new Error("Os dados meteorológicos estão incompletos.");
    }

    ExibirDados(dados);
}

// Atualiza as informações na interface
function ExibirDados(dados) {
    document.querySelector(".cidade").textContent =
        `Tempo em ${dados.name}`;

    document.querySelector(".graus").textContent =
        `${Math.round(dados.main.temp)} °C`;

    document.querySelector(".previsao").textContent =
        dados.weather[0].description;

    const imagem = document.querySelector(".img-previsao");

    imagem.src =
        `https://openweathermap.org/img/wn/${dados.weather[0].icon}@2x.png`;

    imagem.alt = dados.weather[0].description;

    document.querySelector(".umidade").textContent =
        `${dados.main.humidity}%`;

    document.querySelector(".pressao").textContent =
        `${dados.main.pressure} hPa`;

    document.querySelector(".nivelMar").textContent =
        dados.main.sea_level != null
            ? `${dados.main.sea_level} hPa`
            : "Indisponível";

    document.querySelector(".tempMax").textContent =
        `${Math.round(dados.main.temp_max)} °C`;

    document.querySelector(".tempMin").textContent =
        `${Math.round(dados.main.temp_min)} °C`;
}

// Permite pesquisar pressionando Enter
campoCidade.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") {
        Coletar();
    }
});