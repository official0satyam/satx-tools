# -*- coding: utf-8 -*-
"""
SatX Tools - Local Live Preview Server
This script compiles the static website and starts a local server.
It automatically opens the site in your default browser and displays your local IP 
so you can test it on your mobile phone on the same Wi-Fi network.
"""

import os
import sys
import socket
import webbrowser
import subprocess
import http.server
import socketserver

def get_local_ip():
    """Retrieves the local network IP address of the computer."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        # We don't actually connect to 8.8.8.8, we just use it to determine local routing interface
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def compile_website():
    """Runs the node build script to compile the website."""
    print("Compiling website templates and content...")
    if not os.path.exists("build.js"):
        print("[ERROR] build.js not found in current directory.")
        sys.exit(1)
    
    try:
        # Run node build.js in the background/foreground synchronously
        subprocess.run(["node", "build.js"], check=True)
        print("[SUCCESS] Website compiled successfully.")
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] Error compiling website during node build: {e}")
        sys.exit(1)
    except FileNotFoundError:
        print("[ERROR] Node.js is not installed or not in system PATH. Cannot run build.js.")
        sys.exit(1)

def main():
    # 1. Compile the static site before launching the server
    compile_website()

    # 2. Check if dist directory exists
    if not os.path.exists("dist"):
        print("[ERROR] dist output directory was not created. Compilation failed.")
        sys.exit(1)

    # 3. Change directory to dist so we serve compiled static output
    os.chdir("dist")

    PORT = 5500
    local_ip = get_local_ip()

    class QuietHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
        """Standard HTTP server handler that silences request logs for a cleaner terminal."""
        def log_message(self, format, *args):
            # Suppress normal requests log to keep terminal clean
            pass

    # Enable port reuse to avoid address already in use errors
    socketserver.TCPServer.allow_reuse_address = True

    server_started = False
    for attempt_port in range(PORT, PORT + 10):
        try:
            httpd = socketserver.TCPServer(("", attempt_port), QuietHTTPRequestHandler)
            PORT = attempt_port
            server_started = True
            break
        except (OSError, PermissionError):
            continue

    if not server_started:
        print(f"[ERROR] Could not start server. Ports {PORT} through {PORT+9} are all in use.")
        sys.exit(1)

    try:
        with httpd:
            print("\n" + "="*55)
            print("   SATX TOOLS LOCAL LIVE PREVIEW IS ONLINE!")
            print("="*55)
            print(f"   Local Browser preview:  http://localhost:{PORT}")
            print(f"   Mobile WiFi preview:    http://{local_ip}:{PORT}")
            print("="*55)
            print("   Press Ctrl+C in this window to stop the server.\n")

            # Open default browser automatically
            webbrowser.open(f"http://localhost:{PORT}")

            # Serve files forever
            httpd.serve_forever()

    except KeyboardInterrupt:
        print("\n   Server stopped. Goodbye!")
    except Exception as e:
        print(f"[ERROR] Error starting server: {e}")

if __name__ == "__main__":
    main()
