from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='citizen') # 'citizen' or 'admin'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    complaints = db.relationship('Complaint', backref='author', lazy=True, cascade="all, delete-orphan")
    notifications = db.relationship('Notification', backref='recipient', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Worker(db.Model):
    __tablename__ = 'workers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    team = db.Column(db.String(50), nullable=False)
    role = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default='active') # 'active', 'busy', 'inactive'
    phone = db.Column(db.String(20), nullable=True)
    district = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    assigned_complaints = db.relationship('Complaint', backref='worker', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'team': self.team,
            'role': self.role,
            'status': self.status,
            'phone': self.phone,
            'district': self.district
        }


class Complaint(db.Model):
    __tablename__ = 'complaints'
    
    id = db.Column(db.Integer, primary_key=True)
    custom_id = db.Column(db.String(30), unique=True, nullable=False) # e.g. CMP-1001
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    assigned_worker_id = db.Column(db.Integer, db.ForeignKey('workers.id'), nullable=True)
    
    type = db.Column(db.String(100), nullable=False) # 'Garbage Overflow', 'Pothole', etc.
    description = db.Column(db.Text, nullable=True)
    severity = db.Column(db.String(20), default='Medium') # 'Low', 'Medium', 'High', 'Critical'
    district = db.Column(db.String(100), nullable=True)
    
    location_str = db.Column(db.String(255), nullable=True) # Text address or simple string
    location_lat = db.Column(db.Float, nullable=True)
    location_lng = db.Column(db.Float, nullable=True)
    
    image_path = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(30), default='Pending') # 'Pending', 'In Progress', 'Completed'
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'custom_id': self.custom_id,
            'user_id': self.user_id,
            'author_name': self.author.name if self.author else 'Unknown',
            'assigned_worker': self.worker.to_dict() if self.worker else None,
            'type': self.type,
            'description': self.description,
            'severity': self.severity,
            'district': self.district,
            'location_str': self.location_str,
            'location_lat': self.location_lat,
            'location_lng': self.location_lng,
            'image_path': self.image_path,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    complaint_id = db.Column(db.Integer, db.ForeignKey('complaints.id'), nullable=True)
    
    type = db.Column(db.String(30), default='status') # 'status', 'reward', 'alert'
    title = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'complaint_id': self.complaint_id,
            'type': self.type,
            'title': self.title,
            'message': self.message,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
