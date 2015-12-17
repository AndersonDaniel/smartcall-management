import SimpleHTTPServer, SocketServer

httpd = SocketServer.TCPServer(("", 8080), SimpleHTTPServer.SimpleHTTPRequestHandler)

httpd.serve_forever()