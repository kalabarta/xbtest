// Start the data picker code
$('#date').datepicker();

function send_patch(url, data, content, loading_button, success_function) {
    /*
    Function to send an Ajax PATCH request to update the database via the API. url is the url of the
    resource being updated. Data is the data being sent. Content is the type of data being sent.
    Loading button is the button that is spinning that will need to be stopped at the end of the
    function. Success function to be called if the ajax method is succefull. The success function
    should stop the button from spinning, if there is no function given the button is stopped in this
    function. If the function fails then create an alert box to tell the user that something went
    wrong.
     */
    $.ajax({
        url: url,
        dataType: 'json',
        type: 'PATCH',
        contentType: content,
        data: data,
        success: function (data, textStatus, jQxhr) {
            //console.log( data );
            if (success_function) {
                success_function(data, loading_button);
            } else {
                loading_button.stop();
            }
        },
        error: function (jqXhr, textStatus, errorThrown) {
            alert("Update failed with error: " + errorThrown);
            loading_button.stop();
        }
    });
}

function switch_object_class(object, class_type, to_class) {
    /*
    Function to remove the current status class and add a new status class.
     */
    if ($(object).hasClass(class_type + '-default')) {
        $(object).removeClass(class_type + '-default').addClass(class_type + "-" + to_class);
    } else if ($(object).hasClass(class_type + '-success')) {
        $(object).removeClass(class_type + '-success').addClass(class_type + "-" + to_class);
    } else if ($(object).hasClass(class_type + '-warning')) {
        $(object).removeClass(class_type + '-warning').addClass(class_type + "-" + to_class);
    } else if ($(object).hasClass(class_type + '-danger')) {
        $(object).removeClass(class_type + '-danger').addClass(class_type + "-" + to_class);
    }
}

function panel_class_to_status(panel) {
    /* Function to return the status code when given a panel class.
    */
    if ($(panel).hasClass('panel-default')) {
        return 0;
    } else if ($(panel).hasClass('panel-success')) {
        return 1;
    } else if ($(panel).hasClass('panel-warning')) {
        return 2;
    } else if ($(panel).hasClass('panel-danger')) {
        return 3;
    }
}

function status_to_class(code) {
    /* Function to return the class type when given a status code.
     */
    if (code === 0) {
        return "default";
    } else if (code === 1) {
        return "success";
    } else if (code === 2) {
        return "warning";
    } else {
        return "danger";
    }
}

