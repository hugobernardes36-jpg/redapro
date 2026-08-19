const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizarEmail(email) {
    return String(email || '').trim().toLowerCase();
}

function validarCadastro({ name, email, password }) {
    const erros = [];

    const nomeLimpo = String(name || '').trim();
    if (!nomeLimpo) {
        erros.push('O nome é obrigatório.');
    } else if (nomeLimpo.length < 2 || nomeLimpo.length > 120) {
        erros.push('O nome deve ter entre 2 e 120 caracteres.');
    }

    const emailLimpo = normalizarEmail(email);
    if (!emailLimpo) {
        erros.push('O e-mail é obrigatório.');
    } else if (!EMAIL_REGEX.test(emailLimpo) || emailLimpo.length > 190) {
        erros.push('O e-mail informado é inválido.');
    }

    if (!password || typeof password !== 'string') {
        erros.push('A senha é obrigatória.');
    } else if (password.length < 8 || password.length > 72) {
        erros.push('A senha deve ter entre 8 e 72 caracteres.');
    }

    if (erros.length > 0) {
        return { valida: false, erros };
    }

    return {
        valida: true,
        erros: [],
        dados: { name: nomeLimpo, email: emailLimpo, password }
    };
}

function validarLogin({ email, password }) {
    const erros = [];

    const emailLimpo = normalizarEmail(email);
    if (!emailLimpo || !EMAIL_REGEX.test(emailLimpo)) {
        erros.push('Informe um e-mail e senha válidos.');
    }

    if (!password || typeof password !== 'string' || password.length === 0) {
        erros.push('Informe um e-mail e senha válidos.');
    }

    if (erros.length > 0) {
        return { valida: false, erros: ['Informe um e-mail e senha válidos.'] };
    }

    return {
        valida: true,
        erros: [],
        dados: { email: emailLimpo, password }
    };
}

function validarEmailParaRedefinicao({ email }) {
    const emailLimpo = normalizarEmail(email);

    if (!emailLimpo || !EMAIL_REGEX.test(emailLimpo) || emailLimpo.length > 190) {
        return { valida: false, erros: ['Informe um e-mail válido.'] };
    }

    return { valida: true, erros: [], dados: { email: emailLimpo } };
}

function validarNovaSenha({ token, password }) {
    const erros = [];

    if (!token || typeof token !== 'string') {
        erros.push('Token inválido.');
    }

    if (!password || typeof password !== 'string') {
        erros.push('A senha é obrigatória.');
    } else if (password.length < 8 || password.length > 72) {
        erros.push('A senha deve ter entre 8 e 72 caracteres.');
    }

    if (erros.length > 0) {
        return { valida: false, erros };
    }

    return { valida: true, erros: [], dados: { token, password } };
}

module.exports = {
    normalizarEmail,
    validarCadastro,
    validarLogin,
    validarEmailParaRedefinicao,
    validarNovaSenha
};
