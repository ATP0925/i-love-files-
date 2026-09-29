package com.ilovefiles.servlet;

import com.ilovefiles.util.FileUtil;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;

@WebServlet("/img2pdf")
@MultipartConfig(maxFileSize = 20 * 1024 * 1024, maxRequestSize = 100 * 1024 * 1024)
public class ImageToPdfServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        List<Part> files = FileUtil.uploads(req, "files");
        if (files.isEmpty()) {
            FileUtil.fail(req, resp, "img2pdf", "Please select at least one image.");
            return;
        }
        try (PDDocument doc = new PDDocument()) {
            for (Part p : files) {
                byte[] bytes;
                try (InputStream in = p.getInputStream()) {
                    bytes = in.readAllBytes();
                }
                PDImageXObject img = PDImageXObject.createFromByteArray(doc, bytes, p.getSubmittedFileName());

                PDPage page = new PDPage(PDRectangle.A4);
                doc.addPage(page);

                float margin = 30f;
                float maxW = page.getMediaBox().getWidth() - 2 * margin;
                float maxH = page.getMediaBox().getHeight() - 2 * margin;
                float scale = Math.min(maxW / img.getWidth(), maxH / img.getHeight());
                float w = img.getWidth() * scale;
                float h = img.getHeight() * scale;
                float x = (page.getMediaBox().getWidth() - w) / 2;
                float y = (page.getMediaBox().getHeight() - h) / 2;

                try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                    cs.drawImage(img, x, y, w, h);
                }
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            doc.save(out);
            FileUtil.send(resp, out.toByteArray(), "images.pdf", "application/pdf");
        } catch (Exception e) {
            FileUtil.fail(req, resp, "img2pdf", "Could not convert. Use JPG or PNG images.");
        }
    }
}
