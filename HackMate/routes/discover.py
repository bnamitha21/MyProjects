from flask import Blueprint, render_template, request
from flask_login import login_required, current_user
from db import query_db

discover_bp = Blueprint('discover', __name__, url_prefix='/discover')

@discover_bp.route('/students')
@login_required
def students():
    # Retrieve filters from GET query parameters
    role_filter = request.args.get('role', 'All').strip()
    exp_filter = request.args.get('experience', 'All').strip()
    avail_filter = request.args.get('availability', 'All').strip()
    skill_filter = request.args.get('skill', '').strip()
    
    # Build dynamic query
    base_query = """
        SELECT DISTINCT u.id, u.name, p.role, p.college, p.branch, p.year, p.availability, p.photo, p.experience 
        FROM users u 
        JOIN profiles p ON u.id = p.user_id
    """
    
    where_clauses = ["u.id != %s"]
    args = [current_user.id]
    
    if role_filter and role_filter != 'All':
        where_clauses.append("p.role = %s")
        args.append(role_filter)
        
    if exp_filter and exp_filter != 'All':
        where_clauses.append("p.experience = %s")
        args.append(exp_filter)
        
    if avail_filter and avail_filter != 'All':
        where_clauses.append("p.availability = %s")
        args.append(avail_filter)
        
    if skill_filter:
        base_query += " JOIN skills s ON u.id = s.user_id"
        where_clauses.append("s.skill_name LIKE %s")
        args.append(f"%{skill_filter}%")
        
    base_query += " WHERE " + " AND ".join(where_clauses)
    base_query += " ORDER BY u.name ASC"
    
    # Query database
    students_list = query_db(base_query, tuple(args))
    
    # Fetch skills and interests for each student to render on cards
    for student in students_list or []:
        skills_rows = query_db("SELECT skill_name FROM skills WHERE user_id = %s", (student['id'],))
        student['skills'] = [s['skill_name'] for s in skills_rows] if skills_rows else []
        
        interests_rows = query_db("SELECT interest_name FROM interests WHERE user_id = %s", (student['id'],))
        student['interests'] = [i['interest_name'] for i in interests_rows] if interests_rows else []

    return render_template(
        'discover/students.html',
        students=students_list or [],
        role_filter=role_filter,
        exp_filter=exp_filter,
        avail_filter=avail_filter,
        skill_filter=skill_filter
    )

@discover_bp.route('/teams')
@login_required
def teams():
    # Retrieve filters from GET query parameters
    hackathon_filter = request.args.get('hackathon', '').strip()
    role_needed_filter = request.args.get('role_needed', 'All').strip()
    
    # Base query fetching recruiting teams
    base_query = """
        SELECT DISTINCT t.id, t.name, t.description, t.hackathon_name, t.status, u.name as creator_name, t.creator_id 
        FROM teams t
        JOIN users u ON t.creator_id = u.id
    """
    
    where_clauses = ["t.status = 'recruiting'"]
    args = []
    
    # Don't show the team current user is already a member of
    user_team = query_db("SELECT team_id FROM team_members WHERE user_id = %s", (current_user.id,), one=True)
    if user_team:
        where_clauses.append("t.id != %s")
        args.append(user_team['team_id'])
        
    if hackathon_filter:
        where_clauses.append("t.hackathon_name LIKE %s")
        args.append(f"%{hackathon_filter}%")
        
    if role_needed_filter and role_needed_filter != 'All':
        base_query += " JOIN required_roles rr ON t.id = rr.team_id"
        where_clauses.append("rr.role_name = %s")
        args.append(role_needed_filter)
        
    base_query += " WHERE " + " AND ".join(where_clauses)
    base_query += " ORDER BY t.id DESC"
    
    teams_list = query_db(base_query, tuple(args))
    
    # Load required roles, team members, and check if user has a pending join request to these teams
    for team in teams_list or []:
        roles_rows = query_db("SELECT role_name FROM required_roles WHERE team_id = %s", (team['id'],))
        team['required_roles'] = [r['role_name'] for r in roles_rows] if roles_rows else []
        
        members_count = query_db("SELECT COUNT(*) as cnt FROM team_members WHERE team_id = %s", (team['id'],), one=True)
        team['member_count'] = members_count['cnt'] if members_count else 0
        
        # Check if current user has a pending invitation request to join this team
        has_requested = query_db(
            "SELECT id FROM invitations WHERE sender_id = %s AND team_id = %s AND status = 'pending' AND type = 'student_to_team'", 
            (current_user.id, team['id']),
            one=True
        )
        team['pending_invite_id'] = has_requested['id'] if has_requested else None

    return render_template(
        'discover/teams.html',
        teams=teams_list or [],
        hackathon_filter=hackathon_filter,
        role_needed_filter=role_needed_filter
    )
