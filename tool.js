document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const toolId = urlParams.get('tool');

    const toolData = {
        'merge-pdf': { title: 'Merge PDF', desc: 'Combine multiple PDFs into one high-quality document.' },
        'split-pdf': { title: 'Split PDF', desc: 'Extract specific pages from your PDF files.' },
        'compress-pdf': { title: 'Compress PDF', desc: 'Reduce PDF size without losing clarity.' },
        'img-to-pdf': { title: 'Image to PDF', desc: 'Convert images/scans into professional PDFs.' },
        'compress-img': { title: 'Compress Image', desc: 'Shrink image files for easier uploading.' },
        'pdf-to-jpg': { title: 'PDF to JPG', desc: 'Extract PDF pages as high-resolution images.' },
        'rotate-pdf': { title: 'Rotate PDF', desc: 'Fix rotated scans and documents instantly.' },
        'word-to-pdf': { title: 'Word to PDF', desc: 'Convert .docx files to PDF format.' }
    };

    const currentTool = toolData[toolId] || { title: 'Tool Not Found', desc: 'Please go back and select a valid tool.' };

    document.getElementById('tool-title').innerText = currentTool.title;
    document.getElementById('tool-desc').innerText = currentTool.desc;

    const fileInput = document.getElementById('file-input');
    const fileList = document.getElementById('file-list');
    const fileListContainer = document.getElementById('file-list-container');
    const dropZone = document.getElementById('drop-zone');
    const processBtn = document.getElementById('process-btn');
    const processingState = document.getElementById('processing-state');

    fileInput.addEventListener('change', handleFiles);
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('bg-sky-500/10'); });
    dropZone.addEventListener('dragleave', () => { dropZone.classList.remove('bg-sky-500/10'); });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('bg-sky-500/10');
        handleFiles({ target: { files: e.dataTransfer.files } });
    });

    function handleFiles(e) {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        fileListContainer.classList.remove('hidden');
        dropZone.classList.add('hidden');

        fileList.innerHTML = '';
        files.forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'flex items-center justify-between p-4 glass rounded-xl';
            item.innerHTML = `
                <div class="flex items-center gap-3">
                    <i class="fas fa-file-alt text-sky-500"></i>
                    <span class="text-sm truncate max-w-[200px]">${file.name}</span>
                </div>
                <button onclick="this.parentElement.remove()" class="text-slate-500 hover:text-red-500 transition">
                    <i class="fas fa-times"></i>
                </button>
            </div>`;
            fileList.appendChild(item);
        });
    }

    processBtn.addEventListener('click', () => {
        fileListContainer.classList.add('hidden');
        processingState.classList.remove('hidden');

        // Simulate 11ZON fast processing
        setTimeout(() => {
            processingState.innerHTML = `
                <div class="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-check-circle text-5xl"></i>
                </div>
                <h3 class="text-2xl font-bold mb-2">File Processed Successfully!</h3>
                <p class="text-slate-400 mb-8">Your file is ready for download.</p>
                <a href="#" class="bg-green-500 hover:bg-green-600 px-10 py-4 rounded-2xl font-bold text-lg transition shadow-xl">
                    Download Now <i class="fas fa-download ml-2"></i>
                </a>
            </div>`;
        }, 2500);
    });
});
