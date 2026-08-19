const CSRF_COOKIE_NAME = 'redapro_csrf';
const CSRF_HEADER_NAME = 'x-csrf-token';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// Padrão double-submit cookie: o cookie CSRF não é httpOnly (o frontend precisa lê-lo
// para reenviá-lo em um header), mas só é útil para um atacante que já conseguisse
// ler cookies do site — o que SameSite=Lax + CORS restrito já impedem cross-site.
function csrfProtection(req, res, next) {
    if (SAFE_METHODS.has(req.method)) {
        return next();
    }

    const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
    const headerToken = req.get(CSRF_HEADER_NAME);

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        return res.status(403).json({ erro: 'Falha na validação CSRF.' });
    }

    return next();
}

module.exports = { csrfProtection, CSRF_COOKIE_NAME, CSRF_HEADER_NAME };
