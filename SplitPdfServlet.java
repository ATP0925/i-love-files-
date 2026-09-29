package com.ilovefiles.servlet;

import com.ilovefiles.util.FileUtil;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;
import org.apache.pdfbox.multipdf.Splitter;
import org.apache.pdfbox.pdmodel.PDDocument;

@WebServlet("/split")
@MultipartConfig(maxFileSize = 50 * 1024 * 1024, maxRequestSize = 60 * 1024 * 1024)
public class SplitPdfServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        List<Part> files = FileUtil.uploads(req, "files");
        if (files.isEmpty()) {
            FileUtil.fail(req, resp, "split", "Please select a PDF file.");
            return;
        }
        Part file = files.get(0);
        String range = req.getParameter("range");

        try (PDDocument doc = PDDocument.load(file.getInputStream())) {
            if (range == null || range.trim().isEmpty()) {
                // Split every page into its own PDF and return a ZIP
                List<PDDocument> pages = new Splitter().split(doc);
                ByteArrayOutputStream zipBytes = new ByteArrayOutputStream();
                try (ZipOutputStream zip = new ZipOutputStream(zipBytes)) {
                    int n = 1;
                    for (PDDocument page : pages) {
                        ByteArrayOutputStream one = new ByteArrayOutputStream();
                        page.save(one);
                        page.close();
                        zip.putNextEntry(new ZipEntry("page-" + n++ + ".pdf"));
                        zip.write(one.toByteArray());
                        zip.closeEntry();
                    }
                }
                FileUtil.send(resp, zipBytes.toByteArray(),
                        FileUtil.baseName(file) + "_pages.zip", "application/zip");
            } else {
                // Extract selected pages such as "1-3,5"
                List<Integer> idx = parseRange(range, doc.getNumberOfPages());
                if (idx == null || idx.isEmpty()) {
                    FileUtil.fail(req, resp, "split",
                            "Invalid range. Example: 1-3,5 (PDF has " + doc.getNumberOfPages() + " pages).");
                    return;
                }
                try (PDDocument out = new PDDocument()) {
                    for (int i : idx) {
                        out.importPage(doc.getPage(i));
                    }
                    ByteArrayOutputStream bytes = new ByteArrayOutputStream();
                    out.save(bytes);
                    FileUtil.send(resp, bytes.toByteArray(),
                            FileUtil.baseName(file) + "_extract.pdf", "application/pdf");
                }
            }
        } catch (Exception e) {
            FileUtil.fail(req, resp, "split", "Could not read the PDF. Is it a valid, unlocked file?");
        }
    }

    /** "1-3,5" -> [0,1,2,4] (zero-based). Returns null if invalid. */
    private List<Integer> parseRange(String text, int totalPages) {
        List<Integer> result = new ArrayList<>();
        try {
            for (String part : text.split(",")) {
                part = part.trim();
                if (part.contains("-")) {
                    String[] ab = part.split("-");
                    int from = Integer.parseInt(ab[0].trim());
                    int to = Integer.parseInt(ab[1].trim());
                    if (from < 1 || to > totalPages || from > to) return null;
                    for (int p = from; p <= to; p++) result.add(p - 1);
                } else {
                    int p = Integer.parseInt(part);
                    if (p < 1 || p > totalPages) return null;
                    result.add(p - 1);
                }
            }
        } catch (Exception e) {
            return null;
        }
        return result;
    }
}
