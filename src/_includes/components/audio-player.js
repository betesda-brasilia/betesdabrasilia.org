function formatTime(time) {
	const date = new Date(time * 1000);
	if (isNaN(+date)) {
		return '';
	}
	return new Date(time * 1000).toISOString().split('').slice(11, 19).join('');
}

class AudioPlayButton {
	constructor() {
		this.isPlaying = false;
		// button setup
		this.audioButton = document.createElement('button');
		this.audioButton.type = 'button';
		this.audioButton.setAttribute('aria-pressed', this.isPlaying);
		this.audioButton.classList.add('box');
		this.audioButton.classList.add('play-btn');

		// button text setup
		this.textWrapper = document.createElement('span');
		this.iconWrapper = document.createElement('span');
		// visually hidden text
		this.textWrapper.classList.add('vh');
		this.textWrapper.textContent = this.getLabel();
		this.iconWrapper.innerHTML = this.getIcon();

		this.audioButton.appendChild(this.textWrapper);
		this.audioButton.appendChild(this.iconWrapper);
	}

	setStateValue(value) {
		this.isPlaying = Boolean(value);
		this.textWrapper.textContent = this.getLabel();
		this.iconWrapper.innerHTML = this.getIcon();
		this.audioButton.setAttribute('aria-pressed', this.isPlaying);
	}

	getButtonElement() {
		return this.audioButton;
	}

	getLabel() {
		return this.isPlaying ? 'Play' : 'Pause';
	}

	getIcon() {
		return this.isPlaying
			? `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 224 352"><path fill="currentColor" d="M64 352H16a16.002 16.002 0 0 1-16-16V16A16 16 0 0 1 16 0h48a16 16 0 0 1 16 16v320a16.002 16.002 0 0 1-16 16Zm144 0h-48a16.004 16.004 0 0 1-11.314-4.686A16.004 16.004 0 0 1 144 336V16a16.002 16.002 0 0 1 16-16h48a16.002 16.002 0 0 1 16 16v320c0 4.243-1.686 8.313-4.686 11.314A16.004 16.004 0 0 1 208 352Z"/></svg>`
			: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 320 363"><path stroke="currentColor" stroke-miterlimit="10" stroke-width="72" d="M36 56.785v249.43c0 15 14.622 24.53 26.663 17.34l213.22-127.614c10.424-6.236 10.424-22.646 0-28.882L62.663 39.445C50.622 32.255 36 41.785 36 56.785Z"/></svg>`;
	}
}

class AudioScrubber {
	constructor(label = 'Audio scrubber', inputId = Date.now()) {
		// scrubber setup
		this.scrub = document.createElement('input');
		this.scrub.setAttribute('id', inputId);
		this.scrub.type = 'range';
		this.scrub.value = 0;

		// label setup
		this.label = document.createElement('label');
		this.label.setAttribute('for', inputId);
		this.label.classList.add('slider');

		// label text setup
		this.textWrapper = document.createElement('span');

		// visually hidden text
		this.textWrapper.classList.add('vh');
		this.textWrapper.textContent = label;

		this.label.appendChild(this.textWrapper);
		this.label.appendChild(this.scrub);
	}

	setRangeValues(min, max) {
		const _min = parseFloat(min);
		const _max = parseFloat(max);

		this.scrub.setAttribute('min', _min);
		this.scrub.setAttribute('max', _max);
	}

	setScrubberValue(value) {
		this.scrub.value = parseFloat(value);
	}

	getScrubberElement() {
		return this.label;
	}
}

class AudioPlayerControls {
	constructor(audioElement, isPlaying = false) {
		// audio state
		this.isPlaying = isPlaying;

		// Access audio tag
		this.audio = audioElement;

		// creates button instance
		this.audioButton = new AudioPlayButton();

		// gets button element
		this.playButtonElement = this.audioButton.getButtonElement();
		this.playButtonElement.addEventListener('click', () => {
			this.togglePlaying();
		});

		// creates scrubber instance
		this.scrubber = new AudioScrubber();

		// gets scrubber element
		this.scrubberElement = this.scrubber.getScrubberElement();
		this.scrubberElement.addEventListener('change', event => {
			this.handleScrubberChange(event);
		});

		// time stamp
		this.timeInfo = document.createElement('div');

		// Event listeners
		if (typeof this.audio != 'undefined') {
			this.audio.addEventListener('loadedmetadata', () =>
				this.setMediaTime()
			);

			this.audio.addEventListener('timeupdate', () =>
				this.updateMediaTime()
			);

			this.audio.addEventListener('ended', () => this.reset());
		}

		// crontrols setup
		this.controls = document.createElement('div');
		this.addControl([
			this.playButtonElement,
			this.timeInfo,
			this.scrubberElement
		]);
	}

