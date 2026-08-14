function validarRedacao({ tema, texto }) {
    const erros = [];

    if (!tema || tema.trim().length === 0) {
        erros.push('O tema da redação é obrigatório.');
    }

    if (!texto || texto.trim().length === 0) {
        erros.push('O texto da redação é obrigatório.');
    }

    if (texto && texto.trim().length < 100) {
        erros.push('A redação precisa ter pelo menos 100 caracteres.');
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