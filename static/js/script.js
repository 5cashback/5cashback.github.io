function selectQuarter(id, year, quarter) {
  if ($('#quarter' + id + 'label').hasClass("disabled")) {
    $('#quarter' + id + 'label').removeClass("active focus");
  }
  for (i = 1; i <= 5; i++) {
    if (i == id) {
      $('#quarter' + i).prop("checked", true);
      $('#quarter' + i + 'label').addClass("active focus");
    } else {
      $('#quarter' + i).prop("checked", false);
      $('#quarter' + i + 'label').removeClass("active focus");
    }
  }
  $('.quarterly-reward').hide();
  $('.quarterly-reward-' + year + '-' + quarter).show();
}

function updateSettings() {
  // Load hidden categories from localStorage
  var hiddenCategories = JSON.parse(localStorage.getItem('hiddenCategories')) || [];

  // Handle Hidden Categories
  $('.list-group-item').each(function() {
    var text = $(this).text().toLowerCase();
    var shouldHide = false;
    
    for (var i = 0; i < hiddenCategories.length; i++) {
        var category = hiddenCategories[i].toLowerCase();
        if (category && text.includes(category)) {
            shouldHide = true;
            break;
        }
    }
    
    if (shouldHide) {
        $(this).addClass('d-none');
    } else {
        $(this).removeClass('d-none');
    }
  });
  
  // Re-apply manual card visibility and order
  applyCardPreferences();
}

// --- Toast Notification ---
function showToast(message) {
    $('#toastBody').text(message);
    var toastEl = document.getElementById('liveToast');
    var toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
}

// --- Edit Cards Feature ---

function showEditCardsScreen() {
  populateEditCardsModal();
  $('#main-content').addClass('d-none');
  $('#edit-hidden-categories-screen').addClass('d-none');
  $('#share-settings-screen').addClass('d-none');
  $('#edit-cards-screen').removeClass('d-none');
  window.scrollTo(0, 0);
}

function hideEditCardsScreen() {
  $('#edit-cards-screen').addClass('d-none');
  $('#main-content').removeClass('d-none');
}

function populateEditCardsModal() {
  var list = $('#edit-cards-list');
  list.empty();

  // Get all cards from the DOM to ensure we have the full list
  var cards = $('.card-wrapper');
  
  // Check if we have a saved order
  var savedOrder = JSON.parse(localStorage.getItem('cardOrder'));
  
  if (savedOrder) {
      // Sort cards based on saved order
      cards.sort(function(a, b) {
          var idA = $(a).data('rewards');
          var idB = $(b).data('rewards');
          var indexA = savedOrder.indexOf(idA);
          var indexB = savedOrder.indexOf(idB);
          
          // If a card is not in the saved order (new card?), put it at the end
          if (indexA === -1) indexA = 999;
          if (indexB === -1) indexB = 999;
          
          return indexA - indexB;
      });
  }

  cards.each(function() {
    var rewardId = $(this).data('rewards');
    var cardName = $(this).data('card-name');
    
    // Check visibility from localStorage
    var hiddenCards = JSON.parse(localStorage.getItem('hiddenCards')) || [];
    var isChecked = !hiddenCards.includes(rewardId);

    var listItem = $('<li class="list-group-item d-flex justify-content-between align-items-center" data-id="' + rewardId + '"></li>');
    var content = $('<div><i class="fas fa-bars me-2 handle" style="cursor: grab;"></i> ' + cardName + '</div>');
    var checkbox = $('<div class="form-check form-switch"><input class="form-check-input" type="checkbox" ' + (isChecked ? 'checked' : '') + '></div>');

    listItem.append(content);
    listItem.append(checkbox);
    list.append(listItem);
  });
}

function saveCardPreferences() {
  var order = [];
  var hiddenCards = [];

  $('#edit-cards-list li').each(function() {
    var id = $(this).data('id');
    order.push(id);
    
    if (!$(this).find('input[type="checkbox"]').is(':checked')) {
      hiddenCards.push(id);
    }
  });

  localStorage.setItem('cardOrder', JSON.stringify(order));
  localStorage.setItem('hiddenCards', JSON.stringify(hiddenCards));
  
  applyCardPreferences();
  hideEditCardsScreen();
}

