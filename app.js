// State
let currentWeek = 1;
let currentTab = 'roadmap';

// DOM Elements
const weekButtonsContainer = document.getElementById('week-buttons');
const navButtons = document.querySelectorAll('.nav-btn');
const contentContainer = document.getElementById('content-container');
const pageTitle = document.getElementById('page-title');
const pageSubtitle = document.getElementById('page-subtitle');
const progressText = document.getElementById('progress-text');

// Initialize
function init() {
    renderWeekButtons();
    
    // Add event listeners for nav tabs
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTab = btn.getAttribute('data-tab');
            renderContent();
        });
    });

    renderContent();
}

// Render Week Selector Buttons
function renderWeekButtons() {
    weekButtonsContainer.innerHTML = '';
    const availableWeeks = Object.keys(aptisData).map(w => parseInt(w));
    
    availableWeeks.forEach(w => {
        const btn = document.createElement('button');
        btn.className = `week-btn ${w === currentWeek ? 'active' : ''}`;
        btn.innerText = `Week ${w}`;
        btn.addEventListener('click', () => {
            currentWeek = w;
            progressText.innerText = `Tuần ${w}`;
            renderWeekButtons(); // Re-render to update active class
            renderContent();
        });
        weekButtonsContainer.appendChild(btn);
    });
}

// Main Render Function
function renderContent() {
    const weekData = aptisData[currentWeek];
    
    if (!weekData) {
        contentContainer.innerHTML = '<p>Dữ liệu tuần này chưa có.</p>';
        return;
    }

    contentContainer.innerHTML = ''; // Clear current content

    switch (currentTab) {
        case 'roadmap':
            pageTitle.innerText = `Lộ trình Tuần ${currentWeek}`;
            pageSubtitle.innerText = "Xem tổng quan kế hoạch học tập của tuần.";
            renderRoadmap(weekData.roadmap);
            break;
        case 'vocab':
            pageTitle.innerText = `Từ vựng Tuần ${currentWeek}`;
            pageSubtitle.innerText = "Học từ vựng qua flashcard tương tác.";
            renderVocab(weekData.vocab);
            break;
        case 'drills':
            pageTitle.innerText = `Bài tập Trắc nghiệm Từ vựng`;
            pageSubtitle.innerText = "Kiểm tra ghi nhớ từ vựng qua các dạng Drills.";
            const drillsData = weekData.vocab?.drills || weekData.vocab?.exercises;
            renderDrills(drillsData);
            break;
        case 'exercises':
            pageTitle.innerText = `Bài tập Kỹ năng (Subskills)`;
            pageSubtitle.innerText = "Luyện tập chi tiết các kỹ năng Nghe, Đọc, Viết, Nói, Ngữ pháp.";
            renderExercises(weekData.exercises);
            break;
    }
}

// Render Roadmap
function renderRoadmap(roadmap) {
    if (!roadmap) {
        contentContainer.innerHTML = '<p>Không có dữ liệu Roadmap.</p>';
        return;
    }

    const container = document.createElement('div');
    container.className = 'roadmap-grid';

    // Header Card
    const headerCard = document.createElement('div');
    headerCard.className = 'roadmap-header-card';
    
    let grammarTags = roadmap.grammar_focus.map(g => `<span class="tag">${g}</span>`).join('');
    
    headerCard.innerHTML = `
        <h3>Mục tiêu: ${roadmap.goal}</h3>
        <p style="margin-bottom: 12px"><strong>Từ vựng trọng tâm:</strong> ${roadmap.vocab_target}</p>
        <div class="focus-tags">
            ${grammarTags}
        </div>
    `;
    container.appendChild(headerCard);

    // Schedule Grid
    const scheduleGrid = document.createElement('div');
    scheduleGrid.className = 'schedule-grid';

    roadmap.schedule.forEach(day => {
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';
        dayCard.innerHTML = `
            <div class="day-badge">${day.day}</div>
            <div class="task-item">
                <div class="task-label">Block 1: Từ vựng</div>
                <div class="task-desc">${day.block1_vocab}</div>
            </div>
            <div class="task-item">
                <div class="task-label">Block 2: Kỹ năng chính</div>
                <div class="task-desc">${day.block2_main}</div>
            </div>
            <div class="task-item">
                <div class="task-label">Block 3: Subskill</div>
                <div class="task-desc">${day.block3_subskill}</div>
            </div>
            <div class="task-item">
                <div class="task-label">Block 4: Ôn tập</div>
                <div class="task-desc">${day.block4_review}</div>
            </div>
        `;
        scheduleGrid.appendChild(dayCard);
    });

    container.appendChild(scheduleGrid);
    contentContainer.appendChild(container);
}

