const prisma = require('../lib/prisma');

const {
    corrigirRedacao,
    analisarTriagem
} = require('./ia.service');

const {
    verificarTextoBasico,
    verificarTamanhoTexto
} = require('./triagem.service');

async function buscarRedacao(redacaoId) {
    const redacao = await prisma.redacao.findUnique({
        where: {
            id: Number(redacaoId)
        }
    });

    if (!redacao) {
        throw new Error('Redação não encontrada');
    }

    return redacao;
}

async function prepararCorrecao(redacaoId) {
    const redacao = await buscarRedacao(redacaoId);

    return {
        redacaoId: redacao.id,
        tema: redacao.tema,
        texto: redacao.texto
    };
}

function criarEstruturaCorrecao() {
    return {
        competencia1: {
            nota: 0,
            justificativa: '',
            problemas: []
        },

        competencia2: {
            nota: 0,
            justificativa: '',
            problemas: []
        },

        competencia3: {
            nota: 0,
            justificativa: '',
            problemas: []
        },

        competencia4: {
            nota: 0,
            justificativa: '',
            problemas: []
        },

        competencia5: {
            nota: 0,
            justificativa: '',
            problemas: []
        },

        notaFinal: 0,

        feedbackGeral: ''
    };
}

function calcularNotaFinal(correcao) {
    return (
        correcao.competencia1.nota +
        correcao.competencia2.nota +
        correcao.competencia3.nota +
        correcao.competencia4.nota +
        correcao.competencia5.nota
    );
}

function validarPontuacao(correcao) {
    const competencias = [
        correcao.competencia1,
        correcao.competencia2,
        correcao.competencia3,
        correcao.competencia4,
        correcao.competencia5
    ];

    for (const competencia of competencias) {
        if (!Number.isInteger(competencia.nota)) {
            return false;
        }

        if (competencia.nota < 0 || competencia.nota > 200) {
            return false;
        }

        if (competencia.nota % 40 !== 0) {
            return false;
        }
    }

    return true;
}

async function executarCorrecao(redacaoId) {
    const redacao = await buscarRedacao(redacaoId);

    // ==========================================
    // 1. TRIAGEM BÁSICA
    // ==========================================

    const textoBasico = verificarTextoBasico(redacao.texto);

    if (!textoBasico.valido) {
        return {
            redacaoId: redacao.id,
            notaFinal: 0,
            status: 'NAO_APTA',
            motivo: textoBasico.motivo
        };
    }

    const tamanhoTexto = verificarTamanhoTexto(redacao.texto);

    if (!tamanhoTexto.valido) {
        return {
            redacaoId: redacao.id,
            notaFinal: 0,
            status: 'NAO_APTA',
            motivo: tamanhoTexto.motivo
        };
    }

    // ==========================================
    // 2. TRIAGEM COM IA
    // ==========================================

    const triagem = await analisarTriagem({
        tema: redacao.tema,
        texto: redacao.texto
    });

    if (!triagem.apto) {
        return {
            redacaoId: redacao.id,
            notaFinal: 0,
            status: 'NAO_APTA',
            motivo: triagem.motivo,
            explicacao: triagem.explicacao
        };
    }

    // ==========================================
    // 3. CORREÇÃO COM IA
    // ==========================================

    const avaliacao = await corrigirRedacao({
        tema: redacao.tema,
        texto: redacao.texto
    });

    // ==========================================
    // 4. VALIDAÇÃO DA PONTUAÇÃO
    // ==========================================

    if (!validarPontuacao(avaliacao)) {
        throw new Error('A avaliação da IA possui pontuação inválida');
    }

    // ==========================================
    // 5. CÁLCULO DA NOTA FINAL
    // ==========================================

    const notaFinal = calcularNotaFinal(avaliacao);

    return {
        redacaoId: redacao.id,
        status: 'CORRIGIDA',

        competencia1: avaliacao.competencia1,
        competencia2: avaliacao.competencia2,
        competencia3: avaliacao.competencia3,
        competencia4: avaliacao.competencia4,
        competencia5: avaliacao.competencia5,

        notaFinal,

        feedbackGeral: avaliacao.feedbackGeral
    };
}
module.exports = {
    buscarRedacao,
    prepararCorrecao,
    criarEstruturaCorrecao,
    calcularNotaFinal,
    validarPontuacao,
    executarCorrecao
};
