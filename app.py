from flask import Flask, render_template, jsonify
import random

app = Flask(__name__)

PRODUCTS = [
    {"id": 1, "name": "Pure Copper Bottle", "category": "copper", "price": "$24.99", "purity": "99.9%", "image": "copper-bottle", "desc": "Handcrafted pure copper water bottle, traditionally forged in India."},
    {"id": 2, "name": "Copper Jug Set", "category": "copper", "price": "$49.99", "purity": "99.9%", "image": "copper-jug", "desc": "Elegant copper jug with two tumblers, ideal for ayurvedic water storage."},
    {"id": 3, "name": "Copper Plate Set", "category": "copper", "price": "$34.99", "purity": "99.5%", "image": "copper-plate", "desc": "Traditional copper dining plates with hand-embossed motifs."},
    {"id": 4, "name": "Ceramic Vase – Indigo", "category": "ceramic", "price": "$39.99", "purity": "Grade A", "image": "ceramic-vase", "desc": "Hand-painted blue pottery ceramic vase from Jaipur artisans."},
    {"id": 5, "name": "Ceramic Bowl Set", "category": "ceramic", "price": "$29.99", "purity": "Grade A", "image": "ceramic-bowl", "desc": "Artisan glazed ceramic bowls, kiln-fired with traditional techniques."},
    {"id": 6, "name": "Terracotta Planter", "category": "handicraft", "price": "$19.99", "purity": "Handmade", "image": "terracotta", "desc": "Sun-dried terracotta planter with tribal geometric carvings."},
    {"id": 7, "name": "Brass Deity Figurine", "category": "handicraft", "price": "$54.99", "purity": "Handmade", "image": "brass", "desc": "Lost-wax cast brass figurine, centuries-old Dhokra craft tradition."},
    {"id": 8, "name": "Copper Hammered Mug", "category": "copper", "price": "$18.99", "purity": "99.9%", "image": "copper-mug", "desc": "Hand-hammered copper mug with a rustic, artisanal finish."},
]

DESTINATIONS = [
    {"city": "New York", "country": "USA", "lat": 40.71, "lng": -74.00, "shipments": 1240},
    {"city": "London", "country": "UK", "lat": 51.50, "lng": -0.12, "shipments": 980},
    {"city": "Toronto", "country": "Canada", "lat": 43.65, "lng": -79.38, "shipments": 760},
    {"city": "Mexico City", "country": "Mexico", "lat": 19.43, "lng": -99.13, "shipments": 430},
    {"city": "Sydney", "country": "Australia", "lat": -33.86, "lng": 151.20, "shipments": 310},
    {"city": "Dubai", "country": "UAE", "lat": 25.20, "lng": 55.27, "shipments": 520},
]

@app.route("/")
def home():
    return render_template("index.html", products=PRODUCTS[:6], destinations=DESTINATIONS)

@app.route("/catalog")
def catalog():
    return render_template("catalog.html", products=PRODUCTS)

@app.route("/api/shipment-count")
def shipment_count():
    base = 4827
    live = base + random.randint(0, 99)
    return jsonify({"count": live, "active_routes": 6})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
