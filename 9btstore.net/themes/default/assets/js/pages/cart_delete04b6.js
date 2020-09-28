$(document).ready(function () {
    $('body').on('click', '.delete-button', function (e) {
        e.preventDefault();

        $.ajax({
            url: baseUrl + '/cart/item/'+ $(this).attr('data-item-id') ,
            method: 'Delete',
            data: {_token: _token, referre_page: 'cart'},
        }).done(function (data) {
            location.reload();
        }).fail(laravel.ajax.errorHandler);
    });
});
