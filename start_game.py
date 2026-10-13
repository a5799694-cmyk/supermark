"""Run this file, or double-click 启动游戏.bat on Windows. No pip packages required."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import errno
import webbrowser

class FreshFiles(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

def main():
    directory = str(Path(__file__).resolve().parent)
    server = None
    for port in range(8023, 8043):
        try:
            server = ThreadingHTTPServer(('127.0.0.1', port), partial(FreshFiles, directory=directory))
            break
        except OSError as exc:
            if exc.errno != errno.EADDRINUSE and getattr(exc, 'winerror', None) != 10048:
                raise
    if server is None:
        raise RuntimeError('Ports 8023–8042 are busy; close an old game server and try again.')
    url = f'http://127.0.0.1:{port}/'
    print(f'梦里修仙 · 三门派版 v0.2\n{url}\n保持窗口打开；Ctrl+C停止。', flush=True)
    webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()

if __name__ == '__main__':
    main()
