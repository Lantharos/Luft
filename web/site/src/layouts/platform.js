const agent = navigator.userAgent;
document.documentElement.dataset.os = /Android|CrOS|iPhone|iPad/.test(agent) ? 'other' : /Windows/.test(agent) ? 'windows' : /Linux|X11/.test(agent) ? 'linux' : 'other';
