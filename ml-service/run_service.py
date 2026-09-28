import os
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

import uvicorn

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    app_dir = os.path.join(current_dir, "app")
    sys.path.insert(0, app_dir)

    print("================================================================")
    print("Starting IntelliCare HMS - Python FastAPI ML Microservice")
    print("Listening on: http://127.0.0.1:8000")
    print("API Documentation: http://127.0.0.1:8000/docs")
    print("================================================================")

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False, app_dir=app_dir)