function applyCardPreferences() {
  var savedOrder = JSON.parse(localStorage.getItem('cardOrder'));
  var hiddenCards = JSON.parse(localStorage.getItem('hiddenCards')) || [];
  var container = $('#cards-container');
  var cards = container.children('.card-wrapper');

  // Apply visibility
  cards.each(function() {
    var id = $(this).data('rewards');
    if (hiddenCards.includes(id)) {
      $(this).addClass('d-none-user'); // Use a custom class to avoid conflict with other d-none logic
      $(this).hide(); // Explicitly hide
    } else {
      $(this).removeClass('d-none-user');
      $(this).show();
    }
  });

  // Apply Order
  if (savedOrder) {
      // Detach cards and re-append in order
      cards.detach();
      
      // Sort based on saved order
      cards.sort(function(a, b) {
          var idA = $(a).data('rewards');
          var idB = $(b).data('rewards');
          var indexA = savedOrder.indexOf(idA);
          var indexB = savedOrder.indexOf(idB);
          
          if (indexA === -1) indexA = 999;
          if (indexB === -1) indexB = 999;
          
          return indexA - indexB;
      });
      
      container.append(cards);
  }
  
  // Ensure hidden cards stay hidden regardless of Prime setting
  cards.each(function() {
      var id = $(this).data('rewards');
      if (hiddenCards.includes(id)) {
          $(this).hide();
      }
  });
}

// --- Edit Hidden Categories Feature ---

function showEditHiddenCategoriesScreen() {
  var hiddenCategories = JSON.parse(localStorage.getItem('hiddenCategories')) || [];
  $('#hiddenCategoriesInput').val(hiddenCategories.join('\n'));
  
  $('#main-content').addClass('d-none');
  $('#edit-cards-screen').addClass('d-none');
  $('#share-settings-screen').addClass('d-none');
  $('#edit-hidden-categories-screen').removeClass('d-none');
  window.scrollTo(0, 0);
}

function hideEditHiddenCategoriesScreen() {
  $('#edit-hidden-categories-screen').addClass('d-none');
  $('#main-content').removeClass('d-none');
}

function saveHiddenCategories() {
  var text = $('#hiddenCategoriesInput').val();
  var categories = text.split('\n').map(function(item) {
    return item.trim();
  }).filter(function(item) {
    return item.length > 0;
  });
  
  localStorage.setItem('hiddenCategories', JSON.stringify(categories));
  updateSettings();
  hideEditHiddenCategoriesScreen();
}

// --- Share Settings Feature ---

function showShareSettingsScreen() {
    var cardOrder = localStorage.getItem('cardOrder');
    var hiddenCards = localStorage.getItem('hiddenCards');
    var hiddenCategories = localStorage.getItem('hiddenCategories');
    
    var settings = {
        co: cardOrder ? JSON.parse(cardOrder) : null,
        hc: hiddenCards ? JSON.parse(hiddenCards) : null,
        hcat: hiddenCategories ? JSON.parse(hiddenCategories) : null
    };
    
    // Encode settings to base64 to make it URL safe(ish) and shorter
    var encodedSettings = btoa(JSON.stringify(settings));
    var url = window.location.protocol + "//" + window.location.host + window.location.pathname + "?s=" + encodedSettings;
    
    $('#shareLinkInput').val(url);
    
    $('#main-content').addClass('d-none');
    $('#edit-cards-screen').addClass('d-none');
    $('#edit-hidden-categories-screen').addClass('d-none');
    $('#share-settings-screen').removeClass('d-none');
    window.scrollTo(0, 0);
}

function hideShareSettingsScreen() {
    $('#share-settings-screen').addClass('d-none');
    $('#main-content').removeClass('d-none');
}

