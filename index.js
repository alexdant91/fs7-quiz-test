const $answersContainer = document.querySelector("#answers-c");
const $category = document.querySelector("#category");
const $questTitle = document.querySelector("#question-t");
const $difficulty = document.querySelector("#level");
const $quizBtn = document.querySelector("#submit");
const $loading = document.querySelector("#loading");
const $correctScore = document.querySelector("#correct_score");
const $incorrectScore = document.querySelector("#incorrect_score");
const $qstNum = document.querySelector("#qst_num");

const API_URL = "https://opentdb.com/api.php?amount=1";

const ANSWER_TEMPLATE = (text, id) => `
  <input type="radio" name="quiz-answer" id="quiz-answer-${id}" value="${text}">
  <label class="quiz-answer" id="a-text" for="quiz-answer-${id}">${text}</label>
`;

let state = {
  correctScore: 0,
  incorrectScore: 0,
  questionCount: 0,
  isLoading: true,
  isEnabledSubmit: false,
  selectedAnswer: null,
  question: {
    answers: [],
    correct_answer: null,
    question: null,
    category: null,
    difficulty: null,
  },
};

const Utility = {
  shuffle(arr) {
    arr.sort(() => Math.random() - .5);
    return arr;
  },
  _clearState() {
    state = {
      //
      correctScore: state.correctScore,
      incorrectScore: state.incorrectScore,
      questionCount: state.questionCount,
      //
      isLoading: true,
      isEnabledSubmit: false,
      selectedAnswer: null,
      question: {
        answers: [],
        correct_answer: null,
        question: null,
        category: null,
        difficulty: null,
      },
    }
  },
}

/**
 * LOADING
 */

const _toggleLoadingUI = () => {
  if (state.isLoading) {
    $loading.classList.add('active');
  } else {
    $loading.classList.remove('active');
  }
}

/**
 * QUESTIONS
 */

const _fetchQuestions = async () => {
  state.questionCount++;
  return (await (await fetch(API_URL)).json()).results[0];
}

const _formatQuestions = (questions) => {
  const { category, correct_answer, difficulty, incorrect_answers, question } = questions;
  state.question = {
    ...state.question,
    answers: Utility.shuffle([correct_answer, ...incorrect_answers]),
    correct_answer,
    category,
    difficulty,
    question,
  }
}

const _setQuestions = async () => {
  _formatQuestions(await _fetchQuestions());
}

const _renderQuestion = () => {
  $category.innerHTML = state.question.category;
  $questTitle.innerHTML = state.question.question;
  $difficulty.innerHTML = state.question.difficulty;
}

/**
 * ANSWERS
 */

const _renderAnswers = () => {
  const ANSWER_HTML = (state.question.answers.map((answer, id) => ANSWER_TEMPLATE(answer, id))).join('<br />');
  $answersContainer.innerHTML = ANSWER_HTML;
}

/**
 * UI
 */

const _renderUI = async () => {
  _toggleLoadingUI();
  await _setQuestions();
  _renderQuestion();
  _renderAnswers();

  state.isLoading = false;
  console.log($qstNum)
  $qstNum.innerHTML = state.questionCount;

  _toggleLoadingUI();
}

/**
 * INITIALS
 */

const init = async () => {
  updateScoresUI();
  await _renderUI();
}

const updateUIFromEvent = () => {
  if (state.isEnabledSubmit) {
    $quizBtn.disabled = false;
  } else {
    $quizBtn.disabled = true;
  }

  if (state.selectedAnswer != null && state.selectedAnswer === state.question.correct_answer) {
    state.correctScore++;
  } else if (state.selectedAnswer != null && state.selectedAnswer !== state.question.correct_answer) {
    state.incorrectScore++;
  }
}

const updateScoresUI = () => {
  $correctScore.innerHTML = state.correctScore;
  $incorrectScore.innerHTML = state.incorrectScore;
}

const refresh = () => {
  Utility._clearState();
  updateUIFromEvent();
  updateScoresUI();
  init();
}

/**
 * EVENTS
 */

const _setHandlers = () => {
  document.body.addEventListener("click", (e) => {
    const { target: { name } } = e;
    if (name == "quiz-answer") {
      state.isEnabledSubmit = true;
      state.selectedAnswer = document.querySelector('input[name="quiz-answer"]:checked').value;
      updateUIFromEvent();
    }
  })

  $quizBtn.addEventListener("click", () => {
    refresh();
  });
}

window.onload = () => {
  (async () => {
    try {
      await init();

      _setHandlers();
    } catch (err) {
      throw err;
    }
  })();
}
