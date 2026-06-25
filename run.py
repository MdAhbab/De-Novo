import subprocess
import sys
import threading
import os
import signal

def run_process(command, cwd, name):
    print(f"Starting {name} in {cwd}...")
    try:
        process = subprocess.Popen(
            command,
            cwd=cwd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            shell=True,
            creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if sys.platform == 'win32' else 0
        )
        
        for line in process.stdout:
            print(f"[{name}] {line}", end='')
            
        process.wait()
        if process.returncode != 0:
            print(f"[{name}] Process exited with code {process.returncode}")
    except Exception as e:
        print(f"[{name}] Failed to start: {e}")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.join(base_dir, "frontend")
    backend_dir = os.path.join(base_dir, "de-novo-backend")
    
    # Run backend on port 8000
    backend_cmd = f"{sys.executable} manage.py runserver 8000"
    # Run frontend
    frontend_cmd = "npm run dev"
    
    t1 = threading.Thread(target=run_process, args=(backend_cmd, backend_dir, "BACKEND"), daemon=True)
    t2 = threading.Thread(target=run_process, args=(frontend_cmd, frontend_dir, "FRONTEND"), daemon=True)
    
    t1.start()
    t2.start()
    
    print("Press Ctrl+C to stop both servers.")
    
    try:
        # Keep main thread alive to catch KeyboardInterrupt
        while True:
            t1.join(1)
            t2.join(1)
            if not t1.is_alive() and not t2.is_alive():
                break
    except KeyboardInterrupt:
        print("\nShutting down servers...")
        sys.exit(0)