function copyShareLink() {
    var copyText = document.getElementById("shareLinkInput");
    copyText.select();
    copyText.setSelectionRange(0, 99999); /* For mobile devices */
    
    navigator.clipboard.writeText(copyText.value).then(function() {
        showToast('Settings URL copied to clipboard!');
    }, function(err) {
        console.error('Could not copy text: ', err);
        // Fallback is already handled by the input being selected
    });
}

function webShareSettings() {
    var url = $('#shareLinkInput').val();
    if (navigator.share) {
        navigator.share({
            title: 'My Quarterly Rewards Settings',
            text: 'Check out my credit card reward settings!',
            url: url
        }).then(() => {
            console.log('Thanks for sharing!');
        })
        .catch(console.error);
    } else {
        showToast("Web Share API not supported on this browser.");
    }
}

function loadSettingsFromUrl() {
    var urlParams = new URLSearchParams(window.location.search);
    var encodedSettings = urlParams.get('s');
    
    if (encodedSettings) {
        try {
            var settings = JSON.parse(atob(encodedSettings));
            
            if (settings.co) localStorage.setItem('cardOrder', JSON.stringify(settings.co));
            if (settings.hc) localStorage.setItem('hiddenCards', JSON.stringify(settings.hc));
            if (settings.hcat) localStorage.setItem('hiddenCategories', JSON.stringify(settings.hcat));
            
            // Clean URL
            var newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.replaceState({path: newUrl}, '', newUrl);
            
            showToast('Settings loaded successfully!');
        } catch (e) {
            console.error('Error loading settings from URL:', e);
            showToast('Invalid settings URL.');
        }
    }
}

$(document).ready(function() {
  var today = new Date();
  var year = today.getFullYear();

  $('#quarter1').change(function() {
    selectQuarter(1, year, 1);
  });
  $('#quarter2').change(function() {
    selectQuarter(2, year, 2);
  });
  $('#quarter3').change(function() {
    selectQuarter(3, year, 3);
  });
  $('#quarter4').change(function() {
    selectQuarter(4, year, 4);
  });
  $('#quarter5').change(function() {
    selectQuarter(5, year+1, 1);
  });

  var quarter = Math.floor((today.getMonth() + 3) / 3);
  selectQuarter(quarter, year, quarter);

  // Check for settings in URL
  loadSettingsFromUrl();

  // Edit Cards Listeners
  $('#editCardsBtn').click(function(e) {
      e.preventDefault();
      showEditCardsScreen();
  });
  $('#saveCardPreferencesBtn').click(saveCardPreferences);
  $('#cancelEditCardsBtn').click(hideEditCardsScreen);
  
  // Edit Hidden Categories Listeners
  $('#editHiddenCategoriesBtn').click(function(e) {
      e.preventDefault();
      showEditHiddenCategoriesScreen();
  });
  $('#saveHiddenCategoriesBtn').click(saveHiddenCategories);
  $('#cancelEditHiddenCategoriesBtn').click(hideEditHiddenCategoriesScreen);
  
  // Share Settings Listeners
  $('#shareSettingsBtn').click(function(e) {
      e.preventDefault();
      showShareSettingsScreen();
  });
  $('#copyShareLinkBtn').click(copyShareLink);
  $('#webShareBtn').click(webShareSettings);
  $('#closeShareSettingsBtn').click(hideShareSettingsScreen);
  
  // Navbar Brand Listener
  $('#navbarBrandLink').click(function(e) {
      e.preventDefault();
      if (!$('#edit-cards-screen').hasClass('d-none')) {
          hideEditCardsScreen();
      }
      if (!$('#edit-hidden-categories-screen').hasClass('d-none')) {
          hideEditHiddenCategoriesScreen();
      }
      if (!$('#share-settings-screen').hasClass('d-none')) {
          hideShareSettingsScreen();
      }
  });
  
  // Initialize Sortable
  var el = document.getElementById('edit-cards-list');
  var sortable = Sortable.create(el, {
      handle: '.handle',
      animation: 150
  });

  // Initial settings update (which also applies card preferences)
  updateSettings();
});
