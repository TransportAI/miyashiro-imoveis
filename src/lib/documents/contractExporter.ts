import { Contract } from '@/lib/types/contract';
import { formatCurrency } from '@/lib/utils';

export function formatDateBr(dateStr?: string): string {
  if (!dateStr) return '__/__/____';
  try {
    const clean = dateStr.split('T')[0];
    const parts = clean.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  } catch (e) {}
  return dateStr;
}

/**
 * Gera o texto plano (.txt) com variáveis dinâmicas preenchidas
 * Se o contrato tiver minutaTexto customizada pelo usuário, ela tem prioridade total.
 */
export function generateContractText(contract: Contract): string {
  if (contract.minutaTexto && contract.minutaTexto.trim().length > 0) {
    return contract.minutaTexto;
  }

  const isLocacao = contract.modalidade === 'locacao_seguro_fianca' || (contract.type as string)?.includes('locacao');
  const isPermuta = contract.modalidade === 'permuta_imobiliaria';

  const locador = contract.parties.find(p => p.role === 'locador' || p.role === 'vendedor' || p.role === 'permutante_1');
  const locatario = contract.parties.find(p => p.role === 'locatario' || p.role === 'comprador' || p.role === 'permutante_2');
  const corretor = contract.parties.find(p => p.role === 'corretor');

  const locadorStr = locador 
    ? `${locador.name}, portador(a) do CPF/CNPJ ${locador.documentNumber || '___.___.___-__'}${locador.rg ? `, RG ${locador.rg}` : ''}, telefone ${locador.phone || '(19) ____-____'}`
    : 'LOCADOR / VENDEDOR A QUALIFICAR';

  const locatarioStr = locatario
    ? `${locatario.name}, portador(a) do CPF/CNPJ ${locatario.documentNumber || '___.___.___-__'}${locatario.rg ? `, RG ${locatario.rg}` : ''}, telefone ${locatario.phone || '(19) ____-____'}`
    : 'LOCATÁRIO / COMPRADOR A QUALIFICAR';

  let titulo = 'INSTRUMENTO PARTICULAR DE COMPRA E VENDA DE IMÓVEL';
  let conteudoModalidade = '';

  if (isLocacao) {
    titulo = 'CONTRATO DE LOCAÇÃO RESIDENCIAL COM GARANTIA DE SEGURO FIANÇA';
    const rentVal = formatCurrency(contract.financial.monthlyRent || 0);
    const seguradoraNome = contract.financial.seguroFiancaDetails?.seguradoraNome || 'Seguradora Parceira Credenciada';
    const apolice = contract.financial.seguroFiancaDetails?.numeroApolice ? `nº ${contract.financial.seguroFiancaDetails.numeroApolice}` : 'a ser emitida';

    conteudoModalidade = `
CLÁUSULA TERCEIRA - DO VALOR DO ALUGUEL E VENCIMENTO:
O aluguel mensal ajustado é de ${rentVal}, com vencimento impreterível todo dia ${contract.financial.paymentDay || 10} de cada mês, reajustado anualmente com base na variação positiva do ${contract.financial.readjustmentIndex || 'IPCA/IBGE'}.

CLÁUSULA QUARTA - DA GARANTIA EXCLUSIVA POR SEGURO FIANÇA:
Conforme política e exigência contratual da MIYASHIRO IMÓVEIS, a presente locação é garantida EXCLUSIVAMENTE por SEGURO FIANÇA LOCATÍCIA contratado junto à ${seguradoraNome}, sob Apólice/Proposta ${apolice}.
Parágrafo Primeiro: O LOCATÁRIO obriga-se a manter a apólice vigente e quitada ininterruptamente por todo o período da locação e eventuais renovações, sob pena de rescisão imediata por infração contratual.
`;
  } else if (isPermuta) {
    titulo = 'CONTRATO DE COMPROMISSO DE PERMUTA DE BENS IMÓVEIS';
    const pDetails = contract.financial.permutaDetails;
    const imovel1Val = formatCurrency(pDetails?.valorImovel1 || contract.financial.totalSaleValue || 0);
    const imovel2Val = formatCurrency(pDetails?.valorImovel2 || 0);
    const tornaVal = pDetails?.valorTorna ? formatCurrency(pDetails.valorTorna) : 'R$ 0,00';

    conteudoModalidade = `
CLÁUSULA TERCEIRA - DOS BENS OBJETO DA PERMUTA:
O PRIMEIRO PERMUTANTE entrega o imóvel: ${contract.propertyTitle} (${contract.propertyAddress}), avaliado em ${imovel1Val}.
O SEGUNDO PERMUTANTE entrega o imóvel: ${pDetails?.imovelSegundoDescricao || 'Imóvel residencial/comercial a qualificar'}, avaliado em ${imovel2Val}.

CLÁUSULA QUARTA - DA TORNA EM DINHEIRO:
${pDetails?.possuiTorna 
  ? `A permuta é realizada COM TORNA no valor de ${tornaVal}, a ser paga por ${pDetails.pagadorTorna === 'permutante_1' ? 'PRIMEIRO PERMUTANTE' : 'SEGUNDO PERMUTANTE'} nas seguintes condições: ${pDetails.condicoesTorna || 'À vista na lavratura da escritura pública.'}.`
  : 'A presente permuta é realizada SEM TORNA, considerando-se os imóveis de igual valor econômico, dando-se as partes plena, rasa e irrevogável quitação.'}
`;
  } else {
    // Venda e compra tradicional
    const totalVal = formatCurrency(contract.financial.totalSaleValue || 0);
    const sinalVal = formatCurrency(contract.financial.sinalEntrada || contract.financial.depositAmount || 0);

    conteudoModalidade = `
CLÁUSULA TERCEIRA - DO PREÇO E FORMA DE PAGAMENTO:
O preço certo e ajustado para a presente compra e venda é de ${totalVal}, pago da seguinte forma:
a) Sinal e princípio de pagamento: ${sinalVal} nesta data, mediante transferência bancária;
b) Saldo remanescente de ${formatCurrency(Math.max(0, (contract.financial.totalSaleValue || 0) - (contract.financial.sinalEntrada || contract.financial.depositAmount || 0)))} a ser liquidado na assinatura da Escritura Pública de Compra e Venda / Liberação do Financiamento Bancário.
`;
  }

  return `================================================================================
${titulo}
Código de Auditoria: ${contract.code} | Miyashiro Imóveis (CRECI 155957F)
================================================================================

1. DAS PARTES CONTRATANTES:
LOCADOR / PRIMEIRO CONTRATANTE:
${locadorStr}

LOCATÁRIO / SEGUNDO CONTRATANTE:
${locatarioStr}

INTERMEDIADORA E ADMINISTRADORA:
MIYASHIRO IMÓVEIS (S. Miyashiro Negócios Imobiliários), CRECI 155957F, com atuação em Amparo - SP e região do Circuito das Águas Paulista.
Corretor Responsável: ${corretor?.name || contract.corretorNome || 'Equipe Miyashiro'} - ${corretor?.documentNumber || 'CRECI 155957F'}.

2. DO IMÓVEL:
O presente contrato tem como objeto o imóvel situado em:
${contract.propertyAddress}
Identificação / Título: ${contract.propertyTitle} (REF: ${contract.propertyId.toUpperCase()})

${conteudoModalidade}

CLÁUSULA QUINTA - DO PRAZO DE VIGÊNCIA:
O prazo do presente contrato inicia-se em ${formatDateBr(contract.startDate)} e terminará em ${formatDateBr(contract.endDate)}, data em que as obrigações deverão estar plenamente satisfeitas.

CLÁUSULA SEXTA - DO FORO:
Para dirimir quaisquer controvérsias oriundas do presente instrumento, as partes elegem o Foro da Comarca de Amparo, Estado de São Paulo, com renúncia expressa de qualquer outro, por mais privilegiado que seja.

Amparo/SP, ${formatDateBr(new Date().toISOString())}.

__________________________________________
${locador?.name || 'Locador / Vendedor'}

__________________________________________
${locatario?.name || 'Locatário / Comprador'}

__________________________________________
MIYASHIRO IMÓVEIS (CRECI 155957F)
`;
}

