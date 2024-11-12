# Hosts shaders on localhost, to allow hot-reloading them from wasm.
# Now it saves scenes too.

SHADER_PATH = 'dependencies/wgleng/src/wgleng/rendering/shaders'
SCENES_PATH = 'src/scenes'

import os
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse

dirname = os.path.dirname(__file__)

def new_path(parsed_path):
    path_parts: list[str] = parsed_path.path.split('/')
    if len(path_parts) > 2 and path_parts[1] == 'rendering' and path_parts[2] == 'shaders':
        path_parts.pop(0)
        path_parts.pop(0)
        path_parts.pop(0)
        path_parts.insert(0, SHADER_PATH)
    elif len(path_parts) > 2 and path_parts[1] == 'scenes':
        path_parts.pop(0)
        path_parts.pop(0)
        path_parts.insert(0, SCENES_PATH)
    return '/'.join(path_parts)

class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        return super(CORSRequestHandler, self).end_headers()
    
    def do_GET(self):
        filePath = new_path(urlparse(self.path))
        filePath = os.path.join(dirname, filePath)
        try:
            f = open(filePath, 'rb')
            self.send_response(200)
            self.end_headers()
            self.wfile.write(f.read())
        except Exception as er:
            print(er)
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'File not found')

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_body = self.rfile.read(content_length)
        
        # Parse the URL and extract the name
        parsed_path = urlparse(self.path)
        path_parts = parsed_path.path.split('/')
        if len(path_parts) > 2 and path_parts[1] == 'SaveScene':
            scene_name = path_parts[2]
        else:
            scene_name = 'Unknown'

        file_data = post_body.decode('utf-8')
        with open(os.path.join(dirname, f'{SCENES_PATH}/{scene_name}.h'), 'w') as f:
            f.write(file_data)

        self.send_response(200)
        self.end_headers()

httpd = HTTPServer(('localhost', 8000), CORSRequestHandler)
httpd.serve_forever()