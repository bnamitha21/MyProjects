from flask import Blueprint, redirect, url_for, request, flash
from flask_login import login_required, current_user
from db import query_db
from datetime import date

invitations_bp = Blueprint('invitations', __name__, url_prefix='/invitations')


def check_date_overlap(user_id, team_id):
    """
    Returns (True, conflicting_team_name) if the user has a date-conflicting team,
    or (False, None) if safe to join.
    Only checks teams that BOTH have dates set.
    """
    # Get the new team's dates
    new_team = query_db("SELECT start_date, end_date, name FROM teams WHERE id = %s", (team_id,), one=True)
    if not new_team or not new_team['start_date'] or not new_team['end_date']:
        return False, None  # New team has no dates → no conflict check

    new_start = new_team['start_date']
    new_end   = new_team['end_date']

    # Get all teams this user is already in that HAVE dates
    existing = query_db("""
        SELECT t.name, t.start_date, t.end_date
        FROM team_members tm
        JOIN teams t ON tm.team_id = t.id
        WHERE tm.user_id = %s AND t.id != %s
          AND t.start_date IS NOT NULL AND t.end_date IS NOT NULL
    """, (user_id, team_id))

    for t in existing or []:
        # Standard overlap: new_start <= existing_end AND new_end >= existing_start
        if new_start <= t['end_date'] and new_end >= t['start_date']:
            return True, t['name']

    return False, None


@invitations_bp.route('/send', methods=['POST'])
@login_required
def send_invitation():
    team_id    = request.form.get('team_id')
    receiver_id = request.form.get('receiver_id')
    inv_type   = request.form.get('type')
    redirect_url = request.form.get('redirect_url', url_for('dashboard'))

    if not team_id or not receiver_id or not inv_type:
        flash("Invalid request arguments.", "danger")
        return redirect(redirect_url)

    try:
        if inv_type == 'student_to_team':
            # Date-overlap check
            conflict, conflict_team = check_date_overlap(current_user.id, int(team_id))
            if conflict:
                flash(f"Date conflict: you are already in '{conflict_team}' which overlaps with this hackathon's dates.", "warning")
                return redirect(redirect_url)

            # Check if request already pending
            existing_invite = query_db(
                "SELECT id FROM invitations WHERE sender_id = %s AND team_id = %s AND status = 'pending'",
                (current_user.id, team_id), one=True
            )
            if existing_invite:
                flash("A request to join this team is already pending.", "warning")
                return redirect(redirect_url)

            query_db(
                "INSERT INTO invitations (sender_id, receiver_id, team_id, status, type) VALUES (%s, %s, %s, 'pending', 'student_to_team')",
                (current_user.id, receiver_id, team_id), commit=True
            )
            flash("Request to join team sent successfully!", "success")

        elif inv_type == 'team_to_student':
            team = query_db("SELECT creator_id FROM teams WHERE id = %s", (team_id,), one=True)
            if not team or team['creator_id'] != current_user.id:
                flash("Action denied: Only team creator can invite students.", "danger")
                return redirect(redirect_url)

            is_member = query_db("SELECT 1 FROM team_members WHERE team_id = %s AND user_id = %s", (team_id, receiver_id), one=True)
            if is_member:
                flash("Student is already a member of your team.", "warning")
                return redirect(redirect_url)

            existing_invite = query_db(
                "SELECT id FROM invitations WHERE receiver_id = %s AND team_id = %s AND status = 'pending'",
                (receiver_id, team_id), one=True
            )
            if existing_invite:
                flash("An invitation has already been sent to this student.", "warning")
                return redirect(redirect_url)

            query_db(
                "INSERT INTO invitations (sender_id, receiver_id, team_id, status, type) VALUES (%s, %s, %s, 'pending', 'team_to_student')",
                (current_user.id, receiver_id, team_id), commit=True
            )
            flash("Team invitation sent to the student!", "success")

    except Exception as e:
        flash(f"Error sending invitation: {e}", "danger")

    return redirect(redirect_url)


