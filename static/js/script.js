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
});
