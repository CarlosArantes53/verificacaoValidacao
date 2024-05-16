import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const db = getFirestore(); 
const veiculosTableBody = document.getElementById('veiculosTableBody');
const veiculoSelect = document.getElementById('veiculoSelect');

async function displayVeiculos() {
    veiculosTableBody.innerHTML = '';   
    veiculoSelect.innerHTML = '';

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
            veiculosTableBody.appendChild(tr);
            
            const option = document.createElement('option');
            option.value = veiculo.placa;
            option.textContent = `${veiculo.marca} ${veiculo.modelo} (${veiculo.placa})`;
            veiculoSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao obter documentos: ", error);
    }
}

window.addEventListener('load', displayVeiculos);
