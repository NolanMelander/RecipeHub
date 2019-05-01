$('.navbar-nav .nav-item').click(function(){
    $('.navbar-nav .nav-item.active').removeClass('active');
    $(this).addClass('active');
})