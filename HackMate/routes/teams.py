from flask import Blueprint, render_template, redirect, url_for, request, flash
from flask_login import login_required, current_user
from db import query_db

teams_bp = Blueprint('teams', __name__, url_prefix='/teams')


@teams_bp.route('/create', methods=['GET', 'POST'])
@login_required
def create_team():
    if request.method == 'POST':
        name              = request.form.get('name', '').strip()
        description       = request.form.get('description', '').strip()
        hackathon_name    = request.form.get('hackathon_name', '').strip()
        required_roles_str = request.form.get('required_roles', '')
        start_date        = request.form.get('start_date') or None
        end_date          = request.form.get('end_date')   or None

        if not name or not hackathon_name:
            flash("Team Name and Hackathon Name are required fields.", "danger")
            return render_template('teams/create.html')

        # Basic date validation
        if start_date and end_date and start_date > end_date:
            flash("Hackathon start date cannot be after the end date.", "danger")
            return render_template('teams/create.html')

        # Duplicate team name check
        duplicate_name = query_db("SELECT id FROM teams WHERE name = %s", (name,), one=True)
        if duplicate_name:
            flash("A team with this name already exists.", "danger")
            return render_template('teams/create.html')

        # Date-overlap check for creator themselves (import inline to avoid circular)
        if start_date and end_date:
            from routes.invitations import check_date_overlap
            # We check against a dummy team_id=0 which won't exist
            existing = query_db("""
                SELECT t.name, t.start_date, t.end_date
                FROM team_members tm
                JOIN teams t ON tm.team_id = t.id
                WHERE tm.user_id = %s
                  AND t.start_date IS NOT NULL AND t.end_date IS NOT NULL
            """, (current_user.id,))
            for t in existing or []:
                if start_date <= str(t['end_date']) and end_date >= str(t['start_date']):
                    flash(f"Date conflict: your team '{t['name']}' overlaps with these hackathon dates.", "warning")
                    return render_template('teams/create.html')

        try:
            # 1. Create Team record
            team_id = query_db(
                "INSERT INTO teams (name, description, hackathon_name, start_date, end_date, creator_id, status) VALUES (%s, %s, %s, %s, %s, %s, 'recruiting')",
                (name, description, hackathon_name, start_date, end_date, current_user.id),
                commit=True
            )

            # 2. Add creator to team_members
            query_db(
                "INSERT INTO team_members (team_id, user_id, role) VALUES (%s, %s, 'Creator')",
                (team_id, current_user.id), commit=True
            )

            # 3. Add Required Roles
            if required_roles_str:
                roles = list(set([r.strip() for r in required_roles_str.split(',') if r.strip()]))
                for role in roles:
                    query_db(
                        "INSERT INTO required_roles (team_id, role_name) VALUES (%s, %s)",
                        (team_id, role), commit=True
                    )

            flash(f"Team '{name}' created successfully!", "success")
            return redirect(url_for('teams.view_workspace', team_id=team_id))

        except Exception as e:
            flash(f"Error creating team: {e}", "danger")

    return render_template('teams/create.html')


@teams_bp.route('/<int:team_id>')
@login_required
def view_workspace(team_id):
    team = query_db(
        "SELECT t.*, u.name as creator_name FROM teams t JOIN users u ON t.creator_id = u.id WHERE t.id = %s",
        (team_id,), one=True
    )
    if not team:
        flash("Team not found.", "danger")
        return redirect(url_for('dashboard'))

    is_member = query_db(
        "SELECT role FROM team_members WHERE team_id = %s AND user_id = %s",
        (team_id, current_user.id), one=True
    )

    if not is_member:
        flash("Access Denied: You must be a member of this team to view its workspace.", "danger")
        return redirect(url_for('discover.teams'))

    members = query_db("""
        SELECT tm.user_id, u.name, tm.role, p.photo, p.role as profile_role
        FROM team_members tm
        JOIN users u ON tm.user_id = u.id
        JOIN profiles p ON u.id = p.user_id
        WHERE tm.team_id = %s
    """, (team_id,))

    open_roles = query_db("SELECT role_name FROM required_roles WHERE team_id = %s", (team_id,))
    open_roles_list = [r['role_name'] for r in open_roles] if open_roles else []
    open_roles_val  = ",".join(open_roles_list)

    sent_invitations = []
    join_requests    = []
    is_creator = (team['creator_id'] == current_user.id)

    if is_creator:
        sent_invitations = query_db("""
            SELECT i.id, u.name as receiver_name, u.id as receiver_id, i.status
            FROM invitations i
            JOIN users u ON i.receiver_id = u.id
            WHERE i.team_id = %s AND i.type = 'team_to_student' AND i.status = 'pending'
        """, (team_id,))

        join_requests = query_db("""
            SELECT i.id, u.name as sender_name, u.id as sender_id, i.status
            FROM invitations i
            JOIN users u ON i.sender_id = u.id
            WHERE i.team_id = %s AND i.type = 'student_to_team' AND i.status = 'pending'
        """, (team_id,))

    return render_template(
        'teams/workspace.html',
        team=team,
        members=members or [],
        open_roles_val=open_roles_val,
        open_roles=open_roles_list,
        sent_invitations=sent_invitations or [],
        join_requests=join_requests or [],
        is_creator=is_creator,
        my_role=is_member['role']
    )