/**
 * Gera e dispara download de arquivo .docx estruturado direto no navegador
 */
export async function exportContractToDocx(contract: Contract): Promise<void> {
  const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer, PageBreak } = await import('docx');

  // Se o usuário customizou a minuta via editor, geramos o DOCX a partir do texto customizado
  if (contract.minutaTexto && contract.minutaTexto.trim().length > 0) {
    const rawLines = contract.minutaTexto.split('\n');
    const paragraphs: any[] = [];

    for (const line of rawLines) {
      const trimmed = line.trim();
      
      // Quebra de página manual
      if (/---+\s*(?:QUEBRA DE P[AÁ]GINA|quebra-de-pagina|quebra)\s*---+/i.test(trimmed)) {
        paragraphs.push(new Paragraph({ children: [new PageBreak()] }));
        continue;
      }

      if (trimmed.length === 0) {
        paragraphs.push(new Paragraph({ text: '', spacing: { after: 100 } }));
        continue;
      }

      const isHeading = trimmed.startsWith('CLÁUSULA') || 
                        trimmed.startsWith('CONTRATO') || 
                        trimmed.startsWith('INSTRUMENTO') || 
                        /^\d+\.\s+[A-Z\s]+/.test(trimmed) ||
                        trimmed.startsWith('================');

      // Processar tags simples de **negrito** se presentes
      const textRuns: any[] = [];
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      for (const part of parts) {
        if (part.startsWith('**') && part.endsWith('**')) {
          textRuns.push(new TextRun({
            text: part.slice(2, -2),
            bold: true,
            size: isHeading ? 24 : 22,
          }));
        } else if (part.length > 0) {
          textRuns.push(new TextRun({
            text: part,
            bold: isHeading,
            size: isHeading ? 24 : 22,
          }));
        }
      }

      paragraphs.push(new Paragraph({
        children: textRuns.length > 0 ? textRuns : [new TextRun({ text: line, bold: isHeading, size: isHeading ? 24 : 22 })],
        spacing: { after: 120 },
        alignment: isHeading ? AlignmentType.CENTER : AlignmentType.JUSTIFIED
      }));
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: 'MIYASHIRO IMÓVEIS - AMPARO/SP',
              heading: HeadingLevel.HEADING_2,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: 'CRECI 155957F | Excelência Imobiliária no Circuito das Águas',
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 }
            }),
            ...paragraphs
          ]
        }
      ]
    });

    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Contrato_${contract.code}_${contract.propertyId.toUpperCase()}.docx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    return;
  }

  const isLocacao = contract.modalidade === 'locacao_seguro_fianca' || (contract.type as string)?.includes('locacao');
  const isPermuta = contract.modalidade === 'permuta_imobiliaria';

  const locador = contract.parties.find(p => p.role === 'locador' || p.role === 'vendedor' || p.role === 'permutante_1');
  const locatario = contract.parties.find(p => p.role === 'locatario' || p.role === 'comprador' || p.role === 'permutante_2');
  const corretor = contract.parties.find(p => p.role === 'corretor');

  let tituloDoc = 'CONTRATO DE COMPRA E VENDA DE IMÓVEL';
  if (isLocacao) tituloDoc = 'CONTRATO DE LOCAÇÃO COM GARANTIA DE SEGURO FIANÇA';
  if (isPermuta) tituloDoc = 'INSTRUMENTO DE COMPROMISSO DE PERMUTA IMOBILIÁRIA';

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: 'MIYASHIRO IMÓVEIS - AMPARO/SP',
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: 'CRECI 155957F | Excelência Imobiliária no Circuito das Águas',
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: tituloDoc,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: `Código de Controle: ${contract.code}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 }
          }),

          // Seção 1
          new Paragraph({
            text: '1. QUALIFICAÇÃO DAS PARTES',
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'PRIMEIRA PARTE (LOCADOR/VENDEDOR): ', bold: true }),
              new TextRun({ text: `${locador?.name || 'Não informado'}, CPF: ${locador?.documentNumber || '___.___.___-__'}${locador?.rg ? `, RG: ${locador.rg}` : ''}, Contato: ${locador?.phone || 'Não informado'}.` })
            ],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'SEGUNDA PARTE (LOCATÁRIO/COMPRADOR): ', bold: true }),
              new TextRun({ text: `${locatario?.name || 'Não informado'}, CPF: ${locatario?.documentNumber || '___.___.___-__'}${locatario?.rg ? `, RG: ${locatario.rg}` : ''}, Contato: ${locatario?.phone || 'Não informado'}.` })
            ],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'INTERMEDIAÇÃO IMOBILIÁRIA: ', bold: true }),
              new TextRun({ text: `Miyashiro Imóveis (CRECI 155957F). Corretor Responsável: ${corretor?.name || contract.corretorNome || 'Equipe Central'}.` })
            ],
            spacing: { after: 200 }
          }),

          // Seção 2
          new Paragraph({
            text: '2. DO IMÓVEL OBJETO',
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: `Imóvel: ${contract.propertyTitle}, localizado em ${contract.propertyAddress}. Referência do Cadastro: ${contract.propertyId.toUpperCase()}.`,
            spacing: { after: 200 }
          }),

          // Seção 3
          new Paragraph({
            text: '3. CLÁUSULAS ESPECÍFICAS DA MODALIDADE',
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 100 }
          }),

          isLocacao ? new Paragraph({
            children: [
              new TextRun({ text: 'CLÁUSULA DE GARANTIA POR SEGURO FIANÇA: ', bold: true }),
              new TextRun({ 
                text: `A presente locação é garantida exclusivamente por Seguro Fiança Locatícia contratado junto à ${contract.financial.seguroFiancaDetails?.seguradoraNome || 'Seguradora Credenciada'}. O aluguel mensal é de ${formatCurrency(contract.financial.monthlyRent || 0)} com vencimento todo dia ${contract.financial.paymentDay || 10}.` 
              })
            ],
            spacing: { after: 200 }
          }) : isPermuta ? new Paragraph({
            children: [
              new TextRun({ text: 'CLÁUSULA DE PERMUTA E TORNA: ', bold: true }),
              new TextRun({ 
                text: `O imóvel 1 é avaliado em ${formatCurrency(contract.financial.permutaDetails?.valorImovel1 || contract.financial.totalSaleValue || 0)}. O imóvel 2 (${contract.financial.permutaDetails?.imovelSegundoDescricao || 'Segundo imóvel'}) é avaliado em ${formatCurrency(contract.financial.permutaDetails?.valorImovel2 || 0)}. ${contract.financial.permutaDetails?.possuiTorna ? `Torna de ${formatCurrency(contract.financial.permutaDetails.valorTorna || 0)}.` : 'Permuta pura sem torna.'}` 
              })
            ],
            spacing: { after: 200 }
          }) : new Paragraph({
            children: [
              new TextRun({ text: 'CLÁUSULA DE PREÇO E PAGAMENTO: ', bold: true }),
              new TextRun({ 
                text: `Preço total de ${formatCurrency(contract.financial.totalSaleValue || 0)}, com sinal de ${formatCurrency(contract.financial.sinalEntrada || contract.financial.depositAmount || 0)}.` 
              })
            ],
            spacing: { after: 200 }
          }),

          // Seção 4
          new Paragraph({
            text: '4. PRAZOS E FORO',
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            text: `Vigência: De ${formatDateBr(contract.startDate)} até ${formatDateBr(contract.endDate)}. Elegem as partes o Foro da Comarca de Amparo/SP.`,
            spacing: { after: 400 }
          }),

          // Assinaturas
          new Paragraph({
            text: `Amparo/SP, ${formatDateBr(new Date().toISOString())}.`,
            alignment: AlignmentType.RIGHT,
            spacing: { after: 400 }
          }),
          new Paragraph({
            text: '____________________________________________________\nLOCADOR / VENDEDOR / PRIMEIRO PERMUTANTE',
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 }
          }),
          new Paragraph({
            text: '____________________________________________________\nLOCATÁRIO / COMPRADOR / SEGUNDO PERMUTANTE',
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 }
          }),
          new Paragraph({
            text: '____________________________________________________\nMIYASHIRO IMÓVEIS (CRECI 155957F)',
            alignment: AlignmentType.CENTER
          })
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Contrato_${contract.code}_${contract.propertyId.toUpperCase()}.docx`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

