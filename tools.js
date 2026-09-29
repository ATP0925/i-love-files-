/* I Love Files - core tools. Everything runs in the browser, no server. */
(function (root) {
  'use strict';

  function baseName(f) {
    return (f.name || 'file').replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  function fmtSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  }

  /** "1-3,5" -> [0,1,2,4] (zero-based). Throws Error if invalid. */
  function parseRange(text, total) {
    const result = [];
    const bad = new Error('Invalid range. Example: 1-3,5 (this PDF has ' + total + ' pages).');
    for (let part of text.split(',')) {
      part = part.trim();
      if (!part) continue;
      const m = part.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
      if (!m) throw bad;
      const from = parseInt(m[1], 10);
      const to = m[2] ? parseInt(m[2], 10) : from;
      if (from < 1 || to > total || from > to) throw bad;
      for (let p = from; p <= to; p++) result.push(p - 1);
    }
    if (!result.length) throw bad;
    return result;
  }

  async function loadPdf(file) {
    try {
      return await PDFLib.PDFDocument.load(await file.arrayBuffer());
    } catch (e) {
      throw new Error('"' + file.name + '" could not be read. Is it a valid, unlocked PDF?');
    }
  }

  async function mergePdf(files) {
    if (files.length < 2) throw new Error('Please select at least 2 PDF files.');
    const out = await PDFLib.PDFDocument.create();
    for (const f of files) {
      const src = await loadPdf(f);
      const pages = await out.copyPages(src, src.getPageIndices());
      pages.forEach(function (p) { out.addPage(p); });
    }
    const bytes = await out.save();
    return { blob: new Blob([bytes], { type: 'application/pdf' }), name: 'merged.pdf',
             note: 'Merged ' + files.length + ' files into ' + out.getPageCount() + ' pages.' };
  }

  async function splitPdf(files, opts) {
    if (!files.length) throw new Error('Please select a PDF file.');
    const file = files[0];
    const src = await loadPdf(file);
    const total = src.getPageCount();
    const range = ((opts && opts.range) || '').trim();

    if (!range) {
      // every page -> its own PDF, returned as ZIP
      const zip = new JSZip();
      for (let i = 0; i < total; i++) {
        const one = await PDFLib.PDFDocument.create();
        const pg = await one.copyPages(src, [i]);
        one.addPage(pg[0]);
        zip.file('page-' + (i + 1) + '.pdf', await one.save());
      }
      const data = await zip.generateAsync({ type: 'uint8array' });
      return { blob: new Blob([data], { type: 'application/zip' }),
               name: baseName(file) + '_pages.zip', note: 'Split into ' + total + ' single-page PDFs.' };
    }

    const idx = parseRange(range, total);
    const out = await PDFLib.PDFDocument.create();
    const pages = await out.copyPages(src, idx);
    pages.forEach(function (p) { out.addPage(p); });
    const bytes = await out.save();
    return { blob: new Blob([bytes], { type: 'application/pdf' }),
             name: baseName(file) + '_extract.pdf', note: 'Extracted ' + idx.length + ' page(s).' };
  }

  // ---- image helpers (browser only) ----
  function loadImage(file) {
    return new Promise(function (resolve, reject) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = function () { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('"' + file.name + '" is not a supported image.')); };
      img.src = url;
    });
  }

  function canvasBlob(canvas, type, quality) {
    return new Promise(function (resolve) { canvas.toBlob(resolve, type, quality); });
  }

  function drawToCanvas(img, whiteBg) {
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    if (whiteBg) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); }
    ctx.drawImage(img, 0, 0);
    return c;
  }

  async function compressImage(files, opts) {
    if (!files.length) throw new Error('Please select an image (JPG or PNG).');
    const file = files[0];
    let q = parseInt(opts && opts.quality, 10);
    if (isNaN(q)) q = 60;
    q = Math.max(10, Math.min(90, q));
    const img = await loadImage(file);
    const blob = await canvasBlob(drawToCanvas(img, true), 'image/jpeg', q / 100);
    return { blob: blob, name: baseName(file) + '_compressed.jpg',
             note: 'Size: ' + fmtSize(file.size) + ' \u2192 ' + fmtSize(blob.size) };
  }

  async function imagesToPdf(files) {
    if (!files.length) throw new Error('Please select at least one image.');
    const pdf = await PDFLib.PDFDocument.create();
    const A4 = [595.28, 841.89], margin = 30;
    for (const f of files) {
      const type = (f.type || '').toLowerCase();
      const name = (f.name || '').toLowerCase();
      let img;
      if (type === 'image/png' || name.endsWith('.png')) {
        img = await pdf.embedPng(new Uint8Array(await f.arrayBuffer()));
      } else if (type === 'image/jpeg' || /\.jpe?g$/.test(name)) {
        img = await pdf.embedJpg(new Uint8Array(await f.arrayBuffer()));
      } else {
        // other formats (e.g. WebP): convert through a canvas
        const el = await loadImage(f);
        const png = await canvasBlob(drawToCanvas(el, false), 'image/png');
        img = await pdf.embedPng(new Uint8Array(await png.arrayBuffer()));
      }
      const page = pdf.addPage(A4);
      const scale = Math.min((A4[0] - 2 * margin) / img.width, (A4[1] - 2 * margin) / img.height);
      const w = img.width * scale, h = img.height * scale;
      page.drawImage(img, { x: (A4[0] - w) / 2, y: (A4[1] - h) / 2, width: w, height: h });
    }
    const bytes = await pdf.save();
    return { blob: new Blob([bytes], { type: 'application/pdf' }), name: 'images.pdf',
             note: 'Created a PDF with ' + files.length + ' page(s).' };
  }

  const api = { mergePdf: mergePdf, splitPdf: splitPdf, compressImage: compressImage,
                imagesToPdf: imagesToPdf, parseRange: parseRange, fmtSize: fmtSize };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ILF = api;
})(typeof window !== 'undefined' ? window : globalThis);
