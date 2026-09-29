package com.ilovefiles.servlet;

import com.ilovefiles.util.FileUtil;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;
import org.apache.pdfbox.io.MemoryUsageSetting;
import org.apache.pdfbox.multipdf.PDFMergerUtility;

@WebServlet("/merge")
@MultipartConfig(maxFileSize = 50 * 1024 * 1024, maxRequestSize = 200 * 1024 * 1024)
public class MergePdfServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        List<Part> files = FileUtil.uploads(req, "files");
        if (files.size() < 2) {
            FileUtil.fail(req, resp, "merge", "Please select at least 2 PDF files.");
            return;
        }
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            PDFMergerUtility merger = new PDFMergerUtility();
            merger.setDestinationStream(out);
            for (Part p : files) {
                merger.addSource(p.getInputStream());
            }
            merger.mergeDocuments(MemoryUsageSetting.setupMainMemoryOnly());
            FileUtil.send(resp, out.toByteArray(), "merged.pdf", "application/pdf");
        } catch (Exception e) {
            FileUtil.fail(req, resp, "merge", "Could not merge. Make sure all files are valid PDFs.");
        }
    }
}
