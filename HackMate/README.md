# HackMate ⚡

HackMate is a full-stack web application designed to help college students form hackathon teams. Students can sign up, build detailed profiles, search for potential teammates by skills or availability, create teams, send and receive recruitment invitations, and rate their teammates after completing a hackathon.

Developed using **Python + Flask** and a **MySQL** database, styled with a modern, clean dark theme using **HTML, CSS, and JS**.

---

## Features

* **User Authentication**: Secure register, login, and logout flow using password hashing (`scrypt` via Werkzeug) and session state tracking (`Flask-Login`).
* **Profile Management**: Customize college details, current role (e.g. Frontend, Backend, UI/UX), experience level, availability status, list skill & interest tags, and upload profile pictures.
* **Showcase Projects**: Add up to 3 projects to your profile showing off repository links and descriptions.
* **Advanced Teammate & Team Discovery**: Browse students and recruiting teams with dynamic filtering (by specific skills, roles, experience, target hackathon names, or availability).
* **Team Workspaces & Multi-Team Support**: Users can create or join multiple hackathon teams simultaneously! The platform automatically checks hackathon `start_date` and `end_date` to prevent overlapping commitments.
* **Double-Sided Invitations**: Students can request to join teams, and team creators can invite students. 
* **Post-Hackathon Teammate Reviews**: Submit peer reviews (1-5 star ratings and comments) once a team is marked as completed. Ratings are aggregated and displayed anonymously on user profiles.

---

## Tech Stack

* **Frontend**: HTML5, CSS3 (Flexbox/Grid), JavaScript
* **Backend**: Python 3, Flask, Flask-Login (session auth)
* **Database**: MySQL + `mysql-connector-python` (plain SQL queries, no ORM)

---

## File Structure

```text
c:\Users\Namitha\OneDrive\Desktop\Hackmate\
├── app.py                  ← Flask entrypoint & LoginManager configurations
├── config.py               ← Database coordinates & file upload limits
├── db.py                   ← Reusable MySQL connection & fetch query utility
├── schema.sql              ← Database schema structure and seed accounts data
├── requirements.txt        ← Python pip package requirements
│
├── routes/
│   ├── auth.py             ← signup, login, logout endpoints
│   ├── profile.py          ← profile details, uploads, and showcase projects
│   ├── discover.py         ← browse students & recruiting teams filter endpoints
│   ├── teams.py            ← create team and workspace controls (leave, kick, status)
│   ├── invitations.py      ← send, accept, reject, cancel invitation requests
│   └── feedback.py         ← rate teammates post-hackathon
│
├── static/
│   ├── css/
│   │   └── style.css       ← Clean dark layout stylesheet
│   ├── js/
│   │   └── main.js         ← Tags creation UI, fading notifications, action triggers
│   └── uploads/            ← Uploaded profile photo storage
│
└── templates/
    ├── base.html           ← Shared head links, sticky navbar, notifications, footer
    ├── dashboard.html      ← Main feed: invites, suggestions, team cards
    ├── auth/
    │   ├── login.html      ← Styled login page
    │   └── register.html   ← Styled registration page
    ├── profile/
    │   ├── view.html       ← Public profile, portfolio, reviews history
    │   └── edit.html       ← Edit details, skills/interests tags inputs
    ├── discover/
    │   ├── students.html   ← Discover teammates search panel & results grid
    │   └── teams.html      ← Discover teams search panel & results grid
    ├── teams/
    │   ├── create.html     ← Design to form a new team
    │   └── workspace.html  ← Workspace dashboard: members list, recruitment manager
    └── feedback.html       ← Star rating peer-reviews page
```

---

## Local Setup & Installation

### Step 1: Install Dependencies
Open your terminal in the project directory and install the packages listed in `requirements.txt`:
```bash
pip install -r requirements.txt
```

### Step 2: Set Up MySQL Database
1. Ensure your local MySQL server (or XAMPP/WAMP MySQL) is started.
2. Open [config.py](file:///c:/Users/Namitha/OneDrive/Desktop/Hackmate/config.py) and update the root password parameter `DB_PASSWORD` to match your local database settings (the default is `'root'`).
3. Import the database layout script [schema.sql](file:///c:/Users/Namitha/OneDrive/Desktop/Hackmate/schema.sql):
   ```bash
   mysql -u root -p < schema.sql
   ```
   *Alternatively, run the provided Python initializer script:*
   ```bash
   python -c "import sys; sys.path.append('.'); import scratch.init_db; scratch.init_db.init_db()"
   ```

### Step 3: Run the App
Start the Flask development server:
```bash
python app.py
```
Open **`http://127.0.0.1:5000/`** in your web browser.

---

## Seed Accounts for Testing

All seeded accounts have the password **`password123`**:

1. **Aravind Sharma (Fullstack Dev)**
   * Email: `aravind@gmail.com`
   * *Status: In Team ("Code Crafters")*
2. **Neha Iyer (UI/UX Designer)**
   * Email: `neha@gmail.com`
   * *Status: Available*
3. **Rohan Das (AI/ML Engineer)**
   * Email: `rohan@gmail.com`
   * *Status: Available*
4. **Tanya Sen (Backend Dev)**
   * Email: `tanya@gmail.com`
   * *Status: Tentative*
