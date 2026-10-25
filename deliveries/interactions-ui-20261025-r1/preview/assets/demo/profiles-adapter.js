(function(){const root=document.getElementById('confideline-interactions');function present(){        root.querySelectorAll('#interactionTable .user-cell').forEach(cell => {
          if (cell.dataset.profileReady) return;
          cell.dataset.profileReady = 'true';
          const sub = cell.querySelector('.user-sub');
          const id = Number(sub?.textContent.match(/^#(\d+)/)?.[1]);
          const profile = (window.ConfidelinePreviewProfiles || []).find(item => item.id === id);
          if (!profile) return;
          const user = window.PartnerInteractionExampleData.users.find(item => item.id === id);
          sub.title = sub.textContent;
          sub.textContent = '#' + id + ' · ' + (user.role === 'client' ? 'Клиент' : 'Эксперт');
          const name = cell.querySelector('.user-name');
          const link = document.createElement('a');
          link.className = 'cl-profile-link'; link.textContent = profile.name;
          link.href = '#profile-' + encodeURIComponent(profile.id);
          link.target = '_blank'; link.rel = 'noopener noreferrer'; link.title = profile.name + ' · #' + id;
          name.replaceChildren(link);
          if (profile.image) {
            const image = document.createElement('img'); image.src = profile.image; image.alt = '';
            image.width = 28; image.height = 28; image.referrerPolicy = 'no-referrer';
            image.addEventListener('error', () => image.remove(), {once:true});
            cell.querySelector('.avatar-cell').append(image);
          }
        });
}new MutationObserver(present).observe(root,{childList:true,subtree:true});present();})();