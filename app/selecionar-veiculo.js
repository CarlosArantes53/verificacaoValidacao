import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const db = getFirestore();
const veiculosTableBody = document.getElementById('veiculosTableBody');
const confirmarSelecaoBtn = document.getElementById('confirmarSelecaoBtn');

async function displayVeiculos() {
    veiculosTableBody.innerHTML = '';

    try {
        const querySnapshot = await getDocs(collection(db, "veiculos"));
        querySnapshot.forEach((doc) => {
            const veiculo = doc.data();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${veiculo.marca}</td>
                <td>${veiculo.modelo}</td>
                <td>${veiculo.ano}</td>
                <td>${veiculo.placa}</td>
            `;
            tr.addEventListener('click', () => selectVeiculo(veiculo.placa));
            veiculosTableBody.appendChild(tr);
        });
    } catch (error) {
        console.error("Erro ao obter documentos: ", error);
    }
}

function selectVeiculo(placa) {
    // Define a placa do veículo selecionado
    sessionStorage.setItem('placaVeiculo', placa);
    // Ativa o botão de confirmar
    confirmarSelecaoBtn.removeAttribute('disabled');
}

confirmarSelecaoBtn.addEventListener('click', () => {
    const placaVeiculo = sessionStorage.getItem('placaVeiculo');
    if (placaVeiculo) {
        window.location.href = 'reservar-veiculo.html';
    } else {
        alert('Por favor, selecione um veículo antes de prosseguir.');
    }
});

window.addEventListener('load', displayVeiculos);
