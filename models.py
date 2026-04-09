from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Customer(db.Model):
    """Customer information for inquiries"""
    __tablename__ = 'customers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True)
    phone = db.Column(db.String(20), nullable=True)
    country = db.Column(db.String(100), nullable=True)
    company_name = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    inquiries = db.relationship('Inquiry', backref='customer', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Customer {self.name}>'


class Product(db.Model):
    """Product catalog"""
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    price = db.Column(db.String(50), nullable=True)
    purity = db.Column(db.String(100), nullable=True)
    description = db.Column(db.Text, nullable=True)
    image = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    inquiries = db.relationship('Inquiry', backref='product', lazy=True)
    
    def __repr__(self):
        return f'<Product {self.name}>'


class Inquiry(db.Model):
    """Customer inquiries/queries"""
    __tablename__ = 'inquiries'
    
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=True)
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(50), default='new')  # new, replied, converted
    inquiry_date = db.Column(db.DateTime, default=datetime.utcnow)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    responses = db.relationship('InquiryResponse', backref='inquiry', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Inquiry {self.id} - {self.status}>'


class InquiryResponse(db.Model):
    """Responses/replies to inquiries"""
    __tablename__ = 'inquiry_responses'
    
    id = db.Column(db.Integer, primary_key=True)
    inquiry_id = db.Column(db.Integer, db.ForeignKey('inquiries.id'), nullable=False)
    response_text = db.Column(db.Text, nullable=False)
    responded_by = db.Column(db.String(255), nullable=True)
    response_channel = db.Column(db.String(50), default='email')  # email, whatsapp, phone
    response_date = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Response {self.id} via {self.response_channel}>'


class Shipment(db.Model):
    """Shipment tracking"""
    __tablename__ = 'shipments'
    
    id = db.Column(db.Integer, primary_key=True)
    inquiry_id = db.Column(db.Integer, db.ForeignKey('inquiries.id'), nullable=True)
    destination_city = db.Column(db.String(100), nullable=True)
    destination_country = db.Column(db.String(100), nullable=True)
    status = db.Column(db.String(50), default='pending')  # pending, shipped, delivered
    ship_date = db.Column(db.DateTime, nullable=True)
    estimated_delivery = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Shipment {self.id} - {self.status}>'
