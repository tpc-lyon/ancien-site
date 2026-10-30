/* Prépa TPC — La Martinière Diderot
   Comportements communs à toutes les pages. Rien à modifier ici :
   les contenus éditables (témoignages, vidéos, écoles) sont en haut de chaque page. */
(function () {
  // Menu sur téléphone
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Photos : on charge img/xxx.jpg ; si le fichier n'existe pas encore, un emplacement indique quoi fournir.
  document.querySelectorAll('figure.photo[data-src]').forEach(function (fig) {
    var img = new Image();
    img.alt = fig.getAttribute('data-alt') || '';
    img.onload = function () { fig.classList.remove('manque'); fig.insertBefore(img, fig.firstChild); };
    img.onerror = function () {
      fig.classList.add('manque');
      var e = document.createElement('div');
      e.className = 'etiquette';
      e.innerHTML = '<b>Photo à ajouter</b>' + (fig.getAttribute('data-alt') || '') +
        '<br><small>Fichier attendu : ' + fig.getAttribute('data-src') + '</small>';
      fig.insertBefore(e, fig.firstChild);
    };
    img.src = fig.getAttribute('data-src');
  });

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // Vidéos (page Témoignages) : la vidéo YouTube ne se charge qu'au clic.
  var vbox = document.getElementById('videos');
  if (vbox && window.VIDEOS) {
    vbox.innerHTML = window.VIDEOS.map(function (v, i) {
      var ecran = v.youtube
        ? '<div class="ecran"><button type="button" data-i="' + i + '" aria-label="Lire la vidéo : ' + esc(v.titre) + '">' +
          '<img src="https://i.ytimg.com/vi/' + esc(v.youtube) + '/hqdefault.jpg" alt=""><span class="lecture"></span></button></div>'
        : '<div class="ecran manque">Vidéo à ajouter : renseigner son identifiant YouTube dans la liste VIDEOS.</div>';
      return '<figure class="video">' + ecran + '<figcaption><b>' + esc(v.titre) + '</b><span>' + esc(v.legende) + '</span></figcaption></figure>';
    }).join('');
    vbox.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-i]');
      if (!b) return;
      var v = window.VIDEOS[+b.getAttribute('data-i')];
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(v.youtube) + '?autoplay=1&rel=0';
      f.title = v.titre;
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.allowFullscreen = true;
      b.parentNode.replaceChild(f, b);
    });
  }

  // Témoignages écrits
  var pbox = document.getElementById('paroles');
  if (pbox && window.TEMOIGNAGES) {
    pbox.innerHTML = window.TEMOIGNAGES.map(function (t) {
      var av = t.photo ? '<img class="avatar" src="' + esc(t.photo) + '" alt="">' : '';
      return '<figure class="parole"><blockquote>' + esc(t.texte) + '</blockquote><figcaption>' + av +
        '<div><b>' + esc(t.prenom) + '</b><span>' + esc(t.parcours) + '</span></div></figcaption></figure>';
    }).join('');
  }

  // Écoles (page Après la prépa) : filtre par domaine
  var tb = document.getElementById('ecoles-corps');
  if (tb && window.ECOLES) {
    var D = window.DOMAINES, actif = 'tout';
    var filtres = document.getElementById('filtres');
    var doms = ['tout'].concat(Object.keys(D).filter(function (k) { return window.ECOLES.some(function (s) { return s.domaines.indexOf(k) >= 0; }); }));
    filtres.innerHTML = doms.map(function (k) {
      return '<button type="button" data-d="' + k + '" aria-pressed="' + (k === actif) + '">' + (k === 'tout' ? 'Toutes' : D[k]) + '</button>';
    }).join('');
    function rendu() {
      var rows = window.ECOLES.filter(function (s) { return actif === 'tout' || s.domaines.indexOf(actif) >= 0; });
      tb.innerHTML = rows.map(function (s) {
        return '<tr><td><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.nom) + '</a>' +
          (s.remarque ? '<span class="rq">' + esc(s.remarque) + '</span>' : '') + '</td>' +
          '<td class="col-ville">' + esc(s.ville) + '</td>' +
          '<td class="dom">' + s.domaines.map(function (d) { return D[d]; }).join(', ') + '</td>' +
          '<td class="num">' + (s.places ? s.places + (s.partage ? '*' : '') : '—') + '</td></tr>';
      }).join('');
    }
    filtres.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-d]'); if (!b) return;
      actif = b.getAttribute('data-d');
      filtres.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      rendu();
    });
    rendu();
  }

  // Écoles sur dossier
  var tb2 = document.getElementById('dossier-corps');
  if (tb2 && window.ECOLES_DOSSIER) {
    tb2.innerHTML = window.ECOLES_DOSSIER.map(function (s) {
      return '<tr><td><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.nom) + '</a><span class="rq">' + esc(s.remarque) + '</span></td>' +
        '<td class="col-ville">' + esc(s.ville) + '</td><td class="dom">' + esc(s.specialites) + '</td></tr>';
    }).join('');
  }

  // Anciens
  var abox = document.getElementById('anciens-corps');
  if (abox && window.ANCIENS) {
    abox.innerHTML = window.ANCIENS.length ? window.ANCIENS.map(function (a) {
      return '<tr><td>' + esc(a.annee) + '</td><td>' + esc(a.ecole) + '</td><td class="num">' + esc(a.nombre) + '</td></tr>';
    }).join('') : '<tr><td colspan="3"><span class="a-completer">À compléter : ajouter une ligne par école et par année dans la liste ANCIENS.</span></td></tr>';
  }
})();
