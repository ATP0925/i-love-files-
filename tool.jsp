<%
  String tool = request.getParameter("tool");
  if (tool == null) tool = "merge";
  String title, desc, accept, action;
  boolean multiple;
  switch (tool) {
    case "split":
      title = "Split PDF"; desc = "Enter pages like 1-3,5 to extract them, or leave empty to split every page into a ZIP.";
      accept = ".pdf"; action = "split"; multiple = false; break;
    case "compress":
      title = "Compress Image"; desc = "Upload a JPG or PNG and choose the quality level.";
      accept = ".jpg,.jpeg,.png"; action = "compress"; multiple = false; break;
    case "img2pdf":
      title = "Image to PDF"; desc = "Select one or more images. Each image becomes one page.";
      accept = ".jpg,.jpeg,.png"; action = "img2pdf"; multiple = true; break;
    default:
      tool = "merge";
      title = "Merge PDF"; desc = "Select two or more PDF files. They are merged in the order selected.";
      accept = ".pdf"; action = "merge"; multiple = true; break;
  }
  String error = (String) request.getAttribute("error");
%>
<%@ include file="includes/header.jspf" %>
<main class="tool">
  <h1><%= title %></h1>
  <p class="muted"><%= desc %></p>

  <% if (error != null) { %>
    <div class="error"><%= error %></div>
  <% } %>

  <form action="<%= request.getContextPath() %>/<%= action %>" method="post" enctype="multipart/form-data" class="box">
    <input type="file" name="files" accept="<%= accept %>" <%= multiple ? "multiple" : "" %> required>

    <% if (tool.equals("split")) { %>
      <label>Pages (optional)
        <input type="text" name="range" placeholder="e.g. 1-3,5">
      </label>
    <% } %>

    <% if (tool.equals("compress")) { %>
      <label>Quality: <span id="q">60</span>%
        <input type="range" name="quality" min="10" max="90" value="60"
               oninput="document.getElementById('q').textContent = this.value">
      </label>
    <% } %>

    <button type="submit" class="btn"><%= title %></button>
  </form>
  <p class="muted small">Your files are processed in memory and are never stored on the server.</p>
</main>
<%@ include file="includes/footer.jspf" %>
