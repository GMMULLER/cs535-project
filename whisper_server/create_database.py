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
    'Record a message as if you were inviting a friend to hang out with you in your place tomorrow',
    'Record a message as if you were emailing your boss to ask if there is a meeting happening today',
    'Record a massage as if you were wishing happy birthday to your best friend'
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