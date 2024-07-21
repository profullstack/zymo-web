document.getElementById('start-xr').addEventListener('click', function () {
	if (navigator.xr) {
		navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
			if (supported) {
				navigator.xr
					.requestSession('immersive-vr', {
						optionalFeatures: ['local-floor', 'bounded-floor']
					})
					.then((xrSession) => {
						// Session started, set up the scene
						setUpScene(xrSession);
					})
					.catch((err) => {
						console.error('Could not initiate XR session:', err);
					});
			} else {
				console.warn('Immersive VR not supported');
			}
		});
	} else {
		console.error('WebXR not supported by this browser');
	}
});

function setUpScene(xrSession) {
	let glCanvas = document.createElement('canvas');
	document.body.appendChild(glCanvas); // Add canvas to DOM for debugging or visual output
	let gl = glCanvas.getContext('webgl', { xrCompatible: true });
	xrSession.updateRenderState({ baseLayer: new XRWebGLLayer(xrSession, gl) });

	// Load and play video inside the XR session to comply with autoplay policies
	let video = document.createElement('video');
	video.src = 'madagascar.mp4'; // Ensure this path is correct
	video.setAttribute('crossorigin', 'anonymous');
	video.setAttribute('playsinline', ''); // Important for iOS devices
	video.loop = true;
	video.load(); // Preload video
	video.play(); // Attempt to play

	setupVideoInScene(video, xrSession, gl, glCanvas);
}

function setupVideoInScene(video, xrSession, gl, glCanvas) {
	const videoTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, videoTexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

	// Prepare shaders and WebGL program for rendering video
	// This part is not shown here but is crucial. You need vertex and fragment shaders that output the video texture.

	xrSession.requestAnimationFrame(function onXRFrame(time, frame) {
		renderFrame(time, frame, xrSession, gl, video, videoTexture, glCanvas);
	});
}

function renderFrame(time, frame, xrSession, gl, video, videoTexture, glCanvas) {
	glCanvas.width = window.innerWidth;
	glCanvas.height = window.innerHeight;

	gl.bindTexture(gl.TEXTURE_2D, videoTexture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

	// Use your shaders here to draw the video texture onto a plane in the 3D scene
	// This typically involves setting up vertex data (for the plane), using a vertex shader to position it,
	// and a fragment shader to map the video texture onto it.

	xrSession.requestAnimationFrame(function onXRFrame(time, frame) {
		renderFrame(time, frame, xrSession, gl, video, videoTexture, glCanvas);
	});
}

