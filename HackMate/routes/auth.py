from flask import Blueprint, render_template, redirect, url_for, request, flash
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from db import query_db

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
        
    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        
        # Simple inputs validation
        if not name or not email or not password:
            flash("All fields are required.", "danger")
            return render_template('auth/register.html')
            
        if password != confirm_password:
            flash("Passwords do not match.", "danger")
            return render_template('auth/register.html')
            
        # Check if email exists
        existing_user = query_db("SELECT id FROM users WHERE email = %s", (email,), one=True)
        if existing_user:
            flash("An account with this email already exists.", "danger")
            return render_template('auth/register.html')
            
        try:
            # Hash password using Werkzeug security utility
            hashed_password = generate_password_hash(password, method='scrypt')
            
            # Insert User record
            user_id = query_db(
                "INSERT INTO users (name, email, password) VALUES (%s, %s, %s)", 
                (name, email, hashed_password), 
                commit=True
            )
            
            # Auto-create empty profile entry to link user details
            query_db(
                "INSERT INTO profiles (user_id, college, branch, year, bio, availability) VALUES (%s, '', '', 1, '', 'Available')", 
                (user_id,), 
                commit=True
            )
            
            flash("Account created successfully! Please login.", "success")
            return redirect(url_for('auth.login'))
            
        except Exception as e:
            flash(f"An error occurred during registration: {e}", "danger")
            
    return render_template('auth/register.html')

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
        
    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        
        if not email or not password:
            flash("Please enter both email and password.", "danger")
            return render_template('auth/login.html')
            
        user_row = query_db("SELECT * FROM users WHERE email = %s", (email,), one=True)
        
        if user_row and check_password_hash(user_row['password'], password):
            # Resolve circular dependency by importing User here
            from app import User
            user = User(user_row['id'], user_row['name'], user_row['email'])
            
            login_user(user)
            flash(f"Welcome back, {user_row['name']}!", "success")
            
            next_page = request.args.get('next')
            return redirect(next_page or url_for('dashboard'))
        else:
            flash("Invalid email or password.", "danger")
            
    return render_template('auth/login.html')

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash("You have been logged out successfully.", "success")
    return redirect(url_for('auth.login'))
