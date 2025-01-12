document.addEventListener("DOMContentLoaded", function () {
    const panoramaContainers = document.querySelectorAll('.panorama-container');

    panoramaContainers.forEach(container => {
        container.addEventListener('click', function () {
            const imgSrc = container.querySelector('img').src;
            showPanorama(container, imgSrc);
        });
    });

    function showPanorama(container, imgSrc) {
        const viewerId = `${container.id}-viewer`;
        let viewerContainer = document.getElementById(viewerId);

        if (!viewerContainer) {
            viewerContainer = document.createElement('div');
            viewerContainer.id = viewerId;
            viewerContainer.style.position = 'fixed';
            viewerContainer.style.top = '0';
            viewerContainer.style.left = '0';
            viewerContainer.style.width = '100%';
            viewerContainer.style.height = '100%';
            viewerContainer.style.zIndex = '9999';
            viewerContainer.style.background = 'rgba(0, 0, 0, 0.9)';

            document.body.appendChild(viewerContainer);
        }

        pannellum.viewer(viewerContainer, {
            type: "equirectangular",
            panorama: imgSrc,
            autoLoad: true,
            showZoomCtrl: true,
            showFullscreenCtrl: true,
        });

        viewerContainer.addEventListener('click', () => {
            viewerContainer.remove(); // Görüntüleyiciyi kapat
        });
    }
});

