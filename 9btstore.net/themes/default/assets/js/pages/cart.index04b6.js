
(function ($) {

    var submitButtonCart = $("#submit_cart");
    $('.bootstrap-select').selectpicker();
    $(".control-info").uniform({
        radioClass  : 'choice',
        wrapperClass: 'border-info-600 text-info-800'
    });

    if ($('textarea').length) {
        autosize($('textarea'));
    }

    function stopSubmitButtonCart(state = false) {

        // Every Time We Are About To Update The
        // The Item We Need To Stop Submit Cart From Being
        // Clicked Until Our Request Has Been Resolved
        if(state) {
			submitButtonCart
				.addClass('disabled')
				.attr('disabled', true).
			html('<span class="submit-loader-cont"><img src="/themes/default/assets/css/ajax-loader.gif" /> يرجى الانتظار</span>');
        } else  {
			submitButtonCart.attr('disabled', false)
				.removeClass('disabled')
				.html('<span>إتمام الطلب</span><i class="icon-chevron-left"></i>');
        }
    }

    // upload images
    function cartUploader(item, product_id, imagesArray) {

        if (!$('.cart-uploader-' + item).length) {
            return;
        }

        $('.cart-uploader-' + item).filepond({
            server                               : {
                process: {
                    url    : baseUrl + '/cart/image',
                    method : 'POST',
                    onload : function (response) {
                        // console.log(response.data);
                    },
                    onerror: function (response) {
                        // console.log(response.data);
                    },
                    ondata : function (formData) {
                        formData.append('_token', _token);
                        formData.append('cart_item_id', item);
                        formData.append('product_id', product_id);
                        return formData;
                    },
                },
                revert : function (uniqueFileId, load, error) {
                    // console.log(uniqueFileId, load, error);
                },
                // restore: null,
                // load: null,
                // fetch: null,
            },
            beforeRemoveFile                     : function (photo) {
                if (imagesArray) {
                    var imageToDelete = imagesArray.filter(function (obj) {
                        return ((obj.path === item.source) || (obj.source === item.source));
                    });
                    if (imageToDelete.length > 0) {
                        var photo_id = imageToDelete[0].key;
                        if(!photo_id){
                            photo_id = imageToDelete[0].source;
                        }
                        if(!photo_id){
                            return;
                        }
                        axios.delete(baseUrl + '/cart/image/' + photo_id)
                            .then(function (response) {
                                if (response.data === 'success') {
                                    laravel.jGrowl(response.data[0], 'success');
                                }
                            }).catch(function (response) {
                            var error = response.data.error;
                            if ((error) && !$.isEmptyObject(error.fields)) {
                                $.each(error.fields, function (key, value) {
                                    laravel.jGrowl(value, 'error');
                                });
                            }
                        });
                    }
                }
            },
            files                                : imagesArray,
            name                                 : 'file',
            instantUpload                        : true,
            acceptedFileTypes                    : ['image/jpg', 'image/png', 'image/jpeg', 'image/gif'],
            dropValidation                       : true,
            allowImageResize                     : true,
            allowImageCrop                       : true,
            allowImageTransform                  : true,
            imageResizeUpscale                   : false,
            imageTransformVariantsIncludeOriginal: false,
            imageTransformOutputMimeType         : 'image/jpeg',
            imageTransformOutputQuality          : 80,
            imageTransformClientTransforms       : 'resize',
            allowMultiple                        : true,
            checkValidity                        : true,
            allowImageValidateSize               : true,
            imageResizeTargetWidth               : 800,
            imageResizeTargetHeight              : 800,
            maxFileSize                          : '10MB',
            maxFiles                             : 5,
            // Labels
            labelIdle: 'اسحب و أفلت الصورة هنا<span class="filepond--label-action">أو تصفح من جهازك</span>',
            labelMaxFileSizeExceeded: 'الملف كبير جدا',
            labelMaxFileSize: 'الحد الأقصى لحجم الملف هو {filesize}',
            labelMaxTotalFileSizeExceeded: 'تم تجاوز الحد الأقصى للحجم الإجمالي',
            labelMaxTotalFileSize: 'الحد الأقصى لحجم الملف الكلي هو {filesize}',
            labelTapToCancel: 'اضغط للالغاء',
            labelFileTypeNotAllowed: 'يسمح فقط برفع صور من نوع : jpg, png, jpeg.',
            labelFileWaitingForSize: 'في انتظار حجم الصورة',
            labelFileSizeNotAvailable: 'حجم الصورة غير متوفر نرجو المحاولة مرة اخرى',
            labelFileLoadError: 'حصل خطأ غير متوقع!',
            labelFileProcessing: 'جاري التحميل...',
            labelFileProcessingComplete: '👍',
            labelFileProcessingAborted: 'تم الغاء عملية التحميل',
            labelFileProcessingError: 'حصل خطأ غير متوقع! نرجو المحاولة',
            labelFileProcessingRevertError: 'خطأ أثناء الرجوع',
            labelFileRemoveError: 'خطأ أثناء الحذف',
            labelTapToRetry: 'اضغط للمحاولة مره اخرى',
            labelTapToUndo: 'اضغط للرجوع',
            labelButtonRemoveItem: 'حذف',
            labelButtonAbortItemLoad: 'الغاء',
            labelButtonRetryItemLoad: 'إعادة المحاولة',
            labelButtonAbortItemProcessing: 'الغاء',
            labelButtonUndoItemProcessing: 'رجوع',
            labelButtonRetryItemProcessing: 'إعادة المحاولة',
            labelButtonProcessItem: 'رفع',
        });
    }

    $(".product-cart").each(function () {
        var cart_id = $(this).data('itemid');
        var product_id = $(this).data('productid');
        var imagesArray = [];
        if ($(this).find('.uploaded_image_row').length) {
            $(this).find('.uploaded_image_row').each(function (i) {
                imagesArray.push({
                    source : $(this).data('key'),
                    options: {
                        type    : 'local',
                        file    : {
                            name: $(this).data('key') + '.jpeg',
                            size: 1000000,
                            type: 'image/jpeg'
                        },
                        metadata: {
                            poster: $(this).data('path')
                        }
                    }
                });
            });
        }

        cartUploader(cart_id, product_id, imagesArray);

        $(this).find(".option-uploader-field").each(function () {
            var _index = $(this).data('index');

            var temp_count_image = $(this).closest('.product-options').find('img').length;
            if (temp_count_image > 0) {
                $("#field_" + _index).closest('.form-group').css({
                    height: $("#field_" + _index).closest('.div-product-option-value').height() + 27
                });
            }
        });

        $(this).find('.notes-upload-fields .filepond--list').children().length > 0 ? $(this).find('[data-button-hidden-uploader]').addClass('active') : null;

        $(this).find('[data-button-hidden-uploader]').on('click', function () {
            $('.file-input.' + $(this).data('button-hidden-uploader')).toggleClass('hidden');
            $(this).toggleClass('active');

        })
        $(this).find('.product-note').is(':visible') ? $(this).find('.btn-add-note').addClass('active') : null;
    });


    $(".mulit_field").each(function () {
        checkboxfield($(this))
    });

    $('.mulit_field').on('change', function () {
        //$('.hide_dev').hide();
        checkboxfield($(this));
        updateServiceProduct($(this).closest('.product-cart').attr('data-itemid'));
    });

    $(".select-new, .prod-options-list").on('change', function(e) {
        if($(this).is('input') || $(this).is('select')){
            updateBasicProduct($(this).attr('data-itemid'))
        }
    });

    $(".btn--qty-add,.btn--qty-sub").on('click', function (e) {
        var input = $(this).closest('.qty-field--custom').find('.single_product_quantity');
        var itemid = input.attr('data-itemid');
        stopSubmitButtonCart(true);
        setTimeout(function () {
            if (input.data('type') && input.data('type') == 'quantity') {
                updateBasicProduct(input.attr('data-itemid'));
            } else if (itemid) {
                updateServiceProduct(input.attr('data-itemid'));
            }
        }, 1000);
    });

    $('.select-service-new').on('change', function (e) {
        var itemid = $(this).attr('data-itemid');
        if (itemid) {
            updateServiceProduct($(this).attr('data-itemid'));
        }
    });

    //checkAvailableQuantityOfCart();
    $('select.prod-options-list, input.prod-options-list').change(function () {
        checkAvailableQuantity($(this).closest('.product-cart'));
    });

    $(document).on('click', '#submit_cart', function (event) {
        event.preventDefault();
        Salla.event.createAndDispatch('cart::submit');
    });

    $(document).on('cart::submit', function (event) {
        event.preventDefault();

        var _check_quantity = true;
        var msg = "";
        $('select.prod-quantity,input.prod-quantity').each(function (i) {
            var data_id = $(this).attr('id');

            if ($(this).val() == 0) {
                _check_quantity = false;
                $(this).css({"border-color": "#f55157"});
                msg = $(this).attr('product_name') + " <br> " + msg;
            }
        });

        if (_check_quantity == false) {

            laravel.jGrowl(" الرجاء تحديد كمية المنتج: " + msg, 'error');

            return false;
        }

        var _check_option = true;
        $('select.prod-options-list').each(function (i) {

            var data_id = $(this).attr('id');
            var option_length = $('select#' + data_id + ' option').length;
            if (option_length > 1) {
                if ($(this).val() == '-') {
                    _check_option = false;
                    $('select[data-id=' + data_id + ']').css({"border-color": "#f55157"});
                    msg = $(this).attr('data-product-name') + " <br> " + msg;
                }
            }
        });

        $('.div-prod-options-list').each(function () {
            var have_check_value = false;
            $(this).find('.prod-options-list ').each(function () {
                if($(this).is(':radio') && $(this).is(':checked')){
                    have_check_value = true;
                }
            });
            if(!have_check_value){
                _check_option= false;
                $(this).css({"border-color":"#f55157"});
                msg = $(this).attr('data-product-name') +" <br> "+ msg;
            }
        });

        if(_check_option == false){
          laravel.jGrowl(" الرجاء تحديد خيارات المنتج: " + msg, 'error');

            return false;
        }

        submitCart();

    });


    function checkAvailableQuantityOfCart() {
        $('.product-cart').each(function () {
            checkAvailableQuantity($(this));
        });
    }

    function checkAvailableQuantity(element_product_cart) {
        var product_id = element_product_cart.data('productid');

        if(element_product_cart.find('select.prod-options-list, input.prod-options-list').length){

            var list_option_detail_id = [];
            element_product_cart.find('select.prod-options-list, input.prod-options-list').each(function () {
                if (
                    ($(this).val() && $(this).val() != '-') &&
                    (
                        ($(this).is('select')) ||
                        ($(this).is(':radio') && $(this).is(':checked'))
                    )
                ) {
                    list_option_detail_id.push($(this).val());
                }
            });

            if (list_option_detail_id) {
                getAvailableQuantity(element_product_cart, product_id, list_option_detail_id);
            }

        } else {
            getAvailableQuantity(element_product_cart, product_id);
        }
    }


    function checkboxfield(elem) {
        var option_id = '';
        var cur_val = '';
        var cur_val_data = '';
        var object_product_cart = elem.closest('.product-cart');
		
		selectedOptions = getSelectedArray(elem);
		
        if (elem.is('select')) {
            //Hide Element
            clearRelatedCondition(elem);
            elem.selectpicker('destroy');
            option_id = elem.find(':selected').attr('data-option-id');
            cur_val = elem.find(':selected').attr('data-option_detail_id');
            cur_val_data = elem.find(':selected').attr('data-field_value');
            elem.selectpicker();
        } else if (elem.attr('type') == 'checkbox') {
            clearRelatedCondition(elem);
            if (elem.is(':checked')) {
                option_id = elem.attr('data-option-id');
                cur_val = elem.attr('data-option_detail_id');
                cur_val_data = elem.attr('data-field_value');
            }
        }

        $.uniform.update();

        if (cur_val_data) {
            cur_val_data = cur_val_data.trim();
        }

        if (cur_val) {
            object_product_cart.find("[data-condition-field-id='" + option_id + "']").each(function () {
                loopThrowHiddenField(object_product_cart, cur_val, cur_val_data, $(this), selectedOptions);
            });
        }else {
			selectRelatedCondition(object_product_cart, elem, selectedOptions);
		}

        $.uniform.update();
    }

	function loopThrowHiddenField(object_product_cart, cur_val, cur_val_data, hidden_elem, selectedOptions)
	{
		var data_condition_field_id = hidden_elem.attr("data-condition-field-id");
		var data_field_condition = hidden_elem.attr("data-field-condition");
		var data_condition_field_option_id = hidden_elem.attr("data-condition-field-option-id");
		var data_field_id = hidden_elem.attr("data-field-id");

		if (data_condition_field_id) {
			switch (data_field_condition) {
				case "=":
					if (cur_val == data_condition_field_option_id && selectedOptions.indexOf(data_condition_field_option_id) !== -1) {
						object_product_cart.find('#field_section_' + data_field_id).show();

						var temp_div = object_product_cart.find('#field_section_' + data_field_id);
						temp_div.find('select').selectpicker('destroy');
						temp_div.find('select').prop('disabled', false);
						temp_div.find('input').prop('disabled', false);
						temp_div.find('textarea').prop('disabled', false);
						temp_div.find('select').selectpicker();
					}
					break;
				case ">":
					var val_option_object = object_product_cart.find("[data-option_detail_id='" + data_condition_field_option_id + "']");
					if (val_option_object && cur_val_data && selectedOptions.indexOf(cur_val) !== -1) {
						var val_option_data = val_option_object.attr('data-field_value');
						val_option_data = val_option_data.trim();
						if (cur_val_data > val_option_data) {
							object_product_cart.find('#field_section_' + data_field_id).show();

							var temp_div = object_product_cart.find('#field_section_' + data_field_id);
							temp_div.find('select').selectpicker('destroy');
							temp_div.find('select').prop('disabled', false);
							temp_div.find('input').prop('disabled', false);
							temp_div.find('textarea').prop('disabled', false);
							temp_div.find('select').selectpicker();
						}
					}
					break;
				case "<":
					var val_option_object = object_product_cart.find("[data-option_detail_id='" + data_condition_field_option_id + "']");
					if (val_option_object && cur_val_data && selectedOptions.indexOf(cur_val) !== -1) {
						var val_option_data = val_option_object.attr('data-field_value');
						val_option_data = val_option_data.trim();
						if (cur_val_data < val_option_data) {
							object_product_cart.find('#field_section_' + data_field_id).show();

							var temp_div = object_product_cart.find('#field_section_' + data_field_id);
							temp_div.find('select').selectpicker('destroy');
							temp_div.find('select').prop('disabled', false);
							temp_div.find('input').prop('disabled', false);
							temp_div.find('textarea').prop('disabled', false);
							temp_div.find('select').selectpicker();
						}
					}
					break;
				case "!=":
					if (cur_val != data_condition_field_option_id && selectedOptions.indexOf(data_condition_field_option_id) === -1) {
						object_product_cart.find('#field_section_' + data_field_id).show();

						var temp_div = object_product_cart.find('#field_section_' + data_field_id);
						temp_div.find('select').selectpicker('destroy');
						temp_div.find('select').prop('disabled', false);
						temp_div.find('input').prop('disabled', false);
						temp_div.find('textarea').prop('disabled', false);
						temp_div.find('select').selectpicker();
					}
					break;
				default:
					object_product_cart.find('#field_section_' + data_field_id).hide();

					var temp_div = object_product_cart.find('#field_section_' + data_field_id);
					temp_div.find('select').selectpicker('destroy');
					temp_div.find('select').prop('disabled', true);
					temp_div.find('input').prop('disabled', true);
					temp_div.find('textarea').prop('disabled', true);
					temp_div.find('select').selectpicker();
			}
		}
	}

    function clearRelatedCondition(elem) {
        var object_product_cart = elem.closest('.product-cart');
        if (elem.is('select')) {
            elem.selectpicker('destroy');

            var element_val = elem.find('option:selected').attr('data-field_value');
            if (element_val) {
                element_val = element_val.trim();
            }

            elem.find('option').each(function () {
                var elem_option = $(this);

                //if(!$(this).is(':selected')) {
                var disable_data = false;

                cur_val = $(this).attr('data-option_detail_id');
                cur_val_data = $(this).attr('data-field_value');
                if (cur_val) {
                    object_product_cart.find("[data-condition-field-option-id='" + cur_val + "']").each(function () {
                        var temp = $(this);
                        if (temp.attr('data-field-condition') == '=') {
                            if (!elem_option.is(':selected')) {
                                disable_data = true;
                            }
                        } else if (temp.attr('data-field-condition') == '!=') {
                            if (
                                (elem_option.is(':selected'))
                            ) {
                                disable_data = true;
                            }
                        } else if (temp.attr('data-field-condition') == '>') {
                            if (
                                //(!elem_option.is(':selected')) &&
                                (element_val && cur_val_data) &&
                                (!(element_val > cur_val_data))
                            ) {
                                disable_data = true;
                            }
                        } else if (temp.attr('data-field-condition') == '<') {
                            if (
                                //(!elem_option.is(':selected')) &&
                                (element_val && cur_val_data) &&
                                (!(element_val < cur_val_data))
                            ) {
                                disable_data = true;
                            }
                        }

                        if (disable_data) {
                            temp.closest('.form-group').hide();

                            var temp_div = temp.closest('.form-group');
                            temp_div.find('select').prop('disabled', true);
                            temp_div.find('input').prop('disabled', true);
                            temp_div.find('textarea').prop('disabled', true);

                            if (temp.attr('type') == 'checkbox') {
                                temp.prop('checked', false);
                                clearRelatedCondition($(this));
                            } else if (temp.is('select')) {
                                temp.find('option:selected').removeAttr('selected');
                                clearRelatedCondition(temp);
                            } else {
                                temp.val('');
                            }
                        }
                    });
                }
                //}
            });
            elem.selectpicker();
        } else if (elem.attr('type') == 'checkbox') {
            elem.closest('.form-group').find('input[type=checkbox]').each(function () {
                var elem_option = $(this);

                // if(
                //     !$(this).is(':checked')
                // ){
                var disable_data = false;

                cur_val = $(this).attr('data-option_detail_id');
                cur_val_data = $(this).attr('data-field_value');
                if (cur_val) {
                    object_product_cart.find("[data-condition-field-option-id='" + cur_val + "']").each(function () {
                        var temp = $(this);
                        if (temp.attr('data-field-condition') == '=') {
                            if (!elem_option.is(':checked')) {
                                disable_data = true;
                            }
                        } else if (temp.attr('data-field-condition') == '!=') {
                            if (elem_option.is(':checked')) {
                                disable_data = true;
                            }
                        } else if (
                            //(!elem_option.is(':checked')) &&
                            (
                                (temp.attr('data-field-condition') == '>') ||
                                (temp.attr('data-field-condition') == '<')
                            )
                        ) {
                            var have_field_achieve_value = false;
                            elem.closest('.form-group').find('input[type=checkbox]').each(function () {
                                if ($(this).is(':checked')) {
                                    var element_val = $(this).attr('data-field_value');
                                    if (element_val) {
                                        element_val = element_val.trim();
                                    }
                                    if (temp.attr('data-field-condition') == '>') {
                                        if ((element_val && cur_val_data) && (element_val > cur_val_data)) {
                                            have_field_achieve_value = true;
                                            return false;
                                        }
                                    } else if (temp.attr('data-field-condition') == '<') {
                                        if ((element_val && cur_val_data) && (element_val < cur_val_data)) {
                                            have_field_achieve_value = true;
                                            return false;
                                        }
                                    }
                                }
                            });
                            if (!have_field_achieve_value) {
                                disable_data = true;
                            }
                        }

                        if (disable_data) {
                            temp.closest('.form-group').hide();

                            var temp_div = temp.closest('.form-group');
                            temp_div.find('select').prop('disabled', true);
                            temp_div.find('input').prop('disabled', true);
                            temp_div.find('textarea').prop('disabled', true);

                            if (temp.attr('type') == 'checkbox') {
                                temp.prop('checked', false);
                                clearRelatedCondition($(this));
                            } else if (temp.is('select')) {
                                temp.find('option:selected').removeAttr('selected');
                                clearRelatedCondition(temp);
                            } else {
                                temp.val('');
                            }
                        }
                    });
                }
                //}
            });
        }

        $.uniform.update();
    }

	function getSelectedArray(elem)
	{
        var selectedArray = [];

        if (elem.is('select')) {
            elem.find('option').each(function () {
                if ($(this).is(':selected')) {
                    selectedArray.push($(this).attr('data-option_detail_id'));
                }
            });
        } else if (elem.attr('type') == 'checkbox') {
            elem.closest('.form-group').find('input[type=checkbox]').each(function () {
                if ($(this).is(':checked')) {
                    selectedArray.push($(this).attr('data-option_detail_id'));
                }
            });
        }

        return selectedArray;
	}

	function selectRelatedCondition(object_product_cart, elem, selectedOptions)
	{
        if(elem.is('select')){
            elem.selectpicker('destroy');

            elem.find('option').each(function () {
                var elem_option = $(this);

				cur_val = elem_option.attr('data-option_detail_id');
				cur_val_data = elem_option.attr('data-field_value');
				option_id = elem_option.attr('data-option-id');
				//if (elem_option.is(':selected')) {
					object_product_cart.find("[data-condition-field-id='" + option_id + "']").each(function () {
						loopThrowHiddenField(object_product_cart, cur_val, cur_val_data, $(this), selectedOptions);
					});
				//}
            });
            elem.selectpicker();
        } else if(elem.attr('type') == 'checkbox') {
            elem.closest('.form-group').find('input[type=checkbox]').each(function () {
                var elem_option = $(this);

				cur_val = elem_option.attr('data-option_detail_id');
				cur_val_data = elem_option.attr('data-field_value');
				option_id = elem_option.attr('data-option-id');
				//if (elem_option.is(':checked')) {
					object_product_cart.find("[data-condition-field-id='" + option_id + "']").each(function () {
						loopThrowHiddenField(object_product_cart, cur_val, cur_val_data, $(this), selectedOptions);
					});
				//}
            });
        }

        $.uniform.update();
    }

    function updateItem(item_id, quantity, options, notes, amount_donating) {
        $.ajax({
            url     : baseUrl + "/cart/item/" + item_id,
            data    : {
                _token         : _token,
                quantity       : quantity,
                options        : options,
                notes          : notes,
                amount_donating: amount_donating
            },
            dataType: "json",
            type    : 'PUT',
            success : function (resp) {

                $.each(resp.data.items, function (index, product) {
                    if (product.type != 'donating') {
                        $('#product-price-' + product.id).fadeTo('slow', 0.1).fadeTo('slow', 1.0).text(product.product_price_formatted);

                        if (!product.offer) {
                            $('#itemOffer-' + product.id).hide();
                            $('#itemTotal-' + product.id).removeClass('price-before');
                        } else if (product.offer) {
                            $('#itemTotal-' + product.id).addClass('price-before');
                            $('#itemOffer-' + product.id).show();
                            $('#itemOffer-price-' + product.id).fadeTo('slow', 0.1).fadeTo('slow', 1.0).text(product.offer.is_free ? 'مجاني' : product.offer.total_product_after_discount_formatted);
                            $('#itemOffer-name-' + product.id).fadeTo('slow', 0.1).fadeTo('slow', 1.0).text(product.offer.offer_names);
                        }

                        $('#itemTotal-' + product.id).fadeTo('slow', 0.1).fadeTo('slow', 1.0).text(product.total_product_price_formatted);

                        // $('#quantity_' + product.id).val(product.quantity);
                    } else {
                        var _product_price = (product._product_price > 0) ? product._product_price : null;
                        $('#donating_mount_' + product.id).val(Number(_product_price));
                    }

                    if (product.offer) {
                        $('#item-' + product.id).attr('data-price', product.offer.total_product_after_discount);
                    } else {
                        $('#item-' + product.id).attr('data-price', product.total_product_price);
                    }
                });
                $('#cartTotal').fadeTo('slow', 0.1).fadeTo('slow', 1.0).text(resp.data.total);

                laravel.ajax.successHandler(resp);
            },
            error   : function (e) {
                laravel.ajax.errorHandler(e);
                //reset donation amount
                if(amount_donating){
                    var old_price = $('#donating_mount_'+item_id).data('product-price');
                    $('#donating_mount_'+item_id).val(old_price);
                }
                if (
                    ($('body').find('#item-' + item_id))
                ) {
                    checkAvailableQuantity($('body').find('#item-' + item_id));
                }
            },
        }).always(function () {
            // No Matter What Let's Make The Button Clickable
            stopSubmitButtonCart(false);
        });
    }

    function updateBasicProduct(cart_id) {

        var _check_quantity = true;
        var msg = "";

        if ($('#quantity_' + cart_id).val() == 0) {
            _check_quantity = false;
            $('#quantity_' + cart_id).css({"border-color": "#f55157"});
            msg = $('#quantity_' + cart_id).attr('product_name') + " <br> " + msg;
        }

        if (_check_quantity == false) {
            laravel.jGrowl(" الرجاء تحديد كمية المنتج: " + msg, 'error');
            return false;
        }

        var _check_basic_option = true;
        var options = [];
        $(".basic-product-" + cart_id).each(function (_elem) {
            var _elem = $(this);
            if (_elem.val() == '-' && _elem.attr('data-type') == "option") {
                _elem.css({
                    "border-color": "#f55157"
                });
                _check_basic_option = false;
                msg = $(this).attr('data-product-name') + " <br> " + msg;
            }

            if (_elem.attr('data-type') == "option") {
                    options.push(_elem.val());
            } else {
                _elem.find('.prod-options-list').each(function () {
                    _elem2 = $(this);
                    if(_elem2.is(':radio') && _elem2.is(':checked')){
                        options.push(_elem2.val());
                    }
                });
            }
        });

        if (_check_basic_option) {
            var quantity = $('#quantity_' + cart_id).val();
            var notes = '';
            if ($('#notes_' + cart_id).length) {
                notes = $('#notes_' + cart_id).val();
            }
            updateItem(cart_id, quantity, options, notes)
        } else {
            laravel.jGrowl(" الرجاء تحديد خيارات المنتج: " + msg, 'error');
        }
    }

    function updateServiceProduct(item_id) {


        var _check_quantity = true;
        var msg = "";

        if ($('#quantity_' + item_id).val() == 0) {
            _check_quantity = false;
            $('#quantity_' + item_id).css({"border-color": "#f55157"});
            msg = $('#quantity_' + item_id).attr('product_name') + " <br> " + msg;
        }

        if (_check_quantity == false) {
            laravel.jGrowl(" الرجاء تحديد كمية المنتج: " + msg, 'error');

            return false;
        }
        var elements = getServiceOptions($('#item-' + item_id).find(".element-product-option-detail"));
        var notes = '';
        if ($('#notes_' + item_id).length) {
            notes = $('#notes_' + item_id).val();
        }
        updateItem(item_id, $('#quantity_' + item_id).val(), elements, notes)
    }

    function submitCart() {

        showLoading()
        $.ajax({
            url     : baseUrl + '/cart',
            data    : {"has_apple_pay": !!window.ApplePaySession},
            dataType: 'json',
            type    : 'POST',
            success : function (resp) {
                hideLoading()

                // if (resp.case && resp.case === "error") {
                //     laravel.jGrowl(resp.msg, 'error');
                // }
                if (resp.data.redirect.to === "login") {
                    document.dispatchEvent(new Event('auth'));
                }

                if (resp.data.redirect.to === 'refresh') {
                    window.location.reload();
                }

                if (resp.data.redirect.to === "shipping") {
                    window.location = baseUrl + "/shipping";
                }

                if (resp.data.redirect.to === "payment") {
                    window.location = baseUrl + "/payment";
                }

                if (resp.data.redirect.to === "checkout") {
                    window.location = resp.data.redirect.url;
                }
            },
            error   : laravel.ajax.errorHandler,
        });
    }

    function getAvailableQuantity(container_cart, product_id, list_option_detail_id) {

        var url = baseUrl + "/get_product_info/" + product_id;

        $.ajax({
            url    : url,
            type   : 'GET',
            data   : {
                'list_option_detail_id': list_option_detail_id,
            },
            success: function (resp) {
                var selector_quantity = container_cart.find('select.prod-quantity,input.prod-quantity');
                var selected_quantity = selector_quantity.val();

                var empty_quantity_option = selector_quantity.find('option[value="0"]');

                if (selector_quantity.is('select')) {
                    selector_quantity.html('');
                    if (empty_quantity_option) {
                        selector_quantity.append('<option value="0">' + empty_quantity_option.text() + '</option>');
                    }
                    for (i = 1; i <= resp.product_available_quantity; i++) {
                        selector_quantity.append('<option value="' + i + '">' + arabic_number(i) + '</option>');
                    }

                    selector_quantity.val(selected_quantity);

                    if (selector_quantity.hasClass('bootstrap-select')) {
                        selector_quantity.selectpicker('refresh');
                    }
                } else {
                    selector_quantity.val(selected_quantity);
                }

                if (selected_quantity > resp.product_available_quantity) {
                    selected_quantity = resp.product_available_quantity;
                    selector_quantity.val(selected_quantity);

                    if (selector_quantity.hasClass('bootstrap-select')) {
                        selector_quantity.selectpicker('refresh');
                    }
                    // updateBasicProduct(container_cart.data('itemid'));
                }
            }
        });
    }

    $('.amount_donating_cls').on('change keyup paste', function (e) {
        var item_id = $(this).attr('data-itemid');
        $('#btn_donating_mount_' + item_id).show();

    });


    $('.btn-donating-amount').on('click', function (event) {
        var item_id = $(this).attr('data-itemid');
        var _amount = $('#donating_mount_' + item_id).val();

        updateItem(item_id, 1, [], null, _amount);
        $(this).hide();
    });

    /************ update cart item after updating each  element ******/
    var timeout;

    // Update item notes .
    $(".product-note").on('change keyup input paste', function () {
        var id = $(this).attr('data-item-id');
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            updateBasicProduct(id);
        }, 1000)
    });

    // Update item option "text element" Let's Cover Any Changes Since We Are Relying On The Changes .
    $(".text-element").bind("change keyup input paste", function (e) {
        var id = $(this).closest('.product-cart').attr('data-itemid');
        clearTimeout(timeout);
        stopSubmitButtonCart(true);
        timeout = setTimeout(function () {
            updateServiceProduct(id);
        }, 1000)
    });

    // Update item option "date-time element" .
    $(".date-time-element").click(function () {
        var id = $(this).closest('.product-cart').attr('data-itemid');
        $(this).parents('.input_datetime_picker').calendar({
            minDate: moment(),
            className: {
                prevIcon: 'sicon-arrow-left left',
                nextIcon: 'sicon-arrow-right right',
                table: 'ui celled center aligned unstackable table text-ltr',
            },
            formatter: {
                date: function (date, settings) {
                    if (!date) return '';

                    return date.year() + '-' + (date.month() + 1) + '-' + date.date();
                }
            },
            text: {
                days: ['ح', 'اث', 'ثل', 'أر', 'خم', 'ج', 'س'],
                months: [
                    "يناير",
                    "فبراير",
                    "مارس",
                    "أبريل",
                    "مايو",
                    "يونيو",
                    "يوليو",
                    "أغسطس",
                    "سبتمبر",
                    "أكتوبر",
                    "نوفمبر",
                    "ديسمبر",
                ],
            },
            onHidden: (date) => {
                 updateServiceProduct(id)
            }
        });
    });

    // Update item option "time element" .
    $(".time-element").click(function () {
        var id = $(this).closest('.product-cart').attr('data-itemid');
        $(this).parents('.input_time_picker').calendar({
            type: 'time',
            className: {
                prevIcon: 'sicon-arrow-left left',
                nextIcon: 'sicon-arrow-right right',
                table: 'ui celled center aligned unstackable table text-ltr',
            },
            onHidden: (date, mode) => {
                updateServiceProduct(id)
            }
        });
    });

    // Update item option "date element" .
    $(".date-element").click(function(){
        var id = $(this).closest('.product-cart').attr('data-itemid');
        $(this).parents('.input_date_picker').calendar({
            minDate: moment(),
            className: {
                prevIcon: 'sicon-arrow-left left',
                nextIcon: 'sicon-arrow-right right',
                table: 'ui celled center aligned unstackable table text-ltr',
            },
            type: 'date',
            formatter: {
                date: function (date, settings) {
                    if (!date) return '';

                    return date.year() + '-' + (date.month() + 1) + '-' + date.date();
                }
            },
            text: {
                days: ['ح', 'اث', 'ثل', 'أر', 'خم', 'ج', 'س'],
                months: [
                    "يناير",
                    "فبراير",
                    "مارس",
                    "أبريل",
                    "مايو",
                    "يونيو",
                    "يوليو",
                    "أغسطس",
                    "سبتمبر",
                    "أكتوبر",
                    "نوفمبر",
                    "ديسمبر",
                ],
            },
            onChange: function () {
                console.log('test');
                updateServiceProduct(id);
            }
        });
    });

    // Update the product when change the quantity . TODO:: Observe The Keyup
    $(".single_product_quantity").keyup(function(){
        if($(this).val() <= 0) {
            $(this).val(1);
        }
        var itemid = $(this).data('itemid');
        clearTimeout(timeout);
        stopSubmitButtonCart(true);
        timeout = setTimeout(function () {
            if ($(this).data('type') && $(this).data('type') == 'quantity') {
                updateBasicProduct(itemid);
            } else if (itemid) {
                updateServiceProduct(itemid);
            }
        }, 1000);
    });
    /*********************************************************************/

})(jQuery);
