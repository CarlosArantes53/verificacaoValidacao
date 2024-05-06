// Importando as funções necessárias do Firebase
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Obtendo uma referência para o Firestore
const db = getFirestore();

// Referências aos elementos HTML
const detalhesVeiculo = document.getElementById('detalhesVeiculo');
const datasAluguel = document.getElementById('datasAluguel');
const reservarBtn = document.getElementById('reservarBtn');
const metodoPagamentoSelect = document.getElementById('metodoPagamento');
const infoCartaoDiv = document.getElementById('infoCartao');
const baixarBoletoBtn = document.getElementById('baixarBoletoBtn');

let placaVeiculo;

// Evento de carregamento da página
window.addEventListener('load', async () => {
    placaVeiculo = sessionStorage.getItem('placaVeiculo');
    if (!placaVeiculo) {
        window.location.href = 'selecionar-veiculo.html';
    } else {
        detalhesVeiculo.textContent = `Veículo Selecionado: ${placaVeiculo}`;
        await mostrarDatasAluguel(placaVeiculo);
    }
});

// Evento de clique no botão "Cancelar"
cancelarBtn.addEventListener('click', () => {
    sessionStorage.removeItem('placaVeiculo');
    window.location.href = 'selecionar-veiculo.html';
});

// Evento de clique no botão "Reservar Veículo"
reservarBtn.addEventListener('click', async () => {
    const dataInicio = document.getElementById('dataInicio').value;
    const dataFim = document.getElementById('dataFim').value;

    if (dataInicio && dataFim) {
        const disponivel = await verificarDisponibilidade(placaVeiculo, dataInicio, dataFim);
        if (disponivel) {
            adicionarReserva(placaVeiculo, dataInicio, dataFim);
        } else {
            alert('Este carro já possui reserva para essas datas. Por favor, escolha outras datas.');
        }
    } else {
        alert('Por favor, preencha as datas de início e término para reservar o veículo.');
    }
});

// Função para mostrar as datas de aluguel do veículo
async function mostrarDatasAluguel(placaVeiculo) {
    datasAluguel.innerHTML = '';
    try {
        const q = query(collection(db, "aluguel"), where("placa", "==", placaVeiculo));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            const aluguel = doc.data();
            const li = document.createElement('li');
            li.textContent = `De: ${formatarData(aluguel.dataInicio)} - até ${formatarData(aluguel.dataFim)}`;
            datasAluguel.appendChild(li);
        });
    } catch (error) {
        console.error("Erro ao obter datas de aluguel: ", error);
    }
}

// Função para verificar a disponibilidade do veículo nas datas selecionadas
async function verificarDisponibilidade(placaVeiculo, dataInicio, dataFim) {
    try {
        const q = query(collection(db, "aluguel"), where("placa", "==", placaVeiculo));
        const querySnapshot = await getDocs(q);
        let disponivel = true;
        querySnapshot.forEach((doc) => {
            const aluguel = doc.data();
            const inicioReserva = new Date(aluguel.dataInicio);
            const fimReserva = new Date(aluguel.dataFim);
            const inicioSelecionado = new Date(dataInicio);
            const fimSelecionado = new Date(dataFim);

            if (
                (inicioSelecionado >= inicioReserva && inicioSelecionado <= fimReserva) ||
                (fimSelecionado >= inicioReserva && fimSelecionado <= fimReserva)
            ) {
                disponivel = false;
            }
        });
        return disponivel;
    } catch (error) {
        console.error("Erro ao verificar disponibilidade do veículo: ", error);
        return false;
    }
}

// Função para adicionar uma reserva no Firestore
async function adicionarReserva(placaVeiculo, dataInicio, dataFim) {
    try {
        await addDoc(collection(db, "aluguel"), {
            placa: placaVeiculo,
            dataInicio: dataInicio,
            dataFim: dataFim
        });
        alert('Reserva realizada com sucesso!');
    } catch (error) {
        console.error("Erro ao adicionar reserva: ", error);
        alert('Erro ao realizar a reserva. Por favor, tente novamente mais tarde.');
    }
}

// Função para formatar a data no formato DD/MM/AAAA
function formatarData(data) {
    const partesData = data.split('-');
    return `${partesData[2]}/${partesData[1]}/${partesData[0]}`;
}

// Evento de mudança na seleção do método de pagamento
metodoPagamentoSelect.addEventListener('change', () => {
    const selectedOption = metodoPagamentoSelect.value;

    if (selectedOption === 'boleto') {
        // Se a opção selecionada for boleto, oculte os campos do cartão e mostre o botão de boleto
        infoCartaoDiv.classList.add('hidden');
        baixarBoletoBtn.classList.remove('hidden');
    } else {
        // Caso contrário, mostre os campos do cartão e oculte o botão de boleto
        infoCartaoDiv.classList.remove('hidden');
        baixarBoletoBtn.classList.add('hidden');
    }
});
