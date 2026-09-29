package com.ilovefiles.util;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;

public class FileUtil {

    /** Sends bytes to the browser as a file download. */
    public static void send(HttpServletResponse resp, byte[] data, String fileName, String mime)
            throws IOException {
        resp.setContentType(mime);
        resp.setContentLength(data.length);
        resp.setHeader("Content-Disposition", "attachment; filename=\"" + fileName + "\"");
        resp.getOutputStream().write(data);
    }

    /** Sends the user back to the tool page with an error message. */
    public static void fail(HttpServletRequest req, HttpServletResponse resp, String tool, String msg)
            throws ServletException, IOException {
        req.setAttribute("error", msg);
        req.getRequestDispatcher("/tool.jsp?tool=" + tool).forward(req, resp);
    }

    /** Returns all non-empty uploaded parts with the given field name. */
    public static List<Part> uploads(HttpServletRequest req, String field)
            throws IOException, ServletException {
        List<Part> list = new ArrayList<>();
        for (Part p : req.getParts()) {
            if (field.equals(p.getName()) && p.getSize() > 0) {
                list.add(p);
            }
        }
        return list;
    }

    /** File name without extension, safe for downloads. */
    public static String baseName(Part p) {
        String n = p.getSubmittedFileName();
        if (n == null) return "file";
        int dot = n.lastIndexOf('.');
        if (dot > 0) n = n.substring(0, dot);
        return n.replaceAll("[^a-zA-Z0-9_-]", "_");
    }
}
