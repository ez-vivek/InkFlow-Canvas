// Global State for Gestures
let isPanning = false;
let startPanX = 0;
let startPanY = 0;
let panVelocity = { x: 0, y: 0 };
let lastPanTime = 0;
let inertiaTween = null;

// Element Dragging State
let isDragging = false;
let dragElement = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let elementVelocity = { x: 0, y: 0 };
let lastElementTime = 0;
let elementInertiaTween = null;

// Render State
let isDirty = false;
let renderLoopId = null;

// --- Panning Logic ---

function applyPan(dx, dy) {
    elements.forEach(element => {
        element.x1 += dx;
        element.y1 += dy;
        if (element.x2 !== undefined) element.x2 += dx;
        if (element.y2 !== undefined) element.y2 += dy;
    });
    isDirty = true;
}

function pan(e) {
    const dx = (e.clientX - startPanX) / 2;
    const dy = (e.clientY - startPanY) / 2;

    applyPan(dx, dy);

    const now = performance.now();
    const dt = now - lastPanTime;
    if (dt > 0) {
        const newVx = dx / dt;
        const newVy = dy / dt;
        panVelocity.x = panVelocity.x * 0.5 + newVx * 0.5;
        panVelocity.y = panVelocity.y * 0.5 + newVy * 0.5;
    }
    lastPanTime = now;

    startPanX = e.clientX;
    startPanY = e.clientY;
}

function handlePanInertia() {
    if (Math.abs(panVelocity.x) > 0.05 || Math.abs(panVelocity.y) > 0.05) {
        let tracker = { vx: panVelocity.x, vy: panVelocity.y };
        inertiaTween = gsap.to(tracker, {
            duration: 0.8,
            vx: 0,
            vy: 0,
            ease: "power3.out",
            onUpdate: () => {
                applyPan(tracker.vx * 16, tracker.vy * 16);
            }
        });
    }
}

function startPan(e) {
    isPanning = true;
    startPanX = e.clientX;
    startPanY = e.clientY;
    lastPanTime = performance.now();
    panVelocity = { x: 0, y: 0 };
    if (inertiaTween) inertiaTween.kill();
}

// --- Element Dragging Logic ---

function startElementDrag(e, element) {
    isDragging = true;
    dragElement = element;

    // Calculate offset relative to the element's top-left
    dragOffsetX = e.offsetX - element.x1;
    dragOffsetY = e.offsetY - element.y1;

    // Initialize velocity
    lastElementTime = performance.now();
    elementVelocity = { x: 0, y: 0 };
    if (elementInertiaTween) elementInertiaTween.kill();
}

function updateElementDrag(e) {
    if (!isDragging || !dragElement) return;

    const newX = e.offsetX;
    const newY = e.offsetY;

    const dx = newX - dragOffsetX - dragElement.x1;
    const dy = newY - dragOffsetY - dragElement.y1;

    // Update position (1:1 tracking)
    dragElement.x1 += dx;
    dragElement.y1 += dy;
    if (dragElement.x2 !== undefined) dragElement.x2 += dx;
    if (dragElement.y2 !== undefined) dragElement.y2 += dy;

    isDirty = true;

    // Update Velocity
    const now = performance.now();
    const dt = now - lastElementTime;
    if (dt > 0) {
        const newVx = dx / dt;
        const newVy = dy / dt;
        elementVelocity.x = elementVelocity.x * 0.5 + newVx * 0.5;
        elementVelocity.y = elementVelocity.y * 0.5 + newVy * 0.5;
    }
    lastElementTime = now;
}

function endElementDrag() {
    if (!isDragging) return;
    isDragging = false;
    // Removed inertia logic as per user request for immediate stop
    dragElement = null;
}

// --- Render Loop ---

function initRenderLoop(redrawCallback) {
    function loop() {
        if (isDirty) {
            redrawCallback();
            isDirty = false;
        }
        renderLoopId = requestAnimationFrame(loop);
    }
    loop();
}
