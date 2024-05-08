import { displayVeiculos } from './display-vehicles';
import { jest } from '@jest/globals';

jest.mock('https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js', () => ({
    getFirestore: jest.fn(),
    collection: jest.fn(),
    getDocs: jest.fn(),
}));

describe('displayVeiculos', () => {
    let mockGetDocs;
    let mockCollection;
    let mockGetFirestore;

    beforeEach(() => {
        mockGetDocs = jest.fn();
        mockCollection = jest.fn(() => ({ getDocs: mockGetDocs }));
        mockGetFirestore = jest.fn(() => ({ collection: mockCollection }));

        jest.spyOn(document, 'getElementById').mockReturnValue({
            innerHTML: '',
            appendChild: jest.fn(),
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('deve exibir veículos corretamente', async () => {
        const mockQuerySnapshot = {
            forEach: jest.fn((callback) => {
                callback({
                    data: () => ({
                        marca: 'Marca1',
                        modelo: 'Modelo1',
                        ano: 2022,
                        placa: 'ABC123',
                    }),
                });
                callback({
                    data: () => ({
                        marca: 'Marca2',
                        modelo: 'Modelo2',
                        ano: 2021,
                        placa: 'XYZ456',
                    }),
                });
            }),
        };

        mockGetDocs.mockResolvedValue(mockQuerySnapshot);

        await displayVeiculos();

        expect(mockGetFirestore).toHaveBeenCalled();
        expect(mockCollection).toHaveBeenCalledWith('veiculos');
        expect(mockGetDocs).toHaveBeenCalled();
        expect(document.getElementById).toHaveBeenCalledWith('veiculosTableBody');
        expect(document.getElementById).toHaveBeenCalledWith('veiculoSelect');
        expect(document.createElement).toHaveBeenCalledTimes(2);
        expect(document.createElement).toHaveBeenCalledWith('tr');
        expect(document.createElement).toHaveBeenCalledWith('option');
        expect(document.appendChild).toHaveBeenCalledTimes(4);
    });

    test('deve lidar com erros ao obter documentos', async () => {
        const mockError = new Error('Erro ao obter documentos');

        mockGetDocs.mockRejectedValue(mockError);

        console.error = jest.fn();

        await displayVeiculos();

        expect(mockGetFirestore).toHaveBeenCalled();
        expect(mockCollection).toHaveBeenCalledWith('veiculos');
        expect(mockGetDocs).toHaveBeenCalled();
        expect(document.getElementById).toHaveBeenCalledWith('veiculosTableBody');
        expect(document.getElementById).toHaveBeenCalledWith('veiculoSelect');
        expect(document.createElement).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith('Erro ao obter documentos: ', mockError);
    });
});
