from flask import Flask, request, send_from_directory, abort, jsonify
import requests
import json
import whisper
import sqlite3
from functools import lru_cache

app = Flask(__name__)
address = 'localhost'
port = 5001

api_address = 'http://localhost'
api_port = 2000

@app.after_request
def add_cors_headers(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    return response

@app.route('/')
def root():
    abort(403)

@app.route('/uploadAudio', methods=['POST'])
def upload_audio():
    if 'audio' not in request.files:
        return 'No file part'

    filename = request.args.get('filename')

    if(filename == None):
        abort(400)
    else:
        audio_file = request.files['audio']
        audio_file.seek(0)
        audio_file.save(filename+'.webm')

        model = whisper.load_model("medium.en")
        result = model.transcribe(filename+'.webm')

        return jsonify({'content': str(result["text"])})

def lev_dist(a, b):
    '''
    This function will calculate the levenshtein distance between two input
    strings a and b
    
    params:
        a (String) : The first string you want to compare
        b (String) : The second string you want to compare
        
    returns:
        This function will return the distnace between string a and b.
        
    example:
        a = 'stamp'
        b = 'stomp'
        lev_dist(a,b)
        >> 1.0
    '''
    
    @lru_cache(None)  # for memorization
    def min_dist(s1, s2):

        if s1 == len(a) or s2 == len(b):
            return len(a) - s1 + len(b) - s2

        # no change required
        if a[s1] == b[s2]:
            return min_dist(s1 + 1, s2 + 1)

        return 1 + min(
            min_dist(s1, s2 + 1),      # insert character
            min_dist(s1 + 1, s2),      # delete character
            min_dist(s1 + 1, s2 + 1),  # replace character
        )

    return min_dist(0, 0)

@app.route('/submitAnswer', methods=['POST'])
def submit_answer():

    conn = sqlite3.connect('logs.db')
    cur = conn.cursor()

    participant_code = request.json['participant_code']
    task_id = request.json['task_id']
    final_answer = request.json['final_answer']
    last_recorded_answer = request.json['last_recorded_answer']
    number_of_recordings = request.json['number_of_recordings']
    skipped = request.json['skipped']
    time = request.json['time']
    levenshtein_distance = lev_dist(last_recorded_answer, final_answer)

    cur.execute("SELECT * FROM participant WHERE code = ?", (participant_code,))
    row = cur.fetchone()  # Fetch the first matching row

    cur.execute("INSERT INTO answers (participant_id, task_id, final_answer, last_recorded_answer, number_of_recordings, levenshtein_distance, skipped, time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", (row[0], task_id, final_answer, last_recorded_answer, number_of_recordings, levenshtein_distance, skipped, time))

    conn.commit()
    conn.close()

    return "successful"

@app.route('/registerParticipant', methods=['POST'])
def register_participant():

    conn = sqlite3.connect('logs.db')
    cur = conn.cursor()

    code = request.json['code']
    date = request.json['date']
    proficency_level = request.json['proficiency_level']
    native_language = request.json['native_language']

    cur.execute("INSERT INTO participant (code, date, proficiency_level, native_language) VALUES (?, ?, ?, ?)", (code, date, proficency_level, native_language))

    conn.commit()
    conn.close()

    return "successful"


if __name__ == '__main__':
    app.run(host=address, port=port)