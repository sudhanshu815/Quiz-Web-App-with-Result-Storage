'use strict';

    const QUESTIONS = [
      { category: 'HTML', question: 'Which HTML tag is used to create a hyperlink?', options: ['<a>', '<link>', '<href>', '<url>'], answer: 0 },
      { category: 'CSS', question: 'Which property is used to change text color in CSS?', options: ['font-style', 'color', 'text-color', 'foreground'], answer: 1 },
      { category: 'JavaScript', question: 'Which keyword declares a block-scoped variable?', options: ['var', 'let', 'static', 'int'], answer: 1 },
      { category: 'HTML', question: 'Which tag is used for the largest heading?', options: ['<h6>', '<heading>', '<h1>', '<header>'], answer: 2 },
      { category: 'CSS', question: 'What does CSS stand for?', options: ['Creative Style System', 'Cascading Style Sheets', 'Computer Style Syntax', 'Colorful Styling Sheet'], answer: 1 },
      { category: 'JavaScript', question: 'Which method converts JSON string into an object?', options: ['JSON.parse()', 'JSON.stringify()', 'Object.toJSON()', 'JSON.read()'], answer: 0 },

      /* ----------- HTML (5 more) ----------- */
      { category: 'HTML', question: 'Which tag is used to insert an image?', options: ['<img>', '<image>', '<pic>', '<src>'], answer: 0 },
      { category: 'HTML', question: 'Which attribute specifies alternate text for an image?', options: ['title', 'alt', 'src', 'href'], answer: 1 },
      { category: 'HTML', question: 'Which tag is used to create a table row?', options: ['<td>', '<tr>', '<th>', '<table-row>'], answer: 1 },
      { category: 'HTML', question: 'Which tag is used for line break?', options: ['<lb>', '<break>', '<br>', '<line>'], answer: 2 },
      { category: 'HTML', question: 'Which element is used for inserting a video?', options: ['<media>', '<video>', '<movie>', '<vid>'], answer: 1 },

      /* ----------- CSS (5 more) ----------- */
      { category: 'CSS', question: 'Which property controls the size of text?', options: ['text-size', 'font-size', 'text-style', 'font-style'], answer: 1 },
      { category: 'CSS', question: 'Which property is used to set background color?', options: ['bgcolor', 'background-color', 'color', 'bg'], answer: 1 },
      { category: 'CSS', question: 'Which CSS property controls spacing between elements?', options: ['spacing', 'margin', 'padding', 'gap'], answer: 1 },
      { category: 'CSS', question: 'Which property is used to make text bold?', options: ['font-weight', 'text-bold', 'font-style', 'bold'], answer: 0 },
      { category: 'CSS', question: 'Which property sets the border radius?', options: ['corner-radius', 'border-radius', 'radius', 'curve'], answer: 1 },

      /* ----------- JavaScript (5 more) ----------- */
      { category: 'JavaScript', question: 'Which function is used to print in console?', options: ['print()', 'console.log()', 'log()', 'echo()'], answer: 1 },
      { category: 'JavaScript', question: 'Which operator is used for strict equality?', options: ['==', '=', '===', '!='], answer: 2 },
      { category: 'JavaScript', question: 'Which method adds an element at end of array?', options: ['push()', 'pop()', 'shift()', 'add()'], answer: 0 },
      { category: 'JavaScript', question: 'Which keyword is used to define a function?', options: ['def', 'function', 'fun', 'define'], answer: 1 },
      { category: 'JavaScript', question: 'Which method removes last element of array?', options: ['remove()', 'pop()', 'delete()', 'shift()'], answer: 1 }
    ];

    const STORAGE_KEY = 'proquiz_results_v2';

    const el = {
      totalQuestions: document.getElementById('totalQuestions'),
      bestScore: document.getElementById('bestScore'),
      attempts: document.getElementById('attempts'),
      nameInput: document.getElementById('nameInput'),
      categorySelect: document.getElementById('categorySelect'),
      startBtn: document.getElementById('startBtn'),
      clearHistoryBtn: document.getElementById('clearHistoryBtn'),
      quizMeta: document.getElementById('quizMeta'),
      questionText: document.getElementById('questionText'),
      timerBadge: document.getElementById('timerBadge'),
      progressBar: document.getElementById('progressBar'),
      optionsContainer: document.getElementById('optionsContainer'),
      prevBtn: document.getElementById('prevBtn'),
      nextBtn: document.getElementById('nextBtn'),
      submitBtn: document.getElementById('submitBtn'),
      resultCard: document.getElementById('resultCard'),
      resultName: document.getElementById('resultName'),
      resultScore: document.getElementById('resultScore'),
      resultPercent: document.getElementById('resultPercent'),
      resultTag: document.getElementById('resultTag'),
      reviewContainer: document.getElementById('reviewContainer'),
      historyList: document.getElementById('historyList')
    };

    let filteredQuestions = [...QUESTIONS];
    let currentIndex = 0;
    let selectedAnswers = [];
    let started = false;
    let userName = '';
    let timerId = null;
    let seconds = 0;

    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

    function escapeHTML(value) {
      return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
    }

    function readResults() {
      try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
      } catch {
        return [];
      }
    }

    function writeResults(results) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    }

    function updateStats() {
      const results = readResults();
      el.attempts.textContent = results.length;
      el.bestScore.textContent = results.length ? `${Math.max(...results.map(r => r.percentage))}%` : '0%';
    }

    function renderHistory() {
      const results = readResults().slice().reverse();

      if (!results.length) {
        el.historyList.innerHTML = `
          <div class="history-item">
            <strong>No saved results yet</strong>
            <span>Take a quiz and your performance will be saved here automatically.</span>
          </div>
        `;
        return;
      }

      el.historyList.innerHTML = results.map(item => `
        <div class="history-item">
          <strong>${escapeHTML(item.name)}</strong>
          <span>
            Score: ${item.score}/${item.total} • ${item.percentage}%<br>
            Category: ${escapeHTML(item.category)} • ${new Date(item.date).toLocaleString()}
          </span>
        </div>
      `).join('');
    }

    function applyCategoryFilter() {
      const category = el.categorySelect.value;
      filteredQuestions = category === 'All'
        ? [...QUESTIONS]
        : QUESTIONS.filter(q => q.category === category);
    }

    function formatTime(totalSeconds) {
      const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
      const ss = String(totalSeconds % 60).padStart(2, '0');
      return `${mm}:${ss}`;
    }

    function startTimer() {
      clearInterval(timerId);
      seconds = 0;
      el.timerBadge.textContent = `⏱ ${formatTime(seconds)}`;
      timerId = setInterval(() => {
        seconds++;
        el.timerBadge.textContent = `⏱ ${formatTime(seconds)}`;
      }, 1000);
    }

    function stopTimer() {
      clearInterval(timerId);
      timerId = null;
    }

    function resetScreen() {
      currentIndex = 0;
      selectedAnswers = new Array(filteredQuestions.length).fill(null);
      el.resultCard.style.display = 'none';
      el.reviewContainer.innerHTML = '';
      el.submitBtn.classList.add('hidden');
      updateHeader();
      renderQuestion();
    }

    function updateHeader() {
      if (!started || !filteredQuestions.length) {
        el.quizMeta.textContent = 'Ready to start';
        el.questionText.textContent = 'Please enter your name and click Start Quiz.';
        el.progressBar.style.width = '0%';
        return;
      }

      el.quizMeta.textContent = `Question ${currentIndex + 1} of ${filteredQuestions.length} • ${filteredQuestions[currentIndex].category}`;
      el.questionText.textContent = filteredQuestions[currentIndex].question;
      el.progressBar.style.width = `${((currentIndex + 1) / filteredQuestions.length) * 100}%`;
      el.prevBtn.disabled = currentIndex === 0;
      el.nextBtn.disabled = currentIndex === filteredQuestions.length - 1;
      el.submitBtn.classList.toggle('hidden', currentIndex !== filteredQuestions.length - 1);
    }

    function renderQuestion() {
      if (!started || !filteredQuestions.length) {
        el.optionsContainer.innerHTML = '';
        return;
      }

      const q = filteredQuestions[currentIndex];
      updateHeader();

      el.optionsContainer.innerHTML = q.options.map((opt, idx) => {
        const classes = ['option'];
        if (selectedAnswers[currentIndex] === idx) classes.push('selected');
        return `
          <button class="${classes.join(' ')}" type="button" data-index="${idx}">
            <span class="key">${letters[idx] || (idx + 1)}</span>
            <span>${escapeHTML(opt)}</span>
          </button>
        `;
      }).join('');

      el.optionsContainer.querySelectorAll('.option').forEach(button => {
        button.addEventListener('click', () => {
          selectedAnswers[currentIndex] = Number(button.dataset.index);
          renderQuestion();
        });
      });
    }

    function startQuiz() {
      const enteredName = el.nameInput.value.trim();
      if (!enteredName) {
        alert('Please enter your name first.');
        el.nameInput.focus();
        return;
      }

      applyCategoryFilter();
      if (!filteredQuestions.length) {
        alert('No questions available for this category.');
        return;
      }

      userName = enteredName;
      started = true;
      startTimer();
      resetScreen();
      el.nextBtn.disabled = false;
      renderQuestion();
    }

    function nextQuestion() {
      if (currentIndex < filteredQuestions.length - 1) {
        currentIndex++;
        renderQuestion();
      }
    }

    function prevQuestion() {
      if (currentIndex > 0) {
        currentIndex--;
        renderQuestion();
      }
    }

    function submitQuiz() {
      if (!started) return;

      const score = selectedAnswers.reduce((count, selected, index) => {
        return count + (selected === filteredQuestions[index].answer ? 1 : 0);
      }, 0);

      const total = filteredQuestions.length;
      const percentage = Math.round((score / total) * 100);

      stopTimer();
      el.progressBar.style.width = '100%';

      const result = {
        name: userName,
        score,
        total,
        percentage,
        category: el.categorySelect.value,
        date: new Date().toISOString(),
        answers: [...selectedAnswers],
        questions: filteredQuestions.map(q => ({
          question: q.question,
          options: [...q.options],
          answer: q.answer,
          category: q.category
        }))
      };

      const results = readResults();
      results.push(result);
      writeResults(results);
      updateStats();
      renderHistory();
      showResult(result);
    }

    function showResult(result) {
      el.resultCard.style.display = 'block';
      el.resultName.textContent = result.name;
      el.resultScore.textContent = `${result.score}/${result.total}`;
      el.resultPercent.textContent = `${result.percentage}%`;

      const positive = result.percentage >= 50;
      el.resultTag.className = `tag ${positive ? 'success' : 'danger'}`;
      el.resultTag.textContent = positive
        ? (result.percentage >= 80 ? 'Excellent performance' : 'Good job — keep improving')
        : 'Needs more practice';

      el.reviewContainer.innerHTML = result.questions.map((q, idx) => {
        const chosenIndex = result.answers[idx];
        const chosenText = chosenIndex === null || chosenIndex === undefined ? 'Not answered' : q.options[chosenIndex];
        const isCorrect = chosenIndex === q.answer;
        return `
          <div class="review-item">
            <p class="q">Q${idx + 1}. ${escapeHTML(q.question)}</p>
            <p class="a">Your answer: ${escapeHTML(chosenText)}</p>
            <p class="a">Correct answer: ${escapeHTML(q.options[q.answer])}</p>
            <div class="tag ${isCorrect ? 'success' : 'danger'}">${isCorrect ? 'Correct' : 'Incorrect'}</div>
          </div>
        `;
      }).join('');
    }

    function clearSavedResults() {
      if (!confirm('Are you sure you want to delete all saved results?')) return;
      localStorage.removeItem(STORAGE_KEY);
      updateStats();
      renderHistory();
    }

    el.totalQuestions.textContent = QUESTIONS.length;
    updateStats();
    renderHistory();
    updateHeader();

    el.startBtn.addEventListener('click', startQuiz);
    el.nextBtn.addEventListener('click', nextQuestion);
    el.prevBtn.addEventListener('click', prevQuestion);
    el.submitBtn.addEventListener('click', submitQuiz);
    el.clearHistoryBtn.addEventListener('click', clearSavedResults);

    el.categorySelect.addEventListener('change', () => {
      started = false;
      stopTimer();
      selectedAnswers = [];
      currentIndex = 0;
      el.resultCard.style.display = 'none';
      el.optionsContainer.innerHTML = '';
      el.timerBadge.textContent = '⏱ 00:00';
      applyCategoryFilter();
      updateHeader();
    });

    el.nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') startQuiz();
    });