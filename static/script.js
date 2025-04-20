let scanner = new Instascan.Scanner({ video: document.getElementById('preview') });
let scannedMap = new Map();
let totalStudents = 120;  // Total number of students
let presentCount = 0;     // Count of present students

// Update the displayed student list and count
function updateScannedList() {
    let listElement = document.getElementById('scannedList');
    listElement.innerHTML = '';

    let sortedEntries = Array.from(scannedMap.entries()).sort((a, b) => {
        return parseInt(a[0].replace(/[^\d]/g, '')) - parseInt(b[0].replace(/[^\d]/g, ''));
    });

    for (let [rollNo, name] of sortedEntries) {
        let listItem = document.createElement('li');
        listItem.textContent = `${rollNo} - ${name}`;
        listElement.appendChild(listItem);
    }

    let percentage = (presentCount / totalStudents) * 100;
    document.getElementById('countDisplay').textContent = `Marked: ${presentCount}/${totalStudents} (${percentage.toFixed(2)}%)`;
}

// Handle scan event and process data
scanner.addListener('scan', function (content) {
    let qrData = content.split(",");
    let rollNo = qrData.find(item => item.startsWith("roll:")).split(":")[1];
    let name = qrData.find(item => item.startsWith("name:")).split(":")[1];

    if (!scannedMap.has(rollNo)) {
        scannedMap.set(rollNo, name);
        presentCount++;
        updateScannedList();
    } else {
        console.log(`Duplicate: ${rollNo} - ${name}`);
    }
});

// Start scanning
document.getElementById('startBtn').addEventListener('click', function () {
    Instascan.Camera.getCameras().then(function (cameras) {
        if (cameras.length > 0) {
            scanner.start(cameras[0]);
        } else {
            alert('No cameras found!');
        }
    }).catch(function (e) {
        console.error(e);
        alert('Error accessing camera: ' + e);
    });
});

// Stop scanning
document.getElementById('stopBtn').addEventListener('click', function () {
    scanner.stop();
});

// Download attendance report as Excel
document.getElementById('downloadBtn').addEventListener('click', function () {
    let data = [["Roll Number", "Name", "Status"]];
    let sortedEntries = Array.from(scannedMap.entries()).sort((a, b) => {
        return parseInt(a[0].replace(/[^\d]/g, '')) - parseInt(b[0].replace(/[^\d]/g, ''));
    });

    sortedEntries.forEach(([rollNo, name]) => {
        data.push([rollNo, name, "Present"]);
    });

    let ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [{ width: 15 }, { width: 30 }, { width: 15 }];

    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");
    XLSX.writeFile(wb, "attendance_report.xlsx");

    alert(`Download complete: ${sortedEntries.length} students marked present.`);
});
