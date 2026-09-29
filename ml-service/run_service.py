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

    port = int(os.environ.get("PORT", 8000))

    print("================================================================")
    print("Starting IntelliCare HMS - Python FastAPI ML Microservice")
    print(f"Listening on: http://0.0.0.0:{port}")
    print("API Documentation: /docs")
    print("================================================================")

    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False, app_dir=app_dir)
