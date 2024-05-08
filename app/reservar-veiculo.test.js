import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const db = getFirestore();

const detalhesVeiculo = document.getElementById('detalhesVeiculo');
const datasAluguel = document.getElementById('datasAluguel');
const reservarBtn = document.getElementById('reservarBtn');
const metodoPagamentoSelect = document.getElementById('metodoPagamento');
const infoCartaoDiv = document.getElementById('infoCartao');
const baixarBoletoBtn = document.getElementById('baixarBoletoBtn');

let placaVeiculo;

window.addEventListener('load', async () => {
    placaVeiculo = sessionStorage.getItem('placaVeiculo');
    if (!placaVeiculo) {
        window.location.href = 'selecionar-veiculo.html';
    } else {
        detalhesVeiculo.textContent = `Veículo Selecionado: ${placaVeiculo}`;
        await mostrarDatasAluguel(placaVeiculo);
    }
});

cancelarBtn.addEventListener('click', () => {
    sessionStorage.removeItem('placaVeiculo');
    window.location.href = 'selecionar-veiculo.html';
});

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

function formatarData(data) {
    const partesData = data.split('-');
    return `${partesData[2]}/${partesData[1]}/${partesData[0]}`;
}
    
function calcularValorAluguel(dataInicio, dataFim) {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const diffTime = Math.abs(fim - inicio);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const valorPorDia = 150;
    return diffDays * valorPorDia;
}

metodoPagamentoSelect.addEventListener('change', () => {
    const selectedOption = metodoPagamentoSelect.value;
    const dataInicio = document.getElementById('dataInicio').value;
    const dataFim = document.getElementById('dataFim').value;

    if (selectedOption === 'boleto') {
        const totalValueElement = document.getElementById('totalValue');
        totalValueElement.textContent = `Total a pagar: R$ ${calcularValorAluguel(dataInicio, dataFim).toFixed(2)}`;
        infoCartaoDiv.classList.add('hidden');
        baixarBoletoBtn.classList.remove('hidden');
    } else {
        const totalValueElement = document.getElementById('totalValue');
        totalValueElement.textContent = `Total a pagar: R$ ${calcularValorAluguel(dataInicio, dataFim).toFixed(2)}`;
        infoCartaoDiv.classList.remove('hidden');
        baixarBoletoBtn.classList.add('hidden');
    }
});
