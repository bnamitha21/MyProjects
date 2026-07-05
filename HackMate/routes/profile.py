import os
from flask import Blueprint, render_template, redirect, url_for, request, flash
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
from db import query_db
from config import Config

profile_bp = Blueprint('profile', __name__, url_prefix='/profile')

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

@profile_bp.route('/<int:user_id>')
@login_required
def view_profile(user_id):
    # Fetch user base data
    user = query_db("SELECT id, name, email FROM users WHERE id = %s", (user_id,), one=True)
    if not user:
        flash("User not found.", "danger")
        return redirect(url_for('dashboard'))

    # Fetch profile details
    profile = query_db("SELECT * FROM profiles WHERE user_id = %s", (user_id,), one=True)
    
    # Fetch skills and interests
    skills_rows = query_db("SELECT skill_name FROM skills WHERE user_id = %s", (user_id,))
    skills = [s['skill_name'] for s in skills_rows] if skills_rows else []
    
    interests_rows = query_db("SELECT interest_name FROM interests WHERE user_id = %s", (user_id,))
    interests = [i['interest_name'] for i in interests_rows] if interests_rows else []
    
    # Fetch projects
    projects = query_db("SELECT title, description, repo_link FROM projects WHERE user_id = %s", (user_id,))
    
    # Fetch rating statistics
    rating_stats = query_db(
        "SELECT AVG(rating) as avg_rating, COUNT(rating) as total_reviews FROM feedback WHERE reviewee_id = %s", 
        (user_id,), 
        one=True
    )
    
    # Fetch feedback comments
    reviews = query_db(
        """
        SELECT f.rating, f.comment, f.created_at, u.name as reviewer_name 
        FROM feedback f 
        JOIN users u ON f.reviewer_id = u.id 
        WHERE f.reviewee_id = %s 
        ORDER BY f.created_at DESC
        """, (user_id,)
    )

    # Check if current user is team creator and can invite this student
    my_team = query_db(
        "SELECT id, name FROM teams WHERE creator_id = %s AND status = 'recruiting'", 
        (current_user.id,), 
        one=True
    )
    
    is_member = False
    pending_invite = None
    
    if my_team:
        # Check if student is already in team
        member_check = query_db(
            "SELECT 1 FROM team_members WHERE team_id = %s AND user_id = %s", 
            (my_team['id'], user_id), 
            one=True
        )
        is_member = bool(member_check)
        
        # Check if any invite is pending
        pending_invite = query_db(
            """
            SELECT id, sender_id, receiver_id, type FROM invitations 
            WHERE team_id = %s AND (receiver_id = %s OR sender_id = %s) AND status = 'pending'
            """, (my_team['id'], user_id, user_id), 
            one=True
        )

    return render_template(
        'profile/view.html',
        user=user,
        profile=profile,
        skills=skills,
        interests=interests,
        projects=projects or [],
        rating_stats=rating_stats,
        reviews=reviews or [],
        my_team=my_team,
        is_member=is_member,
        pending_invite=pending_invite
    )

