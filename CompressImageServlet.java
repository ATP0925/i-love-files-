package com.ilovefiles.servlet;

import com.ilovefiles.util.FileUtil;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;

@WebServlet("/compress")
@MultipartConfig(maxFileSize = 20 * 1024 * 1024, maxRequestSize = 25 * 1024 * 1024)
public class CompressImageServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        List<Part> files = FileUtil.uploads(req, "files");
        if (files.isEmpty()) {
            FileUtil.fail(req, resp, "compress", "Please select an image (JPG or PNG).");
            return;
        }
        Part file = files.get(0);

        int quality = 60;
        try {
            quality = Integer.parseInt(req.getParameter("quality"));
        } catch (Exception ignored) { }
        quality = Math.max(10, Math.min(90, quality));

        try {
            BufferedImage src = ImageIO.read(file.getInputStream());
            if (src == null) {
                FileUtil.fail(req, resp, "compress", "That file is not a supported image.");
                return;
            }
            // JPEG has no transparency, so draw on a white background
            BufferedImage rgb = new BufferedImage(src.getWidth(), src.getHeight(), BufferedImage.TYPE_INT_RGB);
            Graphics2D g = rgb.createGraphics();
            g.setColor(Color.WHITE);
            g.fillRect(0, 0, rgb.getWidth(), rgb.getHeight());
            g.drawImage(src, 0, 0, null);
            g.dispose();

            ImageWriter writer = ImageIO.getImageWritersByFormatName("jpg").next();
            ImageWriteParam param = writer.getDefaultWriteParam();
            param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
            param.setCompressionQuality(quality / 100f);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            try (ImageOutputStream ios = ImageIO.createImageOutputStream(out)) {
                writer.setOutput(ios);
                writer.write(null, new IIOImage(rgb, null, null), param);
            }
            writer.dispose();

            FileUtil.send(resp, out.toByteArray(),
                    FileUtil.baseName(file) + "_compressed.jpg", "image/jpeg");
        } catch (Exception e) {
            FileUtil.fail(req, resp, "compress", "Compression failed. Try another image.");
        }
    }
}
