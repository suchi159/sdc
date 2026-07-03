import http.server
import socketserver
import os

PORT = 3003
DIRECTORY = "/Users/suchi/Documents/Data proctor"

class CandidateHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # Serve candidate.html for the root path
        if self.path == '/':
            self.path = '/candidate.html'
            
        # Prevent directory traversal attacks
        if '..' in self.path:
            self.send_error(403, "Forbidden")
            return
            
        return super().do_GET()

    def end_headers(self):
        # Add headers similar to the original Node.js server
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Content-Security-Policy', "default-src * data: blob: 'unsafe-inline'; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';")
        super().end_headers()

if __name__ == '__main__':
    os.chdir(DIRECTORY)
    with socketserver.TCPServer(("", PORT), CandidateHandler) as httpd:
        print(f"================================================================")
        print(f"🚀 Python Candidate Module Server Started Successfully!")
        print(f"📂 Workspace Root: {DIRECTORY}")
        print(f"🔗 Local Access: http://localhost:{PORT}/")
        print(f"================================================================")
        httpd.serve_forever()
