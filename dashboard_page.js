import { auth } from './firebase-config.js';
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

function showMessageStatus(message, isSuccess) {
    let statusDiv = document.getElementById('contactus-message-send');
    if (!statusDiv) {
        statusDiv = document.createElement('div');
        statusDiv.id = 'contactus-message-send';
        statusDiv.style.position = 'fixed';
        statusDiv.style.top = '20px';
        statusDiv.style.left = '50%';
        statusDiv.style.transform = 'translateX(-50%)';
        statusDiv.style.padding = '16px 32px';
        statusDiv.style.borderRadius = '8px';
        statusDiv.style.fontSize = '18px';
        statusDiv.style.fontFamily = 'Poppins, Inter, Arial, sans-serif';
        statusDiv.style.zIndex = '9999';
        statusDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        document.body.appendChild(statusDiv);
    }
    statusDiv.textContent = message;
    statusDiv.style.backgroundColor = isSuccess ? '#4BB543' : '#D8000C';
    statusDiv.style.color = '#fff';
    statusDiv.style.display = 'block';
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 3000);
}

function downloadDemoPDF(filename) {
    const link = document.createElement('a');
    link.href = filename;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showMessageStatus('Download started!', true);
}

function fixCanvasDPI(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function setProfileLetterImage(name) {
    const profileImg = document.querySelector('.dashboard-ellipse71');
    if (!profileImg) {
        console.warn('Element with class="dashboard-ellipse71" not found in the DOM');
        return;
    }

    // Default to 'default.png' if name is invalid or empty
    let letter = '';
    
    if (name && typeof name === 'string' && name.trim().length > 0) {
        const firstLetter = name.trim().charAt(0).toUpperCase();
        // Check if the first character is a letter (A-Z)
        if (/^[A-Z]$/.test(firstLetter)) {
            letter = firstLetter;
        }
    }

    const imgSrc = `pictures/letter/${letter}.png`;
    profileImg.src = imgSrc;
    console.log(`Set profile image to: ${imgSrc}`);

    // Handle image load errors (e.g., if the letter image doesn't exist)
    profileImg.onerror = () => {
        console.warn(`Failed to load image: ${imgSrc}. Falling back to default.png`);
        profileImg.src = 'pictures/default.png';
    };
}

let networkTrafficChart = null;

function renderNetworkTrafficChart(dataArray) {
    const ctx = document.getElementById('networkTrafficChart');
    fixCanvasDPI(ctx);
    if (!ctx) return;
    const labels = [
        "1:00", "5:00", "8:00", "11:00", "14:00", "17:00", "20:00", "23:00"
    ];
    const displayData = dataArray;

    if (networkTrafficChart) {
        networkTrafficChart.data.datasets[0].data = displayData;
        networkTrafficChart.update();
    } else {
        networkTrafficChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Network Traffic',
                    data: displayData,
                    fill: true,
                    borderColor: 'rgba(0, 242, 255, 1)',
                    backgroundColor: 'rgba(0, 242, 255, 0.2)',
                    tension: 0.1,
                    pointRadius: 0
                }]
            },
            options: {
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Network Traffic',
                        color: '#fff',
                        font: { size: 20, weight: 'bold', family: 'Poppins' },
                        align: 'start',
                        padding: { top: 30, left: 20, bottom: 40 }
                    }
                },
                scales: {
                    y: {
                        min: 0,
                        max: 100,
                        ticks: {
                            stepSize: 25,
                            color: '#fff',
                            font: { weight: 'bold', family: 'Poppins' },
                            callback: function(value) { return value + '%'; }
                        },
                        grid: { display: false }
                    },
                    x: {
                        ticks: { color: '#fff', font: { weight: 'bold', family: 'Poppins' } },
                        grid: { display: false }
                    }
                }
            }
        });
    }
}

let connectionsChart = null;

