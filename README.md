# 🎓 EduFile Tools - Your Ultimate Education Companion

Welcome to **EduFile Tools**, a specialized platform designed for students and educators to manage their academic documents efficiently. From merging lecture notes to converting study images into PDFs, this tool is built to streamline the educational workflow.

## 🌟 Features
- **Merge PDF:** Combine multiple study guides or assignments into one document.
- **Split PDF:** Extract specific chapters or pages from a large textbook PDF.
- **Compress Image:** Reduce the size of scanned notes for easier uploading to portals.
- **Image to PDF:** Convert photos of handwritten notes or whiteboard snapshots into professional PDFs.

---

## 🚀 Beginner's Guide: How to Use

If you are new to this project or want to run it yourself, follow these simple steps:

### 1. How to Use the Website
- **Open the site:** Simply open `index.html` in any modern web browser (Chrome, Firefox, Edge).
- **Select a Tool:** On the home page, click on the tool you need (e.g., "Merge PDF").
- **Upload Files:** Choose the files from your computer.
- **Process & Download:** Click the process button and download your result. **Note:** Your files are processed locally in your browser and are never uploaded to a server, ensuring your privacy.

### 2. How to Run Locally for Development
If you want to modify the code or run it as a developer:
1. Clone this repository: `git clone https://github.com/ATP0925/i-love-files-.git`
2. Navigate to the folder: `cd i-love-files-`
3. Run a simple local server (Optional but recommended):
   - If you have Python: `python -m http.server 8000`
   - Then visit: `http://localhost:8000` in your browser.

---

## 🤖 AI Era: Future Enhancements (Roadmap)

To make this platform a true "AI-Powered Education Hub," here are the features we suggest adding:

1. **AI-Powered PDF Summarizer:** Integrate an LLM (like GPT-4 or Claude) to summarize long academic PDFs into key bullet points.
2. **OCR (Optical Character Recognition):** Use AI to convert images of handwritten notes into editable text (Word/Markdown).
3. **Smart Document Categorization:** An AI that automatically tags your uploaded files (e.g., "Maths", "History", "Assignment") based on content.
4. **AI-Chat with PDF:** A chatbot that allows students to ask questions directly to their textbook/PDF.
5. **Automated Citation Generator:** AI that reads the document and generates citations in APA, MLA, or Chicago style.

---

## 🛠️ Technical Details
- **Frontend:** HTML5, CSS3, JavaScript.
- **PDF Engine:** [pdf-lib](https://pdf-lib.js.org/) (Client-side processing).
- **Compression:** [JSZip](https://stuk.github.io/jszip/).
- **Backend (Optional):** The project includes Java Servlets and JSP for server-side deployment (requires Apache Tomcat).

## 📄 License
MIT License. See `LICENSE` for more details.
