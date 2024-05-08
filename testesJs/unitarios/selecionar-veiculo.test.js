import { render, screen, fireEvent } from '@testing-library/dom';
import { displayVeiculos, selectVeiculo } from './selecionar-veiculo.js';

jest.mock('./firebase-config.js', () => ({
  getFirestore: () => ({
    collection: () => ({
      getDocs: () => Promise.resolve([{
        data: () => ({
          marca: 'Toyota',
          modelo: 'Corolla',
          ano: 2022,
          placa: 'ABC1234',
        }),
      }]),
    }),
  }),
}));

describe('selecionar-veiculo.js', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <table id="veiculosTable">
        <thead>
          <tr>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Ano</th>
            <th>Placa</th>
          </tr>
        </thead>
        <tbody id="veiculosTableBody"></tbody>
      </table>
      <button id="confirmarSelecaoBtn" disabled>Confirmar Seleção</button>
    `;
  });

  test('deve exibir a tabela de veículos', async () => {
    await displayVeiculos();

    expect(screen.getByRole('cell', { name: 'Toyota' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Corolla' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '2022' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'ABC1234' })).toBeInTheDocument();
  });

  test('deve selecionar um veículo e habilitar o botão de confirmação', () => {
    const tr = screen.getByRole('row', { name: /Toyota Corolla 2022 ABC1234/i });
    fireEvent.click(tr);

    expect(sessionStorage.getItem('placaVeiculo')).toBe('ABC1234');

    expect(screen.getByRole('button', { name: 'Confirmar Seleção' })).not.toBeDisabled();
  });
});