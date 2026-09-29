/* Tool page controller: tool.html?tool=merge|split|compress|img2pdf */
(function () {
  var $ = function (id) { return document.getElementById(id); };

  var TOOLS = {
    merge: {
      title: 'Merge PDF', desc: 'Select two or more PDF files. Use the arrows to set the order.',
      accept: '.pdf,application/pdf', multiple: true, options: '',
      run: function (f) { return ILF.mergePdf(f); }
    },
    split: {
      title: 'Split PDF', desc: 'Enter pages like 1-3,5 to extract them, or leave empty to split every page into a ZIP.',
      accept: '.pdf,application/pdf', multiple: false,
      options: '<label>Pages (optional)<input type="text" id="range" placeholder="e.g. 1-3,5"></label>',
      run: function (f) { return ILF.splitPdf(f, { range: $('range').value }); }
    },
    compress: {
      title: 'Compress Image', desc: 'Upload a JPG or PNG and choose the quality. Lower quality means a smaller file.',
      accept: 'image/*', multiple: false,
      options: '<label>Quality: <span id="qv">60</span>%<input type="range" id="quality" min="10" max="90" value="60"></label>',
      run: function (f) { return ILF.compressImage(f, { quality: $('quality').value }); }
    },
    img2pdf: {
      title: 'Image to PDF', desc: 'Select one or more images. Each image becomes one page. Use the arrows to set the order.',
      accept: 'image/*', multiple: true, options: '',
      run: function (f) { return ILF.imagesToPdf(f); }
    }
  };

  var key = new URLSearchParams(location.search).get('tool');
  if (!TOOLS[key]) key = 'merge';
  var tool = TOOLS[key];
  var files = [];

  document.title = tool.title + ' \u2013 I Love Files';
  $('title').textContent = tool.title;
  $('desc').textContent = tool.desc;
  $('options').innerHTML = tool.options;
  $('run').textContent = tool.title;
  var input = $('file');
  input.accept = tool.accept;
  input.multiple = tool.multiple;
  if ($('quality')) $('quality').oninput = function () { $('qv').textContent = this.value; };

  function show(id, text) { var el = $(id); el.textContent = text; el.hidden = false; }
  function clearMsg() { $('error').hidden = true; $('ok').hidden = true; }

  function render() {
    var list = $('list');
    list.innerHTML = '';
    files.forEach(function (f, i) {
      var li = document.createElement('li');
      var span = document.createElement('span');
      span.textContent = f.name + ' (' + ILF.fmtSize(f.size) + ')';
      li.appendChild(span);
      var box = document.createElement('div');
      function btn(label, title, fn, disabled) {
        var b = document.createElement('button');
        b.type = 'button'; b.textContent = label; b.title = title; b.disabled = !!disabled;
        b.onclick = fn; box.appendChild(b);
      }
      if (tool.multiple) {
        btn('\u2191', 'Move up', function () { files.splice(i - 1, 0, files.splice(i, 1)[0]); render(); }, i === 0);
        btn('\u2193', 'Move down', function () { files.splice(i + 1, 0, files.splice(i, 1)[0]); render(); }, i === files.length - 1);
      }
      btn('\u2715', 'Remove', function () { files.splice(i, 1); render(); });
      li.appendChild(box);
      list.appendChild(li);
    });
  }

  function addFiles(fileList) {
    var arr = Array.prototype.slice.call(fileList);
    if (!arr.length) return;
    files = tool.multiple ? files.concat(arr) : [arr[0]];
    clearMsg();
    render();
  }

  input.onchange = function () { addFiles(input.files); input.value = ''; };
  var drop = $('drop');
  drop.ondragover = function (e) { e.preventDefault(); drop.classList.add('over'); };
  drop.ondragleave = function () { drop.classList.remove('over'); };
  drop.ondrop = function (e) { e.preventDefault(); drop.classList.remove('over'); addFiles(e.dataTransfer.files); };

  $('run').onclick = async function () {
    clearMsg();
    var btn = $('run');
    btn.disabled = true;
    var label = btn.textContent;
    btn.textContent = 'Processing...';
    try {
      var res = await tool.run(files);
      var a = document.createElement('a');
      a.href = URL.createObjectURL(res.blob);
      a.download = res.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 10000);
      show('ok', 'Done! ' + (res.note || '') + ' Your download has started.');
    } catch (e) {
      show('error', e.message || 'Something went wrong.');
    }
    btn.disabled = false;
    btn.textContent = label;
  };
})();