// Render Vocabulary Flashcards
function renderVocab(vocabData) {
    const words = vocabData?.words || vocabData?.vocabulary_list;
    if (!vocabData || !words) {
        contentContainer.innerHTML = '<p>Không có dữ liệu Từ vựng.</p>';
        return;
    }

    // Topics
    const topicsDiv = document.createElement('div');
    topicsDiv.className = 'vocab-topics';
    vocabData.topics.forEach(t => {
        const topic = document.createElement('span');
        topic.className = 'topic-chip';
        topic.innerText = t;
        topicsDiv.appendChild(topic);
    });
    contentContainer.appendChild(topicsDiv);

    // Flashcards Grid
    const grid = document.createElement('div');
    grid.className = 'flashcard-grid';

    words.forEach(word => {
        const card = document.createElement('div');
        card.className = 'flashcard';
        
        let familyStr = 'None';
        if (Array.isArray(word.word_family)) {
            familyStr = word.word_family.length > 0 ? word.word_family.join(', ') : 'None';
        } else if (typeof word.word_family === 'string') {
            familyStr = word.word_family;
        }

        let collocationsStr = word.collocations && word.collocations.length > 0 ? word.collocations.join(', ') : 'None';
        let phoneticsStr = word.phonetics || word.phonetic || '';

        card.innerHTML = `
            <div class="word-header">
                <span class="word-text">${word.word}</span>
                <span class="word-pos">${word.pos}</span>
            </div>
            <div class="word-phonetics">${phoneticsStr}</div>
            <div class="word-meaning">${word.meaning}</div>
            
            <div class="word-details">
                <div class="detail-block">
                    <strong>Ví dụ</strong>
                    ${word.example}
                </div>
                <div class="detail-block">
                    <strong>Collocations</strong>
                    ${collocationsStr}
                </div>
                <div class="detail-block">
                    <strong>Gia đình từ</strong>
                    ${familyStr}
                </div>
                <div class="detail-block">
                    <strong>Ngữ cảnh Aptis</strong>
                    ${word.aptis_context}
                </div>
            </div>
            <div class="expand-hint"><i class="bi bi-arrows-expand"></i> Click để xem chi tiết</div>
        `;

        card.addEventListener('click', () => {
            card.classList.toggle('expanded');
        });

        grid.appendChild(card);
    });

    contentContainer.appendChild(grid);
}

// Render Drills
function renderDrills(drillsData) {
    if (!drillsData) {
        contentContainer.innerHTML = '<p>Không có dữ liệu Drills.</p>';
        return;
    }

    Object.values(drillsData).forEach(drillType => {
        const section = document.createElement('div');
        section.className = 'drill-section';
        
        const title = document.createElement('div');
        title.className = 'drill-title';
        title.innerText = drillType.task || drillType.description || drillType.type || 'Bài tập';
        section.appendChild(title);

        drillType.questions.forEach((q, index) => {
            const qCard = document.createElement('div');
            qCard.className = 'question-card';
            
            const questionStr = q.q || q.target || q.word || q.sentence || 'Chọn đáp án đúng:';
            const safeId = String(index) + Math.random().toString(36).substr(2, 5);
            
            qCard.innerHTML = `
                <div class="question-text"><strong>${questionStr}</strong></div>
                <div class="options-grid" id="opts-${safeId}">
                </div>
                <div class="explanation-box" id="exp-${safeId}">
                    <p><strong>Giải thích:</strong> ${q.explanation}</p>
                </div>
            `;
            
            section.appendChild(qCard);
            
            // Add Options
            const optsGrid = qCard.querySelector('.options-grid');
            const expBox = qCard.querySelector('.explanation-box');
            
            q.options.forEach(opt => {
                const optBtn = document.createElement('button');
                optBtn.className = 'option-btn';
                optBtn.innerText = opt;
                
                optBtn.addEventListener('click', () => {
                    // Disable all options
                    Array.from(optsGrid.children).forEach(b => b.style.pointerEvents = 'none');
                    
                    const isCorrect = opt === q.answer || opt.startsWith(q.answer + '.') || opt.startsWith(q.answer);
                    
                    if (isCorrect) {
                        optBtn.classList.add('correct');
                    } else {
                        optBtn.classList.add('incorrect');
                        // Highlight correct one
                        Array.from(optsGrid.children).forEach(b => {
                            if(b.innerText === q.answer || b.innerText.startsWith(q.answer + '.') || b.innerText.startsWith(q.answer)) {
                                b.classList.add('correct');
                            }
                        });
                    }
                    
                    // Show explanation
                    expBox.style.display = 'block';
                });
                
                optsGrid.appendChild(optBtn);
            });
        });

        contentContainer.appendChild(section);
    });
}