function renderConnectionsChart(dataArray) {
    const ctx = document.getElementById('connectionsChart');
    fixCanvasDPI(ctx);
    if (!ctx) return;
    const labels = ["1:00", "5:00", "8:00", "11:00", "14:00", "17:00", "20:00", "23:00"];
    const displayData = dataArray;

    if (connectionsChart) {
        connectionsChart.data.datasets[0].data = displayData;
        connectionsChart.update();
    } else {
        connectionsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Connections',
                    data: displayData,
                    fill: true,
                    borderColor: 'rgba(0, 242, 255, 1)',
                    backgroundColor: 'rgba(0, 242, 255, 0.2)',
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Connections',
                        color: '#fff',
                        font: { size: 20, weight: 'bold', family: 'Poppins' },
                        align: 'start',
                        padding: { top: 50, left: 0, bottom: 40 }
                    }
                },
                scales: {
                    y: {
                        min: 0,
                        max: 80,
                        ticks: { stepSize: 20, color: '#fff', font: { weight: 'bold', family: 'Poppins' } },
                        grid: { display: false }
                    },
                    x: {
                        ticks: { color: '#fff', font: { weight: 'bold', family: 'Poppins' } },
                        grid: { display: false }
                    }
                }
            }
        });
    }
}

function renderPacketInfoTable(packetInfoList) {
    const tbody = document.getElementById('packetInfoTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    packetInfoList.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.time}</td>
            <td>${row.source}</td>
            <td>${row.destination}</td>
            <td>${row.protocol}</td>
            <td>${row.size}</td>
            <td><span class="status-badge ${row.status.toLowerCase()}">${row.status}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

function updateProtectionStatus(packetInfoList) {
    let safeCount = 0;
    let suspiciousCount = 0;
    if (Array.isArray(packetInfoList)) {
        for (const pkt of packetInfoList) {
            if (pkt.status === 'Safe') safeCount++;
            else if (pkt.status === 'Dangerous') suspiciousCount++;
        }
    }
    console.log("P", safeCount);
    console.log("N", suspiciousCount);
    const statusText = document.querySelector('.dashboard-text25');
    const dotImg = document.querySelector('.dashboard-ellipse4');
    const threatStatus = document.querySelector('.dashboard-text28');
    if (statusText && dotImg && threatStatus) {
        if (safeCount > suspiciousCount) {
            statusText.textContent = 'Protected';
            dotImg.src = 'pictures/green-dot.png';
            threatStatus.textContent = 'Safe';
            threatStatus.style.color = '#19c37d';
        } else if (suspiciousCount === safeCount) {
            statusText.textContent = 'Unprotected';
            dotImg.src = 'pictures/red-dot.png';
            threatStatus.textContent = 'Suspicious';
            threatStatus.style.color = '#fbff00';
        } else {
            statusText.textContent = 'Unprotected';
            dotImg.src = 'pictures/red-dot.png';
            threatStatus.textContent = 'Dangerous';
            threatStatus.style.color = '#e53935';
        }
    }
}

function updateDashboard(data) {
    // const modelAccuracy = document.querySelector('.dashboard-text31');
    // if (modelAccuracy) modelAccuracy.textContent = data.model_accuracy + '%';

    // const modelAccuracyChange = document.querySelector('.dashboard-text30');
    // if (modelAccuracyChange && typeof data.model_accuracy_change === 'number') {
    //     const change = data.model_accuracy_change;
    //     const sign = change > 0 ? '+' : '';
    //     modelAccuracyChange.textContent = `${sign}${change}%`;
    //     modelAccuracyChange.style.color = change >= 0 ? '#19c37d' : '#e53935';
    //     modelAccuracyChange.style.fontWeight = 'bold';
    // }

    const networkLoad = document.querySelector('.dashboard-text34');
    if (networkLoad) networkLoad.textContent = data.network_load;

    const networkLoadBar = document.querySelector('.dashboard-rectangle28');
    if (networkLoadBar && typeof data.network_load === 'string') {
        const percent = parseInt(data.network_load);
        if (!isNaN(percent)) {
            networkLoadBar.style.width = percent + '%';
        }
    }

    // const networkLoadChange = document.querySelector('.dashboard-text32');
    // if (networkLoadChange && typeof data.network_load_change === 'number') {
    //     const change = data.network_load_change;
    //     const sign = change > 0 ? '+' : '';
    //     networkLoadChange.textContent = `${sign}${change}%`;
    //     networkLoadChange.style.color = change >= 0 ? '#19c37d' : '#e53935';
    //     networkLoadChange.style.fontWeight = 'bold';
    //     networkLoadChange.style.marginLeft = '8px';
    // }

    const connections = document.querySelector('.dashboard-text37');
    if (connections) connections.textContent = data.connections;

    const networkTraffic = document.querySelector('.dashboard-text42');
    if (networkTraffic) networkTraffic.textContent = data.network_traffic;

    const packetInfo = document.querySelector('.dashboard-text97');
    if (packetInfo) packetInfo.textContent = data.packet_information;

    if (data.network_traffic_data) {
        renderNetworkTrafficChart(data.network_traffic_data);
    }
    
    if (data.connections_data) {
        renderConnectionsChart(data.connections_data);
    }

    if (data.packet_info) {
        renderPacketInfoTable(data.packet_info);
        updateProtectionStatus(data.packet_info);
    }
}

function fetchDashboardData() {

    Promise.all([
        fetch('https://apiget.huzaifa.cloud/api/dashboard-packet-data').then(res => {
            if (!res.ok) throw new Error(`Packet data error: ${res.status}`);
            return res.json();
        }),
        fetch('https://apiget.huzaifa.cloud/api/dashboard-loadconn-data').then(res => {
            if (!res.ok) throw new Error(`Load/Conn data error: ${res.status}`);
            return res.json();
        })
    ])
    .then(([packetData, loadConnData]) => {
        // Merge the data into a single object for updateDashboard
        const dashboardData = {
            ...loadConnData,
            packet_info: packetData, // assuming packetData is an array of packets
        };
        updateDashboard(dashboardData);
    })
    .catch(err => {
        console.error('Error fetching dashboard data:', err);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    onAuthStateChanged(auth, (user) => {
        const userName = document.getElementById('user-name');
        if (userName) {
            if (user) {
                const displayName = user.displayName || user.email || 'Guest';
                const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1).toLowerCase();
                userName.textContent = capitalizedName;
                console.log('Display name set to:', capitalizedName);
                setProfileLetterImage(displayName); // Set profile image based on first letter
            } else {
                showMessageStatus('Unauthorized User', False);
                // Optionally redirect to sign-in page if user is not authenticated
                window.location.href = '/sign_in_page.html';
            }
        } else {
            console.warn('Element with id="user-name" not found in the DOM');
        }
    });

    const termsElement = document.querySelector('.dashboard-text14');
    if (termsElement) {
        termsElement.addEventListener('click', () => downloadDemoPDF('pdfs/FYP_WEB_PDF_TC.pdf'));
    }
    
    const privacyElement = document.querySelector('.dashboard-text15');
    if (privacyElement) {
        privacyElement.addEventListener('click', () => downloadDemoPDF('pdfs/FYP_WEB_PDF_PP.pdf'));
    }
    
    const faqsElement = document.querySelector('.dashboard-text16');
    if (faqsElement) {
        faqsElement.addEventListener('click', () => downloadDemoPDF('pdfs/FYP_WEB_PDF_FAQ.pdf'));
    }

    fetchDashboardData();
    setInterval(fetchDashboardData, 10000);

    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', fetchDashboardData);
    }

    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            showMessageStatus('Generating PDF...', true);
            const { jsPDF } = window.jspdf;
            const dashboardToExport = document.querySelector('.dashboard-container');
            if (dashboardToExport) {
                html2canvas(dashboardToExport, {
                    useCORS: true,
                    scale: 2
                }).then(canvas => {
                    const imgData = canvas.toDataURL('image/png');
                    const pdfWidth = canvas.width;
                    const pdfHeight = canvas.height;
                    const pdf = new jsPDF({
                        orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
                        unit: 'px',
                        format: [pdfWidth, pdfHeight]
                    });
                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                    pdf.save('dashboard-export.pdf');
                }).catch(err => {
                    console.error("Error generating PDF:", err);
                    showMessageStatus('Failed to generate PDF.', false);
                });
            }
        });
    }
});