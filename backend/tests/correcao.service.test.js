const test = require('node:test');
const assert = require('node:assert/strict');

const {
    calcularNotaFinal,
    validarPontuacao,
    validarAvaliacao,
    validarTriagem
} = require('../src/services/correcao.service');

function criarAvaliacao(nota = 120) {
    const competencia = {
        nota,
        pontosPositivos: ['evidência observável no texto'],
        pontosNegativos: [],
        feedback: 'Justificativa vinculada ao desempenho observado.'
    };

    return {
        competencia1: { ...competencia },
        competencia2: { ...competencia },
        competencia3: { ...competencia },
        competencia4: { ...competencia },
        competencia5: { ...competencia },
        feedbackGeral: 'Síntese baseada nas evidências da redação.'
    };
}

test('calcula a nota final como soma das cinco competências', () => {
    const avaliacao = criarAvaliacao();
    avaliacao.competencia1.nota = 200;
    avaliacao.competencia2.nota = 160;
    avaliacao.competencia3.nota = 120;
    avaliacao.competencia4.nota = 80;
    avaliacao.competencia5.nota = 40;

    assert.equal(calcularNotaFinal(avaliacao), 600);
});

test('aceita somente a escala oficial de competências', () => {
    for (const nota of [0, 40, 80, 120, 160, 200]) {
        assert.equal(validarPontuacao(criarAvaliacao(nota)), true);
    }

    assert.equal(validarPontuacao(criarAvaliacao(180)), false);
    assert.equal(validarPontuacao({ ...criarAvaliacao(), competencia3: undefined }), false);
});

test('exige evidências e justificativas em todas as competências', () => {
    const avaliacao = criarAvaliacao();
    assert.equal(validarAvaliacao(avaliacao), true);

    avaliacao.competencia3.pontosPositivos = 'não é uma lista';
    assert.equal(validarAvaliacao(avaliacao), false);
});

test('valida a coerência do contrato de triagem', () => {
    assert.equal(validarTriagem({ apto: true, motivo: null, explicacao: 'Texto apto.' }), true);
    assert.equal(validarTriagem({ apto: false, motivo: 'fuga_ao_tema', explicacao: 'Tema não atendido.' }), true);
    assert.equal(validarTriagem({ apto: true, motivo: 'fuga_ao_tema', explicacao: 'Inconsistente.' }), false);
    assert.equal(validarTriagem({ apto: false, motivo: null, explicacao: 'Inconsistente.' }), false);
});
