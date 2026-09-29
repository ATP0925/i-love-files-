/* Shared header and footer */
(function () {
  var header =
    '<header class="nav">' +
    '<a class="logo" href="index.html">&#9829; I Love Files</a>' +
    '<nav>' +
    '<a href="tool.html?tool=merge">Merge</a>' +
    '<a href="tool.html?tool=split">Split</a>' +
    '<a href="tool.html?tool=compress">Compress</a>' +
    '<a href="tool.html?tool=img2pdf">Image to PDF</a>' +
    '</nav></header>';
  var footer =
    '<footer class="foot">' +
    '<p>&copy; 2026 I Love Files. Open source under the MIT License.</p>' +
    '<p><a href="terms.html">Terms &amp; Privacy</a></p>' +
    '</footer>';
  document.body.insertAdjacentHTML('afterbegin', header);
  document.body.insertAdjacentHTML('beforeend', footer);
})();
