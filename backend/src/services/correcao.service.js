const prisma = require('../lib/prisma');

const {
    corrigirRedacao,
    analisarTriagem
} = require('./ia.service');

const {
    verificarTextoBasico,
    verificarTamanhoTexto
} = require('./triagem.service');

const { consumirCotaDiaria, reverterCotaDiaria } = require('./aiUsage.service');
const {
    reservarCredito,
    finalizarConsumo,
    reverterConsumo,
} = require('./credit.service');

// Busca a redação e, quando um userId é informado, garante que ela pertence a esse usuário.
// Essa checagem fica dentro do service para proteger qualquer chamador atual ou futuro (anti-IDOR).
async function buscarRedacao(redacaoId, userId) {
    const redacao = await prisma.redacao.findUnique({
        where: {
            id: Number(redacaoId)
        }
    });

    if (!redacao || (userId !== undefined && redacao.userId !== userId)) {
        const erro = new Error('Redação não encontrada');
        erro.status = 404;
        throw erro;
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
    if (!correcao || typeof correcao !== 'object') {
        return false;
    }

    const competencias = [
        correcao.competencia1,
        correcao.competencia2,
        correcao.competencia3,
        correcao.competencia4,
        correcao.competencia5
    ];

    for (const competencia of competencias) {
        if (!competencia || typeof competencia !== 'object') {
            return false;
        }

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

function validarAvaliacao(correcao) {
    if (!validarPontuacao(correcao) || typeof correcao.feedbackGeral !== 'string') {
        return false;
    }

    for (const competencia of [1, 2, 3, 4, 5]) {
        const item = correcao[`competencia${competencia}`];

        if (!Array.isArray(item.pontosPositivos) || !Array.isArray(item.pontosNegativos)) {
            return false;
        }

        if (!item.pontosPositivos.every(ponto => typeof ponto === 'string') ||
            !item.pontosNegativos.every(ponto => typeof ponto === 'string') ||
            typeof item.feedback !== 'string') {
            return false;
        }
    }

    return true;
}

function validarTriagem(triagem) {
    const motivos = [
        'fuga_ao_tema',
        'texto_sem_sentido',
        'texto_insuficiente',
        'nao_dissertativo_argumentativo',
        'conteudo_inadequado'
    ];

    if (!triagem || typeof triagem.apto !== 'boolean' || typeof triagem.explicacao !== 'string') {
        return false;
    }

    return triagem.apto
        ? triagem.motivo === null
        : motivos.includes(triagem.motivo);
}

function mapearMotivoHumano(motivo) {
    const mensagens = {
        'Redação em branco.': 'A redação está em branco.',
        'Texto da redação não informado.': 'A redação não foi informada corretamente.',
        'Texto muito curto para uma redação do ENEM.': 'A redação está muito curta para ser avaliada.',
        fuga_ao_tema: 'A redação fugiu do tema proposto.',
        texto_sem_sentido: 'O texto não apresenta sentido e coerência suficientes para uma correção.',
        texto_insuficiente: 'A redação não possui desenvolvimento suficiente para ser corrigida.',
        'A redação excede o limite máximo de 15.000 caracteres.': 'A redação excede o limite máximo permitido.',
        nao_dissertativo_argumentativo: 'A redação não tem estrutura dissertativo-argumentativa adequada.',
        conteudo_inadequado: 'O conteúdo da redação não atende aos critérios mínimos para correção.'
    };

    return mensagens[motivo] || 'A redação não atende aos critérios mínimos para correção.';
}

async function salvarCorrecao(redacaoId, payload) {
    const dadosIa = payload.dadosIa || payload;
    const motivoHumano = payload.status === 'NAO_APTA'
        ? (payload.motivoHumano || mapearMotivoHumano(payload.motivo))
        : null;
    const base = {
        redacaoId: Number(redacaoId),
        status: payload.status || 'CORRIGIDA',
        notaFinal: Number(payload.notaFinal ?? 0),
        motivo: payload.motivo || null,
        feedback: payload.feedbackGeral || payload.feedback || '',
        dadosIa: {
            ...(dadosIa && typeof dadosIa === 'object' ? dadosIa : {}),
            ...(motivoHumano ? { motivoHumano } : {}),
            status: payload.status || 'CORRIGIDA',
            notaFinal: Number(payload.notaFinal ?? 0)
        },
        competencia1: Number(dadosIa?.competencia1?.nota ?? payload.competencia1?.nota ?? 0),
        competencia2: Number(dadosIa?.competencia2?.nota ?? payload.competencia2?.nota ?? 0),
        competencia3: Number(dadosIa?.competencia3?.nota ?? payload.competencia3?.nota ?? 0),
        competencia4: Number(dadosIa?.competencia4?.nota ?? payload.competencia4?.nota ?? 0),
        competencia5: Number(dadosIa?.competencia5?.nota ?? payload.competencia5?.nota ?? 0),
    };

    const { redacaoId: _, ...persistData } = base;
    const existing = await prisma.correcao.findUnique({
        where: { redacaoId: Number(redacaoId) }
    });

    if (existing) {
        return prisma.correcao.update({
            where: { id: existing.id },
            data: persistData,
        });
    }

    return prisma.correcao.create({
        data: {
            ...persistData,
            redacaoId: Number(redacaoId),
        },
    });
}

async function executarCorrecao(redacaoId, userId, consumoInicial = null) {
    const redacao = await buscarRedacao(redacaoId, userId);

    const correcaoExistente = await prisma.correcao.findUnique({
        where: { redacaoId: redacao.id },
    });
    if (correcaoExistente) {
        return {
            redacaoId: redacao.id,
            status: correcaoExistente.status,
            notaFinal: correcaoExistente.notaFinal,
            correcaoId: correcaoExistente.id,
            ...((correcaoExistente.dadosIa && typeof correcaoExistente.dadosIa === 'object')
                ? correcaoExistente.dadosIa
                : {}),
        };
    }

    const textoBasico = verificarTextoBasico(redacao.texto);

    if (!textoBasico.valido) {
        const resultado = {
            redacaoId: redacao.id,
            notaFinal: 0,
            status: 'NAO_APTA',
            motivo: textoBasico.motivo,
            motivoHumano: mapearMotivoHumano(textoBasico.motivo),
            feedbackGeral: mapearMotivoHumano(textoBasico.motivo),
            explicacao: mapearMotivoHumano(textoBasico.motivo),
        };

        await salvarCorrecao(redacao.id, resultado);
        return resultado;
    }

    const tamanhoTexto = verificarTamanhoTexto(redacao.texto);

    if (!tamanhoTexto.valido) {
        const resultado = {
            redacaoId: redacao.id,
            notaFinal: 0,
            status: 'NAO_APTA',
            motivo: tamanhoTexto.motivo,
            motivoHumano: mapearMotivoHumano(tamanhoTexto.motivo),
            feedbackGeral: mapearMotivoHumano(tamanhoTexto.motivo),
            explicacao: mapearMotivoHumano(tamanhoTexto.motivo),
        };

        await salvarCorrecao(redacao.id, resultado);
        return resultado;
    }

    let consumo = null;
    let cotaConsumida = false;
    try {
        // NÃO reservar crédito ainda - primeiro fazer as triagens (backend + IA)

        // A partir daqui há uma chamada real à OpenAI, portanto consome a cota diária do usuário.
        const cotaDisponivel = await consumirCotaDiaria(userId);
        if (!cotaDisponivel) {
            const erro = new Error('Você atingiu o limite diário de correções. Tente novamente amanhã.');
            erro.status = 429;
            throw erro;
        }
        cotaConsumida = true;

        const triagem = await analisarTriagem({
            tema: redacao.tema,
            texto: redacao.texto
        });

        if (!validarTriagem(triagem)) {
            // Falha na triagem da IA - reverte cota sem ter consumido créditos
            await reverterCotaDiaria(userId);
            throw new Error('A triagem da IA possui formato inválido');
        }

        if (!triagem.apto) {
            const resultado = {
                redacaoId: redacao.id,
                notaFinal: 0,
                status: 'NAO_APTA',
                motivo: triagem.motivo,
                motivoHumano: mapearMotivoHumano(triagem.motivo),
                feedbackGeral: triagem.explicacao || mapearMotivoHumano(triagem.motivo),
                explicacao: triagem.explicacao || mapearMotivoHumano(triagem.motivo),
            };

            // Falha na triagem da IA - não reserva créditos
            await salvarCorrecao(redacao.id, resultado);
            await reverterCotaDiaria(userId);
            return resultado;
        }

        // ✅ APENAS AGORA que passamos em ambas as triagens (backend + IA), reservamos o crédito
        console.log('[CREDIT] Triagens aprovadas. Reservando crédito.');
        consumo = consumoInicial || await reservarCredito(userId, redacao.id);

        const avaliacao = await corrigirRedacao({
            tema: redacao.tema,
            texto: redacao.texto
        });

        if (!validarAvaliacao(avaliacao)) {
            throw new Error('A avaliação da IA possui formato ou pontuação inválida');
        }

        const notaFinal = calcularNotaFinal(avaliacao);
        const resultado = {
            redacaoId: redacao.id,
            status: 'CORRIGIDA',
            competencia1: avaliacao.competencia1,
            competencia2: avaliacao.competencia2,
            competencia3: avaliacao.competencia3,
            competencia4: avaliacao.competencia4,
            competencia5: avaliacao.competencia5,
            notaFinal,
            feedbackGeral: avaliacao.feedbackGeral,
            dadosIa: avaliacao,
        };

        const correcaoSalva = await salvarCorrecao(redacao.id, resultado);
        await finalizarConsumo(consumo.id);
        console.log('[CREDIT] Correção finalizada com sucesso. Crédito consumido.');

        return {
            ...resultado,
            correcaoId: correcaoSalva.id,
        };
    } catch (error) {
        // Somente reverte crédito se foi reservado
        if (consumo) {
            console.log('[CREDIT] Erro na correção. Revertendo crédito.');
            await reverterConsumo(consumo.id).catch(err => {
                console.error('Erro ao reverter consumo de crédito:', err);
            });
        }

        // Se ocorrer qualquer erro durante a comunicação com a IA ou validação dos dados, revertemos as cotas consumidas.
        if (cotaConsumida) {
            console.log('[CREDIT] Erro na correção. Revertendo cota diária.');
            await reverterCotaDiaria(userId).catch(err => {
                console.error('Erro ao reverter cota diária de IA:', err);
            });
        }
        throw error;
    }
}

module.exports = {
    buscarRedacao,
    prepararCorrecao,
    criarEstruturaCorrecao,
    calcularNotaFinal,
    validarPontuacao,
    validarAvaliacao,
    validarTriagem,
    executarCorrecao
};
