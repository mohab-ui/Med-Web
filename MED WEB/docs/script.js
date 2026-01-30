// ==========================================
// 1. إعدادات الربط بالشيت
// ==========================================
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRXESWg32PIPo2yX1lkjWuUmDAACiI_XnAfcIxPwrfR_3aqRCYn6Cjcc_uwW5B5pEJe0lCmL31GM2l3/pub?output=csv"; 

const universityDatabase = [
    "30101010000000", "30202020000000", "12345678901234", "11111111111111"
];

let coursesData = {
    pharma: { title: "PHARMA - علم الأدوية", color: "#dd6b20", bookUrl: "", lectures: [] },
    para:   { title: "PARA - الطفيليات",   color: "#38a169", bookUrl: "", lectures: [] },
    micro:  { title: "MICRO - المايكرو",   color: "#805ad5", bookUrl: "", lectures: [] },
    patho:  { title: "PATHO - علم الأمراض", color: "#e53e3e", bookUrl: "", lectures: [] },
    ece1:   { title: "ECE 1 - الكترونيات",  color: "#3182ce", bookUrl: "", lectures: [] }
};

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('loginForm')) setupLoginPage();

    if (document.getElementById('course-title')) {
        // إضافة رقم عشوائي للرابط عشان يجبر التحديث
        fetchSheetData().then(() => { loadCourseContent(); });
    }
});

async function fetchSheetData() {
    try {
        const response = await fetch(SHEET_URL + "&t=" + new Date().getTime());
        const data = await response.text();
        const rows = data.split('\n').slice(1);

        rows.forEach(row => {
            const cols = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
            
            if(cols && cols.length >= 2) {
                const courseCode = cols[0].replace(/,/g, '').trim().toLowerCase(); 
                const rowName = cols[1] ? cols[1].replace(/"/g, '').replace(/,/g, '').trim() : "";
                const link = cols[2] ? cols[2].replace(/,/g, '').trim() : "";
                const audio = cols[3] ? cols[3].replace(/,/g, '').trim() : "";
                const quiz = cols[4] ? cols[4].replace(/,/g, '').trim() : "";

                if (coursesData[courseCode]) {
                    // تصليح: استخدام includes عشان لو في مسافات زيادة
                    if (rowName.toUpperCase().includes("TEXTBOOK")) {
                        coursesData[courseCode].bookUrl = link;
                    } 
                    else {
                        coursesData[courseCode].lectures.push({
                            name: rowName,
                            pdf: link.length > 5 ? link : "",
                            audio: audio.length > 5 ? audio : "",
                            quiz: quiz.length > 5 ? quiz : ""
                        });
                    }
                }
            }
        });
    } catch (error) {
        console.error(error);
    }
}

function loadCourseContent() {
    const courseId = localStorage.getItem('selectedCourse');
    const container = document.getElementById('lectures-container');
    const titleEl = document.getElementById('course-title');
    
    if (!courseId || !coursesData[courseId]) { return; }

    const data = coursesData[courseId];
    titleEl.innerText = data.title;
    container.innerHTML = "";

    // 1. عرض كتاب المادة (لو موجود) في الكارت الأزرق
    if (data.bookUrl && data.bookUrl.length > 5) {
        // تحويل رابط المعاينة لرابط تحميل للكتاب
        const downloadBook = data.bookUrl.replace("/view", "/uc?export=download");
        
        const bookHTML = `
            <div class="course-book-card">
                <div class="book-info">
                    <div class="book-icon">📚</div>
                    <div class="book-text">
                        <h3>كتاب المادة (Textbook)</h3>
                        <p>مرجع المادة الرسمي PDF</p>
                    </div>
                </div>
                <div>
                     <a href="${data.bookUrl}" target="_blank" class="eye-btn" title="معاينة">👁️</a>
                    <a href="${downloadBook}" class="download-book-btn">⬇ تحميل الكتاب</a>
                </div>
            </div>`;
        container.innerHTML += bookHTML;
    }

    // 2. عرض المحاضرات
    if (data.lectures.length === 0) {
        container.innerHTML += "<p style='text-align:center; color:#718096; margin-top:30px;'>لا توجد محاضرات مضافة حتى الآن ⏳</p>";
        return;
    }

    data.lectures.forEach((lec, index) => {
        // تحويل رابط المعاينة لرابط تحميل للـ PDF
        let pdfDownloadLink = lec.pdf;
        if (lec.pdf.includes("drive.google.com")) {
            pdfDownloadLink = lec.pdf.replace("/view", "/uc?export=download");
        }

        const lecCard = `
            <div class="lecture-card">
                <div class="lec-info">
                    <span class="lec-number">#${index + 1}</span>
                    <h3>${lec.name}</h3>
                </div>
                <div class="lec-actions">
                    ${lec.pdf ? `
                        <div style="display:flex; align-items:center;">
                            <a href="${pdfDownloadLink}" class="btn pdf-btn">📄 PDF</a>
                            <a href="${lec.pdf}" target="_blank" class="eye-btn" title="معاينة">👁️</a>
                        </div>
                    ` : ''}
                    
                    ${lec.audio ? `<a href="${lec.audio}" target="_blank" class="btn audio-btn">🎧 Voice</a>` : ''}
                    ${lec.quiz ? `<a href="${lec.quiz}" target="_blank" class="btn quiz-btn">❓ Quiz</a>` : ''}
                </div>
            </div>`;
        container.innerHTML += lecCard;
    });
}

// (سيب باقي دوال تسجيل الدخول setupLoginPage زي ما هي تحت عشان الكود ميبقاش طويل)
function setupLoginPage() {
    // ... نفس الكود القديم
    const loginBox = document.getElementById('login-box');
    const registerBox = document.getElementById('register-box');
    const loginError = document.getElementById('loginError');
    const regError = document.getElementById('regError');
    const regSuccess = document.getElementById('regSuccess');

    window.showRegister = function() {
        loginBox.style.display = 'none'; registerBox.style.display = 'block'; loginError.style.display = 'none';
    };
    window.showLogin = function() {
        registerBox.style.display = 'none'; loginBox.style.display = 'block'; regError.style.display = 'none';
    };

    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const id = document.getElementById('loginID').value;
        const pass = document.getElementById('loginPass').value;
        let registeredUsers = JSON.parse(localStorage.getItem('usersDB')) || [];
        const user = registeredUsers.find(u => u.id === id && u.pass === pass);
        if (user) {
            localStorage.setItem('currentUser', user.name);
            window.location.href = "dashboard.html";
        } else {
            loginError.style.display = 'block';
            loginError.textContent = "بيانات خاطئة.";
        }
    });

    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const id = document.getElementById('regID').value;
        const name = document.getElementById('regName').value;
        const pass = document.getElementById('regPass').value;

        if (!universityDatabase.includes(id)) {
            regError.style.display = 'block'; regError.textContent = "الرقم القومي غير مسجل."; return;
        }
        let registeredUsers = JSON.parse(localStorage.getItem('usersDB')) || [];
        if (registeredUsers.find(u => u.id === id)) {
            regError.style.display = 'block'; regError.textContent = "الحساب مسجل بالفعل."; return;
        }
        registeredUsers.push({ id, name, pass });
        localStorage.setItem('usersDB', JSON.stringify(registeredUsers));
        regSuccess.style.display = 'block';
        setTimeout(showLogin, 1500);
    });
}
