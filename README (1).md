# I Love Files (Java Servlet + JSP mini project)

Online file tools: Merge PDF, Split PDF, Compress Image, Image to PDF.

## Run
1. Install JDK 11+, Maven, and Apache Tomcat 9.
2. In this folder: `mvn clean package`
3. Copy `target/ilovefiles.war` to Tomcat's `webapps/` folder and start Tomcat.
4. Open http://localhost:8080/ilovefiles/

## Eclipse / NetBeans
Import as "Existing Maven Project", add Tomcat 9 as the server, Run on Server.

## Tomcat 10+
Change the servlet dependency to `jakarta.servlet:jakarta.servlet-api:5.0.0`
and replace `javax.servlet` with `jakarta.servlet` in all Java files.

## Structure
- servlet/  one servlet per tool (@WebServlet + @MultipartConfig)
- util/     FileUtil (download, upload, error helpers)
- webapp/   index.jsp, tool.jsp, terms.jsp, includes/, css/
