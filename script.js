let questions = [];
let currentQuestionIndex = 0;
let userChoices = [];
let currentOptionIndex = 0;
let intervalId;
let nextOptions = [];
let switchTime = { min: 300, max: 300 }; // 默认切换时间
let randomSwitch = false;

function getSwitchTime() {
    if (randomSwitch) {
        return Math.floor(Math.random() * (switchTime.max - switchTime.min + 1)) + switchTime.min;
    } else {
        return switchTime.min;
    }
}

function switchOption(options) {
    const optionsContainer = document.getElementById('options-container');
    const option = options[currentOptionIndex];
    optionsContainer.innerHTML = '';
    if (option.image) {
        optionsContainer.innerHTML = `<img src="${option.image}" alt="${option.text}" data-text="${option.text}" data-id="${option.id}">`;
    } else {
        optionsContainer.innerHTML = `<div class="option-text" data-text="${option.text}" data-id="${option.id}">${option.text}</div>`;
    }
    currentOptionIndex = (currentOptionIndex + 1) % options.length;

    clearInterval(intervalId);
    intervalId = setInterval(() => switchOption(options), getSwitchTime());
}

function loadQuestion() {
    const questionContainer = document.getElementById('question');
    const optionsContainer = document.getElementById('options-container');
    const nextButton = document.getElementById('next-button');
    const instruction = document.getElementById('instruction');
    const mainTitle = document.getElementById('main-title');
    const subTitle = document.getElementById('sub-title');

    const currentQuestion = questions[currentQuestionIndex];

    mainTitle.textContent = "主标题"; // 示例主标题，可根据需要更改
    subTitle.textContent = "副标题"; // 示例副标题，可根据需要更改
    questionContainer.textContent = currentQuestion.question;
    optionsContainer.innerHTML = '';
    nextButton.style.visibility = 'hidden'; // 确保在加载问题时隐藏按钮
    instruction.style.display = 'block'; // 确保提示文本显示

    currentOptionIndex = 0;
    let options = currentQuestion.options;
    if (nextOptions.length > 0) {
        options = options.filter(option => nextOptions.includes(option.id));
    }

    if (options.length === 0) {
        questionContainer.textContent = "当前问题没有可用选项，请检查配置。";
        return;
    }

    intervalId = setInterval(() => switchOption(options), getSwitchTime());

    optionsContainer.removeEventListener('click', selectOption);
    optionsContainer.addEventListener('click', selectOption);
}

function selectOption(event) {
    clearInterval(intervalId);
    const selectedOption = {
        question: questions[currentQuestionIndex].question, // 添加问题标题
        text: event.target.getAttribute('data-text'),
        image: event.target.tagName === 'IMG' ? event.target.src : null,
        id: event.target.getAttribute('data-id')
    };
    userChoices.push(selectedOption);
    const nextButton = document.getElementById('next-button');
    nextButton.style.visibility = 'visible'; // 显示按钮

    const currentQuestion = questions[currentQuestionIndex];
    const selectedOptionData = currentQuestion.options.find(option => option.text === selectedOption.text);
    if (selectedOptionData && selectedOptionData.nextOptions) {
        nextOptions = selectedOptionData.nextOptions;
    } else {
        nextOptions = [];
    }
}

document.getElementById('next-button').addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        showResult();
    }
});

function showResult() {
    const questionContainer = document.getElementById('question');
    const optionsContainer = document.getElementById('options-container');
    const nextButton = document.getElementById('next-button');
    const resultContainer = document.getElementById('result-container');
    const resultList = document.getElementById('result-list');
    const instruction = document.getElementById('instruction');

    questionContainer.textContent = "游戏结束，感谢您的参与！";
    optionsContainer.style.display = 'none';
    nextButton.style.display = 'none';
    resultContainer.style.display = 'block';
    instruction.style.display = 'none'; // 隐藏提示文本

    resultList.innerHTML = '';
    userChoices.forEach(choice => {
        const div = document.createElement('div');
        div.innerHTML = `<p><strong>${choice.question}</strong></p><p>${choice.text}</p>`;
        if (choice.image) {
            div.innerHTML += `<img src="${choice.image}" alt="${choice.text}">`;
        }
        resultList.appendChild(div);
    });

    // 添加截图按钮的点击事件
    const screenshotButton = document.getElementById('screenshot-button');
    screenshotButton.addEventListener('click', () => {
        html2canvas(document.getElementById('game-container')).then(canvas => {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'screenshot.png';
            link.click();
        });
    });
}

async function loadConfig() {
    const response = await fetch('config.json');
    const data = await response.json();
    questions = data.questions;
    switchTime = data.switchTime || { min: 300, max: 300 };
    randomSwitch = data.randomSwitch || false;
    loadQuestion();
}

document.addEventListener('DOMContentLoaded', loadConfig);