@teams_bp.route('/<int:team_id>/roles/update', methods=['POST'])
@login_required
def update_roles(team_id):
    team = query_db("SELECT creator_id FROM teams WHERE id = %s", (team_id,), one=True)
    if not team or team['creator_id'] != current_user.id:
        flash("Action denied: Only the team creator can update roles.", "danger")
        return redirect(url_for('teams.view_workspace', team_id=team_id))

    required_roles_str = request.form.get('required_roles', '')
    try:
        query_db("DELETE FROM required_roles WHERE team_id = %s", (team_id,), commit=True)
        if required_roles_str:
            roles = list(set([r.strip() for r in required_roles_str.split(',') if r.strip()]))
            for role in roles:
                query_db("INSERT INTO required_roles (team_id, role_name) VALUES (%s, %s)", (team_id, role), commit=True)
        flash("Open roles updated successfully!", "success")
    except Exception as e:
        flash(f"Error updating roles: {e}", "danger")

    return redirect(url_for('teams.view_workspace', team_id=team_id))


@teams_bp.route('/<int:team_id>/status', methods=['POST'])
@login_required
def update_status(team_id):
    team = query_db("SELECT creator_id FROM teams WHERE id = %s", (team_id,), one=True)
    if not team or team['creator_id'] != current_user.id:
        flash("Action denied: Only the team creator can modify status.", "danger")
        return redirect(url_for('teams.view_workspace', team_id=team_id))

    status = request.form.get('status', 'recruiting')
    if status in ['recruiting', 'full', 'completed']:
        query_db("UPDATE teams SET status = %s WHERE id = %s", (status, team_id), commit=True)
        if status == 'completed':
            flash("Hackathon marked as Completed! Great work team.", "success")
        else:
            flash(f"Team status changed to {status.capitalize()}.", "success")

    return redirect(url_for('teams.view_workspace', team_id=team_id))


@teams_bp.route('/<int:team_id>/leave', methods=['POST'])
@login_required
def leave_team(team_id):
    team = query_db("SELECT * FROM teams WHERE id = %s", (team_id,), one=True)
    if not team:
        flash("Team not found.", "danger")
        return redirect(url_for('dashboard'))

    is_member = query_db("SELECT 1 FROM team_members WHERE team_id = %s AND user_id = %s", (team_id, current_user.id), one=True)
    if not is_member:
        flash("You are not a member of this team.", "danger")
        return redirect(url_for('dashboard'))

    try:
        if team['creator_id'] == current_user.id:
            # Creator leaves → disband team
            members = query_db("SELECT user_id FROM team_members WHERE team_id = %s", (team_id,))
            query_db("DELETE FROM teams WHERE id = %s", (team_id,), commit=True)
            flash("You left the team. Since you were the creator, the team has been disbanded.", "warning")
        else:
            query_db("DELETE FROM team_members WHERE team_id = %s AND user_id = %s", (team_id, current_user.id), commit=True)
            flash("You have successfully left the team.", "info")
    except Exception as e:
        flash(f"Error leaving team: {e}", "danger")

    return redirect(url_for('dashboard'))


@teams_bp.route('/<int:team_id>/kick/<int:member_id>', methods=['POST'])
@login_required
def kick_member(team_id, member_id):
    team = query_db("SELECT creator_id FROM teams WHERE id = %s", (team_id,), one=True)
    if not team or team['creator_id'] != current_user.id:
        flash("Action denied: Only the team creator can kick members.", "danger")
        return redirect(url_for('teams.view_workspace', team_id=team_id))

    if member_id == current_user.id:
        flash("You cannot kick yourself. Choose Leave Team if you wish to exit.", "warning")
        return redirect(url_for('teams.view_workspace', team_id=team_id))

    try:
        query_db("DELETE FROM team_members WHERE team_id = %s AND user_id = %s", (team_id, member_id), commit=True)
        flash("Member has been removed from the team.", "warning")
    except Exception as e:
        flash(f"Error kicking member: {e}", "danger")

    return redirect(url_for('teams.view_workspace', team_id=team_id))
