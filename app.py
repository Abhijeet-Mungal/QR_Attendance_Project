from flask import Flask, render_template, request, jsonify, send_file
import os
import csv
from io import StringIO

app = Flask(__name__)

# Sample data structure to store attendance (replace with a database for production)
attendance_data = []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload_qr', methods=['POST'])
def upload_qr():
    file = request.files['file']
    if file:
        # Process the QR code here (dummy data for now)
        roll_number = '12345'  # You can extract this from the QR code
        name = 'John Doe'  # You can extract this from the QR code

        # Store the attendance data
        attendance_data.append({'roll_number': roll_number, 'name': name})

        return jsonify({'success': True, 'roll_number': roll_number, 'name': name})
    return jsonify({'success': False})

@app.route('/download_weekly_report', methods=['GET'])
def download_weekly_report():
    # Create a CSV from the attendance data
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(['Roll Number', 'Name'])

    for entry in attendance_data:
        writer.writerow([entry['roll_number'], entry['name']])

    output.seek(0)
    return send_file(output, mimetype='text/csv', as_attachment=True, download_name="weekly_report.csv")

if __name__ == '__main__':
    app.run(debug=True)
