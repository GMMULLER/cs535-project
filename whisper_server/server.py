from flask import Flask, request, send_from_directory, abort, jsonify
import requests
import json
import whisper

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

@app.route('/transcribeAudio', methods=['GET'])
def transcribe_audio():

    model = whisper.load_model("base")
    result = model.transcribe("audio.mp3")

    return result["text"]

@app.route('/uploadAudio', methods=['POST'])
def upload_audio():
    if 'audio' not in request.files:
        return 'No file part'
    audio_file = request.files['audio']
    audio_file.seek(0)
    audio_file.save('audio.mp3')
    return 'Audio uploaded successfully'

if __name__ == '__main__':
    app.run(host=address, port=port)