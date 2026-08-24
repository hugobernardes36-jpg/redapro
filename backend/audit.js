const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function run() {
  try {
    await prisma.$connect();
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

    console.log('COUNTS:', JSON.stringify({ userCount, redacaoCount, correcaoCount, aiUsageCount }));

    const correcoes = await prisma.correcao.findMany({
      orderBy: { id: 'asc' }
    });

    const correcoesPublic = correcoes.map(c => {
      // For cada dadosIa, check null or non-null, get top-level keys, and compare competence1..5.nota and finalGrade to DB columns
      let dadosIaPublic = null;
      if (c.dadosIa) {
        let keys = Object.keys(c.dadosIa);
        let differences = false;
        
        // Let's inspect potential keys: might have a different format/structure. Let's compute this dynamically.
        // Let's extract values if they exist, or check structure.
        // Typically, check if payload has competencia1..5.nota or similar, and compare to DB values c.competencia1..5
        // DB Columns: c.competencia1, c.competencia2, c.competencia3, c.competencia4, c.competencia5, c.notaFinal
        // Let's analyze inside JS.
        let payloadComp = {};
        let payloadNotaFinal = null;
        
        // Let's look for competencia/nota fields inside dadosIa
        // E.g., c.dadosIa.competencia1 or c.dadosIa.competencias?.competencia1, to accommodate typical formats.
        // Let's inspect deep paths recursively or look at typical keys. We will dump the comparison logic robustly.
        const compKeys = ['competencia1', 'competencia2', 'competencia3', 'competencia4', 'competencia5'];
        
        // Helper to find key recursively or at first level
        function findValue(obj, key) {
          if (!obj || typeof obj !== 'object') return null;
          if (key in obj) return obj[key];
          for (let k in obj) {
            let res = findValue(obj[k], key);
            if (res !== null && res !== undefined) return res;
          }
          return null;
        }

        // Check if there are differences
        // Let's write the checked values
        const dbComp = [c.competencia1, c.competencia2, c.competencia3, c.competencia4, c.competencia5];
        let payloadCompList = [];
        
        // Try getting competenciaX or equivalent
        for (let i = 1; i <= 5; i++) {
          let val = findValue(c.dadosIa, 'competencia' + i);
          if (val && typeof val === 'object' && val.nota !== undefined) {
            payloadCompList.push(val.nota);
          } else if (val !== null && typeof val !== 'object') {
            payloadCompList.push(val);
          } else {
            // Check if there's a competencias object/list
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

        // Try getting notaFinal or equivalent
        let valNF = findValue(c.dadosIa, 'notaFinal') || findValue(c.dadosIa, 'nota_final') || findValue(c.dadosIa, 'total') || findValue(c.dadosIa, 'nota');
        if (valNF && typeof valNF === 'object' && valNF.nota !== undefined) {
          payloadNotaFinal = valNF.nota;
        } else if (valNF !== null && typeof valNF !== 'object') {
          payloadNotaFinal = valNF;
        }

        // Compare db values vs payload values
        let compDiff = false;
        for (let i = 0; i < 5; i++) {
          if (payloadCompList[i] !== null && payloadCompList[i] !== dbComp[i]) {
            compDiff = true;
          }
        }
        let totalDiff = (payloadNotaFinal !== null && payloadNotaFinal !== c.notaFinal);

        dadosIaPublic = {
          isNull: false,
          keys: keys,
          differences: compDiff || totalDiff,
          details: {
            payloadCompList,
            dbComp,
            payloadNotaFinal,
            dbNotaFinal: c.notaFinal,
            compDiff,
            totalDiff
          }
        };
      } else {
        dadosIaPublic = {
          isNull: true,
          keys: [],
          differences: false
        };
      }

      // MOTIVO is only shown if it is a short enum/string (less than 50 chars as safe limit, or check length/value)
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
        dadosIa: dadosIaPublic
      };
    });

    console.log('CORRECOES:', JSON.stringify(correcoesPublic, null, 2));

  } catch(err) {
    console.error('ERROR during query:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

run();
