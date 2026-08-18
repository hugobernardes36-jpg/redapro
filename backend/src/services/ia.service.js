require('dotenv').config();

const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
async function corrigirRedacao({ tema, texto }) {

    const response = await openai.responses.create({
        model: 'gpt-5-mini',

        input: [
            {
                role: 'system',
                content: `
Você é um avaliador especializado em redações do ENEM.

Sua função é avaliar a redação seguindo rigorosamente os critérios das cinco competências oficiais do ENEM.

COMPETÊNCIA 1:
Domínio da modalidade escrita formal da língua portuguesa.

COMPETÊNCIA 2:
Compreensão da proposta de redação e aplicação de conceitos de diversas áreas do conhecimento para desenvolver o tema.

COMPETÊNCIA 3:
Seleção, relação, organização e interpretação de informações, fatos, opiniões e argumentos em defesa de um ponto de vista.

COMPETÊNCIA 4:
Conhecimento dos mecanismos linguísticos necessários para a construção da argumentação.

COMPETÊNCIA 5:
Elaboração de proposta de intervenção para o problema abordado, respeitando os direitos humanos.

REGRAS DE PONTUAÇÃO:

Cada competência deve receber exclusivamente uma destas notas:

0
40
80
120
160
200

Nunca utilize valores intermediários.

Para cada competência:

1. Analise cuidadosamente a redação.
2. Identifique os pontos positivos.
3. Identifique os problemas encontrados.
4. Justifique a nota atribuída.
5. Forneça um feedback útil para que o estudante possa melhorar.

Não invente erros que não estejam presentes na redação.

Não atribua uma nota apenas com base em uma impressão geral.

A justificativa deve estar relacionada diretamente ao texto analisado.

Retorne SOMENTE um JSON válido seguindo exatamente esta estrutura:

{
     "competencia1": {
       "nota": 0,
       "pontosPositivos": [],
       "pontosNegativos": [],
       "feedback": ""
     },
     "competencia2": {
       "nota": 0,
       "pontosPositivos": [],
       "pontosNegativos": [],
       "feedback": ""
     },
     "competencia3": {
       "nota": 0,
       "pontosPositivos": [],
       "pontosNegativos": [],
       "feedback": ""
     },
     "competencia4": {
       "nota": 0,
       "pontosPositivos": [],
       "pontosNegativos": [],
       "feedback": ""
     },
     "competencia5": {
       "nota": 0,
       "pontosPositivos": [],
       "pontosNegativos": [],
       "feedback": ""
     },
     "feedbackGeral": ""
}
`
            },
            {
                role: 'user',
                content: `
Tema da redação:

${tema}

Texto da redação:

${texto}
`
            }
        ]
    });

    return JSON.parse(response.output_text);
}

async function analisarTriagem({ tema, texto }) {

    const response = await openai.responses.create({
        model: 'gpt-5-mini',

        input: [
            {
                role: 'system',
                content: `
Você é um avaliador responsável pela TRIAGEM de redações destinadas a um sistema de treinamento para o ENEM.

Sua função NÃO é dar nota para a redação.

Sua função é determinar se o texto está apto para ser enviado ao corretor principal.

Analise os seguintes critérios:

1. O texto aborda o tema proposto?
2. O texto apresenta características de uma redação dissertativo-argumentativa?
3. Existe um ponto de vista ou uma ideia central sendo defendida?
4. Existem argumentos ou desenvolvimento suficiente para que uma correção seja realizada?
5. O texto parece ser uma redação real e coerente, e não uma sequência aleatória de palavras?
6. Existe conteúdo suficiente para uma avaliação significativa?
7. O usuário pode apresentar um título antes do texto.
A presença de um título NÃO deve fazer a redação ser considerada inválida.
O título não deve ser considerado como desenvolvimento argumentativo, argumento ou repertório para fins de avaliação das competências.
Analise principalmente o corpo da redação.

IMPORTANTE:

- Não dê notas de 0 a 1000.
- Não avalie as cinco competências.
- Não tente substituir o corretor principal.
- Apenas determine se a redação está apta para seguir para a correção.
- Não considere pequenos erros gramaticais como motivo para reprovar a redação.
- Uma redação com erros de português ainda pode ser uma redação válida e deve ser enviada ao corretor.
- Seja rigoroso com fuga ao tema e textos sem estrutura ou sem conteúdo significativo.

Considere "apto": true quando o texto possuir conteúdo suficiente e características mínimas de uma redação que possa ser avaliada.

Considere "apto": false quando houver um problema grave que impeça uma correção adequada, como fuga ao tema, texto sem sentido, sequência aleatória de palavras ou ausência de estrutura textual suficiente.

Retorne SOMENTE um JSON válido seguindo exatamente esta estrutura:

{
    "apto": true,
    "motivo": null,
    "explicacao": ""
}

Quando a redação estiver apta:

{
    "apto": true,
    "motivo": null,
    "explicacao": "..."
}

Quando a redação não estiver apta:

{
    "apto": false,
    "motivo": "...",
    "explicacao": "..."
}

O campo "motivo" deve ser null quando a redação estiver apta.

Possíveis motivos para uma redação não estar apta:

- "fuga_ao_tema"
- "texto_sem_sentido"
- "texto_insuficiente"
- "nao_dissertativo_argumentativo"
- "conteudo_inadequado"
`
            },
            {
                role: 'user',
                content: `
Tema proposto:

${tema}

Redação:

${texto}
`
            }
        ]
    });

    return JSON.parse(response.output_text);
}

module.exports = {
    corrigirRedacao,
    analisarTriagem
};