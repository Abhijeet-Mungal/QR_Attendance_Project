// HTML5 QR Code Scanner Setup
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

// Function to handle QR code scan result
function onScanSuccess(decodedText, decodedResult) {
    console.log(`Scanned QR: ${decodedText}`);

    let qrData = decodedText.split(",");
    let rollNo = qrData.find(item => item.toLowerCase().startsWith("roll:")).split(":")[1].trim();
    let name = qrData.find(item => item.toLowerCase().startsWith("name:")).split(":")[1].trim();

    if (!scannedMap.has(rollNo)) {
        scannedMap.set(rollNo, name);
        presentCount++;
        updateScannedList();
    } else {
        console.log(`Duplicate: ${rollNo} - ${name}`);
    }
}

// Initialize the scanner
let html5QrcodeScanner = new Html5Qrcode("preview");
let scanning = false;

// Start scanning
document.getElementById('startBtn').addEventListener('click', function () {
    if (scanning) return;
    Html5Qrcode.getCameras().then(cameras => {
        if (cameras && cameras.length) {
            scanning = true;
            html5QrcodeScanner.start(
                cameras[0].id,
                {
                    fps: 10,    // frames per second
                    qrbox: 250  // scanning box size
                },
                onScanSuccess
            ).catch(err => {
                console.error(err);
                alert("Error starting camera: " + err);
            });
        } else {
            alert("No cameras found!");
        }
    }).catch(err => {
        console.error(err);
        alert("Error getting cameras: " + err);
    });
});

// Stop scanning
document.getElementById('stopBtn').addEventListener('click', function () {
    if (!scanning) return;
    html5QrcodeScanner.stop().then(() => {
        scanning = false;
        console.log("Scanning stopped.");
    }).catch(err => {
        console.error("Stop failed: ", err);
    });
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
