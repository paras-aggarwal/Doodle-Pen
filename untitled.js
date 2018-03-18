$(document).ready(function() {
  $('#code-btn1').click(function(){
    console.log("HI");
    var h = html;
    var c = css;
    var j = js;
    $.ajax({
      type: "POST",
      url: "/save",
      data: { html: h, css: c, js: j},
      success: function(data)
      {
        console.log('key: '+data);
        if(data){
          $('#result').html('<div class="alert alert-Success" role="alert">You have successfully created your short url, Here is your short url:<br><div class="input-group"><div class="input-group-prepend"><div class="input-group-text"><i class="fas fa-link"></i></div></div><input type="text" class="form-control" value=https://dockurl.herokuapp.com/'+data+' readonly></div></div>');
        }
        else{
          $('#result').html('<div class="alert alert-danger" role="alert">Some error Occured !</div>');
        }
      },
      error: function(data)
      {
        console.log('Custom URL Generate Request Failed! :(');        
      }
    });
  });
});