$(function(){
    $("body").fadeIn(600);
    $(".header").fadeIn().css({top:-52, position:'absolute'}).animate({top:0}, 500, function() {});
    $(".container__animate").fadeIn().css({top:100, position:'relative'}).animate({top:0}, 500, function() {});

    $(window).scroll( function(){
        $('.fadein').each( function(i){
            var bottom_of_object = $(this).offset().top + $(this).outerHeight();
            var bottom_of_window = $(window).scrollTop() + $(window).height();

            if( bottom_of_window > bottom_of_object ){
                $(this).fadeIn().css({top:100, position:'relative'}).animate({opacity:1, top:0}, 500, function() {});
            }
        });
    });
});