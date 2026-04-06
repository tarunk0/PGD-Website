# PGD — Pandra Global Dynamics Pvt Ltd
## Flask Website – Local Setup Guide

---

### STEP 1 — Prerequisites
Make sure you have Python 3.8+ installed.
Check with: `python --version`  or  `python3 --version`

---

### STEP 2 — Create a Virtual Environment

**Windows:**
```
cd pgd
python -m venv venv
venv\Scripts\activate
```

**Mac / Linux:**
```
cd pgd
python3 -m venv venv
source venv/bin/activate
```

You'll see `(venv)` appear at the start of your terminal prompt.

---

### STEP 3 — Install Dependencies

With the venv active, run:
```
pip install -r requirements.txt
```

---

### STEP 4 — Run the App

```
python app.py
```

Then open your browser and go to:
👉  http://127.0.0.1:5000

---

### STEP 5 — Stop the Server
Press `Ctrl + C` in your terminal.

---

### STEP 6 — Deactivate the Virtual Environment (when done)
```
deactivate
```

---

### Project Structure
```
pgd/
├── app.py                  ← Flask app + routes
├── requirements.txt        ← Python dependencies
├── README.md
├── templates/
│   ├── index.html          ← Homepage
│   └── catalog.html        ← Full product catalog
└── static/
    ├── css/
    │   └── style.css       ← All styles
    └── js/
        └── main.js         ← Scroll, animations, API calls
```

---

### Pages
- `/`         → Homepage (Hero, Heritage, Products, Map, Contact)
- `/catalog`  → Full product catalog with filter
- `/api/shipment-count` → Live shipment count (JSON)
