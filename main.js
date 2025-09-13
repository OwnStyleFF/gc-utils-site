const sections = ['juegos', 'proyectos', 'comunicados'];
function showSection(section) {
    sections.forEach(s => {
        document.getElementById(s).style.display = (s === section) ? 'flex' : 'none';
    });
}

function loadSection(section) {
    fetch(`${section}/${section}.json`)
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById(section);
            while (container.firstChild) container.removeChild(container.firstChild);
            data.forEach(item => {
                const card = document.createElement('div');
                card.className = 'card';

                const img = document.createElement('img');
                img.src = item.imagen || '';
                img.alt = item.titulo || '';
                img.loading = 'lazy';

                const title = document.createElement('div');
                title.className = 'card-title';
                title.textContent = item.titulo || '';

                card.appendChild(img);
                card.appendChild(title);
                container.appendChild(card);
            });
        });
}

sections.forEach(loadSection);