	togglePlaying() {
		this.isPlaying = !this.isPlaying;
		this.audioButton.setStateValue(this.isPlaying);

		if (this.isPlaying) {
			this.audio.play();
		} else {
			this.audio.pause();
		}
	}

	getControls() {
		return this.controls;
	}

	setMediaTime() {
		this.scrubber.setRangeValues(0, this.audio.duration);
		this.timeInfo.textContent = this.timeInfo.textContent =
			this.getDurationInfo();
	}

	updateMediaTime() {
		this.timeInfo.textContent = `${formatTime(
			this.audio.currentTime
		)} - ${formatTime(this.audio.duration)}`;

		this.scrubber.setScrubberValue(this.audio.currentTime);
	}

	handleScrubberChange(event) {
		const playhead = parseFloat(event.target.value);
		this.audio.currentTime = playhead;
		this.timeInfo.textContent = this.getDurationInfo();
	}

	reset() {
		this.isPlaying = false;
		this.audio.currentTime = 0;
		this.scrubberElement.setScrubberValue(0);
		this.audioButton.setStateValue(this.isPlaying);
	}

	getDurationInfo() {
		return `${formatTime(this.audio.currentTime)} - ${formatTime(
			this.audio.duration
		)}`;
	}

	addControl(controls) {
		controls.forEach(control => {
			this.controls.appendChild(control);
		});
	}
}

class AudioPlayer extends HTMLElement {
	constructor() {
		// always call the super first in the constructor
		super();

		this.classList.add('audio-player');
		this.classList.add('box');
		this.classList.add('flow');
		this.classList.add('font-serif');
	}

	connectedCallback() {
		if (!this.rendered) {
			this.render();
			this.rendered = true;
		}
	}

	render() {
		const _audio = this.setupAudio();
		const _coverImage = this.setupCoverImage();
		const title = this.querySelector('h1, h2, h3, h4');
		const more = this.querySelector('div[data-info="more-info"]');

		// clear previous added child
		this.innerHTML = '';

		if (typeof _coverImage != 'undefined') {
			// add new cover image
			this.appendChild(_coverImage);
		}

		if (typeof title != 'undefined') {
			// add title
			this.appendChild(title);
		}

		if (more != undefined) {
			// add new cover image
			this.appendChild(more);
		}

		// add new audio child
		this.appendChild(_audio);
	}

	setupAudio() {
		const audioGroup = document.createElement('div');
		audioGroup.classList.add('flow-space-m');
		const audio = this.querySelector('audio');

		if (typeof audio == undefined) {
			return;
		}

		audio.src = audio.getAttribute('src') || undefined;
		audio.preload = audio.getAttribute('preload') || 'metadata';
		audio.removeAttribute('controls');

		const controls = new AudioPlayerControls(audio).getControls();

		audioGroup.appendChild(controls);
		audioGroup.appendChild(audio);

		return audioGroup;
	}

	setupCoverImage() {
		const image = this.querySelector('img');
		image.src = image.getAttribute('src') || undefined;
		image.alt = image.getAttribute('alt') || '';

		// set image aspect ratio to avoid layout shift
		image.width = image.getAttribute('width') || '50';
		image.height = image.getAttribute('height') || '50';
		image.setAttribute('loading', image.getAttribute('loading') || 'lazy');
		image.classList.add('box');

		return image;
	}

	attributeChangedCallback(name, oldValue, newValue) {
		this.render();
	}
}

if (typeof window !== 'undefined' && 'customElements' in window) {
	window.customElements.define('audio-player', AudioPlayer);
}