// Render Exercises
function renderExercises(exercisesData) {
    if (!exercisesData || !exercisesData.subskills) {
        contentContainer.innerHTML = '<p>Không có dữ liệu Exercises.</p>';
        return;
    }

    exercisesData.subskills.forEach(subskill => {
        const section = document.createElement('div');
        section.className = 'drill-section';
        
        const title = document.createElement('div');
        title.className = 'drill-title';
        title.innerHTML = `[${subskill.subskill_id}] ${subskill.name} <br><span style="font-size:14px; font-weight:normal; color:#666">${subskill.description}</span>`;
        section.appendChild(title);

        subskill.exercises.forEach((ex, index) => {
            const qCard = document.createElement('div');
            qCard.className = 'question-card';
            
            // Prompt
            const promptStr = `<div style="font-weight:600; color:#4f46e5; margin-bottom:12px;">Câu ${ex.id}: ${ex.prompt}</div>`;
            
            // Audio Player if listening (L1, L2, etc)
            let audioHtml = '';
            if (subskill.subskill_id.startsWith('L') || ex.transcript) {
                // Expected filename format: audio/week{currentWeek}_listen_{ex.id}.mp3
                // Try playing audio, fallback to transcript
                const audioFile = `audio/week${currentWeek}_${subskill.subskill_id.toLowerCase()}_${ex.id}.mp3`;
                audioHtml = `
                    <div class="audio-player-container">
                        <div class="audio-hint">File âm thanh dự kiến: <strong>${audioFile}</strong> (Vui lòng tạo thư mục audio và bỏ file vào đây)</div>
                        <audio controls style="width: 100%; margin-top: 8px;">
                            <source src="${audioFile}" type="audio/mpeg">
                            Trình duyệt của bạn không hỗ trợ thẻ audio.
                        </audio>
                        <div style="margin-top:12px">
                            <button class="nav-btn" style="padding: 6px 12px; font-size:13px; background:#e2e8f0" onclick="this.nextElementSibling.style.display='block'; this.style.display='none'">Hiển thị Transcript</button>
                            <div class="reading-passage" style="display:none; margin-bottom:0; margin-top:10px">${ex.transcript || ex.text_only_version}</div>
                        </div>
                    </div>
                `;
            }

            // Reading text
            let readingHtml = '';
            if (ex.reading_text) {
                readingHtml = `<div class="reading-passage">${ex.reading_text.replace(/\\n/g, '<br>')}</div>`;
            }

            // Message for writing
            let msgHtml = '';
            if (ex.message) {
                msgHtml = `<div class="reading-passage" style="border-color:#10b981"><strong>Tin nhắn nhận được:</strong><br>${ex.message}</div>`;
            }

            // The Question
            let qStr = ex.question || ex.question_text || '';
            if (qStr) qStr = `<div class="question-text">${qStr}</div>`;

            // Step 1 pos (for grammar)
            let step1Html = '';
            if (ex.step_1_pos) {
                step1Html = `<div style="margin-bottom: 12px; padding: 10px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 4px; font-size: 14px;"><strong>Gợi ý phân tích:</strong> ${ex.step_1_pos}</div>`;
            }

            qCard.innerHTML = promptStr + audioHtml + readingHtml + msgHtml + qStr + step1Html;
            
            // Render Interaction Type
            if (ex.type === 'multiple_choice') {
                const optsGrid = document.createElement('div');
                optsGrid.className = 'options-grid';
                
                const expBox = document.createElement('div');
                expBox.className = 'explanation-box';
                expBox.innerHTML = `<p><strong>Giải thích:</strong> ${ex.explanation}</p>`;
                
                Object.entries(ex.options).forEach(([key, val]) => {
                    const optBtn = document.createElement('button');
                    optBtn.className = 'option-btn';
                    optBtn.innerText = `${key}. ${val}`;
                    
                    optBtn.addEventListener('click', () => {
                        Array.from(optsGrid.children).forEach(b => b.style.pointerEvents = 'none');
                        if (key === ex.answer) {
                            optBtn.classList.add('correct');
                        } else {
                            optBtn.classList.add('incorrect');
                            Array.from(optsGrid.children).forEach(b => {
                                if(b.innerText.startsWith(ex.answer)) b.classList.add('correct');
                            });
                        }
                        expBox.style.display = 'block';
                    });
                    
                    optsGrid.appendChild(optBtn);
                });
                
                qCard.appendChild(optsGrid);
                qCard.appendChild(expBox);
            } 
            else if (ex.type === 'short_answer' || ex.type === 'speaking_prompt') {
                const checkBtn = document.createElement('button');
                checkBtn.className = 'check-ans-btn';
                checkBtn.innerText = 'Xem câu trả lời mẫu';
                
                const ansBox = document.createElement('div');
                ansBox.className = 'model-answers';
                ansBox.style.display = 'none';
                
                let modelsHtml = Object.entries(ex.model_answers).map(([level, txt]) => 
                    `<div class="model-answer-item"><strong>Mẫu ${level}:</strong> ${txt}</div>`
                ).join('');
                
                let phrasesHtml = '';
                if (ex.useful_phrases) {
                    phrasesHtml = `<div class="useful-phrases"><strong>Cụm từ hữu ích: </strong> ` + 
                        ex.useful_phrases.map(p => `<span class="phrase-tag">${p}</span>`).join('') + 
                        `</div>`;
                }

                ansBox.innerHTML = modelsHtml + phrasesHtml + `<div class="explanation-box" style="display:block; margin-top:12px; padding:12px;"><p><strong>Phân tích:</strong> ${ex.explanation}</p></div>`;
                
                checkBtn.addEventListener('click', () => {
                    ansBox.style.display = 'block';
                    checkBtn.style.display = 'none';
                });
                
                qCard.appendChild(checkBtn);
                qCard.appendChild(ansBox);
            }

            section.appendChild(qCard);
        });

        contentContainer.appendChild(section);
    });
}

// Start app
document.addEventListener('DOMContentLoaded', init);
