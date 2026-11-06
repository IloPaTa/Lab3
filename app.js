'use strict';

// Ссылки на элементы страницы
const loadBtn = document.getElementById('loadBtn');
const postsList = document.getElementById('postsList');
const postsCount = document.getElementById('postsCount');
const emptyState = document.getElementById('emptyState');
const createForm = document.getElementById('createForm');
const titleInput = document.getElementById('titleInput');
const bodyInput = document.getElementById('bodyInput');
const submitBtn = document.getElementById('submitBtn');
const messageBox = document.getElementById('messageBox');

// Адреса API
const GET_URL = 'https://jsonplaceholder.typicode.com/posts?_limit=5';
const POST_URL = 'https://jsonplaceholder.typicode.com/posts';

function showMessage(text, type = 'info') {
  messageBox.textContent = text;
  messageBox.className = `message show ${type}`;
}

/** Скрывает область сообщений. */
function hideMessage() {
  messageBox.textContent = '';
  messageBox.className = 'message';
}


function setButtonState(button, disabled, label) {
  button.disabled = disabled;
  button.textContent = label;
}


function createPostElement(post) {
  const article = document.createElement('article');
  article.className = 'post';

  const title = document.createElement('h3');
  title.textContent = post.title;

  const body = document.createElement('p');
  body.textContent = post.body;

  article.append(title, body);
  return article;
}


function updateListState() {
  const count = postsList.querySelectorAll('.post').length;
  postsCount.textContent = count;
  emptyState.style.display = count === 0 ? '' : 'none';
}


async function loadPosts() {
  hideMessage();
  setButtonState(loadBtn, true, 'Загрузка...');
  showMessage('Загрузка публикаций...', 'info');

  try {
    const response = await fetch(GET_URL);

    // Проверяем HTTP-статус
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: не удалось загрузить публикации`);
    }

    const posts = await response.json();

    // Удаляем только карточки, не трогая пустое состояние
    postsList.querySelectorAll('.post').forEach((el) => el.remove());

    for (const post of posts) {
      postsList.append(createPostElement(post));
    }

    updateListState();
    showMessage(`Загружено публикаций: ${posts.length}`, 'success');
  } catch (error) {
    console.error('Ошибка загрузки:', error);
    showMessage(
      `Ошибка загрузки: ${error.message}. Попробуйте ещё раз.`,
      'error'
    );
    updateListState();
  } finally {
    setButtonState(loadBtn, false, '⭳ Загрузить публикации');
  }
}

loadBtn.addEventListener('click', loadPosts);


function validateForm() {
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title) {
    showMessage('Заполните поле «Заголовок».', 'error');
    titleInput.focus();
    return null;
  }

  if (!body) {
    showMessage('Заполните поле «Текст».', 'error');
    bodyInput.focus();
    return null;
  }

  return { title, body };
}


async function createPost(event) {
  event.preventDefault(); // отменяем перезагрузку страницы
  hideMessage();

  const data = validateForm();
  if (!data) {
    return; // запрос не отправляем
  }

  setButtonState(submitBtn, true, 'Отправка...');
  showMessage('Отправка публикации...', 'info');

  try {
    const response = await fetch(POST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: data.title,
        body: data.body,
        userId: 1
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: не удалось создать публикацию`);
    }

    const created = await response.json();

    // Выводим заголовок и ID из ответа
    showMessage(
      `Публикация создана! ID: ${created.id}, заголовок: «${created.title}»`,
      'success'
    );

    // Добавляем новую публикацию в список на странице
    postsList.prepend(createPostElement({ title: created.title, body: created.body }));
    updateListState();

    // Очищаем форму
    createForm.reset();
  } catch (error) {
    console.error('Ошибка создания:', error);
    showMessage(
      `Ошибка отправки: ${error.message}. Попробуйте ещё раз.`,
      'error'
    );
  } finally {
    setButtonState(submitBtn, false, '✚ Создать публикацию');
  }
}

createForm.addEventListener('submit', createPost);

// Инициализация состояния списка при загрузке страницы
updateListState();