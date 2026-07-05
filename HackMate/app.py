import os
from flask import Flask, render_template, redirect, url_for
from flask_login import LoginManager, UserMixin, current_user, login_required
from config import Config
from db import query_db

app = Flask(__name__)
app.config.from_object(Config)

# Create upload folder directory if it does not exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize Login Manager
login_manager = LoginManager()
login_manager.login_view = 'auth.login'
login_manager.login_message_category = 'info'
login_manager.init_app(app)

# User class representing authenticated user session
class User(UserMixin):
    def __init__(self, id, name, email):
        self.id = id
        self.name = name
        self.email = email

@login_manager.user_loader
def load_user(user_id):
    """Loads user from SQL database for Flask-Login session management."""
    row = query_db("SELECT id, name, email FROM users WHERE id = %s", (int(user_id),), one=True)
    if row:
        return User(row['id'], row['name'], row['email'])
    return None

# Context processor to inject helper variables into templates globally
@app.context_processor
def inject_user_profile():
    if current_user.is_authenticated:
        profile = query_db("SELECT * FROM profiles WHERE user_id = %s", (current_user.id,), one=True)
        return dict(current_user_profile=profile)
    return dict(current_user_profile=None)

# ----------------- Root / Landing Route -----------------
@app.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    return render_template('auth/login.html')

# ----------------- Dashboard Route -----------------
@app.route('/dashboard')
@login_required
def dashboard():
    # 1. Profile
    profile = query_db("SELECT * FROM profiles WHERE user_id = %s", (current_user.id,), one=True)

    # 2. Skills
    skills_rows = query_db("SELECT skill_name FROM skills WHERE user_id = %s", (current_user.id,))
    skills = [s['skill_name'] for s in skills_rows] if skills_rows else []

    # 3. ALL teams the user is in (multi-team support)
    my_teams = query_db("""
        SELECT t.id, t.name, t.description, t.hackathon_name, t.start_date, t.end_date,
               t.status, tm.role
        FROM teams t
        JOIN team_members tm ON t.id = tm.team_id
        WHERE tm.user_id = %s
        ORDER BY t.id DESC
    """, (current_user.id,))
    my_teams = my_teams or []

    # 4. Pending team-to-student invitations for this user (regardless of team membership)
    pending_invitations = query_db("""
        SELECT i.id, t.name as team_name, t.id as team_id,
               u.name as sender_name, i.type, i.status
        FROM invitations i
        JOIN teams t ON i.team_id = t.id
        JOIN users u ON i.sender_id = u.id
        WHERE i.receiver_id = %s AND i.status = 'pending' AND i.type = 'team_to_student'
    """, (current_user.id,))

    # 5. Pending student_to_team join requests sent by this user
    sent_requests = query_db("""
        SELECT i.id, t.name as team_name, i.status
        FROM invitations i
        JOIN teams t ON i.team_id = t.id
        WHERE i.sender_id = %s AND i.status = 'pending' AND i.type = 'student_to_team'
    """, (current_user.id,))

    # 6. Suggested Teammates — available students not in any of user's teams
    user_team_ids = [t['id'] for t in my_teams]
    exclude_clause = ''
    exclude_args   = [current_user.id]
    if user_team_ids:
        placeholders = ','.join(['%s'] * len(user_team_ids))
        exclude_clause = f"""
            AND u.id NOT IN (
                SELECT user_id FROM team_members WHERE team_id IN ({placeholders})
            )
        """
        exclude_args += user_team_ids

    suggested_teammates = query_db(f"""
        SELECT u.id, u.name, p.role, p.college, p.availability, p.photo
        FROM users u
        JOIN profiles p ON u.id = p.user_id
        WHERE u.id != %s AND p.availability = 'Available'
        {exclude_clause}
        LIMIT 3
    """, tuple(exclude_args))

    # 7. Recruiting teams user is NOT already in
    exclude_clause2 = ''
    exclude_args2   = []
    if user_team_ids:
        placeholders = ','.join(['%s'] * len(user_team_ids))
        exclude_clause2 = f"AND t.id NOT IN ({placeholders})"
        exclude_args2   = user_team_ids

    recruiting_teams = query_db(f"""
        SELECT t.id, t.name, t.description, t.hackathon_name, t.start_date, t.end_date,
               u.name as creator_name
        FROM teams t
        JOIN users u ON t.creator_id = u.id
        WHERE t.status = 'recruiting' {exclude_clause2}
        LIMIT 3
    """, tuple(exclude_args2))

    return render_template(
        'dashboard.html',
        profile=profile,
        skills=skills,
        my_teams=my_teams,
        pending_invitations=pending_invitations or [],
        sent_requests=sent_requests or [],
        suggested_teammates=suggested_teammates or [],
        recruiting_teams=recruiting_teams or []
    )

# ----------------- Register Blueprints -----------------
from routes.auth import auth_bp
from routes.profile import profile_bp
from routes.discover import discover_bp
from routes.teams import teams_bp
from routes.invitations import invitations_bp
from routes.feedback import feedback_bp

app.register_blueprint(auth_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(discover_bp)
app.register_blueprint(teams_bp)
app.register_blueprint(invitations_bp)
app.register_blueprint(feedback_bp)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
