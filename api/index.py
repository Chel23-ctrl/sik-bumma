import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

os.environ.setdefault("DB_NAME", "bumma_db")
os.environ.setdefault("JWT_SECRET", "bumma-mekar-sari-secret-2026")
os.environ.setdefault("ADMIN_EMAIL", "admin_bumma")
os.environ.setdefault("ADMIN_PASSWORD", "BummaMekarSari2026!")

from server import app
