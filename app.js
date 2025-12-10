// ImagePuzzler Builder Application

class ImagePuzzler {
    constructor() {
        this.images = [];
        this.currentIndex = -1;
        this.isDragging = false;
        this.isDrawing = false;
        this.dragStart = { x: 0, y: 0 };
        this.answerPosition = { x: 50, y: 50 };
        this.dialogResolve = null;
        this.updateTimeout = null;

        this.initElements();
        this.initEventListeners();
        this.updateUI();
    }

    // Debounced update - waits for user to stop typing
    debouncedUpdate() {
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }
        this.updateTimeout = setTimeout(() => {
            this.updateCurrentImage();
        }, 150);
    }

    // Custom dialog methods
    showDialog(message, showInput = false, defaultValue = '', showCancel = false) {
        return new Promise((resolve) => {
            this.dialogResolve = resolve;

            const overlay = document.getElementById('dialog-overlay');
            const messageEl = document.getElementById('dialog-message');
            const inputEl = document.getElementById('dialog-input');
            const buttonsEl = document.getElementById('dialog-buttons');

            messageEl.innerHTML = message;

            inputEl.style.display = showInput ? 'block' : 'none';
            inputEl.value = defaultValue;

            buttonsEl.innerHTML = '';

            if (showCancel) {
                const cancelBtn = document.createElement('button');
                cancelBtn.className = 'dialog-btn dialog-btn-secondary';
                cancelBtn.textContent = 'Cancel';
                cancelBtn.onclick = () => this.closeDialog(null);
                buttonsEl.appendChild(cancelBtn);
            }

            const okBtn = document.createElement('button');
            okBtn.className = 'dialog-btn dialog-btn-primary';
            okBtn.textContent = 'OK';
            okBtn.onclick = () => this.closeDialog(showInput ? inputEl.value : true);
            buttonsEl.appendChild(okBtn);

            overlay.classList.add('visible');

            if (showInput) {
                setTimeout(() => inputEl.focus(), 100);
                inputEl.onkeydown = (e) => {
                    if (e.key === 'Enter') this.closeDialog(inputEl.value);
                    if (e.key === 'Escape' && showCancel) this.closeDialog(null);
                };
            }
        });
    }

    closeDialog(result) {
        const overlay = document.getElementById('dialog-overlay');
        overlay.classList.remove('visible');
        if (this.dialogResolve) {
            this.dialogResolve(result);
            this.dialogResolve = null;
        }
    }

    showAlert(message) {
        return this.showDialog(message, false, '', false);
    }

    showPrompt(message, defaultValue = '') {
        return this.showDialog(message, true, defaultValue, true);
    }

    showConfirm(message) {
        return this.showDialog(message, false, '', true);
    }

    initElements() {
        // Gallery
        this.galleryContainer = document.getElementById('gallery-container');
        this.addImageCard = document.getElementById('add-image-card');
        this.fileInput = document.getElementById('file-input');
        this.imageCount = document.getElementById('image-count');

        // Canvas
        this.canvasSection = document.getElementById('canvas-section');
        this.canvasContainer = document.getElementById('canvas-container');
        this.canvas = document.getElementById('editor-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.emptyState = document.getElementById('empty-state');
        this.answerOverlay = document.getElementById('answer-overlay');

        // Controls
        this.questionInput = document.getElementById('question-input');
        this.questionSize = document.getElementById('question-size');
        this.answerInput = document.getElementById('answer-input');
        this.answerSize = document.getElementById('answer-size');
        this.answerColor = document.getElementById('answer-color');
        this.answerOutline = document.getElementById('answer-outline');
        this.revealAnimation = document.getElementById('reveal-animation');

        // Buttons
        this.previewBtn = document.getElementById('preview-btn');
        this.saveProjectBtn = document.getElementById('save-project-btn');
        this.generateGameBtn = document.getElementById('generate-game-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.loadProjectBtn = document.getElementById('load-project-btn');
        this.loadProjectInput = document.getElementById('load-project-input');

        // Settings
        this.projectName = document.getElementById('project-name');
        this.projectNameDisplay = document.getElementById('project-name-display');
        this.gameTitle = document.getElementById('game-title');
        this.gameExplanation = document.getElementById('game-explanation');
        this.nextButtonLabel = document.getElementById('next-button-label');
        this.progressLabel = document.getElementById('progress-label');
        this.completionMessage = document.getElementById('completion-message');

        // Modal
        this.previewModal = document.getElementById('preview-modal');
        this.modalClose = document.getElementById('modal-close');
        this.previewContainer = document.getElementById('preview-container');
    }

    initEventListeners() {
        // File input
        this.addImageCard.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));

        // Drag and drop on gallery
        this.galleryContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.galleryContainer.classList.add('drag-over');
        });
        this.galleryContainer.addEventListener('dragleave', () => {
            this.galleryContainer.classList.remove('drag-over');
        });
        this.galleryContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            this.galleryContainer.classList.remove('drag-over');
            this.handleFiles(e.dataTransfer.files);
        });

        // Canvas events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseleave', () => this.stopDrawing());

        // Touch events for canvas
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDrawing(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', () => this.stopDrawing());

        // Answer overlay drag
        this.answerOverlay.addEventListener('mousedown', (e) => this.startDraggingAnswer(e));
        document.addEventListener('mousemove', (e) => this.dragAnswer(e));
        document.addEventListener('mouseup', () => this.stopDraggingAnswer());

        // Control inputs - use debounced update for text inputs
        this.questionInput.addEventListener('input', () => this.debouncedUpdate());
        this.questionSize.addEventListener('input', () => this.debouncedUpdate());
        this.answerInput.addEventListener('input', () => this.debouncedUpdate());
        this.answerSize.addEventListener('input', () => this.debouncedUpdate());
        this.answerColor.addEventListener('input', () => this.updateCurrentImage());
        this.answerOutline.addEventListener('change', () => this.updateCurrentImage());
        this.revealAnimation.addEventListener('change', () => this.updateCurrentImage());

        // Buttons
        this.previewBtn.addEventListener('click', () => this.showPreview());
        this.saveProjectBtn.addEventListener('click', () => this.saveProject());
        this.generateGameBtn.addEventListener('click', () => this.generateGame());
        this.resetBtn.addEventListener('click', () => this.resetAll());
        this.loadProjectBtn.addEventListener('click', () => this.loadProjectInput.click());
        this.loadProjectInput.addEventListener('change', (e) => this.loadProject(e.target.files[0]));

        // Settings
        this.projectName.addEventListener('input', () => this.updateProjectName());

        // Modal
        this.modalClose.addEventListener('click', () => this.closePreview());
        this.previewModal.addEventListener('click', (e) => {
            if (e.target === this.previewModal) this.closePreview();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closePreview();
        });
    }

    handleFiles(files) {
        const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));

        imageFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    this.images.push({
                        id: Date.now() + Math.random(),
                        name: file.name,
                        dataUrl: e.target.result,
                        width: img.width,
                        height: img.height,
                        selection: null,
                        question: '',
                        questionSize: 72,
                        answer: '',
                        answerSize: 72,
                        answerColor: '#ffffff',
                        answerOutline: true,
                        answerPosition: { x: 50, y: 50 },
                        revealAnimation: 'fade'
                    });

                    if (this.currentIndex === -1) {
                        this.currentIndex = 0;
                    }

                    this.updateUI();
                    this.renderGallery();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });

        this.fileInput.value = '';
    }

    renderGallery() {
        // Remove existing thumbnails
        const thumbnails = this.galleryContainer.querySelectorAll('.thumbnail');
        thumbnails.forEach(t => t.remove());

        // Add thumbnails
        this.images.forEach((image, index) => {
            const thumb = document.createElement('div');
            thumb.className = 'thumbnail' + (index === this.currentIndex ? ' active' : '');
            thumb.draggable = true;
            thumb.dataset.index = index;

            thumb.innerHTML = `
                <img src="${image.dataUrl}" alt="Image ${index + 1}">
                <span class="thumbnail-number">${index + 1}</span>
                <button class="thumbnail-delete">&times;</button>
                ${image.question ? `<span class="thumbnail-caption">${image.question}</span>` : ''}
            `;

            // Click to select
            thumb.addEventListener('click', (e) => {
                if (!e.target.classList.contains('thumbnail-delete')) {
                    this.selectImage(index);
                }
            });

            // Delete button
            thumb.querySelector('.thumbnail-delete').addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteImage(index);
            });

            // Drag events for reordering
            thumb.addEventListener('dragstart', (e) => {
                thumb.classList.add('dragging');
                e.dataTransfer.setData('text/plain', index);
                e.dataTransfer.effectAllowed = 'move';
            });

            thumb.addEventListener('dragend', () => {
                thumb.classList.remove('dragging');
            });

            thumb.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            });

            thumb.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                const toIndex = index;
                if (fromIndex !== toIndex && !isNaN(fromIndex)) {
                    this.reorderImages(fromIndex, toIndex);
                }
            });

            this.galleryContainer.insertBefore(thumb, this.addImageCard);
        });

        this.imageCount.textContent = this.images.length;
    }

    selectImage(index) {
        this.currentIndex = index;
        this.updateUI();
        this.renderGallery();
    }

    deleteImage(index) {
        this.images.splice(index, 1);

        if (this.images.length === 0) {
            this.currentIndex = -1;
        } else if (this.currentIndex >= this.images.length) {
            this.currentIndex = this.images.length - 1;
        }

        this.updateUI();
        this.renderGallery();
    }

    reorderImages(fromIndex, toIndex) {
        const [image] = this.images.splice(fromIndex, 1);
        this.images.splice(toIndex, 0, image);

        if (this.currentIndex === fromIndex) {
            this.currentIndex = toIndex;
        } else if (fromIndex < this.currentIndex && toIndex >= this.currentIndex) {
            this.currentIndex--;
        } else if (fromIndex > this.currentIndex && toIndex <= this.currentIndex) {
            this.currentIndex++;
        }

        this.renderGallery();
    }

    updateUI() {
        const hasImage = this.currentIndex >= 0 && this.images[this.currentIndex];

        this.emptyState.style.display = hasImage ? 'none' : 'block';
        this.canvas.classList.toggle('visible', hasImage);
        this.answerOverlay.classList.toggle('visible', false);

        if (hasImage) {
            const image = this.images[this.currentIndex];
            this.loadImageToCanvas(image);

            this.questionInput.value = image.question || '';
            this.questionSize.value = image.questionSize || 72;
            this.answerInput.value = image.answer || '';
            this.answerSize.value = image.answerSize || 72;
            this.answerColor.value = image.answerColor || '#ffffff';
            this.answerOutline.checked = image.answerOutline !== false;
            this.answerPosition = image.answerPosition || { x: 50, y: 50 };
            this.revealAnimation.value = image.revealAnimation || 'fade';
        } else {
            this.questionInput.value = '';
            this.answerInput.value = '';
            this.revealAnimation.value = 'fade';
        }
    }

    loadImageToCanvas(image) {
        const img = new Image();
        img.onload = () => {
            // Calculate canvas size to fit container
            const container = this.canvasContainer;
            const maxWidth = container.clientWidth - 40;
            const maxHeight = 600;

            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = height * (maxWidth / width);
                width = maxWidth;
            }
            if (height > maxHeight) {
                width = width * (maxHeight / height);
                height = maxHeight;
            }

            this.canvas.width = width;
            this.canvas.height = height;
            this.canvas.dataset.scale = width / img.width;

            this.redrawCanvas();
        };
        img.src = image.dataUrl;
    }

    redrawCanvas() {
        const image = this.images[this.currentIndex];
        if (!image) return;

        const img = new Image();
        img.onload = () => {
            const scale = parseFloat(this.canvas.dataset.scale) || 1;

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);

            // Draw selection rectangle
            if (image.selection) {
                const sel = image.selection;
                this.ctx.strokeStyle = '#3498db';
                this.ctx.lineWidth = 2;
                this.ctx.fillStyle = 'rgba(52, 152, 219, 0.2)';

                this.ctx.fillRect(
                    sel.x * scale,
                    sel.y * scale,
                    sel.width * scale,
                    sel.height * scale
                );
                this.ctx.strokeRect(
                    sel.x * scale,
                    sel.y * scale,
                    sel.width * scale,
                    sel.height * scale
                );
            }

            // Update answer overlay
            if (image.answer) {
                this.answerOverlay.textContent = image.answer;
                this.answerOverlay.style.fontSize = `${image.answerSize * scale}px`;
                this.answerOverlay.style.color = image.answerColor;
                if (image.answerOutline) {
                    this.answerOverlay.style.textShadow = '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, -2px 0 0 #000, 2px 0 0 #000, 0 -2px 0 #000, 0 2px 0 #000';
                } else {
                    this.answerOverlay.style.textShadow = 'none';
                }
                this.answerOverlay.style.left = `${this.answerPosition.x}%`;
                this.answerOverlay.style.top = `${this.answerPosition.y}%`;
                this.answerOverlay.style.transform = 'translate(-50%, -50%)';
                this.answerOverlay.classList.add('visible');
            } else {
                this.answerOverlay.classList.remove('visible');
            }
        };
        img.src = image.dataUrl;
    }

    startDrawing(e) {
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        const scale = parseFloat(this.canvas.dataset.scale) || 1;

        this.dragStart = {
            x: (e.clientX - rect.left) / scale,
            y: (e.clientY - rect.top) / scale
        };
    }

    draw(e) {
        if (!this.isDrawing) return;

        const image = this.images[this.currentIndex];
        if (!image) return;

        const rect = this.canvas.getBoundingClientRect();
        const scale = parseFloat(this.canvas.dataset.scale) || 1;

        const currentX = (e.clientX - rect.left) / scale;
        const currentY = (e.clientY - rect.top) / scale;

        image.selection = {
            x: Math.min(this.dragStart.x, currentX),
            y: Math.min(this.dragStart.y, currentY),
            width: Math.abs(currentX - this.dragStart.x),
            height: Math.abs(currentY - this.dragStart.y)
        };

        this.redrawCanvas();
    }

    stopDrawing() {
        this.isDrawing = false;
    }

    startDraggingAnswer(e) {
        e.preventDefault();
        this.isDragging = true;
    }

    dragAnswer(e) {
        if (!this.isDragging) return;

        const rect = this.canvasContainer.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        this.answerPosition = {
            x: Math.max(0, Math.min(100, x)),
            y: Math.max(0, Math.min(100, y))
        };

        this.updateCurrentImage();
        this.redrawCanvas();
    }

    stopDraggingAnswer() {
        this.isDragging = false;
    }

    updateCurrentImage() {
        const image = this.images[this.currentIndex];
        if (!image) return;

        image.question = this.questionInput.value;
        image.questionSize = parseInt(this.questionSize.value) || 72;
        image.answer = this.answerInput.value;
        image.answerSize = parseInt(this.answerSize.value) || 72;
        image.answerColor = this.answerColor.value;
        image.answerOutline = this.answerOutline.checked;
        image.answerPosition = { ...this.answerPosition };
        image.revealAnimation = this.revealAnimation.value;

        this.redrawCanvas();
        this.renderGallery();
    }

    updateProjectName() {
        const name = this.projectName.value;
        this.projectNameDisplay.textContent = name;
        document.title = name ? `ImagePuzzler - ${name}` : 'ImagePuzzler';
    }

    async showPreview() {
        const image = this.images[this.currentIndex];
        if (!image || !image.selection) {
            await this.showAlert('Please select an image and draw a selection rectangle first.');
            return;
        }

        this.previewModal.classList.add('visible');
        this.renderPreview(image);
    }

    renderPreview(image) {
        this.previewContainer.innerHTML = '';

        const sel = image.selection;
        const img = new Image();
        img.src = image.dataUrl;

        img.onload = () => {
            // Create cropped canvas
            const croppedCanvas = document.createElement('canvas');
            croppedCanvas.width = sel.width;
            croppedCanvas.height = sel.height;
            const croppedCtx = croppedCanvas.getContext('2d');
            croppedCtx.drawImage(img, sel.x, sel.y, sel.width, sel.height, 0, 0, sel.width, sel.height);

            // Calculate display sizes - scale to fill viewport (both up and down)
            const maxWidth = window.innerWidth * 0.75;
            const maxHeight = window.innerHeight * 0.6;
            const croppedScale = Math.min(maxWidth / sel.width, maxHeight / sel.height);

            const displayWidth = sel.width * croppedScale;
            const displayHeight = sel.height * croppedScale;

            // Cropped image element
            const croppedImg = document.createElement('img');
            croppedImg.src = croppedCanvas.toDataURL();
            croppedImg.className = 'preview-cropped';
            croppedImg.style.width = displayWidth + 'px';
            croppedImg.style.height = displayHeight + 'px';
            croppedImg.style.opacity = '0';

            // Question text
            const questionEl = document.createElement('div');
            questionEl.className = 'preview-question';
            questionEl.textContent = image.question || '';
            questionEl.style.fontSize = (image.questionSize * croppedScale) + 'px';
            questionEl.style.opacity = '0';

            // Full image (hidden initially)
            const fullImg = document.createElement('img');
            fullImg.src = image.dataUrl;
            fullImg.className = 'preview-full-image';

            const fullScale = Math.min(
                (window.innerWidth * 0.9) / img.width,
                (window.innerHeight * 0.9) / img.height,
                1
            );
            fullImg.style.width = (img.width * fullScale) + 'px';
            fullImg.style.height = (img.height * fullScale) + 'px';

            // Answer text (only if answer exists)
            let answerEl = null;
            if (image.answer) {
                answerEl = document.createElement('div');
                answerEl.className = 'preview-answer';
                answerEl.textContent = image.answer;
                answerEl.style.fontSize = (image.answerSize * fullScale) + 'px';
                answerEl.style.color = image.answerColor;
                if (image.answerOutline) {
                    answerEl.style.textShadow = '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, -2px 0 0 #000, 2px 0 0 #000, 0 -2px 0 #000, 0 2px 0 #000';
                }
                answerEl.style.left = image.answerPosition.x + '%';
                answerEl.style.top = image.answerPosition.y + '%';
                answerEl.style.transform = 'translate(-50%, -50%)';
            }

            // Add elements
            this.previewContainer.appendChild(fullImg);
            this.previewContainer.appendChild(croppedImg);
            this.previewContainer.appendChild(questionEl);
            if (answerEl) this.previewContainer.appendChild(answerEl);

            // Animate in
            setTimeout(() => {
                croppedImg.style.opacity = '1';
                questionEl.style.opacity = '1';
            }, 100);

            // Click to reveal
            let revealed = false;
            const revealAnimation = image.revealAnimation || 'fade';

            const reveal = () => {
                if (revealed) return;
                revealed = true;

                // Get actual position of full image from browser layout
                const fullRect = fullImg.getBoundingClientRect();

                // Calculate target position based on actual full image position
                const targetX = fullRect.left + (sel.x / img.width) * fullRect.width;
                const targetY = fullRect.top + (sel.y / img.height) * fullRect.height;
                const targetScale = (fullRect.width / img.width) / croppedScale;

                const croppedRect = croppedImg.getBoundingClientRect();
                const translateX = targetX - croppedRect.left;
                const translateY = targetY - croppedRect.top;

                croppedImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${targetScale})`;
                croppedImg.style.transformOrigin = 'top left';

                questionEl.style.opacity = '0';

                // Apply reveal animation based on type
                // Cropped image takes 1.2s to move to position, so reveal starts after that
                if (revealAnimation === 'fade') {
                    setTimeout(() => {
                        fullImg.style.opacity = '1';
                    }, 1400);
                    setTimeout(() => {
                        croppedImg.style.visibility = 'hidden';
                    }, 3200);
                } else if (revealAnimation === 'blur') {
                    // Blur animation - fade in blurred, then sharpen
                    fullImg.style.filter = 'blur(20px)';
                    fullImg.style.transition = 'opacity 1.5s ease-out';
                    setTimeout(() => {
                        fullImg.style.opacity = '1';
                    }, 1400);
                    setTimeout(() => {
                        croppedImg.style.visibility = 'hidden';
                        fullImg.style.transition = 'filter 1.5s ease-out';
                        fullImg.style.filter = 'blur(0px)';
                    }, 2900);
                } else if (revealAnimation === 'box') {
                    // Box expand using clip-path - starts after cropped image finishes moving
                    const centerX = ((sel.x + sel.width/2) / img.width) * 100;
                    const centerY = ((sel.y + sel.height/2) / img.height) * 100;
                    const startW = (sel.width / img.width) * 50;
                    const startH = (sel.height / img.height) * 50;
                    setTimeout(() => {
                        fullImg.style.clipPath = `inset(${centerY - startH}% ${100 - centerX - startW}% ${100 - centerY - startH}% ${centerX - startW}%)`;
                        fullImg.style.opacity = '1';
                        fullImg.style.transition = 'clip-path 2s ease-out';
                        croppedImg.style.visibility = 'hidden';
                        setTimeout(() => {
                            fullImg.style.clipPath = 'inset(0% 0% 0% 0%)';
                        }, 50);
                    }, 1400);
                } else if (revealAnimation === 'circle') {
                    // Radial expand using clip-path - starts after cropped image finishes moving
                    const centerX = ((sel.x + sel.width/2) / img.width) * 100;
                    const centerY = ((sel.y + sel.height/2) / img.height) * 100;
                    const startRadius = Math.max(sel.width, sel.height) / Math.max(img.width, img.height) * 50;
                    setTimeout(() => {
                        fullImg.style.clipPath = `circle(${startRadius}% at ${centerX}% ${centerY}%)`;
                        fullImg.style.opacity = '1';
                        fullImg.style.transition = 'clip-path 2s ease-out';
                        croppedImg.style.visibility = 'hidden';
                        setTimeout(() => {
                            fullImg.style.clipPath = `circle(150% at ${centerX}% ${centerY}%)`;
                        }, 50);
                    }, 1400);
                }

                const answerDelay = revealAnimation === 'blur' ? 4400 : 3200;
                if (answerEl) {
                    setTimeout(() => {
                        answerEl.style.opacity = '1';
                    }, answerDelay);
                }
            };

            croppedImg.addEventListener('click', reveal);
            this.previewContainer.addEventListener('click', reveal);
        };
    }

    closePreview() {
        this.previewModal.classList.remove('visible');
        this.previewContainer.innerHTML = '';
    }

    async saveProject() {
        if (this.images.length === 0) {
            await this.showAlert('No images to save. Please add some images first.');
            return;
        }

        const projectData = {
            version: 1,
            projectName: this.projectName.value || 'Untitled Project',
            gameTitle: this.gameTitle.value,
            gameExplanation: this.gameExplanation.value,
            nextButtonLabel: this.nextButtonLabel.value,
            progressLabel: this.progressLabel.value,
            completionMessage: this.completionMessage.value,
            images: this.images.map((img, index) => ({
                index,
                name: img.name,
                selection: img.selection,
                question: img.question,
                questionSize: img.questionSize,
                answer: img.answer,
                answerSize: img.answerSize,
                answerColor: img.answerColor,
                answerOutline: img.answerOutline,
                answerPosition: img.answerPosition,
                revealAnimation: img.revealAnimation || 'fade'
            }))
        };

        const zip = new JSZip();
        zip.file('project.json', JSON.stringify(projectData, null, 2));

        const imagesFolder = zip.folder('images');
        for (const image of this.images) {
            const base64 = image.dataUrl.split(',')[1];
            imagesFolder.file(image.name, base64, { base64: true });
        }

        const blob = await zip.generateAsync({ type: 'blob' });
        const projectName = this.projectName.value || 'Untitled Project';
        this.downloadBlob(blob, projectName + '.zip');

        await this.showAlert(`Project saved successfully!<br><br><strong>${projectName}</strong><br>${this.images.length} image${this.images.length !== 1 ? 's' : ''}`);
    }

    async loadProject(file) {
        if (!file) return;

        try {
            const zip = await JSZip.loadAsync(file);
            const projectJson = await zip.file('project.json').async('text');
            const projectData = JSON.parse(projectJson);

            // Clear current state
            this.images = [];
            this.currentIndex = -1;

            // Load settings
            this.projectName.value = projectData.projectName || '';
            this.gameTitle.value = projectData.gameTitle || '';
            this.gameExplanation.value = projectData.gameExplanation || '';
            this.nextButtonLabel.value = projectData.nextButtonLabel || '';
            this.progressLabel.value = projectData.progressLabel || '';
            this.completionMessage.value = projectData.completionMessage || '';
            this.updateProjectName();

            // Load images
            const imagePromises = projectData.images.map(async (imgData) => {
                const imageFile = zip.file('images/' + imgData.name);
                if (!imageFile) return null;

                const base64 = await imageFile.async('base64');
                const ext = imgData.name.split('.').pop().toLowerCase();
                const mimeType = ext === 'png' ? 'image/png' :
                               ext === 'gif' ? 'image/gif' :
                               ext === 'webp' ? 'image/webp' : 'image/jpeg';
                const dataUrl = `data:${mimeType};base64,${base64}`;

                return new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => {
                        resolve({
                            id: Date.now() + Math.random(),
                            name: imgData.name,
                            dataUrl: dataUrl,
                            width: img.width,
                            height: img.height,
                            selection: imgData.selection,
                            question: imgData.question,
                            questionSize: imgData.questionSize,
                            answer: imgData.answer,
                            answerSize: imgData.answerSize,
                            answerColor: imgData.answerColor,
                            answerOutline: imgData.answerOutline,
                            answerPosition: imgData.answerPosition,
                            revealAnimation: imgData.revealAnimation || 'fade'
                        });
                    };
                    img.src = dataUrl;
                });
            });

            const loadedImages = await Promise.all(imagePromises);
            this.images = loadedImages.filter(img => img !== null);

            if (this.images.length > 0) {
                this.currentIndex = 0;
            }

            this.updateUI();
            this.renderGallery();

            const projectName = projectData.projectName || 'Untitled Project';
            await this.showAlert(`Project loaded successfully!<br><br><strong>${projectName}</strong><br>${this.images.length} image${this.images.length !== 1 ? 's' : ''}`);
        } catch (error) {
            console.error('Error loading project:', error);
            await this.showAlert('Error loading project. Please make sure the file is a valid ImagePuzzler project.');
        }

        this.loadProjectInput.value = '';
    }

    async generateGame() {
        if (this.images.length === 0) {
            await this.showAlert('No images to generate a game. Please add some images first.');
            return;
        }

        // Check if all images have selections
        const missingSelections = this.images.filter(img => !img.selection);
        if (missingSelections.length > 0) {
            await this.showAlert(`Please draw selection rectangles on all images. ${missingSelections.length} image${missingSelections.length !== 1 ? 's are' : ' is'} missing selections.`);
            return;
        }

        const gameData = {
            title: this.gameTitle.value || this.projectName.value || 'Image Quiz',
            explanation: this.gameExplanation.value || 'Look at the cropped image and guess what it is. Click to reveal the answer!',
            nextButtonLabel: this.nextButtonLabel.value,
            progressLabel: this.progressLabel.value,
            completionMessage: this.completionMessage.value || 'Congratulations! You\'ve completed the quiz.',
            images: this.images.map(img => ({
                dataUrl: img.dataUrl,
                width: img.width,
                height: img.height,
                selection: img.selection,
                question: img.question || '',
                questionSize: img.questionSize || 72,
                answer: img.answer || '',
                answerSize: img.answerSize || 72,
                answerColor: img.answerColor || '#ffffff',
                answerOutline: img.answerOutline !== false,
                answerPosition: img.answerPosition || { x: 50, y: 50 },
                revealAnimation: img.revealAnimation || 'fade'
            }))
        };

        const html = this.generateGameHTML(gameData);
        const blob = new Blob([html], { type: 'text/html' });
        const filename = (this.projectName.value || 'game') + '.html';
        this.downloadBlob(blob, filename);
    }

    generateGameHTML(data) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escapeHtml(data.title)}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        .screen { display: none; width: 100%; height: 100vh; }
        .screen.active { display: flex; align-items: center; justify-content: center; }

        .start-card, .end-card {
            background: white;
            border-radius: 20px;
            padding: 40px 60px;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            max-width: 500px;
        }
        .start-card h1, .end-card h1 {
            color: #667eea;
            font-size: 2.5rem;
            margin-bottom: 20px;
        }
        .start-card p, .end-card p {
            color: #666;
            font-size: 1.1rem;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        .btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 15px 40px;
            font-size: 1.2rem;
            font-weight: 600;
            border-radius: 10px;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102,126,234,0.4); }

        .game-screen { flex-direction: column; position: relative; }
        .progress {
            position: absolute;
            top: 20px;
            right: 20px;
            background: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            color: #667eea;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        .cropped-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            opacity: 0;
            transition: opacity 0.4s;
        }
        .cropped-container.visible { opacity: 1; }
        .cropped-img {
            cursor: pointer;
            transition: transform 1.2s ease-in-out, opacity 0.4s;
        }
        .question-text {
            color: white;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            margin-top: 20px;
            text-align: center;
            transition: opacity 0.4s;
        }
        .full-container {
            position: absolute;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            pointer-events: none;
        }
        .full-img {
            max-width: 90vw;
            max-height: 90vh;
            object-fit: contain;
            opacity: 0;
            transition: opacity 1s;
        }
        .full-img.visible { opacity: 1; }
        .answer-text {
            position: absolute;
            opacity: 0;
            transition: opacity 0.8s;
            white-space: nowrap;
        }
        .answer-text.visible { opacity: 1; }
        .next-btn {
            position: absolute;
            bottom: 40px;
            opacity: 0;
            transition: opacity 0.4s;
            pointer-events: none;
        }
        .next-btn.visible { opacity: 1; pointer-events: auto; }
    </style>
</head>
<body>
    <div class="screen start-screen active" id="start-screen">
        <div class="start-card">
            <h1>${this.escapeHtml(data.title)}</h1>
            <p>${this.escapeHtml(data.explanation)}</p>
            <button class="btn" onclick="startGame()">Start Game</button>
        </div>
    </div>

    <div class="screen game-screen" id="game-screen">
        ${data.progressLabel ? '<div class="progress" id="progress"></div>' : ''}
        <div class="full-container">
            <img class="full-img" id="full-img">
            <div class="answer-text" id="answer-text"></div>
        </div>
        <div class="cropped-container" id="cropped-container">
            <img class="cropped-img" id="cropped-img" onclick="reveal()">
            <div class="question-text" id="question-text"></div>
        </div>
        ${data.nextButtonLabel ? `<button class="btn next-btn" id="next-btn" onclick="nextQuestion()">${this.escapeHtml(data.nextButtonLabel)}</button>` : ''}
    </div>

    <div class="screen end-screen" id="end-screen">
        <div class="end-card">
            <h1>Game Complete!</h1>
            <p>${this.escapeHtml(data.completionMessage)}</p>
            <button class="btn" onclick="restartGame()">Play Again</button>
        </div>
    </div>

    <script>
        const gameData = ${JSON.stringify(data.images)};
        const progressLabel = ${JSON.stringify(data.progressLabel)};
        const hasNextButton = ${!!data.nextButtonLabel};

        let currentIndex = 0;
        let revealed = false;
        let canAdvance = false;

        function showScreen(id) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById(id).classList.add('active');
        }

        function startGame() {
            currentIndex = 0;
            showScreen('game-screen');
            loadQuestion();
        }

        function restartGame() {
            startGame();
        }

        function loadQuestion() {
            revealed = false;
            canAdvance = false;

            const q = gameData[currentIndex];
            const croppedContainer = document.getElementById('cropped-container');
            const croppedImg = document.getElementById('cropped-img');
            const questionText = document.getElementById('question-text');
            const fullImg = document.getElementById('full-img');
            const answerText = document.getElementById('answer-text');
            const nextBtn = document.getElementById('next-btn');
            const progress = document.getElementById('progress');

            // Reset states
            croppedContainer.classList.remove('visible');
            croppedImg.style.transition = 'none';
            croppedImg.style.transform = '';
            croppedImg.style.transformOrigin = '';
            croppedImg.style.visibility = 'visible';
            // Force reflow to apply transition:none immediately
            croppedImg.offsetHeight;
            croppedImg.style.transition = '';
            questionText.style.opacity = '1';

            // Hide full image instantly (disable transition temporarily)
            fullImg.style.transition = 'none';
            fullImg.classList.remove('visible');
            fullImg.style.opacity = '0';
            fullImg.offsetHeight; // Force reflow
            fullImg.style.transition = '';

            // Hide answer instantly (disable transition temporarily)
            answerText.style.transition = 'none';
            answerText.classList.remove('visible');
            answerText.style.opacity = '0';
            answerText.offsetHeight; // Force reflow
            answerText.style.transition = '';

            if (nextBtn) nextBtn.classList.remove('visible');

            // Reset full image styles for different animation types
            fullImg.style.transform = '';
            fullImg.style.clipPath = '';
            fullImg.style.filter = '';

            // Update progress
            if (progress && progressLabel) {
                progress.textContent = progressLabel
                    .replace('{current}', currentIndex + 1)
                    .replace('{total}', gameData.length);
            }

            // Create cropped image
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = q.selection.width;
                canvas.height = q.selection.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, q.selection.x, q.selection.y, q.selection.width, q.selection.height, 0, 0, q.selection.width, q.selection.height);
                croppedImg.src = canvas.toDataURL();

                // Scale cropped image to fill viewport (both up and down)
                const maxWidth = window.innerWidth * 0.75;
                const maxHeight = window.innerHeight * 0.6;
                const croppedDisplayScale = Math.min(maxWidth / q.selection.width, maxHeight / q.selection.height);
                croppedImg.style.width = (q.selection.width * croppedDisplayScale) + 'px';
                croppedImg.style.height = (q.selection.height * croppedDisplayScale) + 'px';

                // Set question
                questionText.textContent = q.question;
                questionText.style.fontSize = (q.questionSize * croppedDisplayScale) + 'px';

                // Set full image
                fullImg.src = q.dataUrl;

                // Set answer
                answerText.textContent = q.answer;
                answerText.style.fontSize = q.answerSize + 'px';
                answerText.style.color = q.answerColor;
                answerText.style.textShadow = q.answerOutline ? '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, -2px 0 0 #000, 2px 0 0 #000, 0 -2px 0 #000, 0 2px 0 #000' : 'none';
                answerText.style.left = q.answerPosition.x + '%';
                answerText.style.top = q.answerPosition.y + '%';
                answerText.style.transform = 'translate(-50%, -50%)';

                // Show cropped container
                setTimeout(() => croppedContainer.classList.add('visible'), 50);
            };
            img.src = q.dataUrl;
        }

        function reveal() {
            if (revealed) {
                if (canAdvance && !hasNextButton) nextQuestion();
                return;
            }
            revealed = true;

            const q = gameData[currentIndex];
            const croppedImg = document.getElementById('cropped-img');
            const questionText = document.getElementById('question-text');
            const fullImg = document.getElementById('full-img');
            const answerText = document.getElementById('answer-text');
            const nextBtn = document.getElementById('next-btn');

            // Calculate transform using actual full image position from browser layout
            const croppedRect = croppedImg.getBoundingClientRect();
            const fullRect = fullImg.getBoundingClientRect();
            const croppedScale = croppedRect.width / q.selection.width;

            // Calculate target position based on actual full image position
            const targetX = fullRect.left + (q.selection.x / q.width) * fullRect.width;
            const targetY = fullRect.top + (q.selection.y / q.height) * fullRect.height;
            const targetScale = (fullRect.width / q.width) / croppedScale;

            const translateX = targetX - croppedRect.left;
            const translateY = targetY - croppedRect.top;

            croppedImg.style.transformOrigin = 'top left';
            croppedImg.style.transform = \`translate(\${translateX}px, \${translateY}px) scale(\${targetScale})\`;
            questionText.style.opacity = '0';

            const revealAnim = q.revealAnimation || 'fade';

            // Cropped image takes 1.2s to move to position, so reveal starts after that
            if (revealAnim === 'fade') {
                setTimeout(() => {
                    fullImg.style.opacity = '';
                    fullImg.classList.add('visible');
                }, 1400);
                setTimeout(() => {
                    croppedImg.style.visibility = 'hidden';
                }, 3200);
            } else if (revealAnim === 'blur') {
                // Blur animation - fade in blurred, then sharpen
                fullImg.style.filter = 'blur(20px)';
                fullImg.style.transition = 'opacity 1.5s ease-out';
                setTimeout(() => {
                    fullImg.style.opacity = '1';
                    fullImg.classList.add('visible');
                }, 1400);
                setTimeout(() => {
                    croppedImg.style.visibility = 'hidden';
                    fullImg.style.transition = 'filter 1.5s ease-out';
                    fullImg.style.filter = 'blur(0px)';
                }, 2900);
            } else if (revealAnim === 'box') {
                const centerX = ((q.selection.x + q.selection.width/2) / q.width) * 100;
                const centerY = ((q.selection.y + q.selection.height/2) / q.height) * 100;
                const startW = (q.selection.width / q.width) * 50;
                const startH = (q.selection.height / q.height) * 50;
                setTimeout(() => {
                    fullImg.style.clipPath = \`inset(\${centerY - startH}% \${100 - centerX - startW}% \${100 - centerY - startH}% \${centerX - startW}%)\`;
                    fullImg.style.opacity = '1';
                    fullImg.classList.add('visible');
                    fullImg.style.transition = 'clip-path 2s ease-out';
                    croppedImg.style.visibility = 'hidden';
                    setTimeout(() => {
                        fullImg.style.clipPath = 'inset(0% 0% 0% 0%)';
                    }, 50);
                }, 1400);
            } else if (revealAnim === 'circle') {
                const centerX = ((q.selection.x + q.selection.width/2) / q.width) * 100;
                const centerY = ((q.selection.y + q.selection.height/2) / q.height) * 100;
                const startRadius = Math.max(q.selection.width, q.selection.height) / Math.max(q.width, q.height) * 50;
                setTimeout(() => {
                    fullImg.style.clipPath = \`circle(\${startRadius}% at \${centerX}% \${centerY}%)\`;
                    fullImg.style.opacity = '1';
                    fullImg.classList.add('visible');
                    fullImg.style.transition = 'clip-path 2s ease-out';
                    croppedImg.style.visibility = 'hidden';
                    setTimeout(() => {
                        fullImg.style.clipPath = \`circle(150% at \${centerX}% \${centerY}%)\`;
                    }, 50);
                }, 1400);
            }

            const answerDelay = revealAnim === 'blur' ? 4400 : 3200;
            setTimeout(() => {
                if (q.answer) {
                    answerText.style.opacity = '';
                    answerText.classList.add('visible');
                }
                canAdvance = true;
                if (hasNextButton && nextBtn) nextBtn.classList.add('visible');
            }, answerDelay);
        }

        function nextQuestion() {
            if (!canAdvance) return;
            currentIndex++;
            if (currentIndex >= gameData.length) {
                showScreen('end-screen');
            } else {
                loadQuestion();
            }
        }

        // Click anywhere to advance (if no next button)
        document.getElementById('game-screen').addEventListener('click', (e) => {
            if (!hasNextButton && canAdvance && revealed && e.target.id !== 'cropped-img') {
                nextQuestion();
            }
        });
    <\/script>
</body>
</html>`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async resetAll() {
        const confirmed = await this.showConfirm('Are you sure you want to reset everything? This cannot be undone.');
        if (!confirmed) {
            return;
        }

        this.images = [];
        this.currentIndex = -1;

        this.projectName.value = '';
        this.gameTitle.value = '';
        this.gameExplanation.value = '';
        this.nextButtonLabel.value = '';
        this.progressLabel.value = '';
        this.completionMessage.value = '';

        this.updateProjectName();
        this.updateUI();
        this.renderGallery();
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ImagePuzzler();
});
