import sqlite3

conn = sqlite3.connect('logs.db')

cur = conn.cursor()

cur.execute('''CREATE TABLE IF NOT EXISTS participant (
               id INTEGER PRIMARY KEY,
               code TEXT UNIQUE,
               date TEXT,
               proficiency_level TEXT,
               native_language TEXT)''')

cur.execute('''CREATE TABLE IF NOT EXISTS task (
               id INTEGER PRIMARY KEY,
               prompt TEXT)''')

tasksPrompts = [
    "Test 1",
    "Test 2",
    "Record a message to your friend to invite them to hang out together this weekend",
    "Record a birthday message to your best friend, highlighting your wishes for them for the upcoming year",
    "Record a message to your professor to extend the deadline for an assignment you’ve been working on",
    "Record a message for your significant other to remind them about an upcoming anniversary dinner reservation",
    "Record a message for your landlord to report a maintenance issue in your apartment"
]

for prompt in tasksPrompts:
    cur.execute("INSERT INTO task (prompt) VALUES (?)", (prompt,))

cur.execute('''CREATE TABLE IF NOT EXISTS answers (
               id INTEGER PRIMARY KEY,
               participant_id INTEGER,
               task_id INTEGER,
               final_answer TEXT,
               last_recorded_answer TEXT,
               number_of_recordings INTEGER,
               levenshtein_distance INTEGER,
               skipped INTEGER,
               time INTEGER,
               FOREIGN KEY (participant_id) REFERENCES participant(id),
               FOREIGN KEY (task_id) REFERENCES task(id))''')

conn.commit()
conn.close()

# cur.execute("INSERT INTO users (name, age) VALUES (?, ?)", ('Alice', 30))