// ============================================
// カメコツイートジェネレータ - Application Logic
// ============================================

(function () {
  'use strict';

  // --- Member Data (grouped) ---
  const GROUPS = [
    {
      id: 'noimii',
      name: '≠ME',
      camekoTag: 'ノイミー_カメコ',
      members: [
        { name: '尾木波菜', hashtag: '尾木波菜' },
        { name: '落合希来里', hashtag: '落合希来里' },
        { name: '蟹沢萌子', hashtag: '蟹沢萌子' },
        { name: '河口夏音', hashtag: '河口夏音' },
        { name: '川中子奈月心', hashtag: '川中子奈月心' },
        { name: '櫻井もも', hashtag: '櫻井もも' },
        { name: '鈴木瞳美', hashtag: '鈴木瞳美' },
        { name: '谷崎早耶', hashtag: '谷崎早耶' },
        { name: '冨田菜々風', hashtag: '冨田菜々風' },
        { name: '永田詩央里', hashtag: '永田詩央里' },
        { name: '本田珠由記', hashtag: '本田珠由記' },
      ],
    },
    {
      id: 'nearjoy',
      name: '≒JOY',
      camekoTag: 'ニアジョイ_カメコ',
      members: [
        { name: '逢田珠里依', hashtag: '逢田珠里依' },
        { name: '天野香乃愛', hashtag: '天野香乃愛' },
        { name: '市原愛弓', hashtag: '市原愛弓' },
        { name: '江角怜音', hashtag: '江角怜音' },
        { name: '大信田美月', hashtag: '大信田美月' },
        { name: '大西葵', hashtag: '大西葵' },
        { name: '小澤愛実', hashtag: '小澤愛実' },
        { name: '髙橋舞', hashtag: '髙橋舞' },
        { name: '藤沢莉子', hashtag: '藤沢莉子' },
        { name: '村山結香', hashtag: '村山結香' },
        { name: '山田杏佳', hashtag: '山田杏佳' },
        { name: '山野愛月', hashtag: '山野愛月' },
      ],
    },
  ];

  // --- DOM References ---
  const els = {
    comment: document.getElementById('comment'),
    eventDate: document.getElementById('event-date'),
    liveName: document.getElementById('live-name'),
    venueName: document.getElementById('venue-name'),
    memberGroup: document.getElementById('member-group'),
    outputPreview: document.getElementById('output-preview'),
    charCount: document.getElementById('char-count'),
    copyBtn: document.getElementById('copy-btn'),
    clearBtn: document.getElementById('clear-btn'),
    toast: document.getElementById('toast'),
  };

  // --- Initialize Members ---
  function initMembers() {
    GROUPS.forEach((group) => {
      // Group heading
      const heading = document.createElement('div');
      heading.className = 'member-group-heading';
      heading.textContent = group.name;
      els.memberGroup.appendChild(heading);

      // Checkbox grid
      const grid = document.createElement('div');
      grid.className = 'checkbox-group';

      group.members.forEach((member, index) => {
        const item = document.createElement('div');
        item.className = 'checkbox-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `member-${group.id}-${index}`;
        checkbox.value = member.hashtag;
        checkbox.dataset.group = group.id;
        checkbox.addEventListener('change', updatePreview);

        const label = document.createElement('label');
        label.htmlFor = `member-${group.id}-${index}`;
        label.textContent = member.name;

        item.appendChild(checkbox);
        item.appendChild(label);
        grid.appendChild(item);
      });

      els.memberGroup.appendChild(grid);
    });
  }

  // --- Format Date ---
  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}.${mm}.${dd}`;
  }

  // --- Get Selected Members with Group Info ---
  function getSelectedMembers() {
    const checkboxes = els.memberGroup.querySelectorAll('input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => ({
      hashtag: cb.value,
      group: cb.dataset.group,
    }));
  }

  // --- Get Active Group IDs ---
  function getActiveGroups(selectedMembers) {
    const groupIds = new Set();
    selectedMembers.forEach(m => groupIds.add(m.group));
    return groupIds;
  }

  // --- Generate Tweet Text ---
  function generateTweet() {
    const comment = els.comment.value.trim();
    const dateStr = els.eventDate.value;
    const liveName = els.liveName.value.trim();
    const venueName = els.venueName.value.trim();
    const selectedMembers = getSelectedMembers();
    const activeGroups = getActiveGroups(selectedMembers);

    const lines = [];

    // Comment block
    if (comment) {
      lines.push(comment);
      lines.push('');
    }

    // Event info block
    const eventInfoLines = [];
    if (dateStr) eventInfoLines.push(formatDate(dateStr));
    if (liveName) eventInfoLines.push(liveName);
    if (venueName) eventInfoLines.push(venueName);

    if (eventInfoLines.length > 0) {
      lines.push(...eventInfoLines);
      lines.push('');
    }

    // Member hashtags
    selectedMembers.forEach(m => {
      lines.push(`#${m.hashtag}`);
    });

    // Group cameko hashtags (based on which groups have selected members)
    GROUPS.forEach(group => {
      if (activeGroups.has(group.id)) {
        lines.push(`#${group.camekoTag}`);
      }
    });

    return lines.join('\n');
  }

  // --- Update Preview ---
  function updatePreview() {
    const tweet = generateTweet();
    els.outputPreview.textContent = tweet;

    // Update character count (Twitter/X limit = 280 for Latin, but Japanese counts differently)
    const len = tweet.length;
    els.charCount.textContent = `${len} 文字`;
    els.charCount.classList.remove('warning', 'danger');
    if (len > 250) {
      els.charCount.classList.add('danger');
    } else if (len > 200) {
      els.charCount.classList.add('warning');
    }
  }

  // --- Copy to Clipboard ---
  async function copyToClipboard() {
    const tweet = generateTweet();
    try {
      await navigator.clipboard.writeText(tweet);
      showToast();
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = tweet;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast();
    }
  }

  // --- Show Toast ---
  function showToast() {
    els.toast.classList.add('show');
    setTimeout(() => {
      els.toast.classList.remove('show');
    }, 2500);
  }

  // --- Clear All ---
  function clearAll() {
    els.comment.value = '';
    els.eventDate.value = '';
    els.liveName.value = '';
    els.venueName.value = '';

    const checkboxes = els.memberGroup.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => { cb.checked = false; });

    updatePreview();
  }

  // --- Event Listeners ---
  function bindEvents() {
    els.comment.addEventListener('input', updatePreview);
    els.eventDate.addEventListener('change', updatePreview);
    els.liveName.addEventListener('input', updatePreview);
    els.venueName.addEventListener('input', updatePreview);
    els.copyBtn.addEventListener('click', copyToClipboard);
    els.clearBtn.addEventListener('click', clearAll);
  }

  // --- Init ---
  function init() {
    initMembers();
    bindEvents();
    updatePreview();
  }

  init();
})();
