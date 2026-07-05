from flask import Flask, request, jsonify, render_template
import sqlite3
import os
from google import genai
from google.genai import types
from dotenv import load_dotenv
import json
import re
from datetime import date

load_dotenv()

app = Flask(__name__)

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
client = None
if api_key:
    client = genai.Client(api_key=api_key)

def get_db_connection():
    conn = sqlite3.connect('nutriscore.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    # Create Users Table
    conn.execute('''CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )''')

    # Create UserProfile Table
    conn.execute('''CREATE TABLE IF NOT EXISTS UserProfile (
        user_id INTEGER PRIMARY KEY,
        age INTEGER,
        gender TEXT,
        height REAL,
        weight REAL,
        diet_preference TEXT,
        allergies TEXT,
        fitness_goal TEXT,
        activity_level TEXT,
        sugar_level TEXT,
        sleep_hours REAL,
        water_intake REAL,
        medical_conditions TEXT,
        FOREIGN KEY (user_id) REFERENCES Users(id)
    )''')

    # Create FoodLogs Table
    conn.execute('''CREATE TABLE IF NOT EXISTS FoodLogs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        food_name TEXT,
        score INTEGER,
        date TEXT,
        FOREIGN KEY (user_id) REFERENCES Users(id)
    )''')
    conn.commit()
    conn.close()

# Initialize DB on startup
init_db()

# ---- Page Routes ---- #
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/signup')
def signup():
    return render_template('signup.html')

@app.route('/profile')
def profile():
    return render_template('profile.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/user_profile')
def user_profile():
    return render_template('user_profile.html')

@app.route('/recommendations/<category>')
def recommendations(category):
    # Data dictionary for Salads
    salad_items = [
        {"name": "Caesar Salad", "image": "caesar.jpg", "score": 75},
        {"name": "Spinach and Strawberry Salad", "image": "spinach.jpg", "score": 92},
        {"name": "Greek Salad with Feta", "image": "greek.jpg", "score": 88},
        {"name": "Cobb Salad", "image": "cobb.jpg", "score": 70},
        {"name": "Caprese Salad", "image": "caprese.jpg", "score": 85},
        {"name": "Kale Quinoa Salad", "image": "kale_quinoa.jpg", "score": 98},
        {"name": "Waldorf Salad", "image": "waldorf.jpg", "score": 80},
        {"name": "Avocado Corn Salad", "image": "avocado_corn.jpg", "score": 90},
        {"name": "Nicoise Salad", "image": "nicoise.jpg", "score": 89},
        {"name": "Arugula Parmesan Salad", "image": "arugula.jpg", "score": 86},
        {"name": "Broccoli Crunch Salad", "image": "broccoli.jpg", "score": 82},
        {"name": "Southwest Chicken Salad", "image": "southwest.jpg", "score": 78},
        {"name": "Mediterranean Chickpea Salad", "image": "chickpea.jpg", "score": 95},
        {"name": "Asian Sesame Salad", "image": "sesame.jpg", "score": 84},
        {"name": "Roasted Beet and Goat Cheese Salad", "image": "beet.jpg", "score": 91}
    ]

    # Data dictionary for Berries
    berries_items = [
        {"name": "Blueberries", "image": "blueberries.jpg", "score": 95},
        {"name": "Strawberries", "image": "strawberries.jpg", "score": 90},
        {"name": "Raspberries", "image": "raspberries.jpg", "score": 92},
        {"name": "Blackberries", "image": "blackberries.jpg", "score": 94},
        {"name": "Cranberries", "image": "cranberries.jpg", "score": 85},
        {"name": "Mixed Berry Bowl", "image": "mixed_bowl.jpg", "score": 98},
        {"name": "Goji Berries", "image": "goji.jpg", "score": 88},
        {"name": "Acai Bowl", "image": "acai.jpg", "score": 82},
        {"name": "Mulberries", "image": "mulberries.jpg", "score": 89},
        {"name": "Boysenberries", "image": "boysenberries.jpg", "score": 86},
        {"name": "Elderberries", "image": "elderberries.jpg", "score": 91},
        {"name": "Gooseberries", "image": "gooseberries.jpg", "score": 84},
        {"name": "Cloudberries", "image": "cloudberries.jpg", "score": 80},
        {"name": "Loganberries", "image": "loganberries.jpg", "score": 83},
        {"name": "Marionberries", "image": "marionberries.jpg", "score": 87}
    ]

    # Data dictionary for Proteins
    protein_items = [
        {"name": "Grilled Chicken Breast", "image": "chicken.jpg", "score": 90},
        {"name": "Salmon Fillet", "image": "salmon.jpg", "score": 95},
        {"name": "Hard Boiled Eggs", "image": "eggs.jpg", "score": 85},
        {"name": "Greek Yogurt", "image": "yogurt.jpg", "score": 88},
        {"name": "Lentil Soup", "image": "lentils.jpg", "score": 92},
        {"name": "Tofu Scramble", "image": "tofu.jpg", "score": 87},
        {"name": "Edamame", "image": "edamame.jpg", "score": 89},
        {"name": "Cottage Cheese", "image": "cottage_cheese.jpg", "score": 82},
        {"name": "Lean Beef Steak", "image": "beef.jpg", "score": 75},
        {"name": "Turkey Breast", "image": "turkey.jpg", "score": 86},
        {"name": "Chickpea Salad", "image": "chickpeas.jpg", "score": 91},
        {"name": "Quinoa Bowl", "image": "quinoa.jpg", "score": 94},
        {"name": "Black Beans", "image": "black_beans.jpg", "score": 93},
        {"name": "Protein Shake", "image": "shake.jpg", "score": 78},
        {"name": "Almonds", "image": "almonds.jpg", "score": 84}
    ]

    # Data dictionary for Detox Water
    water_items = [
        {"name": "Lemon Mint Water", "image": "lemon_mint.jpg", "score": 100},
        {"name": "Cucumber Water", "image": "cucumber.jpg", "score": 100},
        {"name": "Strawberry Basil Water", "image": "strawberry_basil.jpg", "score": 98},
        {"name": "Watermelon Mint Water", "image": "watermelon.jpg", "score": 95},
        {"name": "Grapefruit Rosemary Water", "image": "grapefruit.jpg", "score": 97},
        {"name": "Apple Cinnamon Water", "image": "apple_cinnamon.jpg", "score": 92},
        {"name": "Ginger Lemon Water", "image": "ginger_lemon.jpg", "score": 99},
        {"name": "Orange Blueberry Water", "image": "orange_blueberry.jpg", "score": 96},
        {"name": "Pineapple Mint Water", "image": "pineapple_mint.jpg", "score": 94},
        {"name": "Lime Raspberry Water", "image": "lime_raspberry.jpg", "score": 98},
        {"name": "Chia Seed Water", "image": "chia.jpg", "score": 100},
        {"name": "Aloe Vera Water", "image": "aloe.jpg", "score": 90},
        {"name": "Coconut Water", "image": "coconut.jpg", "score": 95},
        {"name": "Green Tea Detox", "image": "green_tea.jpg", "score": 99},
        {"name": "Pomegranate Mint Water", "image": "pomegranate.jpg", "score": 97}
    ]

    # Map the requested URL category parameter to the data
    data_map = {
        'salads': {
            'title': 'Leafy Salads',
            'items': salad_items
        },
        'berries': {
            'title': 'Berries',
            'items': berries_items
        },
        'proteins': {
            'title': 'High Protein',
            'items': protein_items
        },
        'water': {
            'title': 'Detox Water',
            'items': water_items
        }
    }

    category_data = data_map.get(category)
    if not category_data:
        return "Category Not Found", 404

    return render_template('recommendations.html', 
                           category_id=category, 
                           title=category_data['title'], 
                           items=category_data['items'])


# ---- API Routes ---- #
@app.route('/api/signup', methods=['POST'])
def api_signup():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute('INSERT INTO Users (name, email, password) VALUES (?, ?, ?)', (name, email, password))
        conn.commit()
        userId = cur.lastrowid
        return jsonify({'userId': userId})
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Email already exists'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        conn.close()

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    conn = get_db_connection()
    user = conn.execute('SELECT * FROM Users WHERE email = ? AND password = ?', (email, password)).fetchone()
    
    if user is None:
        conn.close()
        return jsonify({'error': 'Invalid email or password'}), 401
    
    userId = user['id']
    profileRow = conn.execute('SELECT * FROM UserProfile WHERE user_id = ?', (userId,)).fetchone()
    conn.close()
    
    return jsonify({
        'userId': userId,
        'needsProfile': profileRow is None
    })

@app.route('/api/profile', methods=['POST'])
def api_profile():
    data = request.get_json()
    
    query = '''
        INSERT INTO UserProfile 
        (user_id, age, gender, height, weight, diet_preference, allergies, fitness_goal, activity_level, sugar_level, sleep_hours, water_intake, medical_conditions) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    '''
    params = (
        data.get('userId'), data.get('age'), data.get('gender'), data.get('height'), data.get('weight'),
        data.get('diet_preference'), data.get('allergies'), data.get('fitness_goal'), data.get('activity_level'),
        data.get('sugar_level'), data.get('sleep_hours'), data.get('water_intake'), data.get('medical_conditions')
    )

    conn = get_db_connection()
    try:
        conn.execute(query, params)
        conn.commit()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        conn.close()

@app.route('/api/dashboard/<int:user_id>', methods=['GET'])
def api_dashboard(user_id):
    conn = get_db_connection()
    data = {'user': None, 'profile': None, 'logs': [], 'healthScore': 50}
    
    user = conn.execute('SELECT name, email FROM Users WHERE id = ?', (user_id,)).fetchone()
    if not user:
        conn.close()
        return jsonify({'error': 'User not found'}), 404
        
    data['user'] = dict(user)
    
    profile = conn.execute('SELECT * FROM UserProfile WHERE user_id = ?', (user_id,)).fetchone()
    if profile:
        data['profile'] = dict(profile)
        
    logs = conn.execute('SELECT * FROM FoodLogs WHERE user_id = ? ORDER BY id DESC', (user_id,)).fetchall()
    
    if logs:
        data['logs'] = [dict(log) for log in logs]
        score = 50
        for log in logs:
            score += (log['score'] - 50) * 0.2
        data['healthScore'] = min(max(round(score), 0), 100)
        
    conn.close()
    return jsonify(data)

@app.route('/api/logs/<int:user_id>', methods=['POST'])
def api_logs(user_id):
    data = request.get_json()
    food_name = data.get('food_name')
    current_date = date.today().isoformat()
    
    # Try sending explicit score first (used directly inside the dashboard 'Analyze Label' route)
    score = data.get('score')
    
    # Otherwise, automatically query Gemini
    if score is None:
        if not client:
            return jsonify({'error': 'Gemini API is not configured.'}), 500
        
        try:
            prompt = f"Estimate a single health score from 0 to 100 for the food item: '{food_name}'. (100 being perfectly healthy, e.g. plain vegetables, and 0 being terrible, e.g. deep fried oreos). Return ONLY the integer number, nothing else."
            response = client.models.generate_content(model='gemini-3-flash-preview', contents=prompt)
            print(f"-- Debug: AI estimated {response.text.strip()} for {food_name}")
            # Ensure it is a valid integer string representing score before storing
            score_match = re.search(r'\d+', response.text)
            if score_match:
                score = int(score_match.group(0))
            else:
                score = 50 # Default fallback
        except Exception as e:
            print("Gemini Logging Error:", e)
            score = 50 # Default fallback

    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute('INSERT INTO FoodLogs (user_id, food_name, score, date) VALUES (?, ?, ?, ?)', 
                    (user_id, food_name, score, current_date))
        conn.commit()
        return jsonify({'success': True, 'logId': cur.lastrowid})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        conn.close()

@app.route('/api/stats/<int:user_id>', methods=['GET'])
def api_stats(user_id):
    from datetime import date, timedelta
    
    conn = get_db_connection()
    
    # Get all logs for the user to compute averages
    logs = conn.execute('''
        SELECT date, score FROM FoodLogs 
        WHERE user_id = ? 
        ORDER BY date ASC
    ''', (user_id,)).fetchall()
    conn.close()

    # If no logs, return generic empty data
    if not logs:
        return jsonify({'labels': [], 'scores': []})

    from collections import defaultdict
    daily_totals = defaultdict(list)
    
    for log in logs:
        daily_totals[log['date']].append(log['score'])
        
    # Generate labels (last 7 days sequentially)
    labels = []
    scores = []
    today = date.today()
    
    for i in range(6, -1, -1):
        target_date = (today - timedelta(days=i)).isoformat()
        labels.append(target_date)
        
        if target_date in daily_totals:
            # Calculate average for the day
            avg_score = sum(daily_totals[target_date]) / len(daily_totals[target_date])
            scores.append(round(avg_score))
        else:
            # No data for this day, append a 0 or null
            scores.append(0)
            
    return jsonify({
        'labels': labels,
        'scores': scores
    })

@app.route('/api/analyze', methods=['POST'])
def api_analyze():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file uploaded'}), 400

    image_file = request.files['image']
    if image_file.filename == '':
        return jsonify({'error': 'No selected image file'}), 400

    if not client:
        return jsonify({'error': 'Gemini API is not configured. Add GEMINI_API_KEY to .env file.'}), 500

    try:
        # Read the image bytes into memory securely
        image_bytes = image_file.read()
        mime_type = image_file.mimetype

        prompt = """
Look at the ingredients or nutrition information presented in this uploaded image label.
Determine:
1. Is it Healthy, Moderately Healthy, or Unhealthy?
2. Give it a score from 0 to 100 (100 being healthiest).
3. Provide a short explanation (2-3 sentences max).

Return the response STRICTLY as a JSON object, like this:
{
  "status": "Healthy / Moderately Healthy / Unhealthy",
  "score": 85,
  "explanation": "This food is... "
}
"""     
        # Use python sdk `types` object to securely format the image attachment for Gemini processing
        contents = [
            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            prompt
        ]

        response = client.models.generate_content(model='gemini-3-flash-preview', contents=contents)
        response_text = response.text
        
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            parsed_data = json.loads(json_match.group(0))
            return jsonify(parsed_data)
        else:
            print("Raw Gemini Response:", response_text)
            return jsonify({'error': 'Failed to parse Gemini API response'}), 500

    except Exception as e:
        print('Error calling Gemini API:', e)
        return jsonify({'error': 'Failed to analyze label image'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
