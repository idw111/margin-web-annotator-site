// This demonstration only keeps state in memory. No storage, analytics, or network calls.
const pages = {
  a: { title: '천천히 읽는다는 것', path: ' / slow-reading', intro: '빠르게 읽는 데 익숙해지면, 문장 사이에\n남겨진 여백을 자주 지나치게 된다.', exact: '좋은 생각은 잠깐 멈추는 순간에 찾아온다.', outro: '한 문장이 마음에 걸릴 때면 잠시 멈춰본다.\n읽은 것과 생각한 것 사이에, 짧은 메모를 남긴다.' },
  b: { title: '기록하는 작은 습관', path: ' / little-notes', intro: '오늘 읽은 문장을 내일도 기억할 수 있을까.\n짧은 기록 하나가 생각을 이어준다.', exact: '작은 메모는 내일의 나에게 보내는 편지다.', outro: '잘 정리된 글이 아니어도 괜찮다.\n지금 떠오른 생각을 한 줄 남겨두는 것부터.' }
};
const initialNote = '다음 글을 쓰기 전에 다시 읽어보기.\n좋은 아이디어를 서두르지 않기.';
const notes = { a: initialNote, b: '' };
let activePage = 'a';
let editing = false;
let highlightTimer;
const byId = (id) => document.getElementById(id);
const tabs = [...document.querySelectorAll('[data-page]')];
const input = byId('note-input');
const card = byId('annotation-card');
const form = byId('note-form');

function announce(message) { byId('demo-status').textContent = message; }
function render() {
  const page = pages[activePage];
  const note = notes[activePage];
  byId('demo-title').textContent = page.title;
  byId('demo-path').textContent = page.path;
  byId('demo-intro').textContent = page.intro;
  byId('demo-outro').textContent = page.outro;
  byId('selected-text').textContent = page.exact;
  byId('selected-text').classList.toggle('is-empty', !note);
  byId('annotation-quote').textContent = `“${page.exact}”`;
  byId('annotation-quote').title = page.exact;
  byId('note-content').textContent = note;
  byId('note-content').hidden = editing || !note;
  byId('empty-note').hidden = editing || !!note;
  byId('note-tools').hidden = editing || !note;
  byId('cancel-note').hidden = !editing;
  form.hidden = !editing;
  byId('note-count').textContent = `이 페이지의 메모 ${note ? 1 : 0}`;
  byId('demo-reader').setAttribute('aria-labelledby', `tab-${activePage}`);
  for (const tab of tabs) {
    const active = tab.dataset.page === activePage;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  }
}
function edit() {
  editing = true;
  input.value = notes[activePage];
  byId('save-note').disabled = !input.value.trim();
  render();
  input.focus({ preventScroll: true });
  announce('코멘트를 입력하고 저장해 보세요.');
}
function focusCard() {
  clearTimeout(highlightTimer);
  card.classList.add('is-focused');
  highlightTimer = setTimeout(() => card.classList.remove('is-focused'), 1400);
}
function selectPage(page) {
  activePage = page;
  editing = false;
  render();
  announce(notes[page] ? '이 주소에 남긴 메모가 다시 표시됩니다.' : '주소가 달라지면 그 페이지의 메모만 보여요. 첫 메모를 남겨보세요.');
}
for (const tab of tabs) {
  tab.addEventListener('click', () => selectPage(tab.dataset.page));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : tabs.indexOf(tab) === 0 ? 1 : 0;
    selectPage(tabs[index].dataset.page);
    tabs[index].focus();
  });
}
byId('edit-note').addEventListener('click', edit);
byId('add-note').addEventListener('click', edit);
byId('selected-text').addEventListener('click', () => { if (notes[activePage]) focusCard(); else edit(); });
byId('selected-text').addEventListener('pointerenter', () => { if (notes[activePage]) focusCard(); });
byId('delete-note').addEventListener('click', () => {
  notes[activePage] = '';
  editing = false;
  render();
  byId('add-note').focus({ preventScroll: true });
  announce('이 페이지의 데모 메모를 삭제했습니다. 다른 페이지의 메모는 유지됩니다.');
});
byId('cancel-note').addEventListener('click', () => {
  editing = false;
  render();
  (notes[activePage] ? byId('edit-note') : byId('add-note')).focus({ preventScroll: true });
  announce('편집을 취소했습니다.');
});
input.addEventListener('input', () => { byId('save-note').disabled = !input.value.trim(); });
input.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); form.requestSubmit(); }
  if (event.key === 'Escape') { event.preventDefault(); byId('cancel-note').click(); }
});
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const note = input.value.trim();
  if (!note) return;
  notes[activePage] = note;
  editing = false;
  render();
  focusCard();
  byId('edit-note').focus({ preventScroll: true });
  announce('데모에 저장했습니다. 다른 페이지에 갔다가 돌아와 보세요.');
});
byId('reset-demo').addEventListener('click', () => {
  notes.a = initialNote;
  notes.b = '';
  activePage = 'a';
  editing = false;
  render();
  announce('미리보기를 처음 상태로 되돌렸습니다.');
});
byId('try-demo').addEventListener('click', () => { edit(); focusCard(); });
render();
