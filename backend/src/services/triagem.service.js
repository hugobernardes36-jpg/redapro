function verificarTextoBasico(texto) {
    if (!texto || typeof texto !== 'string') {
        return {
            valido: false,
            motivo: 'Texto da redação não informado.'
        };
    }

    const textoLimpo = texto.trim();

    if (textoLimpo.length === 0) {
        return {
            valido: false,
            motivo: 'Redação em branco.'
        };
    }

    return {
        valido: true
    };
}

module.exports = {
    verificarTextoBasico
};

function verificarTamanhoTexto(texto) {
    const palavras = texto
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (palavras.length < 30) {
        return {
            valido: false,
            motivo: 'Texto muito curto para uma redação do ENEM.'
        };
    }

    return {
        valido: true
    };
}

function fazerTriagem({ tema, texto }) {
    const textoBasico = verificarTextoBasico(texto);

    if (!textoBasico.valido) {
        return {
            podeCorrigir: false,
            notaZero: true,
            motivo: textoBasico.motivo
        };
    }

    const tamanho = verificarTamanhoTexto(texto);

    if (!tamanho.valido) {
        return {
            podeCorrigir: false,
            notaZero: true,
            motivo: tamanho.motivo
        };
    }

    return {
        podeCorrigir: true,
        notaZero: false
    };
}

module.exports = {
    verificarTextoBasico,
    verificarTamanhoTexto,
    fazerTriagem
};