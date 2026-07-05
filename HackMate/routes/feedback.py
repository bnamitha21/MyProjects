from flask import Blueprint, render_template, redirect, url_for, request, flash
from flask_login import login_required, current_user
from db import query_db

feedback_bp = Blueprint('feedback', __name__, url_prefix='/feedback')

@feedback_bp.route('/<int:team_id>', methods=['GET', 'POST'])
@login_required
def rate_teammates(team_id):
    # Verify team exists
    team = query_db("SELECT name, status FROM teams WHERE id = %s", (team_id,), one=True)
    if not team:
        flash("Team not found.", "danger")
        return redirect(url_for('dashboard'))
        
    # Check if team is completed
    if team['status'] != 'completed':
        flash("Feedback can only be submitted after the hackathon is completed.", "warning")
        return redirect(url_for('teams.view_workspace', team_id=team_id))
        
    # Verify current user was a member
    is_member = query_db("SELECT 1 FROM team_members WHERE team_id = %s AND user_id = %s", (team_id, current_user.id), one=True)
    if not is_member:
        flash("Access Denied: You were not a member of this team.", "danger")
        return redirect(url_for('dashboard'))
        
    # Handle review submission
    if request.method == 'POST':
        reviewee_id = request.form.get('reviewee_id')
        rating_str = request.form.get('rating')
        comment = request.form.get('comment', '').strip()
        
        if not reviewee_id or not rating_str:
            flash("Please choose a star rating for your teammate.", "danger")
            return redirect(url_for('feedback.rate_teammates', team_id=team_id))
            
        try:
            rating = int(rating_str)
            reviewee_id = int(reviewee_id)
            
            # Verify reviewee is a member and not current user
            verify_member = query_db(
                "SELECT 1 FROM team_members WHERE team_id = %s AND user_id = %s AND user_id != %s", 
                (team_id, reviewee_id, current_user.id), 
                one=True
            )
            if not verify_member:
                flash("Invalid teammate review request.", "danger")
                return redirect(url_for('feedback.rate_teammates', team_id=team_id))
                
            # Check duplicate review
            duplicate = query_db(
                "SELECT id FROM feedback WHERE team_id = %s AND reviewer_id = %s AND reviewee_id = %s",
                (team_id, current_user.id, reviewee_id),
                one=True
            )
            if duplicate:
                flash("You have already reviewed this teammate.", "warning")
                return redirect(url_for('feedback.rate_teammates', team_id=team_id))
                
            # Insert feedback review record
            query_db(
                "INSERT INTO feedback (team_id, reviewer_id, reviewee_id, rating, comment) VALUES (%s, %s, %s, %s, %s)",
                (team_id, current_user.id, reviewee_id, rating, comment),
                commit=True
            )
            flash("Teammate feedback submitted successfully!", "success")
            
        except ValueError:
            flash("Invalid rating format.", "danger")
            
        return redirect(url_for('feedback.rate_teammates', team_id=team_id))
        
    # GET: fetch team members who are not current user
    all_members = query_db(
        """
        SELECT tm.user_id, u.name, p.photo, p.role 
        FROM team_members tm
        JOIN users u ON tm.user_id = u.id
        JOIN profiles p ON u.id = p.user_id
        WHERE tm.team_id = %s AND tm.user_id != %s
        """, (team_id, current_user.id)
    )
    
    # Fetch team members already reviewed
    already_reviewed_rows = query_db(
        "SELECT reviewee_id FROM feedback WHERE team_id = %s AND reviewer_id = %s",
        (team_id, current_user.id)
    )
    reviewed_ids = [r['reviewee_id'] for r in already_reviewed_rows] if already_reviewed_rows else []
    
    # Filter out already reviewed members
    unreviewed_members = []
    for m in all_members or []:
        if m['user_id'] not in reviewed_ids:
            unreviewed_members.append(m)
            
    return render_template(
        'feedback.html',
        team=team,
        team_id=team_id,
        teammates=unreviewed_members
    )