$(document).ready(function () {

    //Navigation Menu Slider
    $('#nav-expander').on('click', function (e) {
        e.preventDefault();
        $('body').toggleClass('nav-expanded');
    });
    $('#nav-close').on('click', function (e) {
        e.preventDefault();
        $('body').removeClass('nav-expanded');
    });


    // Initialize navgoco with default options
    $(".main-menu").navgoco({
        caret: '<span class="caret"></span>',
        accordion: false,
        openClass: 'open',
        save: true,
        cookie: {
            name: 'navgoco',
            expires: false,
            path: '/'
        },
        slide: {
            duration: 300,
            easing: 'swing'
        }
    });

    $('#change_date').on('click', function () {
        window.location.href = "night/" + $('#date').val();
    });

    $('#change_date2').on('click', function () {
        window.location.href = $('#date').val();
    });

    //$.get( "/api/", function( data ) {
    //  console.log( "Data Loaded: " + data );
    //});

    $(".update-cheker").submit(function (event) {
        /* Function to update the checker for a site in the operations log table when the update
        button is clicked. Serialize the checker form data. The form matches the data that the API
        expects so we don't have to change the variable names etc. Find the submit button in the
        form and create a ladda object to start the button spinning. The URL key in the API needs
        the date and the site. Get the date from the date field value and the site from the data
        atribute tag. Create the url string for the API PATCH. Create a function to be run if the
        patch is succesfull. Send the data and the function etc to the send_patch function to update
        the data via the API.
        */
        event.preventDefault();
        var checker_data = $(this).serialize();
        var submit = $(this).find(':submit');
        var loading = Ladda.create(submit[0]);
        loading.start();
        var night = $('#date').val();
        var site = $(this).data("site");
        var key = night + "++" + site;
        var update_url = "/api/operations_log/" + key;
        var success_function = function (data, loading_button) {
            /* Function to be run when the checker field is updated. If the checker has been updated,
            i.e. the data we get back has a checker user. Search through all the checker warnings on
            the page and if one has the data attribute with the same site id then hide the warning
            message. Finally stop the button button from spinning at the end of the function.
             */
            if (data.checker) {
                $(".checker-warning").each(function () {
                    if ($(this).data('site') === data.site_id) {
                        $(this).hide();
                    }
                });
            }
            loading_button.stop();
        };
        send_patch(update_url, checker_data, 'application/x-www-form-urlencoded', loading, success_function);
    });

    $(".check_button").on('click', function (event) {
        /*  Function that is called when the check button is click on any of the sections to change the
        check state from not checked to OK, Warning or Failed.

        Get the check status of the link that has been clicked. If an OK link has been click this
        value will be 1, 2 for warning and 3 for failed. This value corresponds to the value we
        want to set the check_status property to in the API. Create a JSON string object of this
        data. Find the parent button for the link that was click. Then create a ladda loading object
        and set that button spinning while the function is being run. The url key of the API for the
        operation checks needs the camera_id, night and the check_type. The camera_id and the check
        type (section) are both in data attributes. We can get the night from the date field. Create
        a success function to be run if the patch is succesfull and then send the data to update the
        field via the api.
        */
        event.preventDefault();
        var check_data = {};
        check_data.check_status = $(this).data('check_status');
        check_data = JSON.stringify(check_data);
        var button = $(this).parents(".btn-group").find('.btn');
        var loading = Ladda.create($(this).parents(".btn-group").find('.btn')[0]);
        loading.start();
        var night = $('#date').val();
        var camera_id = $(this).data('camera-id');
        var check_type = $(this).data('section');
        var site = $(this).data('site');
        var key = camera_id + "++" + night + "++" + check_type;
        var update_url = "/api/operations_checks/" + key;

        var success_function = function (data, loading_button) {
            /*  Function to be run if the PATCH method successfully updates the API. Find the closest
            panel as we will need to change it's colour. And it's parents panel as we will need to
            work out what the overall status of the camera now is. Get the title object and the
            badge object for the camera we are dealing with. Then depending on the new check status
            change the text in the button and change the style to the correct new style for the
            panel and for the button. Then loop over all the panels in the panel group and get their
            status by turning their class into the status code. Get an overall status for the camera
            and then change the status of the title and the badge to reflect this status. Finally
            stop the loading button from spinning.
            */
            var panel = $(button).closest(".panel");
            var panel_group = panel.parent();
            var title = $("#title" + camera_id);
            var badge = $("#badge" + camera_id);
            if (data.check_status == 1) {
                $(button).find('.check_text').text('OK');
                switch_object_class(button, 'btn', "success");
                switch_object_class(panel, 'panel', "success");
            } else if (data.check_status == 2) {
                $(button).find('.check_text').text('Warning');
                switch_object_class(button, 'btn', "warning");
                switch_object_class(panel, 'panel', "warning");
            } else {
                $(button).find('.check_text').text('Failed');
                switch_object_class(button, 'btn', "danger");
                switch_object_class(panel, 'panel', "danger");
            }
            var check_status = -1;
            $(panel_group).children('.panel').each(function () {
                if (check_status !== 0) {
                    var panel_status = panel_class_to_status($(this));
                    if (panel_status === 0) {
                        check_status = 0;
                    } else if (panel_status > check_status) {
                        check_status = panel_status;
                    }
                }
            });
            var status_class = status_to_class(check_status);
            switch_object_class(title, 'bs-callout', status_class);
            switch_object_class(badge, 'label', status_class);
            // Check to see if all the checks are done for this site
            var checks_remaining = $('.panel-default').filter(function() {
                return $(this).data('site') === site;
            }).length;
            if (checks_remaining === 0){
                $(".not-checked").each(function () {
                    if ($(this).data('site') === site) {
                        $(this).hide();
                    }
                });
            }
            loading_button.stop();
        };
        send_patch(update_url, check_data, 'application/json', loading, success_function);
    });

    $(".flag_image").on('click', function (e) {
        e.preventDefault();
        var row = $(this).closest('tr');
        var loading = Ladda.create($(this)[0]);
        loading.start();
        var frame = $(this).data('frame');
        var table = $(this).data('table');
        var icon = $(this).find('i');
        var new_flag_status = false;
        if (icon.hasClass('fa-flag-o')){
            new_flag_status = true;
        }
        var url = "/api/"+ table +"/" + frame;
        var flag_data = {};
        flag_data.bad = new_flag_status;
        flag_data = JSON.stringify(flag_data);
        var success_function = function (data, loading_button) {
            if (data.bad) {
                icon.removeClass().addClass('fa fa-flag');
                row.addClass('danger');
            } else {
                icon.removeClass().addClass('fa fa-flag-o');
                row.removeClass('danger');
            }
            loading_button.stop();
        };

        send_patch(url, flag_data, 'application/json', loading, success_function);
    });

    $(".flag_all").on('click', function (event){
        event.preventDefault();
        var loading = Ladda.create($(this)[0]);
        loading.start();
        var flags = $(this).parents(".panel-body").find('.flag_image');
        flags.delay(100).queue(function(){
            var icon = $(this).find('i');
            var new_flag_status = false;
            if (icon.hasClass('fa-flag-o')){
                new_flag_status = true;
            }
            //console.log($(this));
            if (new_flag_status === true) {
                $(this).trigger('click');
            }
            $(this).dequeue();
        });
        setTimeout(function(){ loading.stop(); }, 7000);
    });

    $(".unflag_all").on('click', function (event){
        event.preventDefault();
        var loading = Ladda.create($(this)[0]);
        loading.start();
        var flags = $(this).parents(".panel-body").find('.flag_image');
        flags.delay(100).queue(function(){
            var icon = $(this).find('i');
            var new_flag_status = false;
            if (icon.hasClass('fa-flag-o')){
                new_flag_status = true;
            }
            //console.log($(this));
            if (new_flag_status === false) {
                $(this).trigger('click');
            }
            $(this).dequeue();
        });
        setTimeout(function(){ loading.stop(); }, 1000);
    });
});

