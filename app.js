// State
let currentUser = null;
let userProgress = { exercises: {}, vocabScores: {} };
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
    initAuth();
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
            saveProgress();
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
        case 'vocab-learning':
            pageTitle.innerText = `Luyện tập Từ vựng`;
            pageSubtitle.innerText = "Kiểm tra khả năng ghi nhớ từ vựng qua các bài tập tương tác.";
            renderVocabLearning(weekData.vocab);
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
            
            const exId = `Drill_${currentWeek}_${drillType.type || 'type'}_${index}`;
            const questionStr = q.q || q.target || q.word || q.sentence || 'Chọn đáp án đúng:';
            const safeId = String(index) + Math.random().toString(36).substr(2, 5);
            
            qCard.innerHTML = `
                ${isExerciseCompleted(exId) ? '<span class="completed-badge">✅ Đã hoàn thành</span>' : ''}
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
                    markExerciseCompleted(exId, qCard);
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
            const exId = `${currentWeek}_${subskill.subskill_id}_${ex.id}`;
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
                let formattedText = ex.reading_text.replace(/\\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                readingHtml = `<div class="reading-passage">${formattedText}</div>`;
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
            if (ex.type === 'multiple_choice' || (ex.type === 'matching' && ex.options)) {
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
                    markExerciseCompleted(exId, qCard);
                    });
                    
                    optsGrid.appendChild(optBtn);
                });
                
                qCard.appendChild(optsGrid);
                qCard.appendChild(expBox);
            } 
            else if (ex.type === 'short_answer' || ex.type === 'speaking_prompt' || ex.type === 'writing_contrast') {
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
                    markExerciseCompleted(exId, qCard);
                });
                
                qCard.appendChild(checkBtn);
                qCard.appendChild(ansBox);
            }
            else if (ex.type === 'ordering') {
                const list = document.createElement('ul');
                list.style.listStyleType = 'none';
                list.style.paddingLeft = '0';
                list.style.marginBottom = '15px';
                
                if (ex.sentences) {
                    ex.sentences.forEach(s => {
                        const li = document.createElement('li');
                        li.style.padding = '8px';
                        li.style.border = '1px solid #ddd';
                        li.style.marginBottom = '5px';
                        li.style.borderRadius = '4px';
                        li.style.background = '#f9f9f9';
                        li.innerHTML = `<strong>${s.id}.</strong> ${s.text}`;
                        list.appendChild(li);
                    });
                }
                
                const checkBtn = document.createElement('button');
                checkBtn.className = 'check-ans-btn';
                checkBtn.innerText = 'Xem đáp án';
                
                const ansBox = document.createElement('div');
                ansBox.className = 'explanation-box';
                ansBox.style.display = 'none';
                let orderStr = ex.answer ? (Array.isArray(ex.answer) ? ex.answer.join(' &rarr; ') : ex.answer) : '';
                ansBox.innerHTML = `
                    <p><strong>Thứ tự đúng:</strong> ${orderStr}</p>
                    <p><strong>Giải thích:</strong> ${ex.explanation || ''}</p>
                `;
                
                checkBtn.addEventListener('click', () => {
                    ansBox.style.display = 'block';
                    checkBtn.style.display = 'none';
                    markExerciseCompleted(exId, qCard);
                });
                
                qCard.appendChild(list);
                qCard.appendChild(checkBtn);
                qCard.appendChild(ansBox);
            }
            else if (ex.type === 'matching' && ex.pairs) {
                const keys = Object.keys(ex.pairs);
                const vals = Object.values(ex.pairs).sort(() => 0.5 - Math.random());
                const colors = ['#fecaca', '#bfdbfe', '#bbf7d0', '#fef08a', '#e9d5ff', '#fed7aa', '#fbcfe8', '#d9f99d'];
                let colorIndex = 0;
                
                let selectedA = null;
                let userMatches = {}; // key -> val
                let aButtons = {}; // key -> dom
                let bButtons = {}; // val -> dom

                const flexBox = document.createElement('div');
                if (isExerciseCompleted(exId)) {
                    const badge = document.createElement('span');
                    badge.className = 'completed-badge';
                    badge.innerText = '✅ Đã hoàn thành';
                    badge.style.display = 'block';
                    badge.style.width = 'fit-content';
                    badge.style.marginBottom = '10px';
                    qCard.appendChild(badge);
                }
                flexBox.style.display = 'flex';
                flexBox.style.gap = '20px';
                flexBox.style.marginBottom = '15px';
                
                const col1 = document.createElement('div');
                col1.style.flex = '1';
                col1.innerHTML = '<strong style="display:block;margin-bottom:10px;">Cột A</strong>';
                
                const col2 = document.createElement('div');
                col2.style.flex = '1';
                col2.innerHTML = '<strong style="display:block;margin-bottom:10px;">Cột B</strong>';
                
                const renderButtons = () => {
                    Object.keys(aButtons).forEach(k => {
                        let btn = aButtons[k];
                        if (userMatches[k]) {
                            btn.style.borderColor = btn.dataset.color;
                            btn.style.backgroundColor = btn.dataset.color;
                            btn.style.color = '#1e293b';
                        } else if (selectedA === k) {
                            btn.style.borderColor = '#3b82f6';
                            btn.style.backgroundColor = '#eff6ff';
                            btn.style.color = '#1e293b';
                        } else {
                            btn.style.borderColor = '#e2e8f0';
                            btn.style.backgroundColor = '#fff';
                            btn.style.color = '#334155';
                        }
                    });

                    Object.keys(bButtons).forEach(v => {
                        let btn = bButtons[v];
                        let matchedKey = Object.keys(userMatches).find(k => userMatches[k] === v);
                        if (matchedKey) {
                            btn.style.borderColor = aButtons[matchedKey].dataset.color;
                            btn.style.backgroundColor = aButtons[matchedKey].dataset.color;
                            btn.style.color = '#1e293b';
                        } else {
                            btn.style.borderColor = '#e2e8f0';
                            btn.style.backgroundColor = '#fff';
                            btn.style.color = '#334155';
                        }
                    });
                };

                keys.forEach(k => {
                    let btn = document.createElement('button');
                    btn.className = 'learning-option-btn';
                    btn.style.display = 'block';
                    btn.style.width = '100%';
                    btn.style.marginBottom = '8px';
                    btn.style.padding = '10px';
                    btn.style.textAlign = 'left';
                    btn.style.fontSize = '14px';
                    btn.style.transition = 'all 0.2s ease';
                    btn.innerText = k;
                    aButtons[k] = btn;
                    col1.appendChild(btn);

                    btn.addEventListener('click', () => {
                        if (userMatches[k]) {
                            delete userMatches[k];
                        } else {
                            if (selectedA === k) {
                                selectedA = null;
                            } else {
                                selectedA = k;
                                if (!btn.dataset.color) {
                                    btn.dataset.color = colors[colorIndex % colors.length];
                                    colorIndex++;
                                }
                            }
                        }
                        renderButtons();
                    });
                });

                vals.forEach(v => {
                    let btn = document.createElement('button');
                    btn.className = 'learning-option-btn';
                    btn.style.display = 'block';
                    btn.style.width = '100%';
                    btn.style.marginBottom = '8px';
                    btn.style.padding = '10px';
                    btn.style.textAlign = 'left';
                    btn.style.fontSize = '14px';
                    btn.style.transition = 'all 0.2s ease';
                    btn.innerText = v;
                    bButtons[v] = btn;
                    col2.appendChild(btn);

                    btn.addEventListener('click', () => {
                        let matchedKey = Object.keys(userMatches).find(key => userMatches[key] === v);
                        if (matchedKey) {
                            delete userMatches[matchedKey];
                        }

                        if (selectedA) {
                            userMatches[selectedA] = v;
                            selectedA = null;
                        }
                        renderButtons();
                    });
                });
                
                flexBox.appendChild(col1);
                flexBox.appendChild(col2);
                
                const checkBtn = document.createElement('button');
                checkBtn.className = 'check-ans-btn';
                checkBtn.innerText = 'Kiểm tra';
                checkBtn.style.marginTop = '10px';
                
                const ansBox = document.createElement('div');
                ansBox.className = 'explanation-box';
                ansBox.style.display = 'none';
                let pairsHtml = keys.map(k => `<li><strong>${k}</strong> &rarr; ${ex.pairs[k]}</li>`).join('');
                ansBox.innerHTML = `
                    <div id="matching-feedback" style="font-weight:bold; margin-bottom:10px; font-size:16px;"></div>
                    <p><strong>Các cặp đúng:</strong></p>
                    <ul style="padding-left:20px; margin-bottom:10px;">${pairsHtml}</ul>
                    <p><strong>Giải thích:</strong> ${ex.explanation || ''}</p>
                `;
                
                checkBtn.addEventListener('click', () => {
                    let correctCount = 0;
                    keys.forEach(k => {
                        if (userMatches[k] === ex.pairs[k]) {
                            correctCount++;
                            aButtons[k].style.border = '2px solid #22c55e'; // Green border
                            bButtons[userMatches[k]].style.border = '2px solid #22c55e';
                        } else {
                            aButtons[k].style.border = '2px solid #ef4444'; // Red border
                            if (userMatches[k]) bButtons[userMatches[k]].style.border = '2px solid #ef4444';
                        }
                    });

                    ansBox.querySelector('#matching-feedback').innerText = `Kết quả: ${correctCount} / ${keys.length} đúng`;
                    ansBox.querySelector('#matching-feedback').style.color = correctCount === keys.length ? '#15803d' : '#b91c1c';
                    ansBox.style.display = 'block';
                    checkBtn.style.display = 'none';
                    markExerciseCompleted(exId, qCard);
                });
                
                qCard.appendChild(flexBox);
                qCard.appendChild(checkBtn);
                qCard.appendChild(ansBox);
                renderButtons();
            }

            section.appendChild(qCard);
        });

        contentContainer.appendChild(section);
    });
}

// --- VOCAB LEARNING STATE ---
let vlCurrentWords = [];
let vlQuestions = [];
let vlCurrentQIndex = 0;
let vlScore = 0;
let vlMode = 0; // 0: None, 1: Word->Meaning, 2: Meaning->Word, 3: Fill Blanks

// Render Vocab Learning Main Screen
function renderVocabLearning(vocabData) {
    if (!vocabData || (!vocabData.words && !vocabData.vocabulary_list)) {
        contentContainer.innerHTML = '<p>Không có dữ liệu Từ vựng để học.</p>';
        return;
    }

    const words = vocabData.words || vocabData.vocabulary_list;
    vlCurrentWords = [...words];

    // Menu Mode Selection
    contentContainer.innerHTML = `
        <div class="learning-container">
            <h2 style="text-align: center; margin-bottom: 24px; color: var(--primary);">Chọn Chế độ Học</h2>
            <div class="learning-modes">
                <div class="mode-card" onclick="startVocabLearning(1)">
                    <i class="bi bi-translate"></i>
                    <h3>Từ -> Nghĩa</h3>
                    <p>Cho từ tiếng Anh, chọn nghĩa tiếng Việt đúng (Trắc nghiệm)</p>
                </div>
                <div class="mode-card" onclick="startVocabLearning(2)">
                    <i class="bi bi-body-text"></i>
                    <h3>Nghĩa -> Từ</h3>
                    <p>Cho nghĩa tiếng Việt, chọn từ tiếng Anh tương ứng (Trắc nghiệm)</p>
                </div>
                <div class="mode-card" onclick="startVocabLearning(3)">
                    <i class="bi bi-keyboard"></i>
                    <h3>Điền từ</h3>
                    <p>Cho nghĩa tiếng Việt, gõ lại từ tiếng Anh chính xác</p>
                </div>
            </div>
            <p style="text-align:center; color: var(--text-muted); font-size: 14px;">
                * Hệ thống sẽ chọn ngẫu nhiên 25 từ trong bài học tuần này để kiểm tra.
            </p>
        </div>
    `;
}

// Start a learning mode
window.startVocabLearning = function(mode) {
    vlMode = mode;
    vlScore = 0;
    vlCurrentQIndex = 0;
    
    // Select 25 random words (or all if < 25)
    let shuffled = [...vlCurrentWords].sort(() => 0.5 - Math.random());
    let selectedWords = shuffled.slice(0, 25);
    
    vlQuestions = selectedWords.map(word => {
        // Generate distractors
        let distractors = [];
        let allOtherWords = vlCurrentWords.filter(w => w.word !== word.word);
        allOtherWords.sort(() => 0.5 - Math.random());
        
        if (mode === 1) {
            distractors = allOtherWords.slice(0, 3).map(w => w.meaning);
        } else if (mode === 2) {
            distractors = allOtherWords.slice(0, 3).map(w => w.word);
        }
        
        return {
            targetWord: word.word,
            meaning: word.meaning,
            pos: word.pos,
            phonetics: word.phonetics || word.phonetic || '',
            distractors: distractors
        };
    });

    renderCurrentQuestion();
};

// Render the current question
function renderCurrentQuestion() {
    if (vlCurrentQIndex >= vlQuestions.length) {
        renderVocabLearningResult();
        return;
    }

    const q = vlQuestions[vlCurrentQIndex];
    const total = vlQuestions.length;
    const progressPercent = ((vlCurrentQIndex) / total) * 100;

    let html = `
        <div class="learning-container">
            <div class="learning-header">
                <button class="nav-btn" onclick="renderContent()" style="padding: 8px 16px; background: white; border: 1px solid #e2e8f0;"><i class="bi bi-arrow-left"></i> Quay lại menu</button>
                <div class="learning-progress-text">Câu ${vlCurrentQIndex + 1} / ${total}</div>
            </div>
            <div class="learning-progress-bar-bg">
                <div class="learning-progress-bar-fill" style="width: ${progressPercent}%"></div>
            </div>
    `;

    if (vlMode === 1) {
        // Word -> Meaning (Multiple Choice)
        let options = [q.meaning, ...q.distractors].sort(() => 0.5 - Math.random());
        
        html += `
            <div class="learning-question-card">
                <div class="learning-question-sub">${q.phonetics} <span style="color:var(--primary); font-weight:600">(${q.pos})</span></div>
                <div class="learning-question-text">${q.targetWord}</div>
                <div style="margin-bottom:30px; font-size:14px; color:var(--text-muted)">Nghĩa của từ này là gì?</div>
                
                <div class="learning-options-grid" id="vl-options">
                    ${options.map(opt => `<button class="learning-option-btn" onclick="checkVocabAnswer('${opt.replace(/'/g, "\\'")}', '${q.meaning.replace(/'/g, "\\'")}', this, 1)">${opt}</button>`).join('')}
                </div>
                <div id="vl-feedback" class="learning-feedback"></div>
            </div>
        `;
    } else if (vlMode === 2) {
        // Meaning -> Word (Multiple Choice)
        let options = [q.targetWord, ...q.distractors].sort(() => 0.5 - Math.random());
        
        html += `
            <div class="learning-question-card">
                <div class="learning-question-sub">Tìm từ tiếng Anh có nghĩa là:</div>
                <div class="learning-question-text">${q.meaning}</div>
                <div style="margin-bottom:30px; font-size:14px; color:var(--text-muted)">(${q.pos})</div>
                
                <div class="learning-options-grid" id="vl-options">
                    ${options.map(opt => `<button class="learning-option-btn" onclick="checkVocabAnswer('${opt.replace(/'/g, "\\'")}', '${q.targetWord.replace(/'/g, "\\'")}', this, 2)">${opt}</button>`).join('')}
                </div>
                <div id="vl-feedback" class="learning-feedback"></div>
            </div>
        `;
    } else if (vlMode === 3) {
        // Meaning -> Fill in the blank
        html += `
            <div class="learning-question-card">
                <div class="learning-question-sub">Điền từ tiếng Anh có nghĩa là:</div>
                <div class="learning-question-text">${q.meaning}</div>
                <div style="margin-bottom:30px; font-size:14px; color:var(--text-muted)">(${q.pos})</div>
                
                <div class="learning-input-container">
                    <input type="text" id="vl-input" class="learning-input" placeholder="Gõ câu trả lời của bạn vào đây..." autocomplete="off" onkeypress="if(event.key === 'Enter') submitVocabInput()">
                    <button class="learning-submit-btn" onclick="submitVocabInput()">Kiểm tra</button>
                </div>
                <div id="vl-feedback" class="learning-feedback"></div>
            </div>
        `;
    }

    html += `</div>`;
    contentContainer.innerHTML = html;
    
    if (vlMode === 3) {
        setTimeout(() => document.getElementById('vl-input').focus(), 100);
    }
}

// Check answer for Mode 1 and 2
window.checkVocabAnswer = function(selected, correct, btnElement, mode) {
    const grid = document.getElementById('vl-options');
    const feedback = document.getElementById('vl-feedback');
    
    // Disable all buttons
    Array.from(grid.children).forEach(b => b.style.pointerEvents = 'none');
    
    if (selected === correct) {
        btnElement.classList.add('correct');
        feedback.innerText = 'Chính xác! 🎉';
        feedback.className = 'learning-feedback success';
        vlScore++;
    } else {
        btnElement.classList.add('incorrect');
        feedback.innerText = `Sai rồi! Đáp án đúng là: ${correct}`;
        feedback.className = 'learning-feedback error';
        
        // Highlight correct answer
        Array.from(grid.children).forEach(b => {
            if (b.innerText === correct) b.classList.add('correct');
        });
    }

    // Go to next question after delay
    setTimeout(() => {
        vlCurrentQIndex++;
        renderCurrentQuestion();
    }, 1500);
};

// Check answer for Mode 3 (Fill in the blank)
window.submitVocabInput = function() {
    const inputEl = document.getElementById('vl-input');
    const feedback = document.getElementById('vl-feedback');
    const q = vlQuestions[vlCurrentQIndex];
    const correct = q.targetWord.toLowerCase().trim();
    const userAnswer = inputEl.value.toLowerCase().trim();
    
    if (!userAnswer) return;

    inputEl.disabled = true;
    document.querySelector('.learning-submit-btn').style.pointerEvents = 'none';

    if (userAnswer === correct) {
        inputEl.classList.add('correct');
        feedback.innerText = 'Chính xác! 🎉';
        feedback.className = 'learning-feedback success';
        vlScore++;
    } else {
        inputEl.classList.add('incorrect');
        feedback.innerText = `Sai rồi! Đáp án đúng là: ${q.targetWord}`;
        feedback.className = 'learning-feedback error';
    }

    setTimeout(() => {
        vlCurrentQIndex++;
        renderCurrentQuestion();
    }, 2000);
};

// Render final result
function renderVocabLearningResult() {
    const total = vlQuestions.length;
    const percent = Math.round((vlScore / total) * 100);
    let message = "";
    if(currentUser) {
        userProgress.vocabScores[`Week${currentWeek}_Mode${vlMode}`] = Math.max(userProgress.vocabScores[`Week${currentWeek}_Mode${vlMode}`] || 0, vlScore);
        saveProgress();
    }
    if (percent >= 90) message = "Tuyệt vời! Bạn có trí nhớ siêu phàm! 🏆";
    else if (percent >= 70) message = "Rất tốt! Hãy tiếp tục phát huy! 👍";
    else if (percent >= 50) message = "Khá tốt! Bạn cần ôn lại một chút nữa nhé. 💪";
    else message = "Bạn cần luyện tập thêm nhiều hơn. Đừng bỏ cuộc! 📚";

    contentContainer.innerHTML = `
        <div class="learning-container">
            <div class="learning-result-card">
                <h2>Kết quả Luyện tập</h2>
                <div class="learning-score">${vlScore} / ${total}</div>
                <p style="font-size: 18px; margin-bottom: 30px;">${message}</p>
                <div style="display: flex; gap: 16px; justify-content: center;">
                    <button class="nav-btn" onclick="startVocabLearning(vlMode)" style="background: var(--primary); color: white; padding: 12px 24px;"><i class="bi bi-arrow-clockwise"></i> Thử lại chế độ này</button>
                    <button class="nav-btn" onclick="renderContent()" style="background: #e2e8f0; padding: 12px 24px;"><i class="bi bi-house"></i> Về Menu Học</button>
                </div>
            </div>
        </div>
    `;
}

// Start app
document.addEventListener('DOMContentLoaded', init);


// --- AUTH & PROGRESS LOGIC ---
function initAuth() {
    const modal = document.getElementById('login-modal');
    const form = document.getElementById('login-form');
    const usernameInput = document.getElementById('username-input');
    const userProfile = document.getElementById('user-profile');
    const usernameDisplay = document.getElementById('username-display');
    const logoutBtn = document.getElementById('logout-btn');

    if (!modal) return; // Prevent errors if html not loaded

    const savedUser = localStorage.getItem('aptis_currentUser');
    if (savedUser) {
        currentUser = savedUser;
        modal.style.display = 'none';
        userProfile.style.display = 'flex';
        usernameDisplay.innerText = currentUser;
        loadProgress();
    } else {
        modal.style.display = 'flex';
        userProfile.style.display = 'none';
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = usernameInput.value.trim();
        if (val) {
            currentUser = val;
            localStorage.setItem('aptis_currentUser', val);
            modal.style.display = 'none';
            userProfile.style.display = 'flex';
            usernameDisplay.innerText = currentUser;
            loadProgress();
        }
    });

    logoutBtn.addEventListener('click', () => {
        currentUser = null;
        userProgress = { exercises: {}, vocabScores: {} };
        localStorage.removeItem('aptis_currentUser');
        modal.style.display = 'flex';
        userProfile.style.display = 'none';
        usernameInput.value = '';
        
        currentWeek = 1;
        progressText.innerText = 'Tuần 1';
        renderWeekButtons();
        renderContent();
    });
}

function loadProgress() {
    const data = localStorage.getItem('aptis_progress_' + currentUser);
    if (data) {
        userProgress = JSON.parse(data);
        if (!userProgress.exercises) userProgress.exercises = {};
        if (!userProgress.vocabScores) userProgress.vocabScores = {};
        if (userProgress.currentWeek) {
            currentWeek = userProgress.currentWeek;
            progressText.innerText = `Tuần ${currentWeek}`;
        }
    } else {
        userProgress = { exercises: {}, vocabScores: {} };
    }
    renderWeekButtons();
    renderContent();
}

function saveProgress() {
    if (!currentUser) return;
    userProgress.currentWeek = currentWeek;
    localStorage.setItem('aptis_progress_' + currentUser, JSON.stringify(userProgress));
}

function markExerciseCompleted(exId, qCardElement) {
    if (!currentUser) return;
    if (!userProgress.exercises[exId]) {
        userProgress.exercises[exId] = true;
        saveProgress();
        
        // Visual update if badge doesn't exist
        if (qCardElement && !qCardElement.querySelector('.completed-badge')) {
            const badge = document.createElement('span');
            badge.className = 'completed-badge';
            badge.innerText = '✅ Đã hoàn thành';
            
            // Check if it's matching which uses appendChild, else prepend
            if(qCardElement.querySelector('.learning-option-btn')) {
                 qCardElement.insertBefore(badge, qCardElement.firstChild);
            } else {
                 qCardElement.insertBefore(badge, qCardElement.firstChild);
            }
        }
    }
}

function isExerciseCompleted(exId) {
    return userProgress && userProgress.exercises && userProgress.exercises[exId];
}
