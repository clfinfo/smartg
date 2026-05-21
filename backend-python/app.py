import os
import uuid
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime

# Import Configurations and Models
from config import Config
from models import db, User, Worker, Complaint, Notification

app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS for frontend integration
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialise Database and JWT
db.init_app(app)
jwt = JWTManager(app)

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# ─── Helper function for AI Detection Simulation ──────────────────────────────
def detect_issue_type_from_image(filename, provided_type=None):
    """
    AI-Based Detection simulation helper:
    Analyzes uploaded image filename or properties to classify whether it contains garbage or a pothole.
    In production, this integrates with OpenCV / TensorFlow / PyTorch custom image classifiers.
    """
    fn_lower = filename.lower()
    if 'garbage' in fn_lower or 'trash' in fn_lower or 'waste' in fn_lower or 'bin' in fn_lower:
        return "Garbage Overflow"
    elif 'pothole' in fn_lower or 'road' in fn_lower or 'crack' in fn_lower or 'street' in fn_lower:
        return "Pothole"
    elif 'drain' in fn_lower or 'water' in fn_lower or 'leak' in fn_lower:
        return "Drainage Issue"
    elif 'light' in fn_lower or 'pole' in fn_lower or 'bulb' in fn_lower:
        return "Streetlight Problem"
    
    # Fallback to provided type or heuristic default
    if provided_type and provided_type.strip():
        return provided_type.strip()
    return "Garbage Overflow" # Default automated classification fallback


# ─── 1. Authentication Endpoints ──────────────────────────────────────────────

@app.route('/register', methods=['POST'])
def register():
    """User Registration Endpoint"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Invalid request payload'}), 400
            
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role', 'citizen').lower()
        
        if not name or not email or not password:
            return jsonify({'error': 'Name, email, and password are required'}), 400
            
        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({'error': 'Email already registered'}), 409
            
        # Create secure password hash
        hashed_pw = generate_password_hash(password, method='pbkdf2:sha256')
        
        new_user = User(
            name=name,
            email=email,
            password_hash=hashed_pw,
            role=role if role in ['citizen', 'admin'] else 'citizen'
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        # Generate token right away for seamless experience
        access_token = create_access_token(identity=new_user.id)
        
        return jsonify({
            'message': 'User registered successfully',
            'token': access_token,
            'user': new_user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Server error during registration: {str(e)}'}), 500


@app.route('/login', methods=['POST'])
def login():
    """User Login Endpoint"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Invalid request payload'}), 400
            
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
            
        user = User.query.filter_by(email=email).first()
        
        if not user or not check_password_hash(user.password_hash, password):
            return jsonify({'error': 'Invalid email or password credentials'}), 401
            
        # Create JWT session token containing user identity
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': 'Login successful',
            'token': access_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Server error during login: {str(e)}'}), 500


# ─── 2. Complaint Upload & Citizen Endpoints ──────────────────────────────────

