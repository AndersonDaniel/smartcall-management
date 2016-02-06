import http.server, socketserver

server_address = ('', 8000)
httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)
httpd.serve_forever()