@profile_bp.route('/edit', methods=['GET', 'POST'])
@login_required
def edit_profile():
    if request.method == 'POST':
        college = request.form.get('college', '').strip()
        branch = request.form.get('branch', '').strip()
        year = request.form.get('year', '1')
        bio = request.form.get('bio', '').strip()
        github = request.form.get('github', '').strip()
        linkedin = request.form.get('linkedin', '').strip()
        role = request.form.get('role', 'Fullstack')
        experience = request.form.get('experience', 'Intermediate')
        availability = request.form.get('availability', 'Available')
        
        # Parse tags
        skills_str = request.form.get('skills', '')
        interests_str = request.form.get('interests', '')
        
        try:
            year_int = int(year)
        except ValueError:
            year_int = 1
            
        # File upload handling
        photo_filename = None
        if 'photo' in request.files:
            file = request.files['photo']
            if file and file.filename != '':
                if allowed_file(file.filename):
                    ext = file.filename.rsplit('.', 1)[1].lower()
                    photo_filename = f"user_{current_user.id}_avatar.{ext}"
                    filepath = os.path.join(Config.UPLOAD_FOLDER, photo_filename)
                    file.save(filepath)
                else:
                    flash("Invalid file extension. Please upload a PNG, JPG, JPEG or GIF.", "danger")
                    
        # Update Profiles Table
        if photo_filename:
            query_db(
                """
                UPDATE profiles 
                SET college=%s, branch=%s, year=%s, bio=%s, github=%s, linkedin=%s, photo=%s, role=%s, experience=%s, availability=%s 
                WHERE user_id=%s
                """, 
                (college, branch, year_int, bio, github, linkedin, photo_filename, role, experience, availability, current_user.id),
                commit=True
            )
        else:
            query_db(
                """
                UPDATE profiles 
                SET college=%s, branch=%s, year=%s, bio=%s, github=%s, linkedin=%s, role=%s, experience=%s, availability=%s 
                WHERE user_id=%s
                """, 
                (college, branch, year_int, bio, github, linkedin, role, experience, availability, current_user.id),
                commit=True
            )

        # Update Skills Table (simple remove-and-insert method)
        query_db("DELETE FROM skills WHERE user_id = %s", (current_user.id,), commit=True)
        if skills_str:
            skills_list = list(set([s.strip() for s in skills_str.split(',') if s.strip()]))
            for skill in skills_list:
                query_db("INSERT INTO skills (user_id, skill_name) VALUES (%s, %s)", (current_user.id, skill), commit=True)

        # Update Interests Table (simple remove-and-insert method)
        query_db("DELETE FROM interests WHERE user_id = %s", (current_user.id,), commit=True)
        if interests_str:
            interests_list = list(set([i.strip() for i in interests_str.split(',') if i.strip()]))
            for interest in interests_list:
                query_db("INSERT INTO interests (user_id, interest_name) VALUES (%s, %s)", (current_user.id, interest), commit=True)

        # Update Projects Table (supports up to 3 projects)
        query_db("DELETE FROM projects WHERE user_id = %s", (current_user.id,), commit=True)
        for idx in range(1, 4):
            title = request.form.get(f'proj{idx}_title', '').strip()
            desc = request.form.get(f'proj{idx}_desc', '').strip()
            link = request.form.get(f'proj{idx}_link', '').strip()
            if title:
                query_db(
                    "INSERT INTO projects (user_id, title, description, repo_link) VALUES (%s, %s, %s, %s)", 
                    (current_user.id, title, desc, link), 
                    commit=True
                )

        flash("Profile updated successfully!", "success")
        return redirect(url_for('profile.view_profile', user_id=current_user.id))

    # GET requests loading
    profile = query_db("SELECT * FROM profiles WHERE user_id = %s", (current_user.id,), one=True)
    
    # Skills and Interests tag formatting
    skills_rows = query_db("SELECT skill_name FROM skills WHERE user_id = %s", (current_user.id,))
    skills_val = ",".join([s['skill_name'] for s in skills_rows]) if skills_rows else ""
    
    interests_rows = query_db("SELECT interest_name FROM interests WHERE user_id = %s", (current_user.id,))
    interests_val = ",".join([i['interest_name'] for i in interests_rows]) if interests_rows else ""
    
    # Projects loading (pre-fill fields up to 3)
    projects = query_db("SELECT title, description, repo_link FROM projects WHERE user_id = %s LIMIT 3", (current_user.id,))
    
    # Pre-fill structure for template
    projects_list = [{}, {}, {}]
    for idx, p in enumerate(projects or []):
        if idx < 3:
            projects_list[idx] = p

    return render_template(
        'profile/edit.html',
        profile=profile,
        skills_val=skills_val,
        interests_val=interests_val,
        projects=projects_list
    )