@app.route('/upload-report', methods=['POST'])
@jwt_required()
def upload_report():
    """
    Upload Complaint Endpoint supporting text form payload along with an uploaded image.
    Uses AI heuristic detection to verify or classify issue automatically.
    """
    try:
        current_user_id = get_jwt_identity()
        
        # Parse standard Form Data payload
        provided_type = request.form.get('type', '')
        description = request.form.get('description', '')
        severity = request.form.get('severity', 'Medium')
        district = request.form.get('district', 'Bengaluru Urban')
        location_str = request.form.get('location_str', '')
        
        # Parse coordinates safely
        try:
            loc_lat = float(request.form.get('location_lat')) if request.form.get('location_lat') else None
            loc_lng = float(request.form.get('location_lng')) if request.form.get('location_lng') else None
        except ValueError:
            loc_lat, loc_lng = None, None

        # Secure Image Handling
        image_url_path = None
        detected_issue_type = provided_type or "Unknown Civic Issue"
        
        if 'image' in request.files:
            file = request.files['image']
            if file and file.filename != '' and allowed_file(file.filename):
                # Generate robust collision-free filename
                ext = file.filename.rsplit('.', 1)[1].lower()
                unique_filename = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
                save_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
                file.save(save_path)
                
                # Image relative access route
                image_url_path = f"/static/uploads/{unique_filename}"
                
                # Apply automated AI-Based detection
                detected_issue_type = detect_issue_type_from_image(file.filename, provided_type)
        else:
            # Check if JSON string payload was sent alternatively
            if request.is_json:
                json_data = request.get_json()
                detected_issue_type = json_data.get('type', detected_issue_type)
                description = json_data.get('description', description)
                severity = json_data.get('severity', severity)
                district = json_data.get('district', district)
                location_str = json_data.get('location_str', location_str)
                loc_lat = json_data.get('location_lat', loc_lat)
                loc_lng = json_data.get('location_lng', loc_lng)

        # Generate Custom Readable Complaint ID sequence
        last_complaint = Complaint.query.order_by(Complaint.id.desc()).first()
        next_seq = 1001 if not last_complaint else (last_complaint.id + 1001)
        custom_id = f"CMP-{next_seq}"
        
        new_complaint = Complaint(
            custom_id=custom_id,
            user_id=current_user_id,
            type=detected_issue_type,
            description=description,
            severity=severity,
            district=district,
            location_str=location_str,
            location_lat=loc_lat,
            location_lng=loc_lng,
            image_path=image_url_path,
            status='Pending'
        )
        
        db.session.add(new_complaint)
        db.session.commit()
        
        # Trigger initial notification alert
        notification = Notification(
            user_id=current_user_id,
            complaint_id=new_complaint.id,
            type='status',
            title='Report Filed Successfully',
            message=f'Your civic issue report ({custom_id}) classified as "{detected_issue_type}" has been received and is pending municipal verification.'
        )
        db.session.add(notification)
        db.session.commit()
        
        return jsonify({
            'message': 'Complaint uploaded successfully with automated AI classification',
            'complaint': new_complaint.to_dict(),
            'ai_detection_applied': detected_issue_type != provided_type if provided_type else True
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to process uploaded report: {str(e)}'}), 500


@app.route('/my-complaints', methods=['GET'])
@jwt_required()
def my_complaints():
    """Retrieve logged-in user's submitted complaints list"""
    try:
        current_user_id = get_jwt_identity()
        complaints = Complaint.query.filter_by(user_id=current_user_id).order_by(Complaint.created_at.desc()).all()
        return jsonify({
            'count': len(complaints),
            'complaints': [c.to_dict() for c in complaints]
        }), 200
    except Exception as e:
        return jsonify({'error': f'Error fetching user complaints: {str(e)}'}), 500


# ─── 3. Admin Dashboard APIs ──────────────────────────────────────────────────

@app.route('/all-complaints', methods=['GET'])
@jwt_required()
def all_complaints():
    """
    Admin API to view all system complaints. Supports filtering by status parameter.
    Example: /all-complaints?status=Pending
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Strictly verify admin privileges
        if not user or user.role != 'admin':
            return jsonify({'error': 'Unauthorized access. Administrator privileges required.'}), 403
            
        status_filter = request.args.get('status')
        query = Complaint.query
        
        if status_filter and status_filter.lower() != 'all':
            # Support case insensitive matching
            query = query.filter(Complaint.status.ilike(status_filter))
            
        complaints = query.order_by(Complaint.created_at.desc()).all()
        
        return jsonify({
            'total': len(complaints),
            'complaints': [c.to_dict() for c in complaints]
        }), 200
    except Exception as e:
        return jsonify({'error': f'Server error listing all complaints: {str(e)}'}), 500


@app.route('/update-status', methods=['POST'])
@jwt_required()
def update_status():
    """
    Admin API to update complaint status. Automatically emits notification event.
    Payload: {"complaint_id": 1, "status": "In Progress"}
    """
    try:
        current_user_id = get_jwt_identity()
        admin_user = User.query.get(current_user_id)
        if not admin_user or admin_user.role != 'admin':
            return jsonify({'error': 'Unauthorized access'}), 403
            
        data = request.get_json()
        complaint_id = data.get('complaint_id')
        custom_id = data.get('custom_id') # supports finding by standard custom ID sequence alternatively
        new_status = data.get('status')
        
        if not new_status or new_status not in ['Pending', 'In Progress', 'Completed']:
            return jsonify({'error': 'Invalid target status specified. Must be Pending, In Progress, or Completed'}), 400
            
        if custom_id:
            complaint = Complaint.query.filter_by(custom_id=custom_id).first()
        else:
            complaint = Complaint.query.get(complaint_id)
            
        if not complaint:
            return jsonify({'error': 'Specified complaint record not found'}), 404
            
        old_status = complaint.status
        complaint.status = new_status
        db.session.commit()
        
        # Emits automated database notifications when status changes
        if old_status != new_status:
            msg = f"Your complaint ({complaint.custom_id}) regarding '{complaint.type}' has been updated to status: {new_status}."
            if new_status == 'Completed':
                msg += " Thank you for helping keep our city clean and safe!"
                
            notification = Notification(
                user_id=complaint.user_id,
                complaint_id=complaint.id,
                type='status',
                title=f'Status Update: {new_status}',
                message=msg
            )
            db.session.add(notification)
            db.session.commit()
            
        return jsonify({
            'message': 'Complaint status updated successfully',
            'complaint': complaint.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed updating complaint status: {str(e)}'}), 500


@app.route('/assign-worker', methods=['POST'])
@jwt_required()
def assign_worker():
    """Admin API to assign workers to complaints"""
    try:
        current_user_id = get_jwt_identity()
        admin_user = User.query.get(current_user_id)
        if not admin_user or admin_user.role != 'admin':
            return jsonify({'error': 'Unauthorized access'}), 403
            
        data = request.get_json()
        complaint_id = data.get('complaint_id')
        worker_id = data.get('worker_id')
        
        complaint = Complaint.query.get(complaint_id)
        worker = Worker.query.get(worker_id)
        
        if not complaint or not worker:
            return jsonify({'error': 'Complaint or target worker record not found'}), 404
            
        complaint.assigned_worker_id = worker.id
        # Set complaint state to In Progress automatically upon assignment
        if complaint.status == 'Pending':
            complaint.status = 'In Progress'
            
        worker.status = 'busy'
        db.session.commit()
        
        # Send Notification to user about assignment dispatch
        notification = Notification(
            user_id=complaint.user_id,
            complaint_id=complaint.id,
            type='update',
            title='Worker Dispatched',
            message=f"Field Team '{worker.team}' led by {worker.name} has been assigned to attend your report ({complaint.custom_id})."
        )
        db.session.add(notification)
        db.session.commit()
        
        return jsonify({
            'message': f"Worker {worker.name} assigned successfully",
            'complaint': complaint.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Assignment dispatch failed: {str(e)}'}), 500


@app.route('/delete-complaint', methods=['DELETE'])
@jwt_required()
def delete_complaint():
    """Admin API to remove fake or duplicate complaint records"""
    try:
        current_user_id = get_jwt_identity()
        admin_user = User.query.get(current_user_id)
        if not admin_user or admin_user.role != 'admin':
            return jsonify({'error': 'Unauthorized access'}), 403
            
        complaint_id = request.args.get('id') or request.get_json().get('id')
        if not complaint_id:
            return jsonify({'error': 'Complaint ID missing parameter'}), 400
            
        complaint = Complaint.query.get(complaint_id)
        if not complaint:
            return jsonify({'error': 'Target complaint not found'}), 404
            
        # Clean local image upload file reference if present safely
        if complaint.image_path and os.path.exists(os.path.join(os.path.abspath(os.path.dirname(__file__)), complaint.image_path.lstrip('/'))):
            try:
                os.remove(os.path.join(os.path.abspath(os.path.dirname(__file__)), complaint.image_path.lstrip('/')))
            except Exception:
                pass # Continue database cleanup even if local temp file purge skips
                
        db.session.delete(complaint)
        db.session.commit()
        
        return jsonify({'message': f'Complaint record ({complaint_id}) deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed removing complaint: {str(e)}'}), 500


# ─── 4. Support Endpoints & Notifications APIs ────────────────────────────────

@app.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    """Fetch notifications for the logged in user session"""
    try:
        current_user_id = get_jwt_identity()
        notifs = Notification.query.filter_by(user_id=current_user_id).order_by(Notification.created_at.desc()).all()
        return jsonify({'notifications': [n.to_dict() for n in notifs]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/workers', methods=['GET'])
def get_workers():
    """Public helper API listing active municipal workers/teams"""
    try:
        workers = Worker.query.all()
        return jsonify({'workers': [w.to_dict() for w in workers]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Static mapping helper to serve local uploaded images easily
@app.route('/static/uploads/<filename>')
def serve_uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


# ─── Database Seeding helper executed during start ────────────────────────────
def seed_initial_records():
    """Seeds default standard users (citizen & admin) along with workers automatically"""
    with app.app_context():
        db.create_all()
        
        # Check if users table is completely empty
        if not User.query.first():
            print("🚀 Seeding initial standard users (citizen & admin)...")
            hashed_cit = generate_password_hash("demo1234", method='pbkdf2:sha256')
            hashed_adm = generate_password_hash("admin1234", method='pbkdf2:sha256')
            
            cit_user = User(name="Rahul Sharma", email="citizen@karnataka.gov.in", password_hash=hashed_cit, role="citizen")
            adm_user = User(name="Admin Kumar", email="admin@karnataka.gov.in", password_hash=hashed_adm, role="admin")
            db.session.add_all([cit_user, adm_user])
            db.session.commit()
            
        # Seed initial Active municipal workers if empty
        if not Worker.query.first():
            print("👷 Seeding active municipal field workers...")
            workers = [
                Worker(name="Ramesh Hegde", team="Team Alpha", role="Field Supervisor", status="active", district="Bengaluru Urban"),
                Worker(name="Gopal Nayak", team="Team Beta", role="Sanitation Worker", status="active", district="Mysuru"),
                Worker(name="Shiva Kumar", team="Team Gamma", role="Plumber", status="busy", district="Mangaluru"),
                Worker(name="Anand Patil", team="Team Delta", role="Electrician", status="active", district="Hubballi-Dharwad")
            ]
            db.session.add_all(workers)
            db.session.commit()
            print("✅ Database prepared successfully out-of-the-box!")


if __name__ == '__main__':
    seed_initial_records()
    print(f"🗺️ Maps integration configured with Key: {app.config['MAPS_API_KEY'][:12]}...")
    app.run(host='0.0.0.0', port=5000, debug=True)