/**
 * Dispara download de arquivo .txt
 */
export function exportContractToTxt(contract: Contract): void {
  const text = generateContractText(contract);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Minuta_${contract.code}.txt`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

/**
 * Dispara janela de impressão otimizada (que o navegador salva como PDF vetorial sem carga de servidor)
 */
export function exportContractToPdfPrint(contract: Contract): void {
  const text = generateContractText(contract);
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Permita pop-ups no navegador para gerar a impressão ou PDF.');
    return;
  }

  // Divide o texto caso existam quebras explícitas de página
  const rawSections = text.split(/---+\s*(?:QUEBRA DE P[AÁ]GINA|quebra-de-pagina|quebra)\s*---+/i);

  const pagesHtml = rawSections.map((sec, idx) => {
    const isFirst = idx === 0;
    const pageNum = idx + 1;
    const totalPages = rawSections.length;

    let formatted = sec
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/__([^_]+)__/g, '<u>$1</u>');

    return `
      <div class="page-sheet ${!isFirst ? 'break-before' : ''}">
        ${isFirst ? `
          <div class="first-header">
            <div class="logo-box">
              <img src="${window.location.origin}/images/brand/logo.png" alt="Miyashiro Imóveis" class="logo-img" />
            </div>
            <div class="brand-info">
              <div class="company-title">MIYASHIRO IMÓVEIS</div>
              <div class="creci-title">CRECI 155957F • Excelência Imobiliária</div>
              <div class="contact-line">Amparo - SP • Tel: (19) 3807-6744 • WhatsApp: (19) 99824-3434</div>
            </div>
          </div>
          <div class="accent-bar"></div>
        ` : `
          <div class="sub-header">
            <div class="sub-left">
              <img src="${window.location.origin}/images/brand/logo.png" alt="Miyashiro" class="mini-logo" />
              <span>Miyashiro Imóveis • CRECI 155957F</span>
            </div>
            <div class="sub-right">
              Contrato ${contract.code} • Folha ${pageNum} de ${totalPages}
            </div>
          </div>
          <div class="sub-bar"></div>
        `}

        <div class="content-body">${formatted}</div>

        <div class="footer-bar">
          <span>Documento gerado eletronicamente pelo Sistema Miyashiro Imóveis</span>
          <span>Folha ${pageNum} de ${totalPages} • Cód: ${contract.code}</span>
        </div>
      </div>
    `;
  }).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8">
      <title>Contrato ${contract.code} - Miyashiro Imóveis</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 15mm 15mm 15mm 15mm;
        }
        * { box-sizing: border-box; }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 11pt;
          line-height: 1.6;
          color: #1a1a1a;
          margin: 0;
          padding: 0;
          background: #fff;
        }
        .page-sheet {
          max-width: 800px;
          margin: 0 auto;
          padding: 10px 15px;
          display: flex;
          flex-direction: column;
          min-height: 98vh;
        }
        .break-before {
          page-break-before: always;
          break-before: page;
        }
        .first-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 12px;
        }
        .logo-box {
          display: flex;
          align-items: center;
        }
        .logo-img {
          height: 52px;
          width: auto;
          object-fit: contain;
        }
        .brand-info {
          text-align: right;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .company-title {
          font-size: 13pt;
          font-weight: 800;
          color: #00873E;
          letter-spacing: 0.5px;
        }
        .creci-title {
          font-size: 9pt;
          font-weight: 600;
          color: #333;
          margin-top: 1px;
        }
        .contact-line {
          font-size: 8pt;
          color: #666;
          margin-top: 1px;
        }
        .accent-bar {
          height: 2.5px;
          background: #00873E;
          width: 100%;
          margin-bottom: 20px;
        }
        .sub-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 8pt;
          color: #666;
          padding-bottom: 6px;
        }
        .sub-left {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
        }
        .mini-logo {
          height: 20px;
          width: auto;
          opacity: 0.85;
        }
        .sub-right {
          font-weight: 700;
        }
        .sub-bar {
          height: 1px;
          background: #ddd;
          width: 100%;
          margin-bottom: 20px;
        }
        .content-body {
          flex: 1;
          white-space: pre-line;
          text-align: justify;
          text-justify: inter-word;
        }
        .footer-bar {
          margin-top: auto;
          padding-top: 16px;
          border-top: 1px solid #ddd;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 8pt;
          color: #777;
        }
        @media print {
          body { background: transparent; }
          .page-sheet { padding: 0; min-height: auto; }
          .break-before { page-break-before: always; break-before: page; }
        }
      </style>
    </head>
    <body>
      ${pagesHtml}
      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}
