const fs = require('fs');
const path = require('path');

// Let's implement full aggregation inside the JS as well to make it clean.
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function run() {
  try {
    await prisma.\();
    console.log('CON_SUCCESS');
  } catch(err) {
    console.log('CON_FAILED:', err.message);
    process.exit(0);
  }

  try {
    const userCount = await prisma.user.count();
    const redacaoCount = await prisma.redacao.count();
    const correcaoCount = await prisma.correcao.count();
    const aiUsageCount = await prisma.aiUsage.count();

    const correcoes = await prisma.correcao.findMany({
      orderBy: { id: 'asc' }
    });

    const distribNota = {};
    const distribStatus = {};

    const list = correcoes.map(c => {
      distribNota[c.notaFinal] = (distribNota[c.notaFinal] || 0) + 1;
      distribStatus[c.status] = (distribStatus[c.status] || 0) + 1;

      let isNull = true;
      let keys = [];
      let diff = false;
      let payloadCompList = [];
      let payloadNotaFinal = null;

      if (c.dadosIa && typeof c.dadosIa === 'object') {
        isNull = false;
        keys = Object.keys(c.dadosIa);

        function findValue(obj, key) {
          if (!obj || typeof obj !== 'object') return null;
          if (key in obj) return obj[key];
          for (let k in obj) {
            let res = findValue(obj[k], key);
            if (res !== null && res !== undefined) return res;
          }
          return null;
        }

        const dbComp = [c.competencia1, c.competencia2, c.competencia3, c.competencia4, c.competencia5];
        
        for (let i = 1; i <= 5; i++) {
          let val = findValue(c.dadosIa, 'competencia' + i);
          if (val && typeof val === 'object' && val.nota !== undefined) {
            payloadCompList.push(val.nota);
          } else if (val !== null && typeof val !== 'object') {
            payloadCompList.push(val);
          } else {
            let comps = findValue(c.dadosIa, 'competencias');
            if (comps && typeof comps === 'object') {
              let compVal = comps['competencia' + i];
              if (compVal && typeof compVal === 'object' && compVal.nota !== undefined) {
                payloadCompList.push(compVal.nota);
              } else if (compVal !== null && typeof compVal !== 'object') {
                payloadCompList.push(compVal);
              } else {
                payloadCompList.push(null);
              }
            } else {
              payloadCompList.push(null);
            }
          }
        }

        let valNF = findValue(c.dadosIa, 'notaFinal') || findValue(c.dadosIa, 'nota_final') || findValue(c.dadosIa, 'total') || findValue(c.dadosIa, 'nota');
        if (valNF && typeof valNF === 'object' && valNF.nota !== undefined) {
          payloadNotaFinal = valNF.nota;
        } else if (valNF !== null && typeof valNF !== 'object') {
          payloadNotaFinal = valNF;
        }

        let compDiff = false;
        for (let i = 0; i < 5; i++) {
          if (payloadCompList[i] !== null && payloadCompList[i] !== dbComp[i]) {
            compDiff = true;
          }
        }
        let totalDiff = (payloadNotaFinal !== null && payloadNotaFinal !== c.notaFinal);
        diff = compDiff || totalDiff;
      }

      const motivoPublic = (c.motivo && c.motivo.length < 50) ? c.motivo : null;

      return {
        id: c.id,
        redacaoId: c.redacaoId,
        createdAt: c.createdAt,
        status: c.status,
        motivo: motivoPublic,
        notaFinal: c.notaFinal,
        competencia1: c.competencia1,
        competencia2: c.competencia2,
        competencia3: c.competencia3,
        competencia4: c.competencia4,
        competencia5: c.competencia5,
        dadosIa: {
          isNull,
          keys,
          differences: diff
        }
      };
    });

    console.log('AUDIT_RESULTS:', JSON.stringify({
      counts: { User: userCount, Redacao: redacaoCount, Correcao: correcaoCount, AiUsage: aiUsageCount },
      distribution: { status: distribStatus, notaFinal: distribNota },
      correcoes: list
    }, null, 2));

  } catch(err) {
    console.error('ERROR:', err);
  } finally {
    await prisma.\();
  }
}

run();