@invitations_bp.route('/accept/<int:invite_id>')
@login_required
def accept_invitation(invite_id):
    invite = query_db("SELECT * FROM invitations WHERE id = %s", (invite_id,), one=True)
    if not invite or invite['status'] != 'pending':
        flash("Invitation not found or no longer active.", "danger")
        return redirect(url_for('dashboard'))

    try:
        if invite['type'] == 'team_to_student':
            if invite['receiver_id'] != current_user.id:
                flash("Action denied: This invitation is not addressed to you.", "danger")
                return redirect(url_for('dashboard'))

            # Date-overlap check for the student accepting
            conflict, conflict_team = check_date_overlap(current_user.id, invite['team_id'])
            if conflict:
                flash(f"Date conflict: you are already in '{conflict_team}' which overlaps with this hackathon's dates.", "warning")
                return redirect(url_for('dashboard'))

            team = query_db("SELECT status FROM teams WHERE id = %s", (invite['team_id'],), one=True)
            if not team:
                flash("The team no longer exists.", "danger")
                return redirect(url_for('dashboard'))

            # Join Team
            query_db(
                "INSERT INTO team_members (team_id, user_id, role) VALUES (%s, %s, 'Member')",
                (invite['team_id'], current_user.id), commit=True
            )
            # Mark invite accepted
            query_db("UPDATE invitations SET status = 'accepted' WHERE id = %s", (invite_id,), commit=True)

            flash("You have successfully joined the team!", "success")
            return redirect(url_for('teams.view_workspace', team_id=invite['team_id']))

        elif invite['type'] == 'student_to_team':
            if invite['receiver_id'] != current_user.id:
                flash("Action denied: Only team creator can accept join requests.", "danger")
                return redirect(url_for('dashboard'))

            team = query_db("SELECT creator_id FROM teams WHERE id = %s", (invite['team_id'],), one=True)
            if not team or team['creator_id'] != current_user.id:
                flash("Team workspace issue.", "danger")
                return redirect(url_for('dashboard'))

            # Date-overlap check for the applicant
            conflict, conflict_team = check_date_overlap(invite['sender_id'], invite['team_id'])
            if conflict:
                flash(f"Cannot accept: applicant already has a team '{conflict_team}' with overlapping dates.", "warning")
                query_db("UPDATE invitations SET status = 'rejected' WHERE id = %s", (invite_id,), commit=True)
                return redirect(url_for('teams.view_workspace', team_id=invite['team_id']))

            # Add applicant to Team
            query_db(
                "INSERT INTO team_members (team_id, user_id, role) VALUES (%s, %s, 'Member')",
                (invite['team_id'], invite['sender_id']), commit=True
            )
            query_db("UPDATE invitations SET status = 'accepted' WHERE id = %s", (invite_id,), commit=True)

            flash("Join request accepted. New member added to the team!", "success")
            return redirect(url_for('teams.view_workspace', team_id=invite['team_id']))

    except Exception as e:
        flash(f"Error accepting invitation: {e}", "danger")

    return redirect(url_for('dashboard'))


@invitations_bp.route('/reject/<int:invite_id>')
@login_required
def reject_invitation(invite_id):
    invite = query_db("SELECT * FROM invitations WHERE id = %s", (invite_id,), one=True)
    if not invite or invite['status'] != 'pending':
        flash("Invitation not active.", "danger")
        return redirect(url_for('dashboard'))

    if invite['receiver_id'] != current_user.id:
        flash("Action denied: You cannot reject this request.", "danger")
        return redirect(url_for('dashboard'))

    try:
        query_db("UPDATE invitations SET status = 'rejected' WHERE id = %s", (invite_id,), commit=True)
        flash("Invitation declined.", "info")
    except Exception as e:
        flash(f"Error rejecting invitation: {e}", "danger")

    if invite['type'] == 'student_to_team':
        return redirect(url_for('teams.view_workspace', team_id=invite['team_id']))
    return redirect(url_for('dashboard'))


@invitations_bp.route('/cancel/<int:invite_id>', methods=['POST'])
@login_required
def cancel_invitation(invite_id):
    invite = query_db("SELECT * FROM invitations WHERE id = %s", (invite_id,), one=True)
    if not invite:
        flash("Invitation record not found.", "danger")
        return redirect(url_for('dashboard'))

    if invite['sender_id'] != current_user.id:
        flash("Action denied: You cannot cancel this invitation.", "danger")
        return redirect(url_for('dashboard'))

    redirect_url = request.form.get('redirect_url', url_for('dashboard'))
    try:
        query_db("DELETE FROM invitations WHERE id = %s", (invite_id,), commit=True)
        flash("Invitation request cancelled successfully.", "info")
    except Exception as e:
        flash(f"Error cancelling invitation: {e}", "danger")

    return redirect(redirect_url)
