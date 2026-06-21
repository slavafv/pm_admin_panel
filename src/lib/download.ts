/** Escape a string for a PDF literal string. Strips non-ASCII for byte-safety. */
function pdfEscape(s: string): string {
  return s
    .replace(/[^\x20-\x7E]/g, '') // keep printable ASCII (offsets == byte length)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

/** Build a minimal, valid single-page PDF (Helvetica) from a title + text lines. */
export function buildSimplePdf(title: string, lines: string[]): Blob {
  const parts: string[] = ['BT', '/F1 18 Tf', '50 790 Td', `(${pdfEscape(title)}) Tj`, '/F1 11 Tf', '0 -30 Td']
  lines.forEach((ln, i) => {
    if (i > 0) parts.push('0 -16 Td')
    parts.push(`(${pdfEscape(ln)}) Tj`)
  })
  parts.push('ET')
  const content = parts.join('\n')

  const objects: string[] = []
  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>'
  objects[2] = '<< /Type /Pages /Kids [3 0 R] /Count 1 >>'
  objects[3] =
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>'
  objects[4] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`
  objects[5] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'

  let pdf = '%PDF-1.4\n'
  const offsets: number[] = []
  for (let i = 1; i < objects.length; i++) {
    offsets[i] = pdf.length
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`
  }
  const xrefStart = pdf.length
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`
  for (let i = 1; i < objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
  }
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`

  return new Blob([pdf], { type: 'application/pdf' })
}

/** Build a CSV blob (opens in Excel) from rows. */
export function buildCsv(rows: (string | number)[][]): Blob {
  const body = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\r\n')
  return new Blob(['﻿' + body], { type: 'text/csv;charset=utf-8' })
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Open an HTML preview (branded) in a new tab. */
export function openHtmlPreview(html: string) {
  const w = window.open('', '_blank')
  if (w) {
    w.document.write(html)
    w.document.close()
  }
}
