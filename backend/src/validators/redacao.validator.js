function validarRedacao({ tema, texto }) {
    const erros = [];

    if (typeof tema !== 'string' || tema.trim().length === 0) {
        erros.push('O tema da redação é obrigatório.');
    } else if (tema.trim().length > 300) {
        erros.push('O tema da redação não pode exceder 300 caracteres.');
    }

    if (typeof texto !== 'string' || texto.trim().length === 0) {
        erros.push('O texto da redação é obrigatório.');
    } else if (texto.trim().length < 100) {
        erros.push('A redação precisa ter pelo menos 100 caracteres.');
    } else if (texto.trim().length > 15000) {
        erros.push('A redação não pode exceder 15.000 caracteres.');
    }

    if (erros.length > 0) {
        return {
            valida: false,
            erros
        };
    }

    return {
        valida: true,
        erros: []
    };
}

module.exports = validarRedacao;