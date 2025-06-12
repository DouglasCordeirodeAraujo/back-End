const validator = require('validator');
const { differenceInYears, parseISO } = require('date-fns');

function isValidCPF(cpf){
    const str = (cpf || '').replace(/\D/g, '');
    if (str.length !== 11 || /^(\d)\1+$/.test(str)) return false;
    const calc = (t) => [...str].slice(0, t - 1)
        .reduce((soma, num, i) => soma + Number(num) * (t - i), 0) * 10 % 11 % 10;
    return calc(10) === +str[9] && calc(11) === +str[10];
}

module.exports = (req, res, next) => {
    const {
        nome, sobrenome, email, senha,
        dataNascimento, cpf, celular
    } = req.body;

    if (!nome || !sobrenome || !email || !senha || !dataNascimento) {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }

    if(!validator.isEmail(email || '')){
        return  res.status(400).json({ error: 'Email inválido.' });
    }

    if((senha || '').length < 6){
        return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres.' });
    }

    if (!dataNascimento || !validator.isISO8601(dataNascimento)) {
        return res.status(400).json({ error: 'Data de nascimento inválida.' });
    }

    const idade = differenceInYears(new Date(), parseISO(dataNascimento));
    if(idade < 18){
        return res.status(400).json({ error: 'É necessário ser maior de 18 anos.' });
    }

    if(cpf && !isValidCPF(cpf)){
        return res.status(400).json({ error: 'CPF inválido.' });
    }

    const celularLimpo = (celular || '').replace(/\D/g, '');
    if(celular && !validator.isMobilePhone(celularLimpo, 'pt-BR')){
        return res.status(400).json({ error: 'Celular inválido.' });
    }

    req.body.nome = nome.trim();
    req.body.sobrenome = sobrenome.trim();
    req.body.email = email.trim().toLowerCase();

    next();
};