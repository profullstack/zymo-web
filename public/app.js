// Check if WebXR is supported
if (navigator.xr) {
    // Try to initialize a VR session
    navigator.xr.requestSession('immersive-vr', {optionalFeatures: ['local-floor', 'bounded-floor']})
        .then((xrSession) => {
            // Session initialized, set up the scene
            setUpScene(xrSession);
        })
        .catch((err) => {
            console.error('Could not initiate XR session:', err);
        });
} else {
    console.error('WebXR not supported by this browser');
}

function setUpScene(xrSession) {
    let glCanvas = document.createElement('canvas');
    let gl = glCanvas.getContext('webgl', { xrCompatible: true });

    xrSession.updateRenderState({ baseLayer: new XRWebGLLayer(xrSession, gl) });

    // Load video
    let video = document.createElement('video');
    video.src = 'madagascar.mp4'; // Make sure this path is correct
    video.setAttribute('crossorigin', 'anonymous');
    video.load(); // Load the video file

    video.oncanplay = () => {
        // Video is ready to play, set up the WebXR scene to display the video
        setupVideoInScene(video, xrSession, gl);
    };
}

function setupVideoInScene(video, xrSession, gl) {
    // Set up WebGL context, shaders, and textures to display the video

    xrSession.requestAnimationFrame((time, frame) => {
        // Animation loop for rendering
        renderFrame(time, frame, gl, videoTexture);
    });
}

function renderFrame(time, frame, gl, videoTexture) {
    // Update the scene and draw the frame
    // This function should update the video texture with the current video frame
    // and render the scene.

    // Request the next animation frame
    xrSession.requestAnimationFrame((time, frame) => {
        renderFrame(time, frame, gl, videoTexture);
    });
}